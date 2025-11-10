import { parseRole, type AppRole } from "@/services/auth/rbac";

export type SessionMemberSnapshot = {
  org_id: string | null;
  role: string | null;
};

export function resolveSessionContext(
  member: SessionMemberSnapshot | null,
  ownerOrgId: string | null
): { orgId: string | null; role: AppRole } {
  if (member) {
    return {
      orgId: member.org_id ?? null,
      role: parseRole(member.role),
    } as const;
  }

  if (ownerOrgId) {
    return {
      orgId: ownerOrgId,
      role: "owner",
    } as const;
  }

  return {
    orgId: null,
    role: "guest",
  } as const;
}
