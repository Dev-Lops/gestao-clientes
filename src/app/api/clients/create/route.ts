import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * ✅ Criação de cliente com logs completos de debug
 * Mostra no console cada etapa do processo
 */
export async function POST(req: Request) {
  console.log('🟢 [API] Recebendo requisição POST /api/clients/create')

  try {
    const body = await req.json()
    console.log('📦 Body recebido:', body)

    const supabase = await createServerSupabaseClient()
    console.log('🔗 Supabase client criado')

    // 🔐 Recupera usuário logado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError)
      return NextResponse.json(
        { ok: false, message: userError.message },
        { status: 401 }
      )
    }

    if (!user) {
      console.warn('⚠️ Nenhum usuário autenticado')
      return NextResponse.json(
        { ok: false, message: 'Usuário não autenticado.' },
        { status: 401 }
      )
    }

    console.log('👤 Usuário autenticado:', user.id)

    // ⚙️ Pega o org_id salvo em user_metadata (deve ter vindo do login)
    const orgId = user.user_metadata?.org_id
    console.log('🏢 Org ID:', orgId)

    if (!orgId) {
      console.error('❌ Nenhuma organização vinculada ao usuário.')
      return NextResponse.json(
        { ok: false, message: 'Organização não vinculada ao usuário.' },
        { status: 400 }
      )
    }

    // 🧠 Validação de campos obrigatórios
    if (!body.name || body.name.trim().length < 3) {
      console.warn('⚠️ Nome inválido ou ausente:', body.name)
      return NextResponse.json(
        { ok: false, message: 'Informe um nome válido para o cliente.' },
        { status: 400 }
      )
    }

    // 🧾 Dados a inserir
    const insertData = {
      org_id: orgId,
      name: body.name.trim(),
      status: body.status ?? 'new',
      plan: body.plan ?? null,
      main_channel: body.main_channel ?? null,
      account_manager: body.account_manager ?? null,
      payment_status: body.payment_status ?? null,
      created_by: user.id,
    }

    console.log('📤 Tentando inserir cliente:', insertData)

    const { data, error } = await supabase
      .from('app_clients')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error(
        '❌ Supabase erro ao inserir:',
        error.message,
        error.details || ''
      )
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Cliente criado com sucesso:', data)

    return NextResponse.json(
      { ok: true, message: 'Cliente criado com sucesso!', client: data },
      { status: 201 }
    )
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('🚨 Erro inesperado no servidor:', err.message)
      return NextResponse.json(
        { ok: false, message: err.message },
        { status: 500 }
      )
    }

    console.error('🚨 Erro desconhecido no servidor:', err)
    return NextResponse.json(
      { ok: false, message: 'Erro desconhecido ao criar cliente.' },
      { status: 500 }
    )
  }
}
