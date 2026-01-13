import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname
  console.log('[MIDDLEWARE] Updating session', {
    path,
    method: request.method,
    hasCookies: request.cookies.size > 0,
    timestamp: new Date().toISOString(),
  })

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = request.cookies.get(name)?.value
          if (name.includes('auth') || name.includes('supabase')) {
            console.log('[MIDDLEWARE] Getting cookie', {
              name,
              hasValue: !!value,
              valueLength: value?.length || 0,
            })
          }
          return value
        },
        set(name: string, value: string, options: CookieOptions) {
          if (name.includes('auth') || name.includes('supabase')) {
            console.log('[MIDDLEWARE] Setting cookie', {
              name,
              hasValue: !!value,
              valueLength: value?.length || 0,
              options: {
                path: options.path,
                maxAge: options.maxAge,
                httpOnly: options.httpOnly,
                secure: options.secure,
                sameSite: options.sameSite,
              },
            })
          }
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          if (name.includes('auth') || name.includes('supabase')) {
            console.log('[MIDDLEWARE] Removing cookie', {
              name,
              options: {
                path: options.path,
              },
            })
          }
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('[MIDDLEWARE] Error getting user:', {
      message: error.message,
      status: error.status,
      path,
      timestamp: new Date().toISOString(),
    })
  } else if (user) {
    console.log('[MIDDLEWARE] User session found', {
      userId: user.id,
      userEmail: user.email,
      path,
      timestamp: new Date().toISOString(),
    })
  } else {
    console.log('[MIDDLEWARE] No user session', {
      path,
      timestamp: new Date().toISOString(),
    })
  }

  return response
}
