import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from '@/config/env'
import type { Database } from '@/types/supabase'
import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import 'server-only'

export type SupabaseServerClient = SupabaseClient<Database>
export type SupabaseServiceRoleClient = SupabaseClient<Database>

function assertSupabaseEnv() {
  if (!SUPABASE_URL) throw new Error('SUPABASE_URL não configurado.')
  if (!SUPABASE_ANON_KEY) throw new Error('SUPABASE_ANON_KEY não configurado.')
}

if (process.env.NODE_ENV === 'development') {
  console.log(
    '🧩 SERVICE ROLE TESTE:',
    process.env.SUPABASE_SERVICE_ROLE_KEY
      ? 'ENCONTRADA ✅'
      : 'NÃO ENCONTRADA ❌'
  )
}

/**
 * 🔹 Para uso em Server Components (SSR)
 */
/**
 * 🔹 Para uso em Server Components (SSR)
 */
export async function createSupabaseServerClient(): Promise<SupabaseServerClient> {
  assertSupabaseEnv()
  const cookieStore = await cookies() // ✅ agora é await

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        console.warn(
          '⚠️ Tentativa de modificar cookies fora de Route Handler (ignorado):',
          cookiesToSet.map((c) => c.name)
        )
      },
    },
  })
}

/**
 * 🔹 Para uso em Route Handlers (com NextResponse)
 */
export async function createSupabaseRouteHandlerClient(
  response: NextResponse
): Promise<SupabaseServerClient> {
  assertSupabaseEnv()
  const cookieStore = await cookies() // ✅ idem

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set({ name, value, ...options })
        }
      },
    },
  })
}

/**
 * 🔹 Client com Service Role — ignora RLS (uso controlado)
 */
export function createSupabaseServiceRoleClient(): SupabaseServiceRoleClient {
  assertSupabaseEnv()
  if (!SUPABASE_SERVICE_ROLE_KEY)
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurado.')

  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ createSupabaseServiceRoleClient usado (ignora RLS).')
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
