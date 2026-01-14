'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    console.log('[LOGIN] Form submitted', {
      email: email ? `${email.substring(0, 3)}***` : 'empty',
      hasPassword: !!password,
      timestamp: new Date().toISOString(),
    })

    try {
      console.log('[LOGIN] Creating Supabase client...')
      const supabase = createClient()

      // Log environment variable presence (without exposing values)
      console.log('[LOGIN] Supabase client created', {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      })

      console.log('[LOGIN] Attempting sign in with password...')
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('[LOGIN] Sign in error:', {
          message: signInError.message,
          status: signInError.status,
          name: signInError.name,
          timestamp: new Date().toISOString(),
        })
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      console.log('[LOGIN] Sign in successful', {
        hasUser: !!data.user,
        userId: data.user?.id,
        userEmail: data.user?.email,
        hasSession: !!data.session,
        sessionExpiresAt: data.session?.expires_at,
        timestamp: new Date().toISOString(),
      })

      if (data.user) {
        console.log('[LOGIN] Redirecting to leaderboard...')
        router.push('/leaderboard')
        router.refresh()
      } else {
        console.warn('[LOGIN] Sign in succeeded but no user data returned')
        setError('Login succeeded but user data is missing')
        setLoading(false)
      }
    } catch (err) {
      console.error('[LOGIN] Unexpected error during login:', {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      })
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cheese-50 via-cheese-100 to-cream-light p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border-2 border-cheese-300">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cheese-600 mb-2">🧀</h1>
          <h2 className="text-2xl font-bold text-gray-800">Allen App Challenge 2026</h2>
          <p className="text-gray-600 mt-2">Leaderboard Login</p>
          <Link
            href="/about"
            className="text-sm text-cheese-600 hover:text-cheese-700 underline mt-2 inline-block"
          >
            Learn more about the challenge
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese-500 focus:border-cheese-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese-500 focus:border-cheese-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cheese-500 hover:bg-cheese-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Challenge Period: 9 Jan 2026 - 9 Jan 2027</p>
        </div>
      </div>
    </div>
  )
}
