import { createClient } from '@/lib/supabase/browser'
import { SyncedTable, TableMap } from '@/types/tables'

/**
 * Busca os dados iniciais de uma tabela específica para a organização atual.
 * O tipo de retorno é automaticamente inferido a partir da tabela passada.
 */
export async function fetchInitialData<K extends SyncedTable>(
  table: K,
  orgId: string
): Promise<TableMap[K][]> {
  const supabase = createClient()

  // 👇 Corrige nomes que mudaram
  const actualTable =
    table === 'org_client_stats' ? 'org_client_stats_view' : table

  const { data, error } = await supabase
    .from(actualTable as string)
    .select('*')
    .eq('org_id', orgId)

  if (error) {
    console.error(
      `Erro ao buscar dados da tabela "${actualTable}":`,
      error.message
    )
    return []
  }

  return (data ?? []) as TableMap[K][]
}
