import { randomUUID } from "crypto";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export type InvitationRole = "staff" | "client";

export interface CreateInvitationInput {
  orgId: string;
  createdBy: string;
  email: string;
  role: InvitationRole;
  fullName?: string | null;
  clientId?: string | null;
  expiresAt?: Date | null;
}

export interface CreateInvitationResult {
  token: string;
  expiresAt: string | null;
}

export class InvitationError extends Error {}
export class InvitationNotFoundError extends InvitationError {}
export class InvitationExpiredError extends InvitationError {}

export async function createInvitation(
  input: CreateInvitationInput,
): Promise<CreateInvitationResult> {
  const supabase = createSupabaseServiceRoleClient();
  const token = randomUUID();
  const expiresAt =
    input.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("app_invitations")
    .insert({
      org_id: input.orgId,
      client_id: input.clientId ?? null,
      email: input.email,
      role: input.role,
      token,
      expires_at: expiresAt.toISOString(),
      created_by: input.createdBy,
      full_name: input.fullName ?? null,
    })
    .select("token, expires_at")
    .single();

  if (error || !data) {
    throw new InvitationError("Não foi possível registrar o convite.");
  }

  if (input.role === "client" && input.clientId) {
    const { error: updateError } = await supabase
      .from("app_clients")
      .update({ invited_email: input.email })
      .eq("id", input.clientId)
      .eq("org_id", input.orgId);

    if (updateError) {
      throw new InvitationError(
        "Não foi possível atualizar o cliente convidado.",
      );
    }
  }

  return { token: data.token, expiresAt: data.expires_at };
}

interface AcceptInvitationInput {
  token: string;
  userId: string;
}

export interface AcceptInvitationResult {
  orgId: string;
  role: InvitationRole | "staff" | "client";
  clientId: string | null;
}

export async function acceptInvitation(
  input: AcceptInvitationInput,
): Promise<AcceptInvitationResult> {
  const supabase = createSupabaseServiceRoleClient();

  const { data: invitation, error: invitationError } = await supabase
    .from("app_invitations")
    .select("id, org_id, client_id, role, email, expires_at, accepted_at")
    .eq("token", input.token)
    .maybeSingle();

  if (invitationError) {
    throw new InvitationError("Não foi possível validar o convite.");
  }

  if (!invitation) {
    throw new InvitationNotFoundError("Convite inválido ou inexistente.");
  }

  if (invitation.accepted_at) {
    throw new InvitationError("Convite já foi utilizado.");
  }

  if (invitation.expires_at) {
    const expiration = new Date(invitation.expires_at);
    if (
      Number.isFinite(expiration.getTime()) &&
      expiration.getTime() < Date.now()
    ) {
      throw new InvitationExpiredError("Convite expirado.");
    }
  }

  const { data: existingMember } = await supabase
    .from("app_members")
    .select("id, role")
    .eq("org_id", invitation.org_id)
    .eq("user_id", input.userId)
    .maybeSingle();

  const targetRole = invitation.role === "client" ? "client" : "staff";

  if (!existingMember) {
    const { error: insertError } = await supabase.from("app_members").insert({
      org_id: invitation.org_id,
      user_id: input.userId,
      role: targetRole,
      status: "active",
      invited_email: invitation.email,
    });

    if (insertError) {
      throw new InvitationError("Não foi possível confirmar o convite.");
    }
  }

  if (invitation.role === "client" && invitation.client_id) {
    const { error: linkError } = await supabase.from("app_client_users").upsert(
      {
        client_id: invitation.client_id,
        user_id: input.userId,
      },
      { onConflict: "client_id,user_id" },
    );

    if (linkError) {
      throw new InvitationError(
        "Não foi possível vincular o cliente ao usuário.",
      );
    }
  }

  const { error: updateError } = await supabase
    .from("app_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  if (updateError) {
    throw new InvitationError("Não foi possível concluir o aceite do convite.");
  }

  return {
    orgId: invitation.org_id,
    role: targetRole,
    clientId: invitation.client_id,
  };
}
