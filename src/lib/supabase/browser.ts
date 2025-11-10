'use client'

<<<<<<< HEAD
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 🔹 Mantém apenas UMA instância global no navegador
declare global {
   
  var __supabaseBrowser__: SupabaseClient | undefined
}

export function getSupabaseBrowser(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('❌ Tentou usar Supabase browser client no servidor.')
  }

  if (!globalThis.__supabaseBrowser__) {
    globalThis.__supabaseBrowser__ = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: localStorage,
        },
      }
    )
  }

  return globalThis.__supabaseBrowser__
=======
let browserClient: SupabaseClient | null = null

export function createBrowserSupabaseClient(): SupabaseClient {
  if (browserClient) {
    return browserClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase URL ou Anon Key ausentes nas variáveis de ambiente.')
  }

  browserClient = createBrowserClient(url, anonKey)
  return browserClient
>>>>>>> 66d34b01a64c46676e180dadbedcf691e78156c2
}

// ✅ exporta a instância única
export const supabaseBrowser = getSupabaseBrowser()
