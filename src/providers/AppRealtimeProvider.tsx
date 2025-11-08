"use client";

import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { fetchInitialData } from "@/lib/supabase/fetchInitialData";
import { SyncedTable, useAppStore } from "@/store/appStore";
import { ReactNode, useEffect, useState } from "react";

type Props = {
  orgId: string;
  children: ReactNode;
};

type TableDataMap = Record<SyncedTable, unknown[]>;

// Constante de tabelas sincronizadas
const TABLES: SyncedTable[] = [
  "app_clients",
  "app_tasks",
  "app_content_calendar",
  "org_client_stats",
];

export function AppRealtimeProvider({ orgId, children }: Props) {
  const setOrgId = useAppStore((s) => s.setOrgId);
  const [initialData, setInitialData] = useState<Partial<TableDataMap>>({});

  // Define o org global
  useEffect(() => {
    setOrgId(orgId);
    return () => setOrgId(null);
  }, [orgId, setOrgId]);

  // Busca dados iniciais de todas as tabelas
  useEffect(() => {
    async function loadInitial() {
      const result: Partial<TableDataMap> = {};
      for (const table of TABLES) {
        result[table] = await fetchInitialData(table, orgId);
      }
      setInitialData(result);
    }

    loadInitial();

  }, [orgId]);

  // Inicia realtime para cada tabela (hooks precisam ser chamados diretamente)
  useRealtimeSync({
    table: "app_clients",
    orgId,
    initialData: initialData.app_clients,
  });
  useRealtimeSync({
    table: "app_tasks",
    orgId,
    initialData: initialData.app_tasks,
  });
  useRealtimeSync({
    table: "app_content_calendar",
    orgId,
    initialData: initialData.app_content_calendar,
  });
  useRealtimeSync({
    table: "org_client_stats",
    orgId,
    initialData: initialData.org_client_stats,
  });

  // Loader simples (opcional)
  if (!Object.keys(initialData).length) {
    return <div className="p-4 text-center">Carregando dados...</div>;
  }

  return <>{children}</>;
}
