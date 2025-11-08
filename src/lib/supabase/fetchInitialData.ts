import { getBrowserClient } from '@/lib/supabase/browser'

export async function fetchInitialData<T>(
  table: string,
  orgId?: string | null
): Promise<T[]> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('org_id', orgId ?? '')

  if (error) {
    console.error(`[Supabase] Erro ao buscar ${table}:`, error)
    return []
  }

  return data ?? []
}
