"use client";

import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { deriveOrgClientStats } from "@/services/analytics/client-stats";
import { fetchInitialData } from "@/services/repositories/realtime";
import { useAppStore } from "@/store/appStore";
import type { AppClient, SyncedTable, TableMap } from "@/types/tables";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const TABLES: SyncedTable[] = [
  "app_clients",
  "app_tasks",
  "app_content_calendar",
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
  const setTable = useAppStore((s) => s.setTable);
  const clients = useAppStore(
    (s) => s.tables.app_clients as AppClient[] | undefined,
  );
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
        }),
      );

      setInitialData(Object.fromEntries(results) as Partial<TableDataMap>);
    }

    if (orgId) void loadInitial();
  }, [orgId]);

  // ✅ Hooks são chamados sempre (sem condicional)
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

  useEffect(() => {
    if (!orgId) return;
    if (!Array.isArray(clients)) return;

    const stats = deriveOrgClientStats(orgId, clients);
    setTable("org_client_stats", [stats]);
  }, [clients, orgId, setTable]);

  if (!Object.keys(initialData).length) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <p className="text-sm">Sincronizando dados da organização…</p>
      </div>
    );
  }

  return <>{children}</>;
}
