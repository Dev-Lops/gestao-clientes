"use client";

import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { fetchInitialData } from "@/services/repositories/realtime";
import { useAppStore } from "@/store/appStore";
import type { SyncedTable, TableMap } from "@/types/tables";
import { useEffect, useState } from "react";

const TABLES: SyncedTable[] = [
  "app_clients",
  "app_tasks",
  "app_content_calendar",
  "org_client_stats",
];

type TableDataMap = {
  [K in SyncedTable]: TableMap[K][];
};

export function AppRealtimeProvider({
  orgId,
  children,
}: {
  orgId: string;
  children: React.ReactNode;
}) {
  const setOrgId = useAppStore((s) => s.setOrgId);
  const [initialData, setInitialData] = useState<Partial<TableDataMap>>({});

  useEffect(() => {
    setOrgId(orgId);
    return () => setOrgId(null);
  }, [orgId, setOrgId]);

  // 🔸 Busca dados iniciais de todas as tabelas
  useEffect(() => {
    async function loadInitial() {
      const results = await Promise.all(
        TABLES.map(async (table) => {
          const data = await fetchInitialData(table, orgId);
          return [table, data] as const;
        })
      );

      setInitialData(Object.fromEntries(results) as Partial<TableDataMap>);
    }

    if (orgId) void loadInitial();
  }, [orgId]);

  // ✅ Hooks são chamados sempre (sem condicional)
  useRealtimeSync({
    table: "app_clients",
    orgId,
    initialData: initialData.app_clients ?? [],
  });

  useRealtimeSync({
    table: "app_tasks",
    orgId,
    initialData: initialData.app_tasks ?? [],
  });

  useRealtimeSync({
    table: "app_content_calendar",
    orgId,
    initialData: initialData.app_content_calendar ?? [],
  });

  useRealtimeSync({
    table: "org_client_stats",
    orgId,
    initialData: initialData.org_client_stats ?? [],
  });

  if (!Object.keys(initialData).length) {
    return <div className="p-4 text-center">Carregando dados...</div>;
  }

  return <>{children}</>;
}
