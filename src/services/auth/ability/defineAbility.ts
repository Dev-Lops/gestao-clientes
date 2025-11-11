// src/services/auth/ability/defineAbility.ts
import { Ability, AbilityBuilder } from '@casl/ability'
import type { AppAbility } from './types'

export type AbilityContext = {
  role: 'owner' | 'staff' | 'client' | 'guest' | null
  orgId: string | null
  userId: string | null
  // ids de clientes que esse usuário pode ver (para client convidado)
  accessibleClientIds?: string[]
}

export function defineAbilityFor(ctx: AbilityContext): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability)

  const role = ctx.role ?? 'guest'
  const orgId = ctx.orgId
  const userId = ctx.userId

  // OWNER – dono da organização vê e faz tudo dentro da org
  if (role === 'owner') {
    can('manage', 'all')
    return build()
  }

  // STAFF – pode gerenciar recursos da org, mas não mexe na org em si
  if (role === 'staff') {
    if (orgId) {
      can('read', 'AppOrg') // ver dados básicos da org

      // clientes da org
      can('manage', 'AppClient') // pode criar/editar/deletar cliente da org
      // tarefas da org
      can('manage', 'AppTask')
      // calendário / conteúdo
      can('manage', 'AppContent')
      // mídia
      can('manage', 'AppMediaFolder')
      can('manage', 'AppMediaItem')
      // convites
      can('manage', 'AppInvitation')
      // membros: pode ver, mas não necessariamente promover
      can('read', 'AppMember')
    }
    return build()
  }

  // CLIENT – convidado: pode ver só os clientes ligados a ele + mídias deles
  if (role === 'client') {
    const clientIds = ctx.accessibleClientIds ?? []

    // pode ver os clientes aos quais ele tem acesso
    if (clientIds.length > 0) {
      can('read', 'AppClient', {
        // isso é semântico: no front você vai checar manualmente
        // aqui só dizemos "pode"
      })
      // pode ver tarefas do cliente dele
      can('read', 'AppTask')
      // pode ver conteúdo do cliente dele
      can('read', 'AppContent')
      // pode ver mídia do cliente dele
      can('read', 'AppMediaFolder')
      can('read', 'AppMediaItem')
    }

    // não pode mexer em org, membros, convites
    cannot('manage', 'AppOrg')
    cannot('manage', 'AppMember')
    cannot('manage', 'AppInvitation')

    return build()
  }

  // GUEST – nada
  // (pode ser útil deixar 'read' em algo público no futuro)
  return build()
}
