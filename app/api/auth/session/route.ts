import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ user: null })
  }

  const { data: participant } = await supabase
    .from('participants')
    .select('*')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ user: participant })
}
