"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isOwner } from "@/services/auth/rbac";
import { getSessionProfile } from "@/services/auth/session";
import {
  createInvitation,
  type InvitationRole,
} from "@/services/repositories/invitations";
import { sendInvitationEmail } from "@/services/email/invitations";

const ALLOWED_ROLES = ["owner", "staff", "client"] as const;

const inviteSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  full_name: z
    .string()
    .transform((value) => value.trim())
    .optional()
    .transform((value) => (value ? value : null)),
  role: z.enum(["staff", "client"] as const),
});

export async function inviteStaffAction(formData: FormData) {
  const { user, role, orgId } = await getSessionProfile();

  if (!user) throw new Error("Usuário não autenticado.");
  if (!isOwner(role))
    throw new Error("Apenas o proprietário pode convidar membros.");
  if (!orgId) throw new Error("Organização não identificada.");

  const parsed = inviteSchema.parse({
    email: String(formData.get("email") ?? ""),
    full_name: String(formData.get("full_name") ?? ""),
    role: String(formData.get("role") ?? "staff"),
  });

  const invitation = await createInvitation({
    orgId,
    createdBy: user.id,
    email: parsed.email.toLowerCase(),
    role: parsed.role as InvitationRole,
    fullName: parsed.full_name,
  });

  await sendInvitationEmail({
    email: parsed.email,
    token: invitation.token,
    role: parsed.role,
    expiresAt: invitation.expiresAt,
    fullName: parsed.full_name ?? undefined,
  });

  revalidatePath("/admin/members");
}

/**
 * 🔹 Atualiza papel do membro
 */
export async function updateMemberRoleAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { user, role, orgId } = await getSessionProfile();

  if (!user) throw new Error("Usuário não autenticado.");
  if (!isOwner(role))
    throw new Error("Apenas o proprietário pode alterar papéis.");
  if (!orgId) throw new Error("Organização não identificada.");

  const memberId = String(formData.get("member_id") ?? "");
  const newRole = String(formData.get("role") ?? "");
  if (!ALLOWED_ROLES.includes(newRole as (typeof ALLOWED_ROLES)[number])) {
    throw new Error("Papel inválido informado.");
  }

  if (!memberId || !newRole) throw new Error("Dados inválidos.");

  const { error } = await supabase
    .from("app_members")
    .update({ role: newRole as (typeof ALLOWED_ROLES)[number] })
    .eq("id", memberId)
    .eq("org_id", orgId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/members");
}

/**
 * 🔹 Exclui membro
 */
export async function deleteMemberAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { user, role, orgId } = await getSessionProfile();

  if (!user) throw new Error("Usuário não autenticado.");
  if (!isOwner(role))
    throw new Error("Apenas o proprietário pode excluir membros.");
  if (!orgId) throw new Error("Organização não identificada.");

  const memberId = String(formData.get("member_id") ?? "");
  if (!memberId) throw new Error("ID do membro não informado.");

  const { error } = await supabase
    .from("app_members")
    .delete()
    .eq("id", memberId)
    .eq("org_id", orgId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/members");
}
