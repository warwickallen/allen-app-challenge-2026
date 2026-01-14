import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { calculateAppProfit, getProfitHistory } from '@/lib/calculations'
import { canEditApp } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import AppDetailClient from './AppDetailClient'
import TransactionDeleteButton from '@/components/TransactionDeleteButton'
import type { App, Transaction, ProfitHistoryPoint } from '@/types'

interface PageProps {
  params: { id: string }
}

export default async function AppDetailPage({ params }: PageProps) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Get app details
  const { data: app, error } = await supabase
    .from('apps')
    .select(`
      *,
      participants (
        name
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !app) {
    redirect('/dashboard')
  }

  // Check permissions
  if (user.role !== 'admin' && app.participant_id !== user.id) {
    redirect('/dashboard')
  }

  // Get transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('app_id', params.id)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  // Calculate profit
  const profit = await calculateAppProfit(params.id)
  const profitHistory = await getProfitHistory(params.id)

  // Check if user can edit
  const canEdit = await canEditApp(app.participant_id)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/dashboard"
            className="text-cheese-600 hover:text-cheese-700 text-sm font-medium mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-cheese-700">{app.app_name}</h1>
          {app.description && (
            <p className="text-gray-600 mt-2">{app.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Created by {app.participants?.name || 'Unknown'} on {formatDate(app.created_at)}
          </p>
        </div>
        {canEdit && (
          <Link
            href={`/dashboard/apps/${params.id}/edit`}
            className="bg-cheese-500 hover:bg-cheese-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors shadow-md"
          >
            Edit App
          </Link>
        )}
      </div>

      {/* Profit Display */}
      <div className="bg-gradient-to-r from-cheese-400 to-orange-cheese rounded-lg p-6 shadow-lg border-2 border-cheese-600">
        <h2 className="text-sm font-medium text-white mb-2">Current Profit</h2>
        <p className={`text-4xl font-bold ${profit >= 0 ? 'text-gray-900' : 'text-red-800'}`}>
          {formatCurrency(profit)}
        </p>
      </div>

      {/* Profit Chart */}
      <section className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
        <h2 className="text-xl font-bold text-cheese-700 mb-4">Profit History</h2>
        <AppDetailClient profitHistory={profitHistory} />
      </section>

      {/* Transactions */}
      <section className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-cheese-700">Transactions</h2>
          {canEdit && (
            <Link
              href={`/dashboard/apps/${params.id}/transactions/new`}
              className="bg-cheese-500 hover:bg-cheese-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors shadow-md text-sm"
            >
              + Record Transaction
            </Link>
          )}
        </div>
        <TransactionsList transactions={transactions || []} appId={params.id} canEdit={canEdit} />
      </section>
    </div>
  )
}

function TransactionsList({
  transactions,
  appId,
  canEdit,
}: {
  transactions: Transaction[]
  appId: string
  canEdit: boolean
}) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No transactions yet.</p>
        {canEdit && (
          <Link
            href={`/dashboard/apps/${appId}/transactions/new`}
            className="inline-block bg-cheese-500 hover:bg-cheese-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors shadow-md text-sm"
          >
            Add Your First Transaction
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-cheese-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Description
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
              Amount
            </th>
            {canEdit && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                {formatDate(transaction.transaction_date)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    transaction.transaction_type === 'revenue'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {transaction.transaction_type === 'revenue' ? '💰 Revenue' : '💸 Expense'}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-gray-700">
                {transaction.description || <span className="text-gray-400 italic">No description</span>}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <span
                  className={`text-sm font-bold ${
                    transaction.transaction_type === 'revenue' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.transaction_type === 'revenue' ? '+' : '-'}
                  {formatCurrency(Number(transaction.amount))}
                </span>
              </td>
              {canEdit && (
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/dashboard/apps/${appId}/transactions/${transaction.id}/edit`}
                    className="text-cheese-600 hover:text-cheese-700 mr-4"
                  >
                    Edit
                  </Link>
                  <TransactionDeleteButton transactionId={transaction.id} appId={appId} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

