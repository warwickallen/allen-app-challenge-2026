import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import type { ChangeLog } from '@/types'

export default async function ChangeLogPage() {
  await requireAuth()
  const supabase = await createClient()

  const { data: changes, error } = await supabase
    .from('change_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading change log: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cheese-700">Change Log</h1>
        <p className="text-gray-600 mt-2">Track all changes made to apps and transactions.</p>
      </div>

      <section className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300">
        {!changes || changes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No changes recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-cheese-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Date/Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {changes.map((change: ChangeLog) => (
                  <tr key={change.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDateTime(change.created_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {change.user_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-cheese-100 text-cheese-800">
                        {change.action_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                      {change.entity_type}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <ChangeDetails change={change} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function ChangeDetails({ change }: { change: ChangeLog }) {
  if (change.action_type === 'create_app' || change.action_type === 'add_transaction') {
    const newValues = change.new_values || {}
    return (
      <div className="space-y-1">
        {change.action_type === 'create_app' && (
          <>
            <p className="font-semibold">{newValues.app_name || 'N/A'}</p>
            {newValues.description && (
              <p className="text-xs text-gray-500">{newValues.description}</p>
            )}
          </>
        )}
        {change.action_type === 'add_transaction' && (
          <>
            <p>
              <span className="font-semibold">{newValues.transaction_type}:</span>{' '}
              £{Number(newValues.amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {newValues.description && (
              <p className="text-xs text-gray-500">{newValues.description}</p>
            )}
            <p className="text-xs text-gray-500">Date: {newValues.transaction_date}</p>
          </>
        )}
      </div>
    )
  }

  if (change.action_type === 'edit_app' || change.action_type === 'edit_transaction') {
    const oldValues = change.old_values || {}
    const newValues = change.new_values || {}
    return (
      <div className="space-y-2 text-xs">
        {Object.keys(newValues).map((key) => {
          const oldVal = oldValues[key]
          const newVal = newValues[key]
          if (oldVal === newVal) return null

          return (
            <div key={key} className="flex items-start gap-2">
              <span className="font-semibold capitalize">{key.replace('_', ' ')}:</span>
              <span className="text-red-600 line-through">{String(oldVal || 'N/A')}</span>
              <span>→</span>
              <span className="text-green-600">{String(newVal || 'N/A')}</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (change.action_type === 'delete_app' || change.action_type === 'delete_transaction') {
    const oldValues = change.old_values || {}
    if (change.action_type === 'delete_app') {
      return (
        <p className="text-red-600 line-through">
          {oldValues.app_name || 'N/A'}
        </p>
      )
    }
    return (
      <p className="text-red-600 line-through text-xs">
        {oldValues.transaction_type}: £{Number(oldValues.amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    )
  }

  return <span className="text-gray-400">-</span>
}
