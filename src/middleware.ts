import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // ✅ Agora passamos o próprio objeto cookies do Next.js,
  // sem precisar criar manualmente get/set/remove
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // o método `cookies()` retorna o objeto de manipulação direto do Next.js
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set(name, value, options)
        },
        remove: (name, options) => {
          response.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const publicRoutes = ['/login', '/auth', '/auth/callback']

  // 🔹 Redirecionamento se não estiver logado
  if (!user && !publicRoutes.some((r) => pathname.startsWith(r))) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  const orgId = user?.user_metadata?.org_id

  // 🔹 Usuário logado mas sem organização → vai pro setup
  if (user && !orgId && pathname !== '/setup') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/setup'
    return NextResponse.redirect(redirectUrl)
  }

  // 🔹 Usuário logado e com org → bloqueia login/setup
  if (user && orgId && ['/login', '/setup'].includes(pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
