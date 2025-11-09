"use client";

import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { fetchInitialData } from "@/lib/supabase/fetchInitialData";
import { useAppStore } from "@/store/appStore";
import { SyncedTable, TableMap } from "@/types/tables";
import { ReactNode, useEffect, useState } from "react";

// 🔹 Tabelas sincronizadas
const TABLES: SyncedTable[] = [
  "app_clients",
  "app_tasks",
  "app_content_calendar",
  "org_client_stats",
];

// 🔹 Estrutura do estado local
type TableDataMap = {
  [K in SyncedTable]: TableMap[K][];
};

export function AppRealtimeProvider({
  orgId,
  children,
}: {
  orgId: string;
  children: ReactNode;
}) {
  const setOrgId = useAppStore((s) => s.setOrgId);
  const [initialData, setInitialData] = useState<Partial<TableDataMap>>({});

  // 🔸 Define org global
  useEffect(() => {
    setOrgId(orgId);
    return () => setOrgId(null);
  }, [orgId, setOrgId]);

  // 🔸 Busca dados iniciais de todas as tabelas
  useEffect(() => {
    async function loadInitial() {
      const result = {} as Partial<TableDataMap>;

      for (const table of TABLES) {
        const data = await fetchInitialData(table, orgId);

        switch (table) {
          case "app_clients":
            result[table] = data as TableMap["app_clients"][];
            break;
          case "app_tasks":
            result[table] = data as TableMap["app_tasks"][];
            break;
          case "app_content_calendar":
            result[table] = data as TableMap["app_content_calendar"][];
            break;
          case "org_client_stats":
            result[table] = data as TableMap["org_client_stats"][];
            break;
        }
      }

      setInitialData(result);
    }

    void loadInitial();
  }, [orgId]);

  // 🔸 Sincroniza cada tabela em tempo real
  useRealtimeSync({
    table: "app_clients",
    orgId,
    initialData: (initialData.app_clients ?? []) as TableMap["app_clients"][],
  });

  useRealtimeSync({
    table: "app_tasks",
    orgId,
    initialData: (initialData.app_tasks ?? []) as TableMap["app_tasks"][],
  });

  useRealtimeSync({
    table: "app_content_calendar",
    orgId,
    initialData: (initialData.app_content_calendar ??
      []) as TableMap["app_content_calendar"][],
  });

  useRealtimeSync({
    table: "org_client_stats",
    orgId,
    initialData: (initialData.org_client_stats ??
      []) as TableMap["org_client_stats"][],
  });

  // 🔸 Exibe loading enquanto carrega
  if (!Object.keys(initialData).length) {
    return <div className="p-4 text-center">Carregando dados...</div>;
  }

  return <>{children}</>;
}
