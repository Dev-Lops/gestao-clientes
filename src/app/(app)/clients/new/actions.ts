// src/app/(app)/clients/new/actions.ts
'use server'

import { createSupabaseServiceRoleClient } from '@/lib/supabase/server'
import { requireAbility } from '@/services/auth/ability/server'
import { getSessionProfile } from '@/services/auth/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClientAction(formData: FormData) {
  // 1) valida permissão
  await requireAbility('create', 'AppClient')

  const { user, orgId } = await getSessionProfile()
  if (!user || !orgId) {
    throw new Error('Sessão inválida')
  }

  const name = (formData.get('name') as string)?.trim()
  const plan = (formData.get('plan') as string) || null
  const main_channel = (formData.get('main_channel') as string) || null
  const billing_day = formData.get('billing_day')
    ? Number(formData.get('billing_day'))
    : null

  const supabase = createSupabaseServiceRoleClient()
  const { data, error } = await supabase
    .from('app_clients')
    .insert([
      {
        org_id: orgId,
        created_by: user.id,
        name,
        plan,
        main_channel,
        billing_day,
        status: 'new',
        progress: 0,
      },
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/clients')
  redirect(`/clients/${data.id}/info`)
}
