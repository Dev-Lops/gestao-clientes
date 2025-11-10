import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  const redirectUrl = new URL(
    '/auth/login',
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  )

  const response = NextResponse.redirect(redirectUrl)
  const supabase = createSupabaseRouteHandlerClient(cookieStore, response)

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('❌ Erro ao sair:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return response
}
