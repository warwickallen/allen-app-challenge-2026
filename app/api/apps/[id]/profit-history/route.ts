import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { getProfitHistory } from '@/lib/calculations'

// GET /api/apps/[id]/profit-history - Get profit history for charting
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Check if user has permission to view this app
    const { data: app } = await supabase
      .from('apps')
      .select('participant_id')
      .eq('id', params.id)
      .single()

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    if (user.role !== 'admin' && app.participant_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    const history = await getProfitHistory(params.id)

    return NextResponse.json({ history })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
