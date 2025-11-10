'use client'

import { AppRealtimeProvider } from '@/providers/AppRealtimeProvider'
import { useAppStore } from '@/store/appStore'

export default function RealtimeWrapper({ children }: { children: React.ReactNode }) {
  const orgId = useAppStore((s) => s.orgId) // ou passe via props se preferir
  return <AppRealtimeProvider orgId={orgId || ''}>{children}</AppRealtimeProvider>
}
