import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id)
    return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('app_clients')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
