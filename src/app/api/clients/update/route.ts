import { createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const supabase = await createServerSupabase()

    const { id, ...rest } = data
    const { error } = await supabase
      .from('app_clients')
      .update(rest)
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}
