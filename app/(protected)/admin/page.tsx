import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { rankApps, rankParticipants } from '@/lib/calculations'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import AdminDashboardClient from './AdminDashboardClient'
import type { App, MonthlyWinner } from '@/types'

export default async function AdminDashboardPage() {
  await requireAdmin()

  const supabase = await createClient()

  // Get all apps
  const { data: allApps } = await supabase
    .from('apps')
    .select(`
      *,
      participants (
        name
      )
    `)
    .order('created_at', { ascending: false })

  // Get all participants
  const { data: participants } = await supabase
    .from('participants')
    .select('*')
    .order('name', { ascending: true })

  // Get monthly winners
  const { data: monthlyWinners } = await supabase
    .from('monthly_winners')
    .select('*')
    .order('month', { ascending: false })

  // Get current rankings
  const appRankings = await rankApps()
  const participantRankings = await rankParticipants()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-cheese-700">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage all apps, participants, and calculate monthly winners.</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Apps</h3>
          <p className="text-3xl font-bold text-cheese-700">{allApps?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Participants</h3>
          <p className="text-3xl font-bold text-cheese-700">
            {participants?.filter((p) => p.role === 'participant').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Monthly Winners Calculated</h3>
          <p className="text-3xl font-bold text-cheese-700">{monthlyWinners?.length || 0}</p>
        </div>
      </div>

      {/* Monthly Winners Calculation */}
      <section className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-cheese-700">Monthly Winners</h2>
          <AdminDashboardClient />
        </div>
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
          <p className="text-gray-500 text-center py-8">No monthly winners calculated yet. Click "Calculate Monthly Winners" to compute them.</p>
        )}
      </section>

      {/* All Apps */}
      <section className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
        <h2 className="text-xl font-bold text-cheese-700 mb-4">All Apps</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-cheese-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  App Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Participant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Current Rank
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!allApps || allApps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No apps yet.
                  </td>
                </tr>
              ) : (
                allApps.map((app: any) => {
                  const rankIndex = appRankings.findIndex((a) => a.id === app.id)
                  const rank = rankIndex >= 0 ? rankIndex + 1 : '-'
                  const profit = rankIndex >= 0 ? appRankings[rankIndex].profit : 0
                  return (
                    <tr key={app.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {app.app_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {app.participants?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {app.description || <span className="text-gray-400 italic">No description</span>}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                        {rank !== '-' ? (
                          <span className="font-semibold">
                            #{rank} ({formatCurrency(profit)})
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/dashboard/apps/${app.id}`}
                          className="text-cheese-600 hover:text-cheese-700 mr-4"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/apps/${app.id}/edit`}
                          className="text-cheese-600 hover:text-cheese-700"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* All Participants */}
      <section className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
        <h2 className="text-xl font-bold text-cheese-700 mb-4">All Participants</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-cheese-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Current Rank
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Best App Profit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!participants || participants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No participants yet.
                  </td>
                </tr>
              ) : (
                participants.map((participant) => {
                  const rankIndex = participantRankings.findIndex((p) => p.participant_id === participant.id)
                  const rank = rankIndex >= 0 ? rankIndex + 1 : '-'
                  const profit = rankIndex >= 0 ? participantRankings[rankIndex].profit : 0
                  return (
                    <tr key={participant.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {participant.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {participant.email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            participant.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-cheese-100 text-cheese-800'
                          }`}
                        >
                          {participant.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                        {rank !== '-' && participant.role === 'participant' ? (
                          <span className="font-semibold">#{rank}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                        {rank !== '-' && participant.role === 'participant' ? (
                          <span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(profit)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
