import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { createClient as createServerClient } from '@/lib/supabase/server'

// GET /api/apps - List all apps (with permissions)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createServerClient()

    // If admin, get all apps. Otherwise, get only user's apps
    let query = supabase.from('apps').select(`
      *,
      participants (
        name
      )
    `)

    if (user.role !== 'admin') {
      query = query.eq('participant_id', user.id)
    }

    const { data: apps, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ apps })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

// POST /api/apps - Create new app
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createServerClient()
    const body = await request.json()

    const { app_name, description } = body

    // Validation
    if (!app_name || app_name.trim().length === 0) {
      return NextResponse.json({ error: 'App name is required' }, { status: 400 })
    }

    if (app_name.length > 200) {
      return NextResponse.json({ error: 'App name must be 200 characters or less' }, { status: 400 })
    }

    if (description && description.length > 2000) {
      return NextResponse.json({ error: 'Description must be 2000 characters or less' }, { status: 400 })
    }

    // Create app
    const { data: app, error: appError } = await supabase
      .from('apps')
      .insert({
        participant_id: user.id,
        app_name: app_name.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single()

    if (appError) {
      return NextResponse.json({ error: appError.message }, { status: 500 })
    }

    // Log change
    await supabase.from('change_log').insert({
      user_id: user.id,
      user_name: user.name,
      action_type: 'create_app',
      entity_type: 'app',
      entity_id: app.id,
      old_values: null,
      new_values: {
        app_name: app.app_name,
        description: app.description,
      },
    })

    return NextResponse.json({ app }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
