'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSessionProfile } from '@/services/auth/session'
import { revalidatePath } from 'next/cache'

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string
  const due_date = formData.get('due_date') as string | null
  const urgency = formData.get('urgency') as string | null
  const clientId = formData.get('clientId') as string

  if (!title?.trim()) return

  const { user } = await getSessionProfile()
  if (!user) return

  const supabase = await createSupabaseServerClient()

  const adjustedDate = due_date
    ? new Date(`${due_date}T12:00:00Z`).toISOString()
    : null

  const { error } = await supabase.from('app_tasks').insert({
    title: title.trim(),
    client_id: clientId,
    org_id: user.user_metadata?.org_id ?? null,
    created_by: user.id,
    due_date: adjustedDate,
    urgency: urgency || null,
    status: 'todo',
  })

  if (error) console.error('Erro ao criar task:', error)

  revalidatePath(`/clients/${clientId}/tasks`)
}

export async function toggleTask(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const clientId = formData.get('clientId') as string

  const { user } = await getSessionProfile()
  if (!user) return

  const newStatus = status === 'done' ? 'todo' : 'done'

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('app_tasks')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) console.error('Erro ao atualizar task:', error)

  revalidatePath(`/clients/${clientId}/tasks`)
}

export async function deleteTask(id: string, clientId: string) {
  const supabase = await createSupabaseServerClient()
  await supabase.from('app_tasks').delete().eq('id', id)
  revalidatePath(`/clients/${clientId}/tasks`)
}
