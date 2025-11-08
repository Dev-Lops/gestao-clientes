import type { CookieOptions } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabase() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string): string | undefined {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions): void {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Ignora em runtimes onde cookies não são mutáveis
          }
        },
        remove(name: string, options: CookieOptions): void {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Ignora erro de mutação de cookie em Edge
          }
        },
      },
    }
  )

  return supabase
}
