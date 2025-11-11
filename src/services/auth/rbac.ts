const hierarchy = ["client", "staff", "owner"] as const;

export type Role = (typeof hierarchy)[number];

export function can(role: string | null, min: Role) {
  if (!role) return false;
  return hierarchy.indexOf(role as Role) >= hierarchy.indexOf(min);
}

export function isOwner(role: string | null) {
  return role === "owner";
}
