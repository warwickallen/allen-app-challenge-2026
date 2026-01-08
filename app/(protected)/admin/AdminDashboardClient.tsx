'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboardClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCalculateMonthlyWinners = async () => {
    if (!confirm('Calculate monthly winners for all months up to now? This will compute winners based on rankings as of the 10th of each month.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/monthly-winners/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calculateAll: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to calculate monthly winners')
        setLoading(false)
        return
      }

      alert(`Successfully calculated ${data.count || 0} monthly winners!`)
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
      <button
        onClick={handleCalculateMonthlyWinners}
        disabled={loading}
        className="bg-cheese-500 hover:bg-cheese-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {loading ? 'Calculating...' : 'Calculate Monthly Winners'}
      </button>
    </div>
  )
}
