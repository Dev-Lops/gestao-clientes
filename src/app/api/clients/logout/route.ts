import { createRouteHandlerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const loginUrl = new URL(
      '/login',
      process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    )
    const response = NextResponse.redirect(loginUrl)
    const supabase = createRouteHandlerClient(cookieStore, response)

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Erro ao sair:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Redireciona pro login após logout (com cookies atualizados)
    return response
  } catch (err) {
    console.error('Erro inesperado no logout:', err)
    return NextResponse.json(
      { error: 'Falha ao encerrar sessão' },
      { status: 500 }
    )
  }
}
