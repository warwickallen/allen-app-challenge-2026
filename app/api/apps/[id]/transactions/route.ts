import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, canEditApp } from '@/lib/auth'

// GET /api/apps/[id]/transactions - Get all transactions for an app
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Check if user has permission to view this app
    const { data: app } = await supabase
      .from('apps')
      .select('participant_id')
      .eq('id', params.id)
      .single()

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    if (user.role !== 'admin' && app.participant_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('app_id', params.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ transactions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

// POST /api/apps/[id]/transactions - Add transaction
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Check permissions
    const { data: app } = await supabase
      .from('apps')
      .select('participant_id')
      .eq('id', params.id)
      .single()

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    if (!(await canEditApp(app.participant_id))) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    const body = await request.json()
    const { transaction_type, amount, description, transaction_date } = body

    // Validation
    if (!transaction_type || !['revenue', 'expense'].includes(transaction_type)) {
      return NextResponse.json(
        { error: 'Transaction type must be "revenue" or "expense"' },
        { status: 400 }
      )
    }

    if (amount === undefined || amount === null || amount < 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }

    if (amount > 999999999.99) {
      return NextResponse.json({ error: 'Amount exceeds maximum value' }, { status: 400 })
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 })
    }

    const transactionDate = transaction_date || new Date().toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]
    
    if (transactionDate > today) {
      return NextResponse.json({ error: 'Transaction date cannot be in the future' }, { status: 400 })
    }

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        app_id: params.id,
        transaction_type,
        amount: Number(amount),
        description: description?.trim() || null,
        transaction_date: transactionDate,
      })
      .select()
      .single()

    if (transactionError) {
      return NextResponse.json({ error: transactionError.message }, { status: 500 })
    }

    // Log change
    await supabase.from('change_log').insert({
      user_id: user.id,
      user_name: user.name,
      action_type: 'add_transaction',
      entity_type: 'transaction',
      entity_id: transaction.id,
      old_values: null,
      new_values: {
        transaction_type: transaction.transaction_type,
        amount: transaction.amount,
        description: transaction.description,
        transaction_date: transaction.transaction_date,
      },
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
