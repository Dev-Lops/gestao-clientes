import { getSessionProfile } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function slugify(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export async function POST(req: Request) {
  try {
    console.log('📥 [UPLOAD] Iniciando upload...')
    const { supabase, user, orgId } = await getSessionProfile()
    if (!orgId || !user) throw new Error('Sessão inválida.')

    const form = await req.formData()
    const file = form.get('file')
    const clientId = String(form.get('clientId') || '')
    const folder = String(form.get('folder') || '')
    const subfolder = String(form.get('subfolder') || '') // 👈 NOVO
    const title = String(form.get('title') || '')

    console.log('📄 Dados recebidos:', {
      clientId,
      folder,
      subfolder,
      title,
      file: file instanceof File ? file.name : '❌ Nenhum arquivo',
    })

    if (!(file instanceof File))
      throw new Error('Arquivo não encontrado no formulário.')
    if (!clientId || !folder)
      throw new Error('Faltam informações obrigatórias (clientId/folder).')

    // Montagem segura do caminho
    const ext = file.name.match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase() || ''
    const base = slugify(file.name.replace(ext, ''))
    const filename = `${Date.now()}_${base}${ext}`

    const folderPath = [
      orgId,
      clientId,
      slugify(folder),
      subfolder ? slugify(subfolder) : '',
    ]
      .filter(Boolean)
      .join('/')

    const storagePath = `${folderPath}/${filename}`
    console.log('📂 Caminho no storage:', storagePath)

    // Upload para o Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadErr } = await supabase.storage
      .from('media')
      .upload(storagePath, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      })

    if (uploadErr) {
      console.error('❌ Erro ao subir arquivo:', uploadErr)
      throw new Error(uploadErr.message)
    }

    // Inserção no banco de dados
    const { error: insertErr } = await supabase.from('app_media_items').insert({
      org_id: orgId,
      client_id: clientId,
      folder,
      subfolder: subfolder || null, // 👈 NOVO
      title: title || file.name,
      file_path: storagePath,
      file_type: file.type,
      file_size: file.size,
      created_by: user.id,
    })

    if (insertErr) {
      console.error('❌ Erro ao registrar no banco:', insertErr)
      throw new Error(insertErr.message)
    }

    console.log('✅ Upload finalizado com sucesso!')
    return NextResponse.json({ ok: true, path: storagePath }, { status: 201 })
  } catch (err) {
    console.error('🔥 ERRO GERAL NO UPLOAD:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
