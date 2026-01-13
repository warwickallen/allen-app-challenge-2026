'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Transaction } from '@/types'

interface TransactionFormClientProps {
  appId: string
  transaction?: Transaction
}

export default function TransactionFormClient({ appId, transaction }: TransactionFormClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!transaction

  const [formData, setFormData] = useState({
    transaction_type: transaction?.transaction_type || 'revenue',
    amount: transaction?.amount ? String(transaction.amount) : '',
    description: transaction?.description || '',
    transaction_date: transaction?.transaction_date || new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const url = isEdit ? `/api/transactions/${transaction.id}` : `/api/apps/${appId}/transactions`
      const method = isEdit ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || `Failed to ${isEdit ? 'update' : 'create'} transaction`)
        setLoading(false)
        return
      }

      router.push(`/dashboard/apps/${appId}`)
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/apps/${appId}`}
          className="text-cheese-600 hover:text-cheese-700 text-sm font-medium mb-4 inline-block"
        >
          ← Back to App
        </Link>
        <h1 className="text-3xl font-bold text-cheese-700">
          {isEdit ? 'Edit Transaction' : 'Add New Transaction'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="transaction_type" className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <select
            id="transaction_type"
            required
            value={formData.transaction_type}
            onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value as 'revenue' | 'expense' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese-500 focus:border-cheese-500"
          >
            <option value="revenue">💰 Revenue</option>
            <option value="expense">💸 Expense</option>
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              id="amount"
              type="number"
              required
              min="0"
              step="0.01"
              max="999999999.99"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese-500 focus:border-cheese-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700 mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="transaction_date"
            type="date"
            required
            max={today}
            value={formData.transaction_date}
            onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese-500 focus:border-cheese-500"
          />
          <p className="text-xs text-gray-500 mt-1">Cannot be in the future</p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            maxLength={500}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese-500 focus:border-cheese-500"
            placeholder="Transaction description (optional)"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <Link
            href={`/dashboard/apps/${appId}`}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-cheese-500 hover:bg-cheese-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Transaction' : 'Add Transaction')}
          </button>
        </div>
      </form>
    </div>
  )
}
