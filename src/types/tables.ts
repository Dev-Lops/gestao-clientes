import type { Tables, Views } from "./supabase";

type WithId<T extends { id: string }> = Partial<T> & { id: string };

export type AppClient = Tables<"app_clients">;
export type AppTask = Tables<"app_tasks">;
export type ContentCalendarItem = Tables<"app_content_calendar"> & {
  date?: string;
};
export type OrgClientStats = Views<"org_client_stats_view">;
export type AppOrg = Tables<"app_orgs">;
export type AppMember = Tables<"app_members">;

export type SyncedTable = keyof TableMap;

export interface TableMap {
  app_clients: WithId<AppClient>;
  app_tasks: WithId<AppTask>;
  app_orgs: WithId<AppOrg>;
  app_members: WithId<AppMember>;
  app_content_calendar: WithId<ContentCalendarItem>;
  org_client_stats: WithId<OrgClientStats>;
}
