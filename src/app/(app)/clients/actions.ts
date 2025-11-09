'use server'

import { getSessionProfile } from '@/lib/auth/session'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 🔹 Tipo de retorno explícito (ótimo para consumo no client)
export interface DeleteClientResponse {
  success: boolean
  message: string
}

export async function deleteClientAction(
  formData: FormData
): Promise<DeleteClientResponse> {
  // 🔸 Inicializa cliente Supabase no servidor
  const supabase = await createServerSupabaseClient()
  const session = await getSessionProfile()

  // 🔸 Valida autenticação e permissão
  if (!session.user) {
    return { success: false, message: 'Usuário não autenticado.' }
  }

  if (session.role !== 'owner') {
    return {
      success: false,
      message: 'Apenas o proprietário pode excluir clientes.',
    }
  }

  // 🔸 Valida ID do cliente
  const clientId = formData.get('client_id')
  if (typeof clientId !== 'string' || !clientId.trim()) {
    return { success: false, message: 'ID do cliente ausente ou inválido.' }
  }

  // 🔸 Executa exclusão segura
  const { error } = await supabase
    .from('app_clients')
    .delete()
    .eq('id', clientId)

  if (error) {
    console.error('❌ Erro ao excluir cliente:', error.message)
    return {
      success: false,
      message: 'Erro ao excluir cliente. Tente novamente mais tarde.',
    }
  }

  // 🔸 Revalida a listagem de clientes no cache
  revalidatePath('/clients')

  return { success: true, message: 'Cliente excluído com sucesso.' }
}
