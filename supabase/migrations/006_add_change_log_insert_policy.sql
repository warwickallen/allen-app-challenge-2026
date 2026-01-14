-- Add INSERT policy for change_log table
-- This allows authenticated users (via API routes) to insert change log entries
-- The API routes are already authenticated (via requireAuth()), so we allow any authenticated user to insert

CREATE POLICY "Authenticated users can insert change log" ON change_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
