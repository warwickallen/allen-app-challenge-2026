import { requireAuth } from '@/lib/auth'
import { rankApps, rankParticipants } from '@/lib/calculations'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { MonthlyWinner } from '@/types'

export default async function LeaderboardPage() {
  await requireAuth()

  const appRankings = await rankApps()
  const participantRankings = await rankParticipants()

  const supabase = await createClient()
  const { data: monthlyWinners } = await supabase
    .from('monthly_winners')
    .select('*')
    .order('month', { ascending: false })

  const today = new Date()
  const grandWinnerDate = new Date('2027-01-10')
  const showGrandWinner = today >= grandWinnerDate

  // Get grand winner if date has passed
  let grandWinner: { app?: any; participant?: any } | null = null
  if (showGrandWinner && appRankings.length > 0 && participantRankings.length > 0) {
    grandWinner = {
      app: appRankings[0],
      participant: participantRankings[0],
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cheese-700 mb-2">
          🧀 Allen App Challenge 2026
        </h1>
        <p className="text-lg text-gray-700">
          9 January 2026 - 9 January 2027
        </p>
        {showGrandWinner && grandWinner && (
          <div className="mt-6 p-6 bg-gradient-to-r from-cheese-400 to-orange-cheese rounded-lg shadow-lg border-2 border-cheese-600">
            <h2 className="text-2xl font-bold text-white mb-4">🏆 Grand Winner 🏆</h2>
            <div className="grid md:grid-cols-2 gap-4 text-white">
              <div className="bg-white/20 rounded-lg p-4">
                <p className="font-semibold text-sm mb-1">Best App</p>
                <p className="text-xl font-bold">{grandWinner.app.app_name}</p>
                <p className="text-sm">{grandWinner.app.participant_name}</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(grandWinner.app.profit)}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="font-semibold text-sm mb-1">Best Participant</p>
                <p className="text-xl font-bold">{grandWinner.participant.participant_name}</p>
                <p className="text-sm">{grandWinner.participant.best_app_name}</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(grandWinner.participant.profit)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current App Rankings */}
      <section className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
        <h2 className="text-2xl font-bold text-cheese-700 mb-4">📊 Current App Rankings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-cheese-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  App Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Participant
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Profit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appRankings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No apps yet. Create an app to get started!
                  </td>
                </tr>
              ) : (
                appRankings.map((app, index) => (
                  <tr key={app.id} className={index < 3 ? 'bg-cheese-50' : ''}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-cheese-700">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {app.url && app.url.trim() ? (
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-cheese-600 hover:text-cheese-700 hover:underline"
                        >
                          {app.app_name}
                        </a>
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{app.app_name}</div>
                      )}
                      {app.description && (
                        <div className="text-sm text-gray-500 mt-1">{app.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {app.participant_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-bold ${app.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(app.profit)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Current Participant Rankings */}
      <section className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
        <h2 className="text-2xl font-bold text-cheese-700 mb-4">👥 Current Participant Rankings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-cheese-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Participant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Best App
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Profit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participantRankings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No participant rankings yet.
                  </td>
                </tr>
              ) : (
                participantRankings.map((participant, index) => (
                  <tr key={participant.participant_id} className={index < 3 ? 'bg-cheese-50' : ''}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-cheese-700">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {participant.participant_name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {participant.best_app_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-bold ${participant.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(participant.profit)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Monthly Winners */}
      <section className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
        <h2 className="text-2xl font-bold text-cheese-700 mb-4">🏆 Monthly Winners History</h2>
        {monthlyWinners && monthlyWinners.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyWinners.map((winner: MonthlyWinner) => (
              <div
                key={winner.id}
                className="bg-gradient-to-br from-cheese-100 to-orange-cheese/20 rounded-lg p-4 border border-cheese-300"
              >
                <p className="text-sm font-semibold text-cheese-700 mb-2">
                  {formatDate(winner.month)}
                </p>
                <p className="text-xs text-gray-600 mb-1">
                  {winner.winner_type === 'app' ? 'Best App' : 'Best Participant'}
                </p>
                <p className="text-lg font-bold text-gray-900 mb-1">{winner.winner_name}</p>
                <p className="text-sm font-semibold text-green-600">{formatCurrency(Number(winner.profit))}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No monthly winners calculated yet.</p>
        )}
      </section>
    </div>
  )
}
