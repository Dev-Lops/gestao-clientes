'use server'

import { revalidatePath } from 'next/cache'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function createTask(formData: FormData): Promise<void> {
  const clientId = String(formData.get('clientId') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const dueDate = String(formData.get('due_date') ?? '').trim()
  const urgency = Number(formData.get('urgency') ?? 0)

  if (!clientId || !title) {
    throw new Error('Informe o cliente e o título da tarefa.')
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('app_tasks').insert({
    client_id: clientId,
    title,
    due_date: dueDate || null,
    urgency,
    status: 'Pendente',
  })

  if (error) {
    console.error('Erro ao criar tarefa:', error.message)
    throw new Error('Não foi possível criar a tarefa.')
  }

  revalidatePath(`/clients/${clientId}/tasks`)
}

export async function toggleTask(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim()
  const clientId = String(formData.get('clientId') ?? '').trim()
  const status = String(formData.get('status') ?? '').trim()

  if (!id || !clientId) {
    throw new Error('Dados inválidos para atualização.')
  }

  const nextStatus = status === 'Concluída' ? 'Pendente' : 'Concluída'

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('app_tasks')
    .update({
      status: nextStatus,
      completed_at: nextStatus === 'Concluída' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar tarefa:', error.message)
    throw new Error('Erro ao atualizar a tarefa.')
  }

  revalidatePath(`/clients/${clientId}/tasks`)
}

export async function deleteTask(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim()
  const clientId = String(formData.get('clientId') ?? '').trim()

  if (!id || !clientId) {
    throw new Error('Dados inválidos para exclusão.')
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('app_tasks').delete().eq('id', id)

  if (error) {
    console.error('Erro ao excluir tarefa:', error.message)
    throw new Error('Erro ao excluir tarefa.')
  }

  revalidatePath(`/clients/${clientId}/tasks`)
}
