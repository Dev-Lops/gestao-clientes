'use server'

import { createSupabaseServiceRoleClient } from '@/lib/supabase/server'
import { getSessionProfile } from '@/services/auth/session'
import type { AppClient } from '@/types/tables'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClientAction(formData: FormData) {
  const { user, orgId } = await getSessionProfile()
  if (!user) redirect('/login')
  if (!orgId) throw new Error('Usuário não possui organização vinculada.')

  const getString = (key: string) =>
    formData.get(key)?.toString().trim() || null
  const getNumber = (key: string) =>
    formData.get(key) ? Number(formData.get(key)) : null

  const name = getString('name')
  if (!name) throw new Error('Nome do cliente é obrigatório.')

  const payload = {
    org_id: orgId,
    created_by: user.id,
    name,
    plan: getString('plan'),
    main_channel: getString('main_channel'),
    start_date: getString('start_date'),
    account_manager: getString('account_manager'),
    last_meeting_at: getString('last_meeting_at'),
    next_delivery: getString('next_delivery'),
    progress: getNumber('progress') ?? 0,
    internal_notes: getString('internal_notes'),
    monthly_ticket: getNumber('monthly_ticket'),
    billing_day: getNumber('billing_day'),
    payment_method: getString('payment_method'),
    payment_status: getString('payment_status'),
    status: 'new',
  }

  const supabase = createSupabaseServiceRoleClient()
  console.log('🔑 Inserindo cliente na org:', orgId)

  const { data, error } = await supabase
    .from('app_clients')
    .insert([payload])
    .select()
    .single<AppClient>()

  if (error) {
    console.error('❌ Erro Supabase:', error)
    throw new Error(`Erro ao criar cliente: ${error.message}`)
  }

  console.log('✅ Cliente criado:', data)
  revalidatePath('/clients')
  redirect(`/clients/${data.id}/info`)
}
