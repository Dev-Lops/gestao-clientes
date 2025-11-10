'use server'

import { getSessionProfile } from '@/lib/auth/session'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ActionResponse } from '@/types/actions'
import { revalidatePath } from 'next/cache'

export async function deleteClientAction(
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createServerSupabaseClient()
  const session = await getSessionProfile()

  if (!session.user)
    return { success: false, message: 'Usuário não autenticado.' }

  if (session.role !== 'owner')
    return {
      success: false,
      message: 'Apenas o proprietário pode excluir clientes.',
    }

  const clientId = String(formData.get('client_id') ?? '').trim()
  if (!clientId)
    return { success: false, message: 'ID do cliente ausente ou inválido.' }

  const { error } = await supabase
    .from('app_clients')
    .delete()
    .eq('id', clientId)

  if (error) {
    console.error('Erro ao excluir cliente:', error.message)
    return { success: false, message: 'Erro ao excluir cliente.' }
  }

  revalidatePath('/clients')
  return { success: true, message: 'Cliente excluído com sucesso!' }
}
