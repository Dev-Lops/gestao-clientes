import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { SyncedTable, TableMap } from "@/types/tables";
import type { Database } from "@/types/supabase";

const SELECTS: Record<SyncedTable, string> = {
  app_clients:
    "id, org_id, name, status, plan, main_channel, account_manager, payment_status, monthly_ticket, created_at",
  app_tasks:
    "id, org_id, client_id, title, status, urgency, due_date, completed, created_at",
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

const TABLE_NAME_MAP: Record<
  SyncedTable,
  keyof Database["public"]["Tables"] | keyof Database["public"]["Views"]
> = {
  app_clients: "app_clients",
  app_tasks: "app_tasks",
  app_orgs: "app_orgs",
  app_members: "app_members",
  app_content_calendar: "app_content_calendar",
  org_client_stats: "org_client_stats_view",
};

const SELECTS: Record<SyncedTable, string> = {
  app_clients:
    "id, org_id, name, status, plan, main_channel, account_manager, payment_status, monthly_ticket, created_at",
  app_tasks:
    "id, org_id, client_id, title, status, urgency, due_date, completed, created_at",
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

const TABLE_NAME_MAP: Record<SyncedTable, string> = {
  app_clients: "app_clients",
  app_tasks: "app_tasks",
  app_orgs: "app_orgs",
  app_members: "app_members",
  app_content_calendar: "app_content_calendar",
  org_client_stats: "org_client_stats_view",
};

export async function fetchInitialData<K extends SyncedTable>(
  table: K,
  orgId: string,
): Promise<TableMap[K][]> {
  const supabase = createSupabaseBrowserClient();
  const actualTable = TABLE_NAME_MAP[table];
  const tableName = String(actualTable);

  const builder = supabase.from(tableName);

  let query = builder.select(SELECTS[table]);

  if (SELECTS[table].includes("org_id")) {
    query = query.eq("org_id", orgId);
  }

  const limit = LIMITS[table];
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
