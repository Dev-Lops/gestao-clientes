// src/types/tables.ts

/* ----------------------------------------------------------
   🔹 Tipos principais das tabelas do Supabase
---------------------------------------------------------- */

// 🧭 Cliente
// src/types/tables.ts

export interface AppClient {
  id: string
  org_id: string // deve ser obrigatório — toda linha tem um org_id
  name: string
  status?: 'new' | 'onboarding' | 'active' | 'paused' | 'closed'
  plan?: string
  main_channel?: string
  account_manager?: string

  // 🔹 Pagamentos
  payment_status?: string
  payment_method?: string
  billing_day?: number
  monthly_ticket?: number

  // 🔹 Datas e acompanhamento
  start_date?: string
  next_delivery?: string
  last_meeting_at?: string
  meeting_date?: string
  payment_date?: string

  // 🔹 Outras informações
  internal_notes?: string
  progress?: number
  created_at?: string
}

// ✅ Tarefas
export interface AppTask {
  id: string
  org_id: string
  client_id: string
  title: string
  status?: 'todo' | 'doing' | 'done' | 'blocked'
  urgency?: 'low' | 'medium' | 'high' | 'critical'
  due_date?: string | null
  completed?: boolean | null // ← agora opcional
  created_at?: string
}

// 🗓️ Itens do calendário de conteúdo
export interface ContentCalendarItem {
  id: string
  org_id: string
  created_by: string
  event_date: string
  title: string
  notes?: string | null
  channel?: string | null
  created_at?: string
  // normalizado para uso no dashboard
  date?: string
}

// 📊 Estatísticas dos clientes por organização
export interface OrgClientStats {
  id: string
  org_id: string
  total?: number
  ativos?: number
  onboarding?: number
  pausados?: number
  media_progresso?: number
}

/* ----------------------------------------------------------
   🔹 Outras tabelas auxiliares
---------------------------------------------------------- */

export interface AppOrg {
  id: string
  name: string
  owner_user_id: string
  created_at?: string
}

export interface AppMember {
  id: string
  user_id: string
  org_id: string
  full_name?: string
  role?: 'owner' | 'staff' | 'client'
  status?: 'active' | 'inactive'
}

/* ----------------------------------------------------------
   🔹 Mapeamento global de tabelas
---------------------------------------------------------- */

export type SyncedTable = keyof TableMap

export interface TableMap {
  app_clients: AppClient
  app_tasks: AppTask
  app_orgs: AppOrg
  app_members: AppMember
  app_content_calendar: ContentCalendarItem
  org_client_stats: OrgClientStats
}
