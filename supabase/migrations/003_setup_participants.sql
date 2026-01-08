-- Helper migration for setting up participants
-- IMPORTANT: This migration requires manual completion
-- You must:
-- 1. Create users in Supabase Auth first (via Dashboard → Authentication → Users)
-- 2. Get the User UID for each user from the Auth dashboard
-- 3. Replace the [USER_ID] placeholders below with actual UUIDs
-- 4. Update email addresses to match the emails used in Auth

-- Example structure (DO NOT RUN AS-IS - replace placeholders):
/*
INSERT INTO participants (id, name, email, role) VALUES
  ('[AZARIA_AUTH_UID]', 'Azaria', 'azaria@example.com', 'participant'),
  ('[EDEN_AUTH_UID]', 'Eden', 'eden@example.com', 'participant'),
  ('[SAMARA_AUTH_UID]', 'Samara', 'samara@example.com', 'participant'),
  ('[WARWICK_AUTH_UID]', 'Warwick', 'warwick@example.com', 'participant'),
  ('[WENDY_AUTH_UID]', 'Wendy', 'wendy@example.com', 'participant'),
  ('[ADMIN_AUTH_UID]', 'Admin', 'admin@example.com', 'admin')
ON CONFLICT (id) DO NOTHING;
*/

-- Instructions:
-- 1. Get UUIDs from Supabase Auth → Users → Click each user → Copy "User UID"
-- 2. Replace [AZARIA_AUTH_UID], [EDEN_AUTH_UID], etc. with actual UUIDs
-- 3. Update email addresses to match what you used when creating Auth users
-- 4. Uncomment and run the INSERT statement above
-- 5. Verify with: SELECT id, name, email, role FROM participants ORDER BY name;
