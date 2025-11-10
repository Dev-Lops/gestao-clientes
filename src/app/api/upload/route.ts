import { createServerClient } from '@supabase/ssr'
import { randomUUID } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * ✅ Upload handler oficial
 * - Autentica com Supabase via cookies
 * - Salva no bucket "media"
 * - Cria registro em app_media_items
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const clientId = formData.get('clientId')?.toString()
    const folder = formData.get('folder')?.toString() || ''
    const subfolder = formData.get('subfolder')?.toString() || null
    const title = formData.get('title')?.toString() || file?.name || 'sem_nome'

    if (!file || !clientId) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {}, // sem escrita aqui
        },
      }
    )

    // 🔹 Autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user)
      return NextResponse.json(
        { error: 'Usuário não autenticado.' },
        { status: 401 }
      )

    // 🔹 Caminho no storage
    const path = `${clientId}/${folder}${
      subfolder ? `/${subfolder}` : ''
    }/${randomUUID()}-${file.name}`

    // 🔹 Upload no Storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, { upsert: false })

    if (uploadError) throw uploadError

    // 🔹 Descobre org_id via app_members
    const { data: member } = await supabase
      .from('app_members')
      .select('org_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const orgId = member?.org_id ?? null

    // 🔹 Cria registro no banco
    const { error: insertError } = await supabase
      .from('app_media_items')
      .insert({
        client_id: clientId,
        org_id: orgId,
        folder,
        subfolder,
        title,
        file_path: path,
        created_by: user.id,
      })

    if (insertError) throw insertError

    return NextResponse.json({ success: true, path })
  } catch (err: unknown) {
    console.error('❌ Upload error:', err)
    return NextResponse.json(
      { error: 'Falha ao fazer upload.' },
      { status: 500 }
    )
  }
}
