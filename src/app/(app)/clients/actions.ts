"use server";

import { getSessionProfile } from "@/services/auth/session";
import { deleteClientById } from "@/services/repositories/clients";
import { revalidatePath } from "next/cache";

interface DeleteClientResponse {
  success: boolean;
  message: string;
}

export async function deleteClientAction(
  formData: FormData,
): Promise<DeleteClientResponse> {
  try {
    const session = await getSessionProfile();

    if (!session.user) {
      return { success: false, message: "Usuário não autenticado." };
    }

    if (session.role !== "owner") {
      return {
        success: false,
        message: "Apenas o proprietário pode excluir clientes.",
      };
    }

    if (!session.orgId) {
      return {
        success: false,
        message: "Organização não vinculada ao usuário.",
      };
    }

    const clientId = formData.get("client_id");
    if (typeof clientId !== "string" || !clientId.trim()) {
      return { success: false, message: "ID do cliente ausente ou inválido." };
    }

    await deleteClientById({ orgId: session.orgId, clientId });

    revalidatePath("/clients");
    return { success: true, message: "Cliente excluído com sucesso." };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao excluir cliente.",
    };
  }
}
