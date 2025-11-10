"use client";

import type { SyncedTable, TableMap } from "@/types/tables";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppStoreState {
  orgId: string | null;
  role: string | null;
  userEmail: string | null;
  tables: {
    [K in SyncedTable]?: TableMap[K][];
  };
  setOrgId: (orgId: string | null) => void;
  setRole: (role: string | null) => void;
  setUserEmail: (email: string | null) => void;
  setTable: <K extends SyncedTable>(table: K, data: TableMap[K][]) => void;
  upsertRow: <K extends SyncedTable>(table: K, row: TableMap[K]) => void;
  removeRow: <K extends SyncedTable>(table: K, id: string) => void;
  clearAll: () => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      orgId: null,
      role: null,
      userEmail: null,
      tables: {},

      setOrgId: (orgId) => set({ orgId }),
      setRole: (role) => set({ role }),
      setUserEmail: (email) => set({ userEmail: email }),

      setTable: (table, data) =>
        set((state) => ({
          tables: { ...state.tables, [table]: data },
        })),

      upsertRow: <K extends SyncedTable>(table: K, row: TableMap[K]) =>
        set((state) => {
          const existing = state.tables[table] ?? [];
          const idx = existing.findIndex((r) => r.id === row.id);

          const updated =
            idx !== -1
              ? [...existing.slice(0, idx), row, ...existing.slice(idx + 1)]
              : [...existing, row];

          return { tables: { ...state.tables, [table]: updated } };
        }),

      removeRow: <K extends SyncedTable>(table: K, id: string) =>
        set((state) => {
          const existing = state.tables[table] ?? [];
          const filtered = existing.filter((r) => r.id !== id);
          return { tables: { ...state.tables, [table]: filtered } };
        }),

      clearAll: () =>
        set({ orgId: null, role: null, userEmail: null, tables: {} }),
    }),
    {
      name: "app-store",
      partialize: (state) => ({
        orgId: state.orgId,
        role: state.role,
        userEmail: state.userEmail,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.tables = {};
      },
    },
  ),
);
