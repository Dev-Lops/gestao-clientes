import { resolveSessionContext } from "@/services/auth/session-utils";

describe("resolveSessionContext", () => {
  it("returns guest when no member or owner org", () => {
    expect(resolveSessionContext(null, null)).toEqual({
      orgId: null,
      role: "guest",
    });
  });

  it("honors owner org when available", () => {
    expect(resolveSessionContext(null, "org-123")).toEqual({
      orgId: "org-123",
      role: "owner",
    });
  });

  it("prefers member role over owner fallback", () => {
    expect(
      resolveSessionContext({ org_id: "org-999", role: "staff" }, "org-123"),
    ).toEqual({
      orgId: "org-999",
      role: "staff",
    });
  });
});
