'use client'

import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Autenticando...')

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()

    async function handleAuth() {
      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)

        let access_token = ''
        let refresh_token = ''

        if (code) {
          // ✅ Fluxo PKCE — troca código por sessão
          setStatus('Trocando código por sessão...')
          const { data, error } = await supabase.auth.exchangeCodeForSession(url.toString())
          if (error) throw error

          access_token = data.session?.access_token ?? ''
          refresh_token = data.session?.refresh_token ?? ''
        } else if (params.has('access_token')) {
          // ✅ Fluxo Implicit — tokens no hash
          access_token = params.get('access_token') ?? ''
          refresh_token = params.get('refresh_token') ?? ''
          await supabase.auth.setSession({ access_token, refresh_token })
        } else {
          throw new Error('Nenhum token de autenticação encontrado.')
        }

        // ✅ Sincroniza cookies SSR
        if (access_token && refresh_token) {
          await fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token, refresh_token }),
            credentials: 'include',
          })
        }

        setStatus('✅ Login realizado! Redirecionando...')
        setTimeout(() => router.replace('/dashboard'), 1200)
      } catch (err) {
        console.error('❌ Falha ao autenticar:', err)
        setStatus('Erro ao autenticar. Verifique o console.')
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <p>{status}</p>
    </div>
  )
}
