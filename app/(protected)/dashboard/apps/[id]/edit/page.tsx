import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { canEditApp } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AppEditClient from './AppEditClient'

interface PageProps {
  params: { id: string }
}

export default async function EditAppPage({ params }: PageProps) {
  await requireAuth()
  const supabase = await createClient()

  const { data: app, error } = await supabase
    .from('apps')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !app) {
    redirect('/dashboard')
  }

  const canEdit = await canEditApp(app.participant_id)

  if (!canEdit) {
    redirect('/dashboard')
  }

  return <AppEditClient app={app} />
}
