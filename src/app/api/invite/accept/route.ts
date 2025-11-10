// app/invite/accept/route.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import {
  InviteAcceptanceError,
  InviteService,
} from '@/lib/invite/invite.service'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type QueryParams = Record<string, string>

const redirectTo = (origin: string, path: string, query: QueryParams = {}) => {
  const url = new URL(path, origin)

  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return NextResponse.redirect(url.toString())
}

const getTokenFrom = (request: NextRequest): string | null => {
  const url = new URL(request.url)

  return url.searchParams.get('token')
}

export async function GET(req: NextRequest) {
  const token = getTokenFrom(req)
  const origin = new URL(req.url).origin

  if (!token) {
    return redirectTo(origin, '/login', { error: 'token' })
  }

  const supabase = await createServerSupabaseClient()
  const inviteService = new InviteService(supabase)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirectTo(origin, '/login', {
      next: `/invite/accept?token=${encodeURIComponent(token)}`,
    })
  }

  try {
    await inviteService.acceptInvite({
      userId: user.id,
      token,
    })

    return redirectTo(origin, '/dashboard', { invite: 'ok' })
  } catch (error) {
    if (error instanceof InviteAcceptanceError) {
      return redirectTo(origin, '/dashboard', { error: 'invite' })
    }

    throw error
  }
}
