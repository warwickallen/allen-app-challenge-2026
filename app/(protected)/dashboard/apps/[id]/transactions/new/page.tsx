import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { canEditApp } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TransactionFormClient from './TransactionFormClient'

interface PageProps {
  params: { id: string }
}

export default async function NewTransactionPage({ params }: PageProps) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: app } = await supabase
    .from('apps')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!app) {
    redirect('/dashboard')
  }

  const canEdit = await canEditApp(app.participant_id)

  if (!canEdit) {
    redirect('/dashboard')
  }

  return <TransactionFormClient appId={params.id} />
}
