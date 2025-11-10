export type ClientStatus = 'new' | 'onboarding' | 'active' | 'paused' | 'closed'

export interface AppClient {
  id: string
  name: string
  status?: ClientStatus
  plan?: string
  main_channel?: string
  account_manager?: string
  monthly_ticket?: number | null
  billing_day?: number | null
  payment_status?: string | null
  payment_method?: string | null
  start_date?: string | null
  next_delivery?: string | null
  last_meeting_at?: string | null
  internal_notes?: string | null
  progress?: number | null
  created_by?: string
  org_id?: string
  created_at?: string
}
