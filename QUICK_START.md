# Quick Start Guide - Allen App Challenge 2026

This is a condensed version of the deployment guide. For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## TL;DR Deployment Steps

### 1. Supabase Setup (5 minutes)
```bash
# 1. Create project at https://supabase.com
# 2. Get credentials from Settings → API:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY
```

### 2. Database Migration (2 minutes)
```sql
-- In Supabase SQL Editor, run:
-- Copy/paste contents of: supabase/migrations/001_initial_schema.sql
```

### 3. Create Auth Users (10 minutes)
```
1. Supabase Dashboard → Authentication → Users
2. Add 6 users (Azaria, Eden, Samara, Warwick, Wendy, Admin)
3. Save User UIDs for each
```

### 4. Link Users to Participants (5 minutes)
```sql
-- In SQL Editor, replace [UID] with actual User UIDs:
INSERT INTO participants (id, name, email, role) VALUES
  ('[UID]', 'Azaria', 'azaria@example.com', 'participant'),
  ('[UID]', 'Eden', 'eden@example.com', 'participant'),
  ('[UID]', 'Samara', 'samara@example.com', 'participant'),
  ('[UID]', 'Warwick', 'warwick@example.com', 'participant'),
  ('[UID]', 'Wendy', 'wendy@example.com', 'participant'),
  ('[UID]', 'Admin', 'admin@example.com', 'admin');
```

### 5. Deploy to Vercel (5 minutes)
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/allen-app-challenge-2026.git
git push -u origin main

# 2. Import to Vercel
# - Go to vercel.com
# - Import GitHub repo
# - Add environment variables:
#   * NEXT_PUBLIC_SUPABASE_URL
#   * NEXT_PUBLIC_SUPABASE_ANON_KEY
#   * SUPABASE_SERVICE_ROLE_KEY
# - Deploy!
```

## Environment Variables

Create `.env.local` for local testing:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Verification Checklist

- [ ] Can log in with participant account
- [ ] Can create an app
- [ ] Can add revenue/expense transactions
- [ ] Profit calculates correctly
- [ ] Leaderboard displays rankings
- [ ] Admin can access admin dashboard
- [ ] Change log records changes

## Common Issues

| Issue | Solution |
|-------|----------|
| Can't log in | Verify User UID matches participant.id exactly |
| Unauthorized errors | Check RLS policies enabled, verify env vars |
| Database errors | Confirm Supabase URL and keys are correct |

For detailed troubleshooting, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
