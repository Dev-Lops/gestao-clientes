'use client'

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Loader2, LogIn } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    const supabase = createSupabaseBrowserClient()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) console.error(error)
    if (data?.url) window.location.href = data.url
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="text-center">
        <h1 className="text-3xl mb-4 font-bold">MyGest</h1>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="inline w-5 h-5 mr-2 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <LogIn className="inline w-5 h-5 mr-2" />
              Entrar com Google
            </>
          )}
        </button>
      </div>
    </div>
  )
}
