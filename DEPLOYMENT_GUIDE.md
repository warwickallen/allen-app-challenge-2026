# Deployment Guide - Allen App Challenge 2026

This guide provides detailed step-by-step instructions for deploying the Allen App Challenge 2026 Leaderboard application.

---

## Prerequisites

- A GitHub account
- A Supabase account (free tier available at https://supabase.com)
- A Vercel account (free tier available at https://vercel.com)
- Node.js 18+ and npm/yarn installed locally (for testing)

---

## Step 1: Set Up Supabase Project

### 1.1 Create a Supabase Account and Project

1. Go to https://supabase.com and sign up/login
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `allen-app-challenge-2026` (or your preferred name)
   - **Database Password**: Generate a strong password and **save it securely**
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Select **Free** (sufficient for this project)
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be provisioned

### 1.2 Get Supabase Credentials

1. Once your project is ready, go to **Settings** → **API**
2. You'll need the following values:
   - **Project URL** (found under "Project URL")
   - **anon/public key** (found under "Project API keys" → "anon public")
   - **service_role key** (found under "Project API keys" → "service_role" - **keep this secret!**)

3. Save these values in a secure location - you'll need them later:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

---

## Step 2: Run Database Migrations

### 2.1 Access Supabase SQL Editor

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **"New query"**

### 2.2 Run the Initial Schema Migration

1. Open the file `supabase/migrations/001_initial_schema.sql` in your code editor
2. Copy the **entire contents** of the file
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)
5. Verify the migration succeeded:
   - You should see a success message
   - Check the left sidebar: **Table Editor** → you should see tables:
     - `participants`
     - `apps`
     - `transactions`
     - `change_log`
     - `monthly_winners`

### 2.3 Verify Tables and Policies

1. In the SQL Editor, run this query to verify all tables exist:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_type = 'BASE TABLE'
   ORDER BY table_name;
   ```
   
   You should see: `apps`, `change_log`, `monthly_winners`, `participants`, `transactions`

2. Verify RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```
   
   All tables should have `rowsecurity = true`

---

## Step 3: Create Participant Accounts in Supabase Auth

### 3.1 Enable Email Auth

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Ensure **Email** provider is enabled (it's enabled by default)
3. Optionally configure:
   - **Confirm email**: Disable for easier testing (you can enable later)
   - **Secure email change**: Keep enabled

### 3.2 Create Auth Users

You need to create 6 user accounts:
- Azaria (participant)
- Eden (participant)
- Samara (participant)
- Warwick (participant)
- Wendy (participant)
- Admin (admin)

**Option A: Using Supabase Dashboard (Manual)**

1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. For each user:
   - **Email**: `azaria@example.com` (use a real email or test email)
   - **Password**: Set a secure password (e.g., `Azaria2026!`)
   - **Auto Confirm User**: ✓ Check this box
   - Click **"Create user"**
4. Repeat for all 6 users with appropriate emails and passwords
5. **Important**: Save all email/password combinations securely - you'll need them to log in

**Option B: Using Supabase SQL (Batch Creation)**

Alternatively, you can create users programmatically. In the SQL Editor, run:

```sql
-- Note: This requires enabling the auth schema access
-- First, create the users via Supabase Auth API or Dashboard
-- Then link them to participants table (see Step 4)
```

**Recommended**: Use Option A (Dashboard) for simplicity and security.

---

## Step 4: Link Auth Users to Participants Table

### 4.1 Get Auth User IDs

1. In Supabase dashboard, go to **Authentication** → **Users**
2. For each user, click on their email to view details
3. Copy the **User UID** (a UUID like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
4. Create a mapping document:
   ```
   Azaria: [User UID]
   Eden: [User UID]
   Samara: [User UID]
   Warwick: [User UID]
   Wendy: [User UID]
   Admin: [User UID]
   ```

### 4.2 Insert Participants into Database

1. Go to **SQL Editor** in Supabase
2. Run the following SQL, replacing `[USER_ID]` with the actual UUIDs from Step 4.1:

```sql
-- Insert participants (replace [USER_ID] placeholders with actual UUIDs from Auth)
INSERT INTO participants (id, name, email, role) VALUES
  ('[AZARIA_USER_ID]', 'Azaria', 'azaria@example.com', 'participant'),
  ('[EDEN_USER_ID]', 'Eden', 'eden@example.com', 'participant'),
  ('[SAMARA_USER_ID]', 'Samara', 'samara@example.com', 'participant'),
  ('[WARWICK_USER_ID]', 'Warwick', 'warwick@example.com', 'participant'),
  ('[WENDY_USER_ID]', 'Wendy', 'wendy@example.com', 'participant'),
  ('[ADMIN_USER_ID]', 'Admin', 'admin@example.com', 'admin');
```

**Important**: 
- The `id` must match the Auth User UID exactly
- The `email` must match the email used in Auth
- Update the email addresses to match what you used in Step 3.2

3. Click **"Run"**
4. Verify the insert succeeded:
   ```sql
   SELECT id, name, email, role FROM participants ORDER BY name;
   ```
   
   You should see all 6 participants listed.

### 4.3 Verify the Link

1. Go to **Table Editor** → **participants**
2. You should see all 6 rows with:
   - Correct names
   - Correct roles (5 participants, 1 admin)
   - Matching email addresses

---

## Step 5: Configure Environment Variables

### 5.1 Prepare Environment Variables

Create a file `.env.local` in your project root (this file is gitignored):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Optional: App URL for development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Replace the placeholder values** with your actual Supabase credentials from Step 1.2.

### 5.2 Test Locally (Optional but Recommended)

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. Open http://localhost:3000 in your browser
4. Test login with one of the participant accounts
5. Verify:
   - You can log in successfully
   - Dashboard shows correctly
   - You can create an app
   - You can add transactions
   - Leaderboard displays

6. Fix any issues before proceeding to deployment

---

## Step 6: Deploy to Vercel

### 6.1 Push Code to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Allen App Challenge 2026"
   ```

2. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Repository name: `allen-app-challenge-2026`
   - Choose public or private
   - **Don't** initialize with README, .gitignore, or license
   - Click **"Create repository"**

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/allen-app-challenge-2026.git
   git branch -M main
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username.

### 6.2 Deploy to Vercel

1. Go to https://vercel.com and sign up/login (use GitHub OAuth for easier setup)

2. Click **"Add New Project"**

3. Import your GitHub repository:
   - Find `allen-app-challenge-2026` in the list
   - Click **"Import"**

4. Configure the project:
   - **Project Name**: `allen-app-challenge-2026` (or your preferred name)
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (leave as default)
   - **Output Directory**: `.next` (leave as default)
   - **Install Command**: `npm install` (leave as default)

5. Add Environment Variables:
   - Expand **"Environment Variables"** section
   - Add each variable:
     - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
       - **Value**: Your Supabase project URL (from Step 1.2)
       - **Environments**: Production, Preview, Development ✓
     
     - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
       - **Value**: Your Supabase anon key (from Step 1.2)
       - **Environments**: Production, Preview, Development ✓
     
     - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
       - **Value**: Your Supabase service role key (from Step 1.2)
       - **Environments**: Production, Preview, Development ✓
       - **⚠️ Important**: Keep this secret!

6. Click **"Deploy"**

7. Wait for deployment to complete (usually 2-3 minutes)

8. Once deployed, Vercel will provide you with a URL like:
   `https://allen-app-challenge-2026.vercel.app`

### 6.3 Verify Deployment

1. Open the deployment URL in your browser
2. You should see the login page
3. Test login with one of the participant accounts:
   - Email: (the email you used in Step 3.2)
   - Password: (the password you set in Step 3.2)
4. Verify functionality:
   - ✅ Login works
   - ✅ Dashboard displays
   - ✅ Can create apps
   - ✅ Can add transactions
   - ✅ Leaderboard shows rankings
   - ✅ Change log is accessible

### 6.4 Set Up Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Enter your domain name (e.g., `leaderboard.yourdomain.com`)
4. Follow Vercel's instructions to configure DNS records
5. Once DNS propagates, your app will be accessible via the custom domain

---

## Step 7: Post-Deployment Configuration

### 7.1 Update Supabase Auth Settings (if needed)

1. Go to Supabase dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel deployment URL to **Site URL**:
   ```
   https://allen-app-challenge-2026.vercel.app
   ```
3. Add to **Redirect URLs**:
   ```
   https://allen-app-challenge-2026.vercel.app/**
   ```

### 7.2 Set Up Automatic Deployments

Vercel automatically deploys when you push to the main branch. To set up:
- ✅ Already configured by default
- Each push to `main` triggers a new deployment
- Preview deployments are created for pull requests

### 7.3 Test All Functionality

Go through this checklist to ensure everything works:

- [ ] All participants can log in
- [ ] Admin can log in
- [ ] Participants can create apps
- [ ] Participants can edit their own apps
- [ ] Participants can add revenue transactions
- [ ] Participants can add expense transactions
- [ ] Profit calculates correctly
- [ ] Leaderboard shows correct app rankings
- [ ] Leaderboard shows correct participant rankings
- [ ] Change log records all changes
- [ ] Admin can edit any app
- [ ] Admin can edit any transaction
- [ ] Profit charts display correctly
- [ ] Mobile responsive design works
- [ ] Monthly winners can be calculated (admin only)

---

## Troubleshooting

### Issue: Can't log in / "Invalid credentials"

**Solution**:
1. Verify the email and password are correct
2. Check Supabase Auth → Users to ensure the user exists
3. Verify the participant record exists in the `participants` table
4. Ensure the `id` in `participants` matches the Auth User UID exactly

### Issue: "Unauthorized" errors

**Solution**:
1. Check that RLS policies are enabled
2. Verify environment variables are set correctly in Vercel
3. Ensure the service role key is configured (for server-side operations)

### Issue: Database connection errors

**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check that the Supabase project is active (not paused)
3. Verify your IP isn't blocked (check Supabase dashboard)

### Issue: Monthly winners calculation fails

**Solution**:
1. Ensure you're logged in as admin
2. Check that transactions exist with dates before the 10th of each month
3. Verify the `monthly_winners` table exists and has correct schema

### Issue: Charts not displaying

**Solution**:
1. Ensure Recharts is installed: `npm install recharts`
2. Check browser console for errors
3. Verify transaction data exists for the app

---

## Security Notes

1. **Never commit `.env.local`** to git - it's already in `.gitignore`
2. **Never expose `SUPABASE_SERVICE_ROLE_KEY`** publicly
3. **Use strong passwords** for all participant accounts
4. **Enable email confirmation** in production (optional but recommended)
5. **Monitor Supabase usage** to stay within free tier limits
6. **Set up Vercel environment variable protection** for sensitive values

---

## Maintenance

### Regular Tasks

1. **Monitor Supabase usage**: Check dashboard for database size and bandwidth
2. **Calculate monthly winners**: Admin should calculate winners monthly (on the 10th)
3. **Backup database**: Use Supabase backups (automatic with paid plans, manual for free)
4. **Update dependencies**: Regularly run `npm update` and test

### Adding New Participants

If you need to add more participants later:

1. Create Auth user in Supabase → Authentication → Users
2. Get the User UID
3. Insert into participants table:
   ```sql
   INSERT INTO participants (id, name, email, role)
   VALUES ('[USER_UID]', 'Name', 'email@example.com', 'participant');
   ```

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase logs: Dashboard → Logs
3. Check Vercel logs: Project → Deployments → Click deployment → View Function Logs
4. Review browser console for client-side errors

---

## Deployment Checklist Summary

- [ ] Supabase project created
- [ ] Database migrations run successfully
- [ ] All 6 user accounts created in Supabase Auth
- [ ] Participants table populated with correct User UIDs
- [ ] Environment variables configured in Vercel
- [ ] Code pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Login tested with all accounts
- [ ] All core functionality verified
- [ ] Custom domain configured (optional)
- [ ] Supabase URL configuration updated

---

**Congratulations!** Your Allen App Challenge 2026 Leaderboard is now live! 🧀🎉
