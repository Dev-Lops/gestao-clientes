import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Todas as tabelas sincronizadas
export type SyncedTable =
  | 'app_clients'
  | 'app_tasks'
  | 'app_content_calendar'
  | 'org_client_stats'

export interface BaseRow {
  id?: string
  org_id?: string | null
  [key: string]: unknown
}

interface AppState {
  orgId: string | null
  tables: Record<SyncedTable, BaseRow[]>

  setOrgId: (orgId: string | null) => void
  setTable: (table: SyncedTable, rows: BaseRow[]) => void
  upsertRow: (table: SyncedTable, row: BaseRow) => void
  removeRow: (table: SyncedTable, id: string) => void
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
          const existing = state.tables[table] || []
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
