import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const supabase = await createServerSupabase()

  const { data: client } = await supabase
    .from('app_clients')
    .select('id, member_id')
    .eq('id', id)
    .maybeSingle()

  if (!client) {
    return new Response('Cliente não encontrado.', { status: 404 })
  }

  // Deleta o vínculo do cliente (app_members)
  if (client.member_id) {
    await supabase.from('app_members').delete().eq('id', client.member_id)
  }

  // Limpa o campo de convite
  await supabase
    .from('app_clients')
    .update({ invited_email: null, member_id: null })
    .eq('id', id)

  revalidatePath(`/clients/${id}/info`)
  return new Response('Acesso removido.', { status: 200 })
}
