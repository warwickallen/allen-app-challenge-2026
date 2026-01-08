import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { calculateMonthlyWinners } from '@/lib/calculations'

// GET /api/monthly-winners - Get all monthly winners
export async function GET() {
  try {
    await requireAuth()
    const supabase = await createClient()

    const { data: winners, error } = await supabase
      .from('monthly_winners')
      .select('*')
      .order('month', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ winners })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

// POST /api/monthly-winners/calculate - Calculate monthly winners (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()
    const { month, calculateAll } = body

    if (calculateAll) {
      // Calculate winners for all months from challenge start to now
      // Only calculate for months where the 10th has passed (winners announced on 10th)
      const challengeStart = new Date('2026-01-09')
      const today = new Date()
      let count = 0

      // Iterate through each month
      const currentMonth = new Date(challengeStart.getFullYear(), challengeStart.getMonth(), 1)
      
      while (currentMonth <= today) {
        // Check if the 10th of this month has passed
        const tenthOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 10)
        
        if (tenthOfMonth <= today) {
          // First day of the month for storage
          const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
          const { appWinner, participantWinner } = await calculateMonthlyWinners(monthDate)

          const winnersToInsert: any[] = []

          if (appWinner) {
            winnersToInsert.push({
              month: monthDate.toISOString().split('T')[0], // First day of month (YYYY-MM-01)
              winner_type: 'app',
              winner_id: appWinner.appId,
              winner_name: appWinner.appName,
              profit: appWinner.profit,
            })
          }

          if (participantWinner) {
            winnersToInsert.push({
              month: monthDate.toISOString().split('T')[0], // First day of month (YYYY-MM-01)
              winner_type: 'participant',
              winner_id: participantWinner.participantId,
              winner_name: participantWinner.participantName,
              profit: participantWinner.profit,
            })
          }

          if (winnersToInsert.length > 0) {
            await supabase
              .from('monthly_winners')
              .upsert(winnersToInsert, {
                onConflict: 'month,winner_type',
              })
            count += winnersToInsert.length
          }
        }

        // Move to next month
        currentMonth.setMonth(currentMonth.getMonth() + 1)
      }

      return NextResponse.json({
        success: true,
        count,
      })
    }

    if (!month) {
      return NextResponse.json({ error: 'Month is required (YYYY-MM-DD format) or set calculateAll: true' }, { status: 400 })
    }

    const monthDate = new Date(month)
    const { appWinner, participantWinner } = await calculateMonthlyWinners(monthDate)

    // Store winners in database
    const winnersToInsert: any[] = []

    if (appWinner) {
      winnersToInsert.push({
        month: monthDate.toISOString().split('T')[0],
        winner_type: 'app',
        winner_id: appWinner.appId,
        winner_name: appWinner.appName,
        profit: appWinner.profit,
      })
    }

    if (participantWinner) {
      winnersToInsert.push({
        month: monthDate.toISOString().split('T')[0],
        winner_type: 'participant',
        winner_id: participantWinner.participantId,
        winner_name: participantWinner.participantName,
        profit: participantWinner.profit,
      })
    }

    if (winnersToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('monthly_winners')
        .upsert(winnersToInsert, {
          onConflict: 'month,winner_type',
        })

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      appWinner,
      participantWinner,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('Unauthorised') ? 403 : 401 })
  }
}
