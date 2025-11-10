import { act } from "@testing-library/react";
import { useAppStore } from "@/store/appStore";

describe("useAppStore", () => {
  beforeEach(() => {
    useAppStore.getState().clearAll();
    localStorage.clear();
  });

  it("updates organization metadata without persisting tables", () => {
    act(() => {
      useAppStore.getState().setOrgId("org-123");
      useAppStore.getState().setRole("staff");
      useAppStore.getState().setUserEmail("user@example.com");
      useAppStore
        .getState()
        .setTable("app_clients", [
          { id: "client-1", org_id: "org-123" } as never,
        ]);
    });

    const state = useAppStore.getState();
    expect(state.orgId).toBe("org-123");
    expect(state.tables.app_clients?.length).toBe(1);

    const persisted = localStorage.getItem("app-store");
    expect(persisted).not.toBeNull();
    expect(persisted).not.toContain("app_clients");
  });

  it("clears tables on rehydration", async () => {
    act(() => {
      useAppStore.getState().setOrgId("org-777");
      useAppStore
        .getState()
        .setTable("app_tasks", [{ id: "task-1", org_id: "org-777" } as never]);
    });

    expect(useAppStore.getState().tables.app_tasks).toHaveLength(1);

    await useAppStore.persist.rehydrate();

    expect(useAppStore.getState().tables.app_tasks).toBeUndefined();
  });
});
