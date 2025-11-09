'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSessionProfile() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    if (userError) {
      console.error('Erro ao recuperar sessão do usuário:', userError)
    }

    return {
      supabase,
      user: null,
      orgId: null,
      role: null as string | null,
    }
  }

  const { data: member, error: memberError } = await supabase
    .from('app_members')
    .select('id, org_id, role, full_name, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (memberError) {
    console.error('Erro ao buscar membro:', memberError)
  }

  return {
    supabase,
    user,
    orgId: member?.org_id ?? null,
    role: member?.role ?? null,
  }
}
