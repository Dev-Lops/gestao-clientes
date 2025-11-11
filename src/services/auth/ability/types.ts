// src/services/auth/ability/types.ts
import { Ability } from '@casl/ability'

// aqui usamos strings simples pros subjects porque seus modelos vêm do Supabase
// e não são classes TS
export type AppSubjects =
  | 'AppOrg'
  | 'AppMember'
  | 'AppClient'
  | 'AppTask'
  | 'AppContent'
  | 'AppMediaFolder'
  | 'AppMediaItem'
  | 'AppInvitation'
  | 'all'

export type AppActions =
  | 'manage' // tudo
  | 'create'
  | 'read'
  | 'update'
  | 'delete'

export type AppAbility = Ability<[AppActions, AppSubjects]>
