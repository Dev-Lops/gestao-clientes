'use server'

import { roleSatisfies } from '@/lib/auth/rbac'
import { getSessionProfile } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export async function toggleTask(formData: FormData) {
  const { supabase, user, role } = await getSessionProfile()
  if (!user) throw new Error('Usuário não autenticado.')

  const id = String(formData.get('id'))
  const clientId = String(formData.get('clientId'))
  const status = String(formData.get('status')) as 'Pendente' | 'Concluída'

  // 🔒 Confere se a task pertence ao cliente do usuário
  const { data: client, error: clientError } = await supabase
    .from('app_clients')
    .select('created_by')
    .eq('id', clientId)
    .maybeSingle()

  if (clientError) console.error('Erro ao buscar cliente:', clientError)

  if (
    !client ||
    (client.created_by !== user.id && !roleSatisfies(role, 'owner'))
  ) {
    throw new Error('Sem permissão para alterar esta tarefa.')
  }

  const next = status === 'Concluída' ? 'Pendente' : 'Concluída'

  const { error: updateError } = await supabase
    .from('app_tasks')
    .update({
      status: next,
      completed_at: next === 'Concluída' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (updateError) {
    console.error('Erro ao atualizar tarefa:', updateError)
    throw new Error(`Falha ao atualizar tarefa: ${updateError.message}`)
  }

  await supabase.rpc('fn_update_client_progress', { client_id: clientId })

  revalidatePath(`/clients/${clientId}/tasks`)
  revalidatePath('/dashboard')
}

export async function deleteTask(formData: FormData) {
  const { supabase, user, role } = await getSessionProfile()
  if (!user) throw new Error('Usuário não autenticado.')

  const id = String(formData.get('id'))
  const clientId = String(formData.get('clientId'))

  const { data: client } = await supabase
    .from('app_clients')
    .select('created_by')
    .eq('id', clientId)
    .maybeSingle()

  if (
    !client ||
    (client.created_by !== user.id && !roleSatisfies(role, 'owner'))
  ) {
    throw new Error('Sem permissão para excluir esta tarefa.')
  }

  await supabase.from('app_tasks').delete().eq('id', id)
  await supabase.rpc('fn_update_client_progress', { client_id: clientId })

  revalidatePath(`/clients/${clientId}/tasks`)
  revalidatePath('/dashboard')
}

export async function createTask(formData: FormData) {
  const { supabase, user, role } = await getSessionProfile()
  if (!user) throw new Error('Usuário não autenticado.')

  const clientId = String(formData.get('clientId'))
  const title = String(formData.get('title') || '').trim()
  const due_date = (formData.get('due_date') as string) || null
  const urgency = Number(formData.get('urgency') || 0)

  if (!title) return

  const { data: client } = await supabase
    .from('app_clients')
    .select('created_by')
    .eq('id', clientId)
    .maybeSingle()

  if (
    !client ||
    (client.created_by !== user.id && !roleSatisfies(role, 'owner'))
  ) {
    throw new Error('Sem permissão para adicionar tarefas.')
  }

  await supabase.from('app_tasks').insert({
    client_id: clientId,
    title,
    due_date,
    urgency,
    status: 'Pendente',
  })

  await supabase.rpc('fn_update_client_progress', { client_id: clientId })

  revalidatePath(`/clients/${clientId}/tasks`)
  revalidatePath('/dashboard')
}
