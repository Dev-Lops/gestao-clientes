import { parseRole, type Role } from '@/lib/auth/rbac'
import { createServerSupabase } from '@/lib/supabase/server'

import type { User } from '@supabase/supabase-js'

type SupabaseServerClient = Awaited<ReturnType<typeof createServerSupabase>>
type ServerClient = SupabaseServerClient

async function syncUserRoleMetadata(
  supabase: ServerClient,
  user: User,
  nextRole: Role
): Promise<void> {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>
  const currentRole = parseRole(metadata.role as string | null)

  if (currentRole === nextRole) return

  await supabase.auth.updateUser({
    data: { ...metadata, role: nextRole },
  })
}

export async function completeUserOnboarding(supabase: ServerClient) {
  // 🔹 Garante que o user existe
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Usuário não autenticado')
  }

  const email = user.email?.toLowerCase() ?? null
  const defaultName = email ? `Agência ${email.split('@')[0]}` : 'Minha Agência'

  // 🔹 Recupera sessão (modo compatível com SSR)
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const sessionUserId = session?.user?.id ?? user.id

  // 🔹 Garante ou cria a organização para o usuário
  const { data: orgData, error: orgError } = await supabase.rpc(
    'fn_ensure_owner_org',
    {
      p_user_id: sessionUserId,
      p_name: defaultName,
    }
  )

  if (orgError) {
    console.error('Erro ao criar/recuperar organização:', orgError)
    throw new Error(orgError.message)
  }

  const orgId = orgData as string | null
  if (!orgId) throw new Error('Falha ao criar ou recuperar organização')

  // 🔹 Atualiza metadados do usuário
  const { error: metaError } = await supabase.auth.updateUser({
    data: { org_id: orgId, role: 'owner' },
  })
  if (metaError) throw new Error(metaError.message)

  // 🔹 Sincroniza role no JWT
  await syncUserRoleMetadata(supabase, user, 'owner')

  // 🔹 Força refresh do token pra aplicar o novo JWT
  const { error: refreshError } = await supabase.auth.refreshSession()
  if (refreshError)
    console.warn('Erro ao atualizar sessão:', refreshError.message)

  // 🔹 Confirma se org_id foi aplicado corretamente
  const {
    data: { user: refreshed },
  } = await supabase.auth.getUser()

  if (!refreshed?.user_metadata?.org_id) {
    console.warn('⚠️ org_id ainda não apareceu no JWT após refresh.')
  }

  console.log('✅ Onboarding concluído com sucesso para org:', orgId)
  return orgId
}
