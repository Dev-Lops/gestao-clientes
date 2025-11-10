<<<<<<< HEAD
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
=======
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase URL ou Anon Key não configurados nas variáveis de ambiente.')
  }

  return { url, anonKey }
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseCredentials()

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        void name
        void value
        void options
        // cookies() em renderizações server-side padrão é somente leitura.
        // A atualização real deve ocorrer via Route Handler usando createRouteHandlerClient.
      },
      remove(name: string, options: CookieOptions) {
        void name
        void options
        // Não faz nada aqui pelo mesmo motivo do método set.
      },
    },
  })
}

export function createRouteHandlerClient(
  cookieStore: ReadonlyRequestCookies,
  response: NextResponse
) {
  const { url, anonKey } = getSupabaseCredentials()

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })
>>>>>>> 66d34b01a64c46676e180dadbedcf691e78156c2
}
