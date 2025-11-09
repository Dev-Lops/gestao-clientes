import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/**
 * Retorna uma instância única do Supabase Client para o browser.
 * Evita recriação e garante persistência da sessão via cookies.
 */
export function createClient(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      throw new Error(
        '❌ Supabase URL ou Anon Key ausentes nas variáveis de ambiente.'
      )
    }

    client = createBrowserClient(url, anonKey)
  }

  return client
}
