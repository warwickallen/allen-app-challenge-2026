'use client'

import ProfitChart from '@/components/ProfitChart'
import type { ProfitHistoryPoint } from '@/types'

interface AppDetailClientProps {
  profitHistory: ProfitHistoryPoint[]
}

export default function AppDetailClient({ profitHistory }: AppDetailClientProps) {
  return <ProfitChart history={profitHistory} />
}
