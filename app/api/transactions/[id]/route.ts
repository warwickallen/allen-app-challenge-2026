import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, canEditApp } from '@/lib/auth'

// GET /api/transactions/[id] - Get transaction details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select(`
        *,
        apps!inner (
          participant_id
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check permissions
    if (user.role !== 'admin' && transaction.apps.participant_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    return NextResponse.json({ transaction })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

// PATCH /api/transactions/[id] - Update transaction
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing transaction and check permissions
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select(`
        *,
        apps!inner (
          participant_id
        )
      `)
      .eq('id', params.id)
      .single()

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (!(await canEditApp(existingTransaction.apps.participant_id))) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    const body = await request.json()
    const updates: any = {}

    if (body.transaction_type !== undefined) {
      if (!['revenue', 'expense'].includes(body.transaction_type)) {
        return NextResponse.json(
          { error: 'Transaction type must be "revenue" or "expense"' },
          { status: 400 }
        )
      }
      updates.transaction_type = body.transaction_type
    }

    if (body.amount !== undefined) {
      if (body.amount < 0 || body.amount > 999999999.99) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      }
      updates.amount = Number(body.amount)
    }

    if (body.description !== undefined) {
      if (body.description && body.description.length > 500) {
        return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 })
      }
      updates.description = body.description?.trim() || null
    }

    if (body.transaction_date !== undefined) {
      const today = new Date().toISOString().split('T')[0]
      if (body.transaction_date > today) {
        return NextResponse.json({ error: 'Transaction date cannot be in the future' }, { status: 400 })
      }
      updates.transaction_date = body.transaction_date
    }

    // Update transaction
    const { data: transaction, error: updateError } = await supabase
      .from('transactions')
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
      action_type: 'edit_transaction',
      entity_type: 'transaction',
      entity_id: transaction.id,
      old_values: {
        transaction_type: existingTransaction.transaction_type,
        amount: existingTransaction.amount,
        description: existingTransaction.description,
        transaction_date: existingTransaction.transaction_date,
      },
      new_values: {
        transaction_type: transaction.transaction_type,
        amount: transaction.amount,
        description: transaction.description,
        transaction_date: transaction.transaction_date,
      },
    })

    return NextResponse.json({ transaction })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

// DELETE /api/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get existing transaction and check permissions
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select(`
        *,
        apps!inner (
          participant_id
        )
      `)
      .eq('id', params.id)
      .single()

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (!(await canEditApp(existingTransaction.apps.participant_id))) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    // Log change before deletion
    await supabase.from('change_log').insert({
      user_id: user.id,
      user_name: user.name,
      action_type: 'delete_transaction',
      entity_type: 'transaction',
      entity_id: params.id,
      old_values: {
        transaction_type: existingTransaction.transaction_type,
        amount: existingTransaction.amount,
        description: existingTransaction.description,
        transaction_date: existingTransaction.transaction_date,
      },
      new_values: null,
    })

    // Delete transaction
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
