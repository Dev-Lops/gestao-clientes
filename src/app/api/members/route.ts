import { getSessionProfile } from '@/lib/auth/session'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { orgId } = await getSessionProfile()

    if (!orgId) {
<<<<<<< HEAD
      return new Response(
        JSON.stringify({ error: 'Organização não encontrada.' }),
        { status: 400 }
      )
    }

    // 🔹 Busca membros
=======
      return new Response(JSON.stringify({ error: 'Organização não encontrada para o usuário autenticado.' }), {
        status: 401,
      })
    }

>>>>>>> 66d34b01a64c46676e180dadbedcf691e78156c2
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 66d34b01a64c46676e180dadbedcf691e78156c2
  }
}
