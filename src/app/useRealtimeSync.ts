'use client'

import { useAppStore } from '@/store/appStore'
import type { SyncedTable, TableMap } from '@/types/tables'
import type {
  RealtimePostgresChangesPayload,
  SupabaseClient,
} from '@supabase/supabase-js'
import { useEffect, useRef } from 'react'

/**
 * 🔄 Hook genérico de sincronização em tempo real com Supabase.
 * Mantém as tabelas locais do Zustand sempre atualizadas via canais de realtime.
 */
export function useRealtimeSync<K extends SyncedTable>({
  table,
  orgId,
  initialData,
}: {
  table: K
  orgId?: string | null
  initialData?: TableMap[K][]
}) {
  const setTable = useAppStore((s) => s.setTable)
  const upsertRow = useAppStore((s) => s.upsertRow)
  const removeRow = useAppStore((s) => s.removeRow)

  const hydratedRef = useRef(false)

  useEffect(() => {
    // ❌ Evita execução no servidor (SSR)
    if (typeof window === 'undefined' || !orgId) return

    let channel: ReturnType<SupabaseClient['channel']> | null = null

    async function startRealtime() {
      try {
        // 🔹 Import lazy do client (só no browser)
        const { getSupabaseBrowser } = await import('@/lib/supabase/browser')
        const supabase = getSupabaseBrowser()
        if (!supabase) return

        // 🔹 Hidrata dados iniciais apenas uma vez
        if (!hydratedRef.current && initialData?.length) {
          setTable(table, initialData)
          hydratedRef.current = true
        }

        // 🔹 Canal Realtime do Supabase
        channel = supabase
          .channel(`realtime_${table}_${orgId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table,
              filter: orgId ? `org_id=eq.${orgId}` : undefined,
            },
            (payload: RealtimePostgresChangesPayload<TableMap[K]>) => {
              const { eventType, new: newRow, old: oldRow } = payload

              switch (eventType) {
                case 'DELETE':
                  if (oldRow && 'id' in oldRow) {
                    removeRow(table, String((oldRow as { id: string }).id))
                  }
                  break

                case 'INSERT':
                case 'UPDATE':
                  if (newRow && 'id' in newRow) {
                    upsertRow(table, newRow as TableMap[K])
                  }
                  break
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`📡 [Realtime] Subscribed to ${table}`)
            }
          })
      } catch (err) {
        console.error(`Erro ao iniciar realtime de ${table}:`, err)
      }
    }

    startRealtime()

    // 🔹 Cleanup ao desmontar
    return () => {
      if (channel) {
        channel.unsubscribe()
        console.log(`🛑 [Realtime] Unsubscribed from ${table}`)
      }
    }
  }, [table, orgId, initialData, setTable, upsertRow, removeRow])
}
