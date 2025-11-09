// src/types/tables.ts
export interface AppClient {
  id: string
  org_id: string
  name: string
  status: string
  plan: string
  main_channel: string
  created_at: string
}

export interface AppTask {
  id: string
  org_id: string
  client_id: string
  title: string
  status: string
  due_date: string | null
  urgency: string
  created_at: string
}

export interface ContentCalendarItem {
  id: string
  org_id: string
  created_by: string
  date: string
  title: string | null
  notes: string | null
  channel: string | null
  content_type?: string | null
  caption?: string | null
  created_at: string
}

export interface OrgClientStats {
  id: string
  org_id: string
  total: number
  ativos: number
  onboarding: number
  pausados: number
  media_progresso: number
}

export type SyncedTable =
  | 'app_clients'
  | 'app_tasks'
  | 'app_content_calendar'
  | 'org_client_stats'

export type TableMap = {
  app_clients: AppClient
  app_tasks: AppTask
  app_content_calendar: ContentCalendarItem
  org_client_stats: OrgClientStats
}
