import { createClient } from '@/lib/supabase/browser'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing client ID' }, { status: 400 })
    }

    const supabase = createClient()

    // 🔒 1. Recupera o usuário autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 🔐 2. Busca o org_id do usuário logado (ex: salvo em user_metadata)
    const orgId = user.user_metadata?.org_id

    if (!orgId) {
      return NextResponse.json(
        { error: 'Missing organization ID' },
        { status: 400 }
      )
    }

    // ✅ 3. Garante que o cliente pertence à mesma org
    const { data, error } = await supabase
      .from('app_clients')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId) // <— filtro obrigatório
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ client: data }, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('API Error:', err.message)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
  }
}
