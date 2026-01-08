import { createClient } from '@/lib/supabase/server'
import type { AppWithProfit, ParticipantRanking, ProfitHistoryPoint } from '@/types'

/**
 * Calculate total profit for an app up to a specific date
 */
export async function calculateAppProfit(
  appId: string,
  upToDate?: Date
): Promise<number> {
  const supabase = await createClient()

  let query = supabase
    .from('transactions')
    .select('transaction_type, amount')
    .eq('app_id', appId)

  if (upToDate) {
    query = query.lte('transaction_date', upToDate.toISOString().split('T')[0])
  }

  const { data: transactions, error } = await query

  if (error || !transactions) {
    return 0
  }

  const revenue = transactions
    .filter((t) => t.transaction_type === 'revenue')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = transactions
    .filter((t) => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return revenue - expenses
}

/**
 * Get the best-earning app for a participant
 */
export async function getParticipantBestApp(
  participantId: string,
  upToDate?: Date
): Promise<{ appId: string; profit: number } | null> {
  const supabase = await createClient()

  const { data: apps, error } = await supabase
    .from('apps')
    .select('id')
    .eq('participant_id', participantId)

  if (error || !apps || apps.length === 0) {
    return null
  }

  let bestApp: { appId: string; profit: number } | null = null

  for (const app of apps) {
    const profit = await calculateAppProfit(app.id, upToDate)
    if (!bestApp || profit > bestApp.profit) {
      bestApp = { appId: app.id, profit }
    }
  }

  return bestApp
}

/**
 * Rank all apps by profit
 */
export async function rankApps(
  upToDate?: Date
): Promise<AppWithProfit[]> {
  const supabase = await createClient()

  const { data: apps, error } = await supabase
    .from('apps')
    .select(`
      *,
      participants (
        name
      )
    `)

  if (error || !apps) {
    return []
  }

  const appsWithProfit: AppWithProfit[] = await Promise.all(
    apps.map(async (app: any) => {
      const profit = await calculateAppProfit(app.id, upToDate)
      return {
        ...app,
        participant_name: app.participants?.name || 'Unknown',
        profit,
      }
    })
  )

  return appsWithProfit.sort((a, b) => b.profit - a.profit)
}

/**
 * Rank participants by their best app
 */
export async function rankParticipants(
  upToDate?: Date
): Promise<ParticipantRanking[]> {
  const supabase = await createClient()

  const { data: participants, error } = await supabase
    .from('participants')
    .select('id, name')
    .eq('role', 'participant')

  if (error || !participants) {
    return []
  }

  const rankings: ParticipantRanking[] = []

  for (const participant of participants) {
    const bestApp = await getParticipantBestApp(participant.id, upToDate)

    if (bestApp) {
      const { data: app } = await supabase
        .from('apps')
        .select('app_name')
        .eq('id', bestApp.appId)
        .single()

      rankings.push({
        participant_id: participant.id,
        participant_name: participant.name,
        best_app_id: bestApp.appId,
        best_app_name: app?.app_name || 'Unknown',
        profit: bestApp.profit,
      })
    }
  }

  return rankings.sort((a, b) => b.profit - a.profit)
}

/**
 * Get profit history for charting (time series)
 */
export async function getProfitHistory(
  appId: string
): Promise<ProfitHistoryPoint[]> {
  const supabase = await createClient()

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('transaction_type, amount, transaction_date')
    .eq('app_id', appId)
    .order('transaction_date', { ascending: true })

  if (error || !transactions) {
    return []
  }

  // Group transactions by date
  const dateMap = new Map<string, { revenue: number; expense: number }>()

  for (const transaction of transactions) {
    const date = transaction.transaction_date
    const current = dateMap.get(date) || { revenue: 0, expense: 0 }

    if (transaction.transaction_type === 'revenue') {
      current.revenue += Number(transaction.amount)
    } else {
      current.expense += Number(transaction.amount)
    }

    dateMap.set(date, current)
  }

  // Calculate cumulative profit
  const history: ProfitHistoryPoint[] = []
  let cumulativeProfit = 0

  const sortedDates = Array.from(dateMap.keys()).sort()

  for (const date of sortedDates) {
    const dayData = dateMap.get(date)!
    cumulativeProfit += dayData.revenue - dayData.expense
    history.push({
      date,
      cumulativeProfit,
    })
  }

  return history
}

/**
 * Calculate monthly winners for a specific month
 */
export async function calculateMonthlyWinners(month: Date): Promise<{
  appWinner: { appId: string; appName: string; participantName: string; profit: number } | null
  participantWinner: { participantId: string; participantName: string; bestAppName: string; profit: number } | null
}> {
  // Calculate winners based on data as of the 10th of the month
  const cutoffDate = new Date(month.getFullYear(), month.getMonth(), 10)

  const appRankings = await rankApps(cutoffDate)
  const participantRankings = await rankParticipants(cutoffDate)

  const appWinner =
    appRankings.length > 0 && appRankings[0].profit > 0
      ? {
          appId: appRankings[0].id,
          appName: appRankings[0].app_name,
          participantName: appRankings[0].participant_name,
          profit: appRankings[0].profit,
        }
      : null

  const participantWinner =
    participantRankings.length > 0 && participantRankings[0].profit > 0
      ? {
          participantId: participantRankings[0].participant_id,
          participantName: participantRankings[0].participant_name,
          bestAppName: participantRankings[0].best_app_name,
          profit: participantRankings[0].profit,
        }
      : null

  return { appWinner, participantWinner }
}
