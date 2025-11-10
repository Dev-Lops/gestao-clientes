// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  // Cria uma resposta que redireciona para /setup
  const response = NextResponse.redirect(`${origin}/setup`)

  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient(cookieStore, response)

  // 🔹 Troca o código OAuth por uma sessão válida
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  )
  if (exchangeError) {
    console.error('Erro ao trocar o código por sessão:', exchangeError)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  // 🔹 Obtém o usuário autenticado
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('Erro ao buscar usuário:', userError)
    return NextResponse.redirect(`${origin}/login?error=user_not_found`)
  }

  console.log('✅ Sessão criada para:', user.email)

  // 🔹 Verifica se já existe um membro vinculado a este usuário
  const { data: existingMembers, error: memberFetchError } = await supabase
    .from('app_members')
    .select('id, org_id')
    .eq('user_id', user.id)

  if (memberFetchError) {
    console.error('Erro ao verificar membro existente:', memberFetchError)
  }

  const existingMember = existingMembers?.[0] || null

  if (!existingMember) {
    console.log('🆕 Novo usuário detectado — criando organização e membro...')

    // 🔸 Cria nova organização
    const { data: org, error: orgError } = await supabase
      .from('app_orgs')
      .insert({
        name: user.user_metadata?.full_name || 'Minha Organização',
        owner_user_id: user.id,
      })
      .select('id')
      .single()

    if (orgError) {
      console.error('Erro ao criar organização:', orgError)
      return NextResponse.redirect(`${origin}/login?error=org_create_failed`)
    }

    // 🔸 Cria membro vinculado
    const { error: memberError } = await supabase.from('app_members').insert({
      user_id: user.id,
      org_id: org.id,
      full_name: user.user_metadata?.full_name || user.email,
      invited_email: user.email,
      role: 'owner',
      status: 'active',
    })

    if (memberError) {
      console.error('Erro ao criar membro:', memberError)
      return NextResponse.redirect(`${origin}/login?error=member_create_failed`)
    }

    console.log('✅ Organização e membro criados com sucesso:', org.id)
  } else {
    console.log('👤 Usuário já é membro da org:', existingMember.org_id)
  }

  // 🔹 Redireciona para /setup (a lógica de org existente/dash é tratada lá)
  return response
}
