import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { canEditApp } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TransactionFormClient from '../new/TransactionFormClient'

interface PageProps {
  params: { id: string; transactionId: string }
}

export default async function EditTransactionPage({ params }: PageProps) {
  await requireAuth()
  const supabase = await createClient()

  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .select(`
      *,
      apps!inner (
        participant_id
      )
    `)
    .eq('id', params.transactionId)
    .single()

  if (transactionError || !transaction) {
    redirect(`/dashboard/apps/${params.id}`)
  }

  const canEdit = await canEditApp(transaction.apps.participant_id)

  if (!canEdit) {
    redirect(`/dashboard/apps/${params.id}`)
  }

  return <TransactionFormClient appId={params.id} transaction={transaction} />
}
