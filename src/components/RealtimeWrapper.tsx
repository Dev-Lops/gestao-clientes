'use client'

import { AppRealtimeProvider } from '@/providers/AppRealtimeProvider'

/**
 * Client-side wrapper para inicializar o Supabase realtime.
 * Evita erro de SSR: “Tentou usar Supabase browser client no servidor”.
 */
export default function RealtimeWrapper({
  orgId,
  children,
}: {
  orgId: string
  children: React.ReactNode
}) {
  return <AppRealtimeProvider orgId={orgId}>{children}</AppRealtimeProvider>
}
