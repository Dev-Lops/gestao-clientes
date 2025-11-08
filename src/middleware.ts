import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // ✅ Autenticação segura — valida token com o servidor do Supabase
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  console.log('MIDDLEWARE - Usuário autenticado:', !!user, 'Erro:', error)

  const pathname = request.nextUrl.pathname
  const publicRoutes = ['/login', '/auth', '/auth/callback']

  // 🔒 Se não houver usuário autenticado → redireciona pro login
  if (!user && !publicRoutes.some((p) => pathname.startsWith(p))) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // 🔹 Se o usuário existe, mas não tem org_id → vai para /setup
  const orgId = user?.user_metadata?.org_id
  if (user && !orgId && pathname !== '/setup') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/setup'
    return NextResponse.redirect(redirectUrl)
  }

  // 🔹 Se o usuário tem org_id → bloqueia /login e /setup
  if (user && orgId && ['/login', '/setup'].includes(pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  if (user && !user.user_metadata?.org_id && pathname !== '/setup') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/setup'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
