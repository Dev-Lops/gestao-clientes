import { createRouteHandlerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = cookies()
    const response = NextResponse.json(
      { message: 'Sessão encerrada com sucesso.' },
      { status: 200 }
    )
    const supabase = createRouteHandlerClient(cookieStore, response)
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Erro ao sair:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ✅ Tudo certo: retorna resposta configurada (cookies atualizados via Supabase)
    return response
  } catch (err) {
    console.error('Erro inesperado no logout:', err)
    return NextResponse.json(
      { error: 'Falha ao encerrar sessão' },
      { status: 500 }
    )
  }
}
