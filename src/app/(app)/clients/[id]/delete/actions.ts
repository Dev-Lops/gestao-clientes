"use server";

import { getSessionProfile } from "@/services/auth/session";
import type { ActionResponse } from "@/types/actions";
import { deleteClientById } from "@/services/repositories/clients";
import { revalidatePath } from "next/cache";

export async function deleteClientAction(
  formData: FormData,
): Promise<ActionResponse> {
  const session = await getSessionProfile();

  if (!session.user)
    return { success: false, message: "Usuário não autenticado." };

  if (session.role !== "owner" || !session.orgId)
    return {
      success: false,
      message: "Apenas o proprietário pode excluir clientes.",
    };

  const clientId = String(formData.get("client_id") ?? "").trim();
  if (!clientId)
    return { success: false, message: "ID do cliente ausente ou inválido." };

  try {
    await deleteClientById({ orgId: session.orgId, clientId });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return { success: false, message: "Erro ao excluir cliente." };
  }

  revalidatePath("/clients");
  return { success: true, message: "Cliente excluído com sucesso!" };
}
