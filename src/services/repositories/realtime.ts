import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { SyncedTable, TableMap } from "@/types/tables";

// ========================================
// CONFIGURAÇÕES DE COLUNAS E LIMITES
// ========================================

const SELECTS: Record<SyncedTable, string> = {
  app_clients:
    "id, org_id, name, status, plan, main_channel, account_manager, payment_status, monthly_ticket, created_at",
  app_tasks:
    "id, org_id, client_id, title, status, urgency, due_date, created_at",
  app_orgs: "id, name, owner_user_id, created_at",
  app_members: "id, org_id, user_id, full_name, role, status, created_at",
  app_content_calendar:
    "id, org_id, created_by, event_date, title, notes, channel, created_at",
  org_client_stats:
    "id, org_id, total, ativos, onboarding, pausados, media_progresso",
};

const LIMITS: Partial<Record<SyncedTable, number>> = {
  app_clients: 50,
  app_tasks: 100,
  app_content_calendar: 60,
  org_client_stats: 1,
};

// ========================================
// MAPEAMENTO DE TABELAS E VIEWS
// (usar `as const` pra manter os literais!)
// ========================================

const TABLE_NAME_MAP = {
  app_clients: "app_clients",
  app_tasks: "app_tasks",
  app_orgs: "app_orgs",
  app_members: "app_members",
  app_content_calendar: "app_content_calendar",
  org_client_stats: "org_client_stats_view",
} as const satisfies Record<SyncedTable, string>;

// ========================================
// FETCH DE DADOS INICIAIS
// ========================================

export async function fetchInitialData<K extends SyncedTable>(
  table: K,
  orgId: string,
): Promise<TableMap[K][]> {
  const supabase = createSupabaseBrowserClient();
  const tableName = TABLE_NAME_MAP[table];
  const select = SELECTS[table];
  const limit = LIMITS[table];

  // 1) caso seja uma VIEW (ex.: org_client_stats_view)
  if (tableName === "org_client_stats_view") {
    let query = supabase.from("org_client_stats_view").select(select);

    // views nem sempre têm org_id, mas se tiver, filtramos
    if (select.includes("org_id")) {
      query = query.eq("org_id", orgId);
    }
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error(
        `Erro ao buscar dados da view "${tableName}":`,
        error.message,
      );
      return [];
    }

    return (data ?? []) as TableMap[K][];
  }

  // 2) caso seja uma tabela normal
  if (tableName !== "org_client_stats_view") {
    // 2) caso seja uma tabela normal
    let query = supabase
      .from(
        tableName as
          | "app_clients"
          | "app_tasks"
          | "app_orgs"
          | "app_members"
          | "app_content_calendar",
      )
      .select(select);

    if (select.includes("org_id")) {
      // cast explícito pro TS não reclamar
      query = query.eq("org_id" as never, orgId);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error(
        `Erro ao buscar dados da tabela "${tableName}":`,
        error.message,
      );
      return [];
    }

    return (data ?? []) as TableMap[K][];
  }

  return [];
}

// ========================================
// SUBSCRIBE REALTIME DATA
// ========================================

type RealtimeCallback<K extends SyncedTable> = (
  payload: TableMap[K] & { eventType: "INSERT" | "UPDATE" | "DELETE" },
) => void;

export function subscribeRealtimeData<K extends SyncedTable>(
  table: K,
  orgId: string,
  onChange: RealtimeCallback<K>,
) {
  const supabase = createSupabaseBrowserClient();
  const tableName = TABLE_NAME_MAP[table];

  // Supabase não manda realtime pra views
  if (tableName.endsWith("_view")) {
    console.warn(
      `⚠️ Realtime ignorado: "${tableName}" é uma view e o Supabase não emite eventos.`,
    );
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel(`realtime:${tableName}:${orgId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: tableName,
        filter: `org_id=eq.${orgId}`,
      },
      (payload) => {
        const eventType = payload.eventType as "INSERT" | "UPDATE" | "DELETE";
        const newData = payload.new as TableMap[K];
        onChange({ ...newData, eventType });
      },
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.info(`📡 Inscrito em realtime: ${tableName}`);
      }
    });

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
      console.info(`❌ Cancelada inscrição em: ${tableName}`);
    },
  };
}
