'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewAppPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    app_name: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create app')
        setLoading(false)
        return
      }

      router.push(`/dashboard/apps/${data.app.id}`)
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-cheese-600 hover:text-cheese-700 text-sm font-medium mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-cheese-700">Create New App</h1>
        <p className="text-gray-600 mt-2">Enter your app details to get started tracking profits.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 border-2 border-cheese-300 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="app_name" className="block text-sm font-medium text-gray-700 mb-2">
            App Name <span className="text-red-500">*</span>
          </label>
          <input
            id="app_name"
            type="text"
            required
            maxLength={200}
            value={formData.app_name}
            onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese-500 focus:border-cheese-500"
            placeholder="Enter app name"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.app_name.length}/200 characters</p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            maxLength={2000}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese-500 focus:border-cheese-500"
            placeholder="Describe your app (optional)"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/dashboard"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-cheese-500 hover:bg-cheese-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? 'Creating...' : 'Create App'}
          </button>
        </div>
      </form>
    </div>
  )
}
