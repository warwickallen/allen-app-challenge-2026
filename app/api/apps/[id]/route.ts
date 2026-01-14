import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, canEditApp } from '@/lib/auth'

// GET /api/apps/[id] - Get app details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: app, error } = await supabase
      .from('apps')
      .select(`
        *,
        participants (
          name
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check permissions (user can only view their own apps unless admin)
    if (user.role !== 'admin' && app.participant_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    return NextResponse.json({ app })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

// PATCH /api/apps/[id] - Update app
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Check permissions
    const { data: existingApp } = await supabase
      .from('apps')
      .select('participant_id, app_name, description')
      .eq('id', params.id)
      .single()

    if (!existingApp) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    if (!(await canEditApp(existingApp.participant_id))) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    const body = await request.json()
    const { app_name, description } = body

    const updates: any = {}
    if (app_name !== undefined) {
      if (!app_name || app_name.trim().length === 0) {
        return NextResponse.json({ error: 'App name is required' }, { status: 400 })
      }
      if (app_name.length > 200) {
        return NextResponse.json({ error: 'App name must be 200 characters or less' }, { status: 400 })
      }
      updates.app_name = app_name.trim()
    }

    if (description !== undefined) {
      if (description && description.length > 2000) {
        return NextResponse.json({ error: 'Description must be 2000 characters or less' }, { status: 400 })
      }
      updates.description = description?.trim() || null
    }

    // Update app
    const { data: app, error: updateError } = await supabase
      .from('apps')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log change
    await supabase.from('change_log').insert({
      user_id: user.id,
      user_name: user.name,
      action_type: 'edit_app',
      entity_type: 'app',
      entity_id: app.id,
      app_id: app.id,
      old_values: {
        app_name: existingApp.app_name,
        description: existingApp.description,
      },
      new_values: {
        app_name: app.app_name,
        description: app.description,
      },
    })

    return NextResponse.json({ app })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

// DELETE /api/apps/[id] - Delete app
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Check permissions
    const { data: existingApp } = await supabase
      .from('apps')
      .select('participant_id, app_name, description')
      .eq('id', params.id)
      .single()

    if (!existingApp) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    if (!(await canEditApp(existingApp.participant_id))) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    // Log change before deletion
    await supabase.from('change_log').insert({
      user_id: user.id,
      user_name: user.name,
      action_type: 'delete_app',
      entity_type: 'app',
      entity_id: params.id,
      app_id: params.id,
      old_values: {
        app_name: existingApp.app_name,
        description: existingApp.description,
      },
      new_values: null,
    })

    // Delete app (CASCADE will handle transactions)
    const { error: deleteError } = await supabase.from('apps').delete().eq('id', params.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
