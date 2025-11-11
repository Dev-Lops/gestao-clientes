// src/services/auth/ability/AbilityProvider.tsx
'use client'

import { createContext, useContext, useMemo } from 'react'
import { defineAbilityFor } from './defineAbility'
import type { AppAbility } from './types'

type AbilityProviderProps = {
  children: React.ReactNode
  // dados vindos de /api/session, por ex.
  session: {
    role: 'owner' | 'staff' | 'client' | 'guest' | null
    orgId: string | null
    userId: string | null
    accessibleClientIds?: string[]
  }
}

const AbilityContext = createContext<AppAbility | null>(null)

export function AbilityProvider({ children, session }: AbilityProviderProps) {
  const ability = useMemo(
    () =>
      defineAbilityFor({
        role: session.role,
        orgId: session.orgId,
        userId: session.userId,
        accessibleClientIds: session.accessibleClientIds,
      }),
    [session],
  )

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}

export function useAbilityContext() {
  const ctx = useContext(AbilityContext)
  if (!ctx) {
    throw new Error('useAbilityContext must be used within AbilityProvider')
  }
  return ctx
}
