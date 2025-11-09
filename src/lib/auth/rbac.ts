// src/lib/auth/rbac.ts
export type AppRole = 'guest' | 'client' | 'staff' | 'owner'

const ROLE_ORDER: AppRole[] = ['guest', 'client', 'staff', 'owner']

export function can(role: AppRole | null, needed: AppRole) {
  if (!role) return false
  return ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(needed)
}

export const isOwner = (r: AppRole | null) => r === 'owner'
export const isStaffOrAbove = (r: AppRole | null) =>
  r === 'owner' || r === 'staff'
