import { createServerSupabaseClient } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('app_clients')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}
