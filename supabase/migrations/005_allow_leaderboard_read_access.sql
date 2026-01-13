-- Allow all authenticated users to read all apps, transactions, and participants for leaderboard
-- This enables participants to view everyone's apps in the leaderboard rankings
-- while still maintaining write restrictions (users can only modify their own apps)

-- Allow all authenticated users to read all participants for leaderboard
CREATE POLICY "Authenticated users can read all participants for leaderboard" ON participants
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to read all apps for leaderboard
CREATE POLICY "Authenticated users can read all apps for leaderboard" ON apps
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to read all transactions for leaderboard
CREATE POLICY "Authenticated users can read all transactions for leaderboard" ON transactions
  FOR SELECT USING (auth.uid() IS NOT NULL);
