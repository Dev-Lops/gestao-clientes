import { redirect } from 'next/navigation'

// --- Tipos básicos ---
export type Role = 'guest' | 'client' | 'staff' | 'owner'

/**
 * Define a hierarquia de permissões.
 * Quanto mais alto na lista, mais permissões o papel tem.
 */
const hierarchy: Exclude<Role, 'guest'>[] = ['client', 'staff', 'owner']

const OWNER_EMAIL_ENV =
  process.env.NEXT_PUBLIC_OWNER_EMAILS ?? process.env.OWNER_EMAILS ?? ''

const OWNER_EMAIL_SET = new Set(
  OWNER_EMAIL_ENV.split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
)

/**
 * Verifica se o papel atual do usuário satisfaz o nível mínimo exigido.
 * - "guest" nunca tem permissão.
 */
export function roleSatisfies(
  role: Role,
  required: Exclude<Role, 'guest'>
): boolean {
  if (role === 'guest') return false
  return (
    hierarchy.indexOf(role as Exclude<Role, 'guest'>) >=
    hierarchy.indexOf(required)
  )
}

/**
 * Garante que o usuário possua o papel mínimo exigido.
 * Se não tiver, redireciona automaticamente para a página apropriada.
 *
 * @param role - Papel atual do usuário
 * @param required - Papel mínimo exigido
 * @param redirectTo - Caminho de fallback (padrão: /unauthorized)
 */
export function ensureRole(
  role: Role,
  required: Exclude<Role, 'guest'>,
  redirectTo: string = '/unauthorized'
): void {
  if (!roleSatisfies(role, required)) {
    redirect(redirectTo)
  }
}

/**
 * Converte strings genéricas do banco em papéis válidos do sistema.
 * Retorna "guest" como fallback seguro.
 */
export function parseRole(value: string | null | undefined): Role {
  if (value === 'owner' || value === 'staff' || value === 'client') return value
  return 'guest'
}

export function promoteRoleForOwnerEmail(
  role: Role,
  email: string | null
): Role {
  if (!email || OWNER_EMAIL_SET.size === 0) {
    return role
  }

  const normalized = email.trim().toLowerCase()
  if (normalized && OWNER_EMAIL_SET.has(normalized)) {
    return 'owner'
  }

  return role
}
