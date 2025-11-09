// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { cookies as nextCookies } from 'next/headers'

export async function createServerSupabaseClient() {
  // cookies() agora é assíncrono no Next 15
  const cookieStore = (await nextCookies()) as unknown as ReadonlyRequestCookies

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // ❌ Não tente escrever cookies no SSR comum!
        // ✅ Apenas defina a função como noop (sem efeito)
        setAll() {
          /* noop: bloqueado fora de Server Actions */
        },
      },
    }
  )
}
