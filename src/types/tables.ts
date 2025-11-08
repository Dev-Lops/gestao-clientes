export interface AppClient {
  id: string;
  org_id: string;
  name: string;
  status: string;
  plan: string | null;
  main_channel: string | null;
  created_at: string;
}

export interface AppTask {
  id: string;
  org_id: string;
  client_id: string;
  title: string;
  status: "todo" | "doing" | "done" | "blocked";
  due_date: string | null;
  urgency: "low" | "normal" | "high" | "critical";
}

export interface ContentCalendarItem {
  id: string;
  org_id: string;
  created_by: string | null;
  date: string;
  title: string | null;
  notes: string | null;
  channel?: string | null;
}

export interface OrgClientStats {
  id?: string;
  org_id: string;
  total: number;
  ativos: number;
  onboarding: number;
  pausados: number;
  media_progresso: number;
}
