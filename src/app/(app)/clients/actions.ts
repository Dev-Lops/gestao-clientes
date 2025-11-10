'use server'

import { getSessionProfile } from '@/lib/auth/session'
import { createServerSupabaseClient } from '@/lib/supabase/server'

import { revalidatePath } from 'next/cache'

export async function deleteClientAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const session = await getSessionProfile()

  if (!session.user) throw new Error('Usuário não autenticado.')
  if (session.role !== 'owner')
    throw new Error('Apenas o proprietário pode excluir clientes.')

  const clientId = String(formData.get('client_id') ?? '')
  if (!clientId) throw new Error('ID do cliente ausente.')

  const { error } = await supabase
    .from('app_clients')
    .delete()
    .eq('id', clientId)
  if (error) throw new Error('Erro ao excluir cliente. Tente novamente.')

  revalidatePath('/clients')
  return { success: true }
}
