// src/lib/auth/rbac.ts
export type AppRole = "guest" | "client" | "staff" | "owner";

const ROLE_ORDER: AppRole[] = ["guest", "client", "staff", "owner"];

export function can(role: AppRole | null, needed: AppRole) {
  if (!role) return false;
  return ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(needed);
}

export const isOwner = (r: AppRole | null) => r === "owner";
export const isStaffOrAbove = (r: AppRole | null) =>
  r === "owner" || r === "staff";

export function roleSatisfies(role: AppRole | null, required: AppRole) {
  return can(role, required);
}

export function parseRole(value: string | null | undefined): AppRole {
  if (!value) return "guest";
  const normalized = value.toLowerCase() as AppRole;
  return ROLE_ORDER.includes(normalized) ? normalized : "guest";
}
