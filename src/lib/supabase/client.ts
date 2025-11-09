import { createBrowserClient } from '@supabase/ssr'

let supabase: ReturnType<typeof createBrowserClient> | null = null

export function createBrowserSupabaseClient() {
  if (!supabase) {
    supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: { sameSite: 'lax' },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true, // fundamental
          storageKey: 'sb-client-session',
        },
      }
    )
  }
  return supabase
}
