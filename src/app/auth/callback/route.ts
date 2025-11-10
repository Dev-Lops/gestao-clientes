// app/auth/callback/route.ts
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const response = NextResponse.redirect(`${origin}/setup`)
  const cookieStore = await cookies()
  const supabase = createSupabaseRouteHandlerClient(cookieStore, response)

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    console.error('Erro ao trocar o código por sessão:', exchangeError)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Erro ao buscar usuário:', userError)
    return NextResponse.redirect(`${origin}/login?error=user_not_found`)
  }

  const { data: member, error: memberError } = await supabase
    .from('app_members')
    .select('org_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (memberError) {
    console.error('Erro ao verificar membro existente:', memberError)
    return response
  }

  if (member?.org_id) {
    try {
      await supabase.auth.updateUser({
        data: {
          org_id: member.org_id,
          role: member.role,
        },
      })
    } catch (error) {
      console.error('Erro ao atualizar metadados do usuário:', error)
    }

    response.headers.set('Location', `${origin}/dashboard`)
  }

  return response
}
