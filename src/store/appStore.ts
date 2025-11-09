import type { SyncedTable, TableMap } from '@/types/tables'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AppState {
  orgId: string | null
  tables: { [K in SyncedTable]: TableMap[K][] }
  setOrgId: (orgId: string | null) => void
  setTable: <K extends SyncedTable>(table: K, rows: TableMap[K][]) => void
  upsertRow: <K extends SyncedTable>(table: K, row: TableMap[K]) => void
  removeRow: <K extends SyncedTable>(table: K, id: string) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      orgId: null,
      tables: {
        app_clients: [],
        app_tasks: [],
        app_content_calendar: [],
        org_client_stats: [],
      },

      setOrgId: (orgId) => set({ orgId }),

      setTable: (table, rows) =>
        set((state) => ({
          tables: { ...state.tables, [table]: [...rows] },
        })),

      upsertRow: (table, row) =>
        set((state) => {
          const existing = state.tables[table]
          const index = existing.findIndex((r) => r.id === row.id)

          const updated =
            index !== -1
              ? [
                  ...existing.slice(0, index),
                  { ...existing[index], ...row },
                  ...existing.slice(index + 1),
                ]
              : [...existing, row]

          return { tables: { ...state.tables, [table]: updated } }
        }),

      removeRow: (table, id) =>
        set((state) => ({
          tables: {
            ...state.tables,
            [table]: state.tables[table].filter((r) => r.id !== id),
          },
        })),
    }),
    { name: 'AppStore' }
  )
)
