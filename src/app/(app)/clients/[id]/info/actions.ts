export interface ClientUpdatePayload {
  id?: string
  name?: string
  status?: string
  plan?: string
  main_channel?: string
  account_manager?: string | null
  payment_status?: string | null
  payment_method?: string | null
  billing_day?: number | null
  monthly_ticket?: number | null
  internal_notes?: string | null
  meeting_date?: string | null
  payment_date?: string | null
  progress?: number | null
}

export async function updateClientInfo(
  updatedData: ClientUpdatePayload
): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch('/api/client/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Falha ao atualizar cliente')
    }

    return { ok: true }
  } catch (err) {
    console.error('Erro em updateClientInfo:', err)
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return { ok: false, message }
  }
}
