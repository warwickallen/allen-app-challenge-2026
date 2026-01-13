'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface NavigationProps {
  user: { name: string; role: string } | null
}

export default function Navigation({ user }: NavigationProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-cheese-500 text-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/leaderboard" className="flex items-center space-x-2 hover:text-gray-700">
              <span className="text-2xl">🧀</span>
              <span className="font-bold text-lg">Allen App Challenge</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/leaderboard"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-cheese-600 transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-cheese-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/changelog"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-cheese-600 transition-colors"
            >
              Change Log
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-cheese-600 transition-colors"
              >
                Admin
              </Link>
            )}
            {user && (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-cheese-400">
                <span className="text-sm">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-cheese-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-cheese-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/leaderboard"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cheese-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Leaderboard
            </Link>
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cheese-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/changelog"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cheese-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Change Log
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-cheese-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {user && (
              <div className="pt-4 border-t border-cheese-400">
                <div className="px-3 py-2 text-sm">Welcome, {user.name}</div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleLogout()
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-cheese-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
