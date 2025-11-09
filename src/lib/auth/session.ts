// src/lib/auth/session.ts
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getSessionProfile() {
  // ⚙️ Sem "await" aqui — o client é síncrono
  const supabase = await createServerSupabaseClient()

  // 🔹 Obtém o usuário autenticado
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { user: null, role: null, orgId: null }
  }

  // 🔹 Busca membro ativo vinculado à organização
  const { data: member, error: memberError } = await supabase
    .from('app_members')
    .select('id, org_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (memberError) {
    console.error('Erro ao buscar membro:', memberError)
  }

  return {
    user,
    role: member?.role ?? 'guest',
    orgId: member?.org_id ?? null,
  }
}
