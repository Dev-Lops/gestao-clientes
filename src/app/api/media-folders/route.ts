import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * ✅ Lista arquivos de mídia do cliente autenticado.
 * - Usa o cliente Supabase no servidor (com cookies de sessão)
 * - Respeita políticas RLS automaticamente
 */

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()


  const { data, error } = await supabase
    .from('app_media_items')
    .select('id, folder, title')
    .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar mídias:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('Erro inesperado:', err)
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    )
  }
}
