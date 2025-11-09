import { createClient } from '@/lib/supabase/browser'
import { useAppStore } from '@/store/appStore'
import { SyncedTable, TableMap } from '@/types/tables'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useEffect, useMemo, useRef } from 'react'

/**
 * Hook genérico para sincronização em tempo real com Supabase.
 * Mantém as tabelas locais no Zustand sempre atualizadas.
 */
export function useRealtimeSync<K extends SyncedTable>(params: {
  table: K
  orgId?: string | null
  initialData?: TableMap[K][]
}) {
  const { table, orgId, initialData } = params

  const supabase = useMemo(() => createClient(), [])
  const setTable = useAppStore((s) => s.setTable)
  const upsertRow = useAppStore((s) => s.upsertRow)
  const removeRow = useAppStore((s) => s.removeRow)

  const hydratedRef = useRef(false)

  // Reinicia hidratação ao trocar de tabela/org
  useEffect(() => {
    hydratedRef.current = false
  }, [table, orgId])

  useEffect(() => {
    if (!orgId) return

    // 🔹 Carrega os dados iniciais apenas uma vez
    if (!hydratedRef.current && initialData?.length) {
      setTable(table, initialData)
      hydratedRef.current = true
    }

    // 🔹 Assina os eventos em tempo real do Supabase
    const channel = supabase
      .channel(`realtime_${table}_${orgId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload: RealtimePostgresChangesPayload<TableMap[K]>) => {
          const { eventType, new: newRow, old: oldRow } = payload

          // DELETE
          if (eventType === 'DELETE') {
            if (oldRow && 'org_id' in oldRow && oldRow.org_id !== orgId) return
            if (oldRow && 'id' in oldRow && oldRow.id)
              removeRow(table, oldRow.id)
            return
          }

          // INSERT / UPDATE
          if (newRow && 'org_id' in newRow && newRow.org_id !== orgId) return
          if (newRow && 'id' in newRow && newRow.id) upsertRow(table, newRow)
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
