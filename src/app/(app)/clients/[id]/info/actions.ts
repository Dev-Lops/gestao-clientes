'use server'

import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { getSessionProfile } from '@/services/auth/session'
import type { ActionResponse } from '@/types/actions'
import type { AppClient } from '@/types/client'

export async function updateClientInfo(
  data: Partial<AppClient>
): Promise<ActionResponse> {
  const supabase = await createServerSupabaseClient()
  const session = await getSessionProfile()

  if (!session.user)
    return { success: false, message: 'Usuário não autenticado.' }

  if (!data.id)
    return { success: false, message: 'ID do cliente não informado.' }

  const { id, ...fields } = data

  const { error } = await supabase
    .from('app_clients')
    .update(fields)
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar cliente:', error.message)
    return { success: false, message: 'Erro ao atualizar cliente.' }
  }

  return { success: true, message: 'Informações do cliente atualizadas!' }
}
