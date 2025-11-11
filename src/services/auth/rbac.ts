// src/lib/auth/rbac.ts
export type AppRole = "guest" | "client" | "staff" | "owner";

const ROLE_ORDER: AppRole[] = ["guest", "client", "staff", "owner"];

export function parseRole(value: string | null | undefined): AppRole {
  if (!value) {
    return "guest";
  }

  const normalized = value.toLowerCase() as AppRole;
  return ROLE_ORDER.includes(normalized) ? normalized : "guest";
}

export function can(role: AppRole | null, required: AppRole): boolean {
  if (!role) {
    return false;
  }

  return ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(required);
}

export const roleSatisfies = can;

export const isOwner = (role: AppRole | null) => role === "owner";

export const isStaff = (role: AppRole | null) => role === "staff";

export const isClient = (role: AppRole | null) => role === "client";

export const isStaffOrAbove = (role: AppRole | null) =>
  role === "owner" || role === "staff";

export function assertCan(role: AppRole | null, required: AppRole) {
  if (!can(role, required)) {
    throw new Error("Permissão insuficiente.");
  }
}
