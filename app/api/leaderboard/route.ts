import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { rankApps, rankParticipants } from '@/lib/calculations'

// GET /api/leaderboard - Get current app and participant rankings
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const appRankings = await rankApps()
    const participantRankings = await rankParticipants()

    return NextResponse.json({
      appRankings,
      participantRankings,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
