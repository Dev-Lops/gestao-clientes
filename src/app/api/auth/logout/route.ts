import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  // Cria Supabase client com acesso aos cookies da requisição/resposta
  const supabase = await createServerSupabaseClient()

  // Faz logout e limpa sessão
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('❌ Erro ao sair:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // ✅ O Supabase já limpa o cookie automaticamente
  // Você só precisa redirecionar para o login
  return NextResponse.redirect(
    new URL(
      '/auth/login',
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    )
  )
}
