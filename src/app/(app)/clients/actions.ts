'use server'

import { getSessionProfile } from "@/services/auth/session";
import { deleteClientById } from "@/services/repositories/clients";
import { revalidatePath } from "next/cache";

export async function deleteClientAction(formData: FormData) {
  const session = await getSessionProfile();

  // 🔸 Valida autenticação e permissão
  if (!session.user) {
    return { success: false, message: 'Usuário não autenticado.' }
  }

  if (session.role !== 'owner' || !session.orgId) {
    return {
      success: false,
      message: 'Apenas o proprietário pode excluir clientes.',
    }
  }

  // 🔸 Valida ID do cliente
  const clientId = formData.get("client_id");
  if (typeof clientId !== "string" || !clientId.trim()) {
    return { success: false, message: "ID do cliente ausente ou inválido." };
  }

  try {
    await deleteClientById({ orgId: session.orgId, clientId });
  } catch (error) {
    console.error("❌ Erro ao excluir cliente:", error);
    return {
      success: false,
      message: "Erro ao excluir cliente. Tente novamente mais tarde.",
    };
  }

  // 🔸 Revalida a listagem de clientes no cache
  revalidatePath("/clients");

  return { success: true, message: "Cliente excluído com sucesso." };
}
