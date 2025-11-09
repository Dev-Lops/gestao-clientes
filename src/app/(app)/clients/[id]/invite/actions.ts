// app/(app)/clients/[id]/invite/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'

export async function inviteClientAction(clientId: string, email: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('auth')

  const { data, error } = await supabase.rpc('fn_invite_client', {
    p_inviter: user.id,
    p_client_id: clientId,
    p_email: email.toLowerCase(),
  })

  if (error) throw error

  return data // já contém member_id e org_id
}
