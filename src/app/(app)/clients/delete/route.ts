import { deleteClientAction } from '@/app/(app)/clients/actions'

export const POST = async (req: Request): Promise<Response> => {
  try {
    const formData = await req.formData()

    if (!formData.has('client_id')) {
      return new Response(
        JSON.stringify({ error: 'ID do cliente é obrigatório.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    await deleteClientAction(formData)

    return new Response(null, {
      status: 303,
      headers: { Location: '/clients' },
    })
  } catch (err: unknown) {
    console.error('Erro ao excluir cliente:', err)
    const message =
      err instanceof Error ? err.message : 'Erro inesperado ao excluir cliente.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
