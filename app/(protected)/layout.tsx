import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Navigation from '@/components/Navigation'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('[PROTECTED LAYOUT] Checking authentication...')
  const user = await getCurrentUser()

  if (!user) {
    console.log('[PROTECTED LAYOUT] No user found, redirecting to login')
    redirect('/login')
  }

  console.log('[PROTECTED LAYOUT] User authenticated', {
    userId: user.id,
    role: user.role,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-cheese-50 via-cheese-100 to-cream-light">
      <Navigation user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
