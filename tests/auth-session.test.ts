import test from "node:test";
import assert from "node:assert/strict";

import { resolveSessionContext } from "../src/services/auth/session-utils";

test("resolveSessionContext returns guest when no member or owner org", () => {
  const context = resolveSessionContext(null, null);
  assert.deepEqual(context, { orgId: null, role: "guest" });
});

test("resolveSessionContext honors owner org when available", () => {
  const context = resolveSessionContext(null, "org-123");
  assert.deepEqual(context, { orgId: "org-123", role: "owner" });
});

test("resolveSessionContext prefers member role over owner fallback", () => {
  const context = resolveSessionContext({ org_id: "org-999", role: "staff" }, "org-123");
  assert.deepEqual(context, { orgId: "org-999", role: "staff" });
});
