import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

// GET /api/changelog - Get change log
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const supabase = await createClient()

    const searchParams = request.nextUrl.searchParams
    const appId = searchParams.get('app_id')

    let query = supabase
      .from('change_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (appId) {
      query = query.eq('entity_id', appId).eq('entity_type', 'app')
    }

    const { data: changes, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ changes })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
