import { createRouteHandlerClient } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { access_token, refresh_token } = await req.json()
    const cookieStore = await cookies()
    const response = NextResponse.json({ ok: true })
    const supabase = createRouteHandlerClient(cookieStore, response)

    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) {
      console.error('Erro ao sincronizar sessão:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return response
  } catch (err) {
    console.error('Erro ao sincronizar sessão:', err)
    return NextResponse.json(
      { error: 'Erro ao sincronizar sessão.' },
      { status: 500 }
    )
  }
}
