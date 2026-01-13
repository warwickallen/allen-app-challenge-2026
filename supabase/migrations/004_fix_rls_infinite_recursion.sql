-- Fix infinite recursion in RLS policies
-- The issue: Policies that check admin status by querying the participants table
-- cause infinite recursion because the query triggers RLS policies again.
--
-- Solution: Create a SECURITY DEFINER function that runs with elevated privileges
-- (as the function owner, typically postgres), which can bypass RLS when querying
-- the participants table to check admin status.

-- Create a security definer function to check if a user is an admin
-- This function bypasses RLS, preventing infinite recursion
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Query participants table - this bypasses RLS because the function
  -- runs with SECURITY DEFINER (as the function owner, typically postgres)
  SELECT role INTO user_role
  FROM participants
  WHERE id = user_id;
  
  RETURN COALESCE(user_role = 'admin', false);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can read all participants" ON participants;
DROP POLICY IF EXISTS "Admins can read all apps" ON apps;
DROP POLICY IF EXISTS "Admins can read all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can manage all apps" ON apps;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON transactions;

-- Recreate the policies using the security definer function
CREATE POLICY "Admins can read all participants" ON participants
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can read all apps" ON apps
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can read all transactions" ON transactions
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all apps" ON apps
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all transactions" ON transactions
  FOR ALL USING (is_admin(auth.uid()));
