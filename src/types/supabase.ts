/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Placeholder gerado automaticamente para os tipos do Supabase.
 *
 * Substitua este arquivo executando:
 *   supabase gen types typescript --project-id <id> > src/types/supabase.ts
 */

export type Database = any;

// Helpers genéricos para manter compatibilidade com o código existente
export type Tables<Name extends string = string> = { id: string } & Record<
  string,
  any
> & { __table__?: Name };
export type TablesInsert<Name extends string = string> = Record<string, any> & {
  __table__?: Name;
};
export type TablesUpdate<Name extends string = string> = Record<string, any> & {
  __table__?: Name;
};
export type Views<Name extends string = string> = { id: string } & Record<
  string,
  any
> & { __view__?: Name };
/* eslint-enable @typescript-eslint/no-explicit-any */
