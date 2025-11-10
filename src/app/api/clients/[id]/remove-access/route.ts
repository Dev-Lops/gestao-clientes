import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSessionProfile } from '@/services/auth/session'
import { revalidatePath } from 'next/cache'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const session = await getSessionProfile()

  if (!session.user || !session.orgId) {
    return new Response('Não autorizado.', { status: 401 })
  }

  const supabase = await createSupabaseServerClient()

  const { data: client } = await supabase
    .from('app_clients')
    .select('id, member_id')
    .eq('id', id)
    .eq('org_id', session.orgId)
    .maybeSingle()

  if (!client) {
    return new Response('Cliente não encontrado.', { status: 404 })
  }

  // Deleta o vínculo do cliente (app_members)
  if (client.member_id) {
    await supabase
      .from('app_members')
      .delete()
      .eq('id', client.member_id)
      .eq('org_id', session.orgId)
  }

  // Limpa o campo de convite
  await supabase
    .from('app_clients')
    .update({ invited_email: null, member_id: null })
    .eq('id', id)
    .eq('org_id', session.orgId)

  revalidatePath(`/clients/${id}/info`)
  return new Response('Acesso removido.', { status: 200 })
}
