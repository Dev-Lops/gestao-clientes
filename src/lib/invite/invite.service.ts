import type { SupabaseClient } from '@supabase/supabase-js'

export class InviteAcceptanceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InviteAcceptanceError'
  }
}

interface AcceptInvitePayload {
  userId: string
  token: string
}

export class InviteService {
  constructor(private readonly supabase: SupabaseClient) {}

  async acceptInvite({ userId, token }: AcceptInvitePayload): Promise<void> {
    const { error } = await this.supabase.rpc('fn_accept_invite', {
      p_user_id: userId,
      p_token: token,
    })

    if (error) {
      throw new InviteAcceptanceError(error.message)
    }
  }
}
