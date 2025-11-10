import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAppStore } from "@/store/appStore";
import type { SyncedTable, TableMap } from "@/types/tables";
import type { Database } from "@/types/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef } from "react";

const REALTIME_TABLE_MAP: Record<SyncedTable, string> = {
  app_clients: "app_clients",
  app_tasks: "app_tasks",
  app_orgs: "app_orgs",
  app_members: "app_members",
  app_content_calendar: "app_content_calendar",
  org_client_stats: "org_client_stats_view",
};

/**
 * Hook genérico para sincronização em tempo real com Supabase.
 * Mantém as tabelas locais no Zustand sempre atualizadas.
 */
export function useRealtimeSync<K extends SyncedTable>(params: {
  table: K;
  orgId?: string | null;
  initialData?: TableMap[K][];
}) {
  const { table, orgId, initialData } = params;

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const setTable = useAppStore((s) => s.setTable);
  const upsertRow = useAppStore((s) => s.upsertRow);
  const removeRow = useAppStore((s) => s.removeRow);

  const hydratedRef = useRef(false);

  // Reinicia hidratação ao trocar de tabela/org
  useEffect(() => {
    hydratedRef.current = false;
  }, [table, orgId]);

  useEffect(() => {
    if (!orgId) return;

    // 🔹 Carrega os dados iniciais apenas uma vez
    if (!hydratedRef.current && initialData?.length) {
      setTable(table, initialData);
      hydratedRef.current = true;
    }

    // 🔹 Assina os eventos em tempo real do Supabase
    const realtimeTable = REALTIME_TABLE_MAP[table];

    const channel = supabase
      .channel(`realtime_${table}_${orgId}`)
      .on(
        "postgres_changes" as const,
        { event: "*", schema: "public", table: realtimeTable },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const { eventType, new: newRowRaw, old: oldRowRaw } = payload;
          const newRow = newRowRaw as TableMap[K] | null;
          const oldRow = oldRowRaw as TableMap[K] | null;

          // DELETE
          if (eventType === "DELETE") {
            if (oldRow && "org_id" in oldRow && oldRow.org_id !== orgId) return;
            if (oldRow && "id" in oldRow && oldRow.id)
              removeRow(table, oldRow.id);
            return;
          }

          // INSERT / UPDATE
          if (newRow && "org_id" in newRow && newRow.org_id !== orgId) return;
          if (newRow && "id" in newRow && newRow.id) upsertRow(table, newRow);
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Realtime] Subscribed to ${table}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      console.log(`[Realtime] Unsubscribed from ${table}`);
    };
  }, [table, orgId, supabase, setTable, upsertRow, removeRow, initialData]);
}
