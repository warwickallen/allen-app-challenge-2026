'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface TransactionDeleteButtonProps {
  transactionId: string
  appId: string
}

export default function TransactionDeleteButton({ transactionId, appId }: TransactionDeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete transaction')
      }
    } catch (error) {
      alert('An error occurred while deleting the transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
