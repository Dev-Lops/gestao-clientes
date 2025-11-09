// src/app/api/auth/set-session/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { access_token, refresh_token } = await req.json()
    const cookieStore = await cookies() // ✅ precisa do await

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options as CookieOptions)
            }
          },
        },
      }
    )

    // ✅ grava tokens de sessão
    await supabase.auth.setSession({ access_token, refresh_token })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro ao sincronizar sessão:', err)
    return NextResponse.json(
      { error: 'Erro ao sincronizar sessão.' },
      { status: 500 }
    )
  }
}
