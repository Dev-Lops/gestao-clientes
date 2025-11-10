import { getSessionProfile } from '@/services/auth/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { orgId } = await getSessionProfile()

    if (!orgId) {
      return new Response(JSON.stringify({ error: 'Organização não encontrada para o usuário autenticado.' }), {
        status: 401,
      })
    }

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
      console.error('Erro na consulta de membros:', error)
      throw error
    }

    return Response.json({ data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('Erro na API /api/members:', err)

    return new Response(JSON.stringify({ error: 'Falha ao buscar membros', details: message }), {
      status: 500,
    })
  }
}
