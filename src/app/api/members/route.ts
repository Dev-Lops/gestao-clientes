import { getSessionProfile } from '@/lib/auth/session'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { orgId } = await getSessionProfile()

    if (!orgId) {
      return new Response(
        JSON.stringify({ error: 'Organização não encontrada.' }),
        { status: 400 }
      )
    }

    // 🔹 Busca membros
    const { data, error } = await supabase
      .from('app_members')
      .select(
        `
        id,
        user_id,
        role,
        status,
        full_name,
        created_at,
        org_id
      `
      )
      .eq('org_id', orgId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro na query:', error)
      return new Response(
        JSON.stringify({
          error: 'Erro ao buscar membros',
          details: error.message,
        }),
        { status: 500 }
      )
    }

    return Response.json({ data })
  } catch (err) {
    console.error('Erro na API /api/members:', err)
    return new Response(
      JSON.stringify({
        error: 'Falha ao buscar membros',
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500 }
    )
  }
}
