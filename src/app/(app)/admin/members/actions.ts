'use server'

import { getSessionProfile } from '@/lib/auth/session'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 🔹 Envia convite para novo membro (staff ou client)
 */
export async function inviteStaffAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const { user, role, orgId } = await getSessionProfile()

  if (!user) throw new Error('Usuário não autenticado.')
  if (role !== 'owner')
    throw new Error('Apenas o proprietário pode convidar membros.')

  const email = String(formData.get('email') ?? '').trim()
  const full_name = String(formData.get('full_name') ?? '').trim() || null
  const inviteRole = String(formData.get('role') ?? 'staff')

  if (!email) throw new Error('O e-mail é obrigatório.')

  const { error } = await supabase.rpc('invite_member', {
    p_org: orgId,
    p_email: email,
    p_full_name: full_name,
    p_role: inviteRole,
  })

  if (error) throw new Error(`Erro ao convidar membro: ${error.message}`)

  revalidatePath('/admin/members')
}

/**
 * 🔹 Atualiza papel do membro
 */
export async function updateMemberRoleAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { user, role, orgId } = await getSessionProfile()

  if (!user) throw new Error('Usuário não autenticado.')
  if (role !== 'owner')
    throw new Error('Apenas o proprietário pode alterar papéis.')

  const memberId = String(formData.get('member_id') ?? '')
  const newRole = String(formData.get('role') ?? '')

  if (!memberId || !newRole) throw new Error('Dados inválidos.')

  const { error } = await supabase
    .from('app_members')
    .update({ role: newRole })
    .eq('id', memberId)
    .eq('org_id', orgId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/members')
}

/**
 * 🔹 Exclui membro
 */
export async function deleteMemberAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { user, role, orgId } = await getSessionProfile()

  if (!user) throw new Error('Usuário não autenticado.')
  if (role !== 'owner')
    throw new Error('Apenas o proprietário pode excluir membros.')

  const memberId = String(formData.get('member_id') ?? '')
  if (!memberId) throw new Error('ID do membro não informado.')

  const { error } = await supabase
    .from('app_members')
    .delete()
    .eq('id', memberId)
    .eq('org_id', orgId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/members')
}
