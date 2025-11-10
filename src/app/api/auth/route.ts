import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login?error=user_not_found`)
  }

  // Exemplo: cria registro na primeira vez
  const { data: existing } = await supabase
    .from('app_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) {
    await supabase.from('app_members').insert({
      user_id: user.id,
      full_name: user.user_metadata?.full_name || user.email,
      role: 'owner',
    })
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
