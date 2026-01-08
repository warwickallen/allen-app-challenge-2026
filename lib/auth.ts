import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get participant details
  const { data: participant } = await supabase
    .from('participants')
    .select('*')
    .eq('id', user.id)
    .single()

  return participant
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Require admin role - redirects to login if not admin
 */
export async function requireAdmin() {
  const user = await requireAuth()

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  return user
}

/**
 * Check if user can edit an app (owner or admin)
 */
export async function canEditApp(appParticipantId: string): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  return user.role === 'admin' || user.id === appParticipantId
}
