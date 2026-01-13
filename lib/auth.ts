import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  console.log('[AUTH] Getting current user...')
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('[AUTH] Error getting user:', {
      message: error.message,
      status: error.status,
      name: error.name,
      timestamp: new Date().toISOString(),
    })
    return null
  }

  if (!user) {
    console.log('[AUTH] No user found in session')
    return null
  }

  console.log('[AUTH] User found, fetching participant details', {
    userId: user.id,
    userEmail: user.email,
    timestamp: new Date().toISOString(),
  })

  // Get participant details
  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .select('*')
    .eq('id', user.id)
    .single()

  if (participantError) {
    console.error('[AUTH] Error fetching participant:', {
      message: participantError.message,
      code: participantError.code,
      details: participantError.details,
      hint: participantError.hint,
      timestamp: new Date().toISOString(),
    })
    return null
  }

  if (!participant) {
    console.warn('[AUTH] User authenticated but no participant record found', {
      userId: user.id,
      timestamp: new Date().toISOString(),
    })
    return null
  }

  console.log('[AUTH] Participant found', {
    participantId: participant.id,
    role: participant.role,
    timestamp: new Date().toISOString(),
  })

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
