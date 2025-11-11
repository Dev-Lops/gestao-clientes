import { act } from "@testing-library/react";
import { useAppStore } from "./appStore";
import type { TableMap } from "@/types/tables";

describe("useAppStore", () => {
  const resetStore = () => {
    useAppStore.setState({
      orgId: null,
      role: null,
      userEmail: null,
      tables: {},
    });
  };

  beforeEach(() => {
    resetStore();
    useAppStore.persist.clearStorage();
  });

  it("updates identity information", () => {
    const store = useAppStore.getState();

    act(() => {
      store.setOrgId("org-123");
      store.setRole("owner");
      store.setUserEmail("user@example.com");
    });

    const nextState = useAppStore.getState();
    expect(nextState.orgId).toBe("org-123");
    expect(nextState.role).toBe("owner");
    expect(nextState.userEmail).toBe("user@example.com");
  });

  it("manages table data with set, upsert and remove", () => {
    const store = useAppStore.getState();
    const initialRow = {
      id: "1",
      name: "Initial Client",
    } as TableMap["app_clients"];
    const updatedRow = {
      ...initialRow,
      name: "Updated Client",
    } as TableMap["app_clients"];
    const newRow = { id: "2", name: "New Client" } as TableMap["app_clients"];

    act(() => {
      store.setTable("app_clients", [initialRow]);
    });
    expect(useAppStore.getState().tables.app_clients).toEqual([initialRow]);

    act(() => {
      store.upsertRow("app_clients", updatedRow);
    });
    expect(useAppStore.getState().tables.app_clients).toEqual([updatedRow]);

    act(() => {
      store.upsertRow("app_clients", newRow);
    });
    expect(useAppStore.getState().tables.app_clients).toEqual([
      updatedRow,
      newRow,
    ]);

    act(() => {
      store.removeRow("app_clients", "1");
    });
    expect(useAppStore.getState().tables.app_clients).toEqual([newRow]);
  });

  it("clears all data with clearAll", () => {
    const store = useAppStore.getState();

    act(() => {
      store.setOrgId("org-123");
      store.setRole("staff");
      store.setUserEmail("staff@example.com");
      store.setTable("app_clients", [
        { id: "client-1", name: "Client" } as TableMap["app_clients"],
      ]);
      store.clearAll();
    });

    expect(useAppStore.getState()).toEqual({
      orgId: null,
      role: null,
      userEmail: null,
      tables: {},
      setOrgId: store.setOrgId,
      setRole: store.setRole,
      setUserEmail: store.setUserEmail,
      setTable: store.setTable,
      upsertRow: store.upsertRow,
      removeRow: store.removeRow,
      clearAll: store.clearAll,
    });
  });

  it("persists only selected fields and resets tables on rehydrate", () => {
    const options = useAppStore.persist.getOptions();

    const partial = options.partialize({
      orgId: "org",
      role: "role",
      userEmail: "user@example.com",
      tables: { app_clients: [{ id: "1" } as TableMap["app_clients"]] },
      setOrgId: jest.fn(),
      setRole: jest.fn(),
      setUserEmail: jest.fn(),
      setTable: jest.fn(),
      upsertRow: jest.fn(),
      removeRow: jest.fn(),
      clearAll: jest.fn(),
    } as unknown as ReturnType<typeof useAppStore.getState>);

    expect(partial).toEqual({
      orgId: "org",
      role: "role",
      userEmail: "user@example.com",
    });

    const rehydrate = options.onRehydrateStorage?.();
    const state = {
      tables: { app_clients: [{ id: "1" } as TableMap["app_clients"]] },
    } as unknown as ReturnType<typeof useAppStore.getState>;

    rehydrate?.(state, undefined);

    expect(state.tables).toEqual({});
  });
});
