import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSessionProfile } from '@/services/auth/session'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSessionProfile()

  if (!session.user || !session.orgId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('app_clients')
    .select('*')
    .eq('id', params.id)
    .eq('org_id', session.orgId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  return NextResponse.json(data, { status: 200 })
}
