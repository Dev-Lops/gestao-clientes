<<<<<<< HEAD
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
=======
import { getSessionProfile } from '@/lib/auth/session'
import { NextRequest, NextResponse } from 'next/server'
>>>>>>> 66d34b01a64c46676e180dadbedcf691e78156c2

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing client ID' }, { status: 400 })
    }

<<<<<<< HEAD
    const supabase = await createServerSupabaseClient()
=======
    const { supabase, user, orgId } = await getSessionProfile()
>>>>>>> 66d34b01a64c46676e180dadbedcf691e78156c2

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!orgId) {
      return NextResponse.json({ error: 'Missing organization ID' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('app_clients')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ client: data }, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('API Error:', err.message)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
  }
}
