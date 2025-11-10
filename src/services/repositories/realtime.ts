import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { SyncedTable, TableMap } from "@/types/tables";

/**
 * Busca dados iniciais de uma tabela para a organização atual.
 */
export async function fetchInitialData<K extends SyncedTable>(
  table: K,
  orgId: string
): Promise<TableMap[K][]> {
  const supabase = createSupabaseBrowserClient();

  const actualTable =
    table === "org_client_stats" ? "org_client_stats_view" : table;

  const { data, error } = await supabase
    .from(actualTable as string)
    .select("*")
    .eq("org_id", orgId);

  if (error) {
    console.error(
      `Erro ao buscar dados da tabela "${actualTable}":`,
      error.message
    );
    return [];
  }

  return (data ?? []) as TableMap[K][];
}
