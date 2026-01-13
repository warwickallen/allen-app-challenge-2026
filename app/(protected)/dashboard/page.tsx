import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { calculateAppProfit, getParticipantBestApp } from '@/lib/calculations'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import type { App } from '@/types'

export default async function DashboardPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Get user's apps
  const { data: apps } = await supabase
    .from('apps')
    .select('*')
    .eq('participant_id', user.id)
    .order('created_at', { ascending: false })

  // Calculate stats
  const totalApps = apps?.length || 0
  let totalProfit = 0
  let bestApp: { app: App; profit: number } | null = null

  if (apps) {
    for (const app of apps) {
      const profit = await calculateAppProfit(app.id)
      totalProfit += profit
      
      if (!bestApp || profit > bestApp.profit) {
        bestApp = { app, profit }
      }
    }
  }

  const bestAppFromParticipant = await getParticipantBestApp(user.id)
  const bestAppProfit = bestAppFromParticipant?.profit || 0

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-cheese-700">My Dashboard</h1>
        <Link
          href="/dashboard/apps/new"
          className="bg-cheese-500 hover:bg-cheese-600 text-black font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
        >
          + Create New App
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Apps</h3>
          <p className="text-3xl font-bold text-cheese-700">{totalApps}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Profit (All Apps)</h3>
          <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalProfit)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Best App Profit</h3>
          <p className={`text-3xl font-bold ${bestAppProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(bestAppProfit)}
          </p>
          {bestAppFromParticipant && (
            <p className="text-sm text-gray-500 mt-2">
              Best App: {bestApp?.app?.app_name || 'N/A'}
            </p>
          )}
        </div>
      </div>

      {/* Apps List */}
      <section className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
        <h2 className="text-2xl font-bold text-cheese-700 mb-4">My Apps</h2>
        {!apps || apps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven&apos;t created any apps yet.</p>
            <Link
              href="/dashboard/apps/new"
              className="inline-block bg-cheese-500 hover:bg-cheese-600 text-black font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
            >
              Create Your First App
            </Link>
          </div>
        ) : (
          <AppsList apps={apps} />
        )}
      </section>
    </div>
  )
}

async function AppsList({ apps }: { apps: App[] }) {
  const appsWithProfit = await Promise.all(
    apps.map(async (app) => {
      const profit = await calculateAppProfit(app.id)
      return { app, profit }
    })
  )

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {appsWithProfit.map(({ app, profit }) => (
        <Link
          key={app.id}
          href={`/dashboard/apps/${app.id}`}
          className="block bg-gradient-to-br from-cheese-50 to-cream-light rounded-lg p-6 border-2 border-cheese-300 hover:border-cheese-500 transition-all hover:shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">{app.app_name}</h3>
          {app.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{app.description}</p>
          )}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Created {new Date(app.created_at).toLocaleDateString('en-GB')}
            </span>
            <span className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profit)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
