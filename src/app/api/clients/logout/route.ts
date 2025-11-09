import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Erro ao sair:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Redireciona pro login após logout
    return NextResponse.redirect(
      new URL('/login', process.env.NEXT_PUBLIC_SITE_URL)
    )
  } catch (err) {
    console.error('Erro inesperado no logout:', err)
    return NextResponse.json(
      { error: 'Falha ao encerrar sessão' },
      { status: 500 }
    )
  }
}
