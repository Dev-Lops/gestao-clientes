"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isOwner, isStaffOrAbove } from "@/services/auth/rbac";
import { getSessionProfile } from "@/services/auth/session";
import { getClientById } from "@/services/repositories/clients";
import { createInvitation } from "@/services/repositories/invitations";
import { sendInvitationEmail } from "@/services/email/invitations";

const inviteClientSchema = z.object({
  clientId: z.string().min(1, "Cliente inválido."),
  email: z.string().email("Informe um e-mail válido."),
  fullName: z
    .string()
    .optional()
    .transform((value) => (value ? value.trim() : null)),
});

export async function inviteClientAction(input: {
  clientId: string;
  email: string;
  fullName?: string | null;
}) {
  const { user, orgId, role } = await getSessionProfile();

  if (!user) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!orgId) {
    throw new Error("Organização não encontrada.");
  }

  if (!(isOwner(role) || isStaffOrAbove(role))) {
    throw new Error("Você não tem permissão para convidar clientes.");
  }

  const payload = inviteClientSchema.parse({
    clientId: input.clientId,
    email: input.email,
    fullName: input.fullName,
  });

  const client = await getClientById(orgId, payload.clientId);

  if (!client) {
    throw new Error("Cliente não encontrado.");
  }

  const invitation = await createInvitation({
    orgId,
    createdBy: user.id,
    email: payload.email.toLowerCase(),
    role: "client",
    clientId: client.id,
    fullName: payload.fullName,
  });

  await sendInvitationEmail({
    email: payload.email,
    token: invitation.token,
    role: "client",
    expiresAt: invitation.expiresAt,
    fullName: payload.fullName ?? undefined,
    clientName: client.name,
  });

  revalidatePath(`/clients/${client.id}/info`);

  return { success: true } as const;
}
