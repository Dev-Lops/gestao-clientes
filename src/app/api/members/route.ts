import { getSessionProfile } from '@/lib/auth/session'

export async function GET() {
  try {
    const { supabase, orgId } = await getSessionProfile()

    // 🔹 Busca membros sem depender de colunas inexistentes
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
      throw error
    }

    return Response.json({ data })
  } catch (err: any) {
    console.error('Erro na API /api/members:', err)
    return new Response(
      JSON.stringify({
        error: 'Falha ao buscar membros',
        details: err.message,
      }),
      { status: 500 }
    )
  }
}
