import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * ✅ Lista arquivos de mídia do cliente autenticado.
 * - Usa o cliente Supabase no servidor (com cookies de sessão)
 * - Respeita políticas RLS automaticamente
 */
<<<<<<< HEAD
export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
=======
export async function GET() {
  const supabase = await createServerSupabaseClient()
>>>>>>> 66d34b01a64c46676e180dadbedcf691e78156c2

    // 🔹 Obtem usuário autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado.' },
        { status: 401 }
      )
    }

    // 🔹 Busca org vinculada ao usuário
    const { data: member } = await supabase
      .from('app_members')
      .select('org_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!member?.org_id) {
      return NextResponse.json(
        { error: 'Organização não encontrada.' },
        { status: 403 }
      )
    }

    // 🔹 Busca arquivos da organização
    const { data, error } = await supabase
      .from('app_media_items')
      .select('id, folder, subfolder, title, created_at')
      .eq('org_id', member.org_id)
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
