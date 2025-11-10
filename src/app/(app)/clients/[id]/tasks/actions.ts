'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ActionResponse } from '@/types/actions'

export async function deleteTask(formData: FormData): Promise<ActionResponse> {
  const id = String(formData.get('id') ?? '').trim()
  const clientId = String(formData.get('clientId') ?? '').trim()

  if (!id || !clientId)
    return { success: false, message: 'Dados inválidos para exclusão.' }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('app_tasks').delete().eq('id', id)

  if (error) {
    console.error('Erro ao excluir tarefa:', error.message)
    return { success: false, message: 'Erro ao excluir tarefa.' }
  }

  return { success: true, message: 'Tarefa excluída com sucesso!' }
}
