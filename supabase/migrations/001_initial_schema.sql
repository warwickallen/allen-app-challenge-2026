-- Participants/Users table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('participant', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apps table
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (revenue and expenses)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('revenue', 'expense')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Change log for auditing
CREATE TABLE IF NOT EXISTS change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES participants(id),
  user_name TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'create_app', 'edit_app', 'add_transaction', 'edit_transaction', 'delete_transaction', 'delete_app'
  entity_type TEXT NOT NULL, -- 'app', 'transaction'
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly winners (cached/computed)
CREATE TABLE IF NOT EXISTS monthly_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL, -- First day of the month
  winner_type TEXT NOT NULL CHECK (winner_type IN ('app', 'participant')),
  winner_id UUID NOT NULL, -- app_id or participant_id
  winner_name TEXT NOT NULL,
  profit DECIMAL(10, 2) NOT NULL,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, winner_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_apps_participant_id ON apps(participant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_app_id ON transactions(app_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_change_log_created_at ON change_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_log_user_id ON change_log(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_winners_month ON monthly_winners(month DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for participants (users can read their own data and admins can read all)
CREATE POLICY "Users can read own participant data" ON participants
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all participants" ON participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for apps (users can read their own apps and admins can read all)
CREATE POLICY "Users can read own apps" ON apps
  FOR SELECT USING (participant_id = auth.uid());

CREATE POLICY "Admins can read all apps" ON apps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for transactions (users can read transactions for their apps and admins can read all)
CREATE POLICY "Users can read own app transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = transactions.app_id AND apps.participant_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for change_log (all authenticated users can read)
CREATE POLICY "Authenticated users can read change log" ON change_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for monthly_winners (all authenticated users can read)
CREATE POLICY "Authenticated users can read monthly winners" ON monthly_winners
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for apps (users can insert/update/delete their own apps, admins can do all)
CREATE POLICY "Users can insert own apps" ON apps
  FOR INSERT WITH CHECK (participant_id = auth.uid());

CREATE POLICY "Users can update own apps" ON apps
  FOR UPDATE USING (participant_id = auth.uid());

CREATE POLICY "Users can delete own apps" ON apps
  FOR DELETE USING (participant_id = auth.uid());

CREATE POLICY "Admins can manage all apps" ON apps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for transactions (users can manage transactions for their apps, admins can do all)
CREATE POLICY "Users can insert own app transactions" ON transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = transactions.app_id AND apps.participant_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own app transactions" ON transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = transactions.app_id AND apps.participant_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own app transactions" ON transactions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = transactions.app_id AND apps.participant_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all transactions" ON transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for change_log (only server/service role can insert)
-- Change log is managed by API routes with service role, so no user-level policies needed

-- RLS Policies for monthly_winners (only server/service role can insert/update)
-- Monthly winners are managed by admin API routes with service role, so no user-level policies needed
