'use client'

import { useSessionContext, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Hook seguro de autenticação.
 * Evita loops de redirecionamento durante carregamento da sessão.
 */
export function useAuthUser({
  redirectTo = '/login',
}: { redirectTo?: string } = {}) {
  const { session, isLoading } = useSessionContext()
  const user = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 🚫 Só roda depois que o Supabase terminar de carregar
    if (isLoading) return

    if (!session || !user) {
      console.log('🔒 Nenhum usuário autenticado, redirecionando...')
      router.replace(redirectTo)
    } else {
      setLoading(false)
    }
  }, [isLoading, session, user, router, redirectTo])

  // ✅ Enquanto estiver carregando, mantém a tela "travada" (sem redirect)
  return { user, loading: isLoading || loading }
}
