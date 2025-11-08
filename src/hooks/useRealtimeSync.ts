import { getBrowserClient } from '@/lib/supabase/browser'
import { SyncedTable, useAppStore } from '@/store/appStore'
import { useEffect, useMemo, useRef } from 'react'

type RealtimeOptions<
  T extends Record<string, unknown> = Record<string, unknown>
> = {
  table: SyncedTable
  orgId?: string | null
  initialData?: T[]
}

/**
 * Hook de sincronização em tempo real com Supabase.
 * Atualiza as tabelas no Zustand automaticamente.
 */
export function useRealtimeSync<T extends Record<string, unknown>>({
  table,
  orgId,
  initialData,
}: RealtimeOptions<T>) {
  const supabase = useMemo(() => getBrowserClient(), [])
  const setTable = useAppStore((s) => s.setTable)
  const upsertRow = useAppStore((s) => s.upsertRow)
  const removeRow = useAppStore((s) => s.removeRow)

  const hydratedRef = useRef(false)

  useEffect(() => {
    hydratedRef.current = false
  }, [table, orgId])

  useEffect(() => {
    if (!orgId) return

    if (!hydratedRef.current && initialData?.length) {
      setTable(table, initialData)
      hydratedRef.current = true
    }

    const channel = supabase
      .channel(`realtime_${table}_${orgId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload: unknown) => {
          const {
            eventType,
            new: newRow,
            old: oldRow,
          } = payload as {
            eventType: 'INSERT' | 'UPDATE' | 'DELETE'
            new: (T & { org_id?: string | null; id?: string }) | null
            old: (T & { org_id?: string | null; id?: string }) | null
          }

          if (eventType === 'DELETE') {
            if (oldRow?.org_id && oldRow.org_id !== orgId) return
            if (oldRow?.id) removeRow(table, oldRow.id)
            return
          }

          if (newRow?.org_id && newRow.org_id !== orgId) return
          if (newRow?.id) upsertRow(table, newRow)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Subscribed to ${table}`)
        }
      })

    return () => {
      supabase.removeChannel(channel)
      console.log(`[Realtime] Unsubscribed from ${table}`)
    }
  }, [table, orgId, supabase, setTable, upsertRow, removeRow, initialData])
}
