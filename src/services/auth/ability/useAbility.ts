// src/services/auth/ability/useAbility.ts
'use client'

import { useAbilityContext } from './AbilityProvider'

export function useAbility() {
  const ability = useAbilityContext()
  return ability
}
