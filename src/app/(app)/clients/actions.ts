'use server'

import { getSessionProfile } from '@/services/auth/session'
import { deleteClientById } from '@/services/repositories/clients'
import { revalidatePath } from 'next/cache'

interface DeleteClientResponse {
  success: boolean
  message: string
}

export async function deleteClientAction(
  formData: FormData
): Promise<DeleteClientResponse> {
  try {
    // 🔹 Recupera sessão e valida
    const session = await getSessionProfile()

    if (!session.user) {
      return { success: false, message: 'Usuário não autenticado.' }
    }

    if (session.role !== 'owner') {
      return {
        success: false,
        message: 'Apenas o proprietário pode excluir clientes.',
      }
    }

    if (!session.orgId) {
      return {
        success: false,
        message: 'Organização não vinculada ao usuário.',
      }
    }

    // 🔹 Valida ID do cliente
    const clientId = formData.get('client_id')
    if (typeof clientId !== 'string' || !clientId.trim()) {
      return { success: false, message: 'ID do cliente ausente ou inválido.' }
    }

    console.log(
      `🗑️ Solicitando exclusão do cliente ${clientId} na org ${session.orgId}`
    )

    // 🔹 Executa exclusão com Service Role
    await deleteClientById({ orgId: session.orgId, clientId })

    // 🔹 Atualiza cache e retorna sucesso
    revalidatePath('/clients')
    return { success: true, message: 'Cliente excluído com sucesso.' }
  } catch (err) {
    console.error('❌ Erro ao excluir cliente:', err)
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao excluir cliente.',
    }
  }
}
