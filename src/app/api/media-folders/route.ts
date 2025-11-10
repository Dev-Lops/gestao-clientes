import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Endpoint de listagem de pastas de mídia
 * Usa o cliente de servidor (com cookies HttpOnly do Supabase)
 */
export async function GET() {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('app_media_items')
    .select('id, folder, title')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
