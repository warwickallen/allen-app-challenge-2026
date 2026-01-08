export type Role = 'participant' | 'admin'

export interface Participant {
  id: string
  name: string
  email: string
  role: Role
  created_at: string
  updated_at: string
}

export interface App {
  id: string
  participant_id: string
  app_name: string
  description: string | null
  created_at: string
  updated_at: string
}

export type TransactionType = 'revenue' | 'expense'

export interface Transaction {
  id: string
  app_id: string
  transaction_type: TransactionType
  amount: number
  description: string | null
  transaction_date: string
  created_at: string
  updated_at: string
}

export type ActionType =
  | 'create_app'
  | 'edit_app'
  | 'delete_app'
  | 'add_transaction'
  | 'edit_transaction'
  | 'delete_transaction'

export type EntityType = 'app' | 'transaction'

export interface ChangeLog {
  id: string
  user_id: string
  user_name: string
  action_type: ActionType
  entity_type: EntityType
  entity_id: string
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  created_at: string
}

export type WinnerType = 'app' | 'participant'

export interface MonthlyWinner {
  id: string
  month: string
  winner_type: WinnerType
  winner_id: string
  winner_name: string
  profit: number
  computed_at: string
}

export interface AppWithProfit extends App {
  participant_name: string
  profit: number
}

export interface ParticipantRanking {
  participant_id: string
  participant_name: string
  best_app_id: string
  best_app_name: string
  profit: number
}

export interface ProfitHistoryPoint {
  date: string
  cumulativeProfit: number
}
