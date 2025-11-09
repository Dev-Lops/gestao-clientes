export interface Client {
  id: string
  name: string
  status?: string
  plan?: string
  main_channel?: string
  account_manager?: string | null
  monthly_ticket?: number | null
  billing_day?: number | null
  payment_status?: string | null
  payment_method?: string | null
  meeting_date?: string | null
  payment_date?: string | null
  internal_notes?: string | null
  progress?: number | null
}
