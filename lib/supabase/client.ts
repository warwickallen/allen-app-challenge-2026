import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[SUPABASE CLIENT] Missing environment variables:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      timestamp: new Date().toISOString(),
    })
  } else {
    console.log('[SUPABASE CLIENT] Creating browser client', {
      urlPresent: true,
      anonKeyPresent: true,
      timestamp: new Date().toISOString(),
    })
  }

  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!
  )
}
