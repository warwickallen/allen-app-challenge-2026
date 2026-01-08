# Allen App Challenge 2026 - Leaderboard Web Application
## Requirements Document

**Project Name:** Allen App Challenge 2026 Leaderboard  
**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Ready for Development

---

## 1. Project Overview

This is a password-protected leaderboard web application for tracking a family app development challenge. Participants compete to create the most profitable apps, with rankings based on profit (revenue minus expenses). The challenge runs from **2026-01-09** until **2027-01-09**, with a grand winner announced on **2027-01-10**.

### 1.1 Challenge Details

- **Challenge Name:** "Allen App Challenge 2026"
- **Theme:** Cheese (for UI/UX design)
- **Start Date:** 2026-01-09
- **End Date:** 2027-01-09
- **Grand Winner Announcement:** 2027-01-10
- **Monthly Winners:** Announced on the 10th day of each month during the challenge period

### 1.2 Participants

- Azaria
- Eden
- Samara
- Warwick
- Wendy

### 1.3 Business Rules

- Each participant may enter multiple apps
- Apps are ranked individually by total profit (revenue - expenses)
- Participant rankings are based on their best-earning app at that time
- Rankings are based on profit, not revenue
- The leaderboard operates on a trust model (no profit verification required)

---

## 2. Functional Requirements

### 2.1 Authentication & Authorisation

- **Individual Passwords:** Each participant has their own login credentials
- **Admin Account:** Separate admin account with elevated permissions
- **Password Protection:** The entire application is password-protected but publicly hosted
- **Session Management:** Secure session handling with appropriate timeouts

**Roles:**
- **Participant:** Can view leaderboard, manage their own apps, view change log
- **Admin:** Can do everything a participant can, plus edit any app/transaction

### 2.2 Participant Dashboard

Participants can:
- View all their apps
- Create new apps (app name and description required)
- Edit their app details (name and description)
- View individual app details with profit history
- Add revenue transactions
- Add expense transactions
- View profit charts for their apps
- Delete their own apps (optional requirement - confirm if needed)

### 2.3 Admin Dashboard

Admins can:
- Everything a participant can do
- Edit any participant's app details
- Add/edit/delete transactions for any app
- View all apps and participants

### 2.4 Leaderboard

The leaderboard displays:
- **App Rankings:** All apps ranked by total profit (highest to lowest)
- **Participant Rankings:** Participants ranked by their best-earning app's profit
- **Monthly Winners:** Display of all past monthly winners
  - Monthly winner announcement date: 10th of each month
  - Winners calculated based on rankings as of the 10th
  - Show both monthly app winner and monthly participant winner
- **Current Rankings:** Live/current rankings based on latest data
- **Overall Rankings:** Cumulative rankings for the entire challenge period

**Leaderboard Sections:**
1. Current App Rankings (top apps by profit)
2. Current Participant Rankings (participants by best app)
3. Monthly Winners History (all monthly winners)
4. Grand Winner (displayed after 2027-01-10)

### 2.5 Change Log

- **Viewable by:** All authenticated users (participants and admin)
- **Logs all changes:**
  - App creation
  - App edits (name, description)
  - Transaction creation (revenue/expense)
  - Transaction edits
  - Transaction deletions
  - Any admin edits to participant data
- **Change Log Fields:**
  - Who made the change (user name)
  - When the change was made (timestamp)
  - What type of change (action type)
  - What entity was changed (app or transaction)
  - Old values (if applicable)
  - New values
- **Sorting:** Most recent first (default)

### 2.6 Profit Tracking

- **Profit Calculation:** Profit = Total Revenue - Total Expenses
- **Transaction Tracking:**
  - Each transaction has a date
  - Revenue and expenses tracked separately
  - Transactions can be edited or deleted
  - Historical profit calculated cumulatively over time
- **Profit History:**
  - Track profit over time for charting
  - Display charts showing profit growth over time
  - Charts should be available on individual app pages

### 2.7 App Management

**App Creation:**
- Required fields: App name, Description
- Auto-assigned to logged-in participant
- Created timestamp recorded

**App Editing:**
- Participants can edit their own app name and description
- Admin can edit any app name and description
- All edits logged in change log

**Transaction Entry:**
- Participants can add transactions to their own apps
- Admin can add transactions to any app
- Transaction fields:
  - Type: Revenue or Expense
  - Amount: Decimal (positive number)
  - Description: Optional text
  - Date: Transaction date (defaults to today, but can be set to past dates for historical entries)
- Transactions can be edited or deleted
- All transaction changes logged

---

## 3. Technical Requirements

### 3.1 Technology Stack

**Recommended Stack:**
- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Frontend:** React 18+
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Charts:** Recharts or Chart.js
- **Hosting:** Vercel (free tier)

**Alternative Considerations:**
- If Supabase is not available, use PostgreSQL + Prisma ORM
- If Vercel is not available, consider Netlify or Railway

### 3.2 Database Schema

```sql
-- Participants/Users table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('participant', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apps table
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (revenue and expenses)
CREATE TABLE transactions (
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
CREATE TABLE change_log (
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
CREATE TABLE monthly_winners (
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
CREATE INDEX idx_apps_participant_id ON apps(participant_id);
CREATE INDEX idx_transactions_app_id ON transactions(app_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_change_log_created_at ON change_log(created_at DESC);
CREATE INDEX idx_change_log_user_id ON change_log(user_id);
CREATE INDEX idx_monthly_winners_month ON monthly_winners(month DESC);
```

### 3.3 API Endpoints

```
Authentication:
  POST   /api/auth/login          - Login user
  POST   /api/auth/logout         - Logout user
  GET    /api/auth/session        - Get current session

Apps:
  GET    /api/apps                - List all apps (with permissions)
  POST   /api/apps                - Create new app (participant only)
  GET    /api/apps/[id]           - Get app details
  PATCH  /api/apps/[id]           - Update app (owner or admin)
  DELETE /api/apps/[id]           - Delete app (owner or admin)

Transactions:
  GET    /api/apps/[id]/transactions         - Get all transactions for an app
  POST   /api/apps/[id]/transactions         - Add transaction (owner or admin)
  GET    /api/transactions/[id]              - Get transaction details
  PATCH  /api/transactions/[id]              - Update transaction (owner or admin)
  DELETE /api/transactions/[id]              - Delete transaction (owner or admin)
  GET    /api/apps/[id]/profit-history       - Get profit history for charting

Leaderboard:
  GET    /api/leaderboard                    - Get current app and participant rankings
  GET    /api/leaderboard/apps               - Get app rankings only
  GET    /api/leaderboard/participants       - Get participant rankings only

Monthly Winners:
  GET    /api/monthly-winners                - Get all monthly winners
  POST   /api/monthly-winners/calculate      - Calculate monthly winners (admin only, or cron)

Change Log:
  GET    /api/changelog                      - Get change log (all users)
  GET    /api/changelog?app_id=[id]          - Get change log filtered by app
```

### 3.4 Business Logic Functions

**Profit Calculations:**
```typescript
// Calculate total profit for an app up to a specific date
function calculateAppProfit(appId: string, upToDate?: Date): number

// Get the best-earning app for a participant
function getParticipantBestApp(participantId: string, upToDate?: Date): { appId: string, profit: number }

// Rank all apps by profit
function rankApps(upToDate?: Date): Array<{ appId: string, appName: string, participantName: string, profit: number }>

// Rank participants by their best app
function rankParticipants(upToDate?: Date): Array<{ participantId: string, participantName: string, bestAppId: string, bestAppName: string, profit: number }>

// Get profit history for charting (time series)
function getProfitHistory(appId: string): Array<{ date: Date, cumulativeProfit: number }>

// Calculate monthly winners for a specific month
function calculateMonthlyWinners(month: Date): { appWinner: {...}, participantWinner: {...} }
```

**Monthly Winner Calculation:**
- Winners are calculated based on rankings as of the 10th day of each month
- Example: February 2026 monthly winners are calculated based on rankings as of 2026-02-10
- Store calculated winners in `monthly_winners` table to avoid recalculation

### 3.5 Data Validation

**App Validation:**
- App name: Required, max 200 characters
- Description: Optional, max 2000 characters
- Participant ID: Must exist and be valid

**Transaction Validation:**
- Amount: Required, must be >= 0, max 999999999.99
- Transaction type: Must be 'revenue' or 'expense'
- Transaction date: Required, cannot be future date (validation rule)
- Description: Optional, max 500 characters

### 3.6 Security Requirements

- All API routes must check authentication
- Participants can only edit their own apps (unless admin)
- Row-level security in database (if using Supabase)
- Password hashing using bcrypt or similar
- CSRF protection
- SQL injection prevention (use parameterised queries)
- XSS prevention (sanitise user inputs)
- Rate limiting on API endpoints (optional but recommended)

---

## 4. UI/UX Requirements

### 4.1 Design Theme

- **Theme:** Cheese
- **Colour Palette:** Yellow, orange, cream tones (cheese-inspired)
- **Typography:** Clean, readable fonts
- **Icons:** Cheese-related icons where appropriate (optional)

### 4.2 Page Structure

**1. Login Page** (`/login`)
- Simple login form
- Email/username and password fields
- Error handling for invalid credentials
- "Remember me" option (optional)

**2. Leaderboard Page** (`/leaderboard`)
- Main page (redirect here after login)
- Sections:
  - Header: Challenge name and dates
  - Current App Rankings (table with: Rank, App Name, Participant, Profit)
  - Current Participant Rankings (table with: Rank, Participant, Best App, Profit)
  - Monthly Winners section (cards or table showing all monthly winners)
  - Grand Winner section (visible after 2027-01-10)
- Navigation to other sections

**3. Dashboard Page** (`/dashboard`)
- Participant's own apps listed
- Quick stats: Total apps, Total profit across all apps, Best app
- Button to create new app
- Each app card shows: Name, Description, Current Profit, Profit chart (mini)
- Click app card to view detailed app page

**4. App Detail Page** (`/dashboard/[appId]`)
- App name and description (editable)
- Current profit prominently displayed
- Profit history chart (line chart showing profit over time)
- Transactions list (table: Date, Type, Amount, Description, Actions)
- Add transaction button (revenue or expense)
- Edit/delete app button (if owner or admin)
- Edit/delete transaction buttons (if owner or admin)

**5. Admin Dashboard** (`/admin`) - Admin only
- Similar to participant dashboard but shows all apps
- Filter/search functionality
- Edit any app or transaction

**6. Change Log Page** (`/changelog`)
- Table showing all changes
- Columns: Date/Time, User, Action, Entity, Details
- Sortable by date (default: most recent first)
- Filter by user or app (optional)

**7. Navigation**
- Header navigation: Leaderboard, Dashboard, Change Log, Admin (if admin), Logout
- Mobile-responsive hamburger menu

### 4.3 Responsive Design

- Mobile-first approach
- Responsive tables (may need to switch to cards on mobile)
- Touch-friendly buttons and inputs
- Charts must be responsive

### 4.4 User Experience

- Clear visual hierarchy
- Loading states for async operations
- Success/error notifications (toast messages)
- Confirmation dialogs for destructive actions (delete)
- Form validation with clear error messages
- Accessibility: WCAG 2.1 Level AA compliance

---

## 5. Data Initialisation

### 5.1 Initial Participants Setup

Create the following user accounts:
- Azaria (participant)
- Eden (participant)
- Samara (participant)
- Warwick (participant)
- Wendy (participant)
- Admin account (admin role)

**Note:** Initial passwords should be securely generated or set by admin. Consider password reset functionality for first-time login.

### 5.2 Challenge Configuration

Store challenge configuration:
- Challenge name: "Allen App Challenge 2026"
- Start date: 2026-01-09
- End date: 2027-01-09
- Grand winner announcement date: 2027-01-10

---

## 6. Deployment Requirements

### 6.1 Hosting Platform

- **Primary:** Vercel (free tier)
  - Automatic deployments from GitHub
  - Free SSL certificates
  - Custom domain support
  - Environment variable management

### 6.2 Database Hosting

- **Primary:** Supabase (free tier)
  - 500MB database storage
  - 2GB bandwidth per month
  - PostgreSQL database
  - Built-in authentication
  - Row-level security

### 6.3 Environment Variables

Required environment variables:
```
DATABASE_URL=<supabase_connection_string>
NEXT_PUBLIC_SUPABASE_URL=<supabase_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<supabase_service_role_key>
NEXTAUTH_SECRET=<random_secret_for_sessions>
NODE_ENV=production
```

### 6.4 Deployment Checklist

- [ ] Set up Supabase project
- [ ] Run database migrations
- [ ] Create initial participant accounts
- [ ] Configure environment variables
- [ ] Deploy to Vercel
- [ ] Set up custom domain (optional)
- [ ] Test authentication flow
- [ ] Test CRUD operations
- [ ] Test leaderboard calculations
- [ ] Test monthly winner calculations

---

## 7. Testing Requirements

### 7.1 Unit Tests

- Profit calculation functions
- Ranking functions
- Monthly winner calculation functions
- Data validation functions

### 7.2 Integration Tests

- API endpoint testing
- Authentication flow
- CRUD operations for apps and transactions
- Authorisation checks (participant vs admin)

### 7.3 Manual Testing Scenarios

1. Participant can create an app
2. Participant can add revenue transaction
3. Participant can add expense transaction
4. Profit calculates correctly (revenue - expenses)
5. Participant can only edit their own apps
6. Admin can edit any app
7. Leaderboard shows correct rankings
8. Change log records all changes
9. Monthly winners calculate correctly
10. Charts display profit history correctly

---

## 8. Future Enhancements (Optional)

These features are not required for initial implementation but could be added later:

- Password reset functionality
- Email notifications for monthly winners
- Export leaderboard to CSV/PDF
- Profit projections/forecasting
- Comments/discussions on apps
- App screenshots/images
- Revenue/expense categories/tags
- Profit goals/targets
- Time-based filters on leaderboard (view rankings on specific dates)

---

## 9. Development Guidelines

### 9.1 Code Standards

- Use TypeScript for type safety
- Follow Next.js 14 App Router conventions
- Use functional React components with hooks
- Implement proper error handling
- Use meaningful variable and function names
- Add comments for complex business logic

### 9.2 File Structure

Follow Next.js 14 App Router structure:
```
app/
├── (auth)/              - Auth-related pages (login)
├── (protected)/         - Protected pages (dashboard, leaderboard)
├── api/                 - API routes
├── layout.tsx           - Root layout
└── page.tsx             - Home page (redirect to leaderboard)

components/
├── auth/
├── leaderboard/
├── apps/
├── charts/
└── ui/

lib/
├── supabase/
├── auth.ts
├── calculations.ts
└── utils.ts

types/
└── index.ts
```

### 9.3 Incremental Development

Build in small, testable increments:
1. Set up project structure and database
2. Implement authentication
3. Build basic CRUD for apps
4. Add transaction management
5. Implement profit calculations
6. Build leaderboard
7. Add monthly winners functionality
8. Implement change log
9. Add charts and polish UI

---

## 10. Acceptance Criteria

The application is considered complete when:

- [ ] All participants can log in with their own credentials
- [ ] Admin account can log in
- [ ] Participants can create and manage their own apps
- [ ] Participants can add revenue and expense transactions
- [ ] Profit calculates correctly for all apps
- [ ] Leaderboard displays correct app rankings
- [ ] Leaderboard displays correct participant rankings
- [ ] Monthly winners can be calculated and displayed
- [ ] Change log records all data changes
- [ ] All authenticated users can view change log
- [ ] Admin can edit any app or transaction
- [ ] Participants can only edit their own data
- [ ] Profit history charts display correctly
- [ ] Application is responsive on mobile devices
- [ ] Application is deployed and accessible
- [ ] All pages follow the cheese theme

---

## 11. Notes for Developers

1. **Trust Model:** This application operates on trust - participants self-report their profits. No verification is required, but all changes are logged for transparency.

2. **Date Handling:** Be careful with timezones. Use UTC for all timestamps and convert to local time only for display.

3. **Monthly Winners:** Monthly winners are announced on the 10th of each month. The winners should be calculated based on data as of that date (e.g., February 2026 winners are calculated as of 2026-02-10).

4. **Profit History:** When calculating profit history for charts, consider all transactions up to each date point. The chart should show cumulative profit over time.

5. **Performance:** Consider caching monthly winners to avoid recalculation. Recalculate only when new transactions are added that could affect historical rankings.

6. **Security:** Ensure all API routes check authentication and authorisation. Never trust client-side validation alone.

7. **Error Handling:** Provide clear error messages to users. Log errors server-side for debugging.

---

## 12. Contact & Clarifications

For any clarifications or questions during development, refer to this document and the business rules outlined above. If additional requirements emerge, document them and update this requirements document.

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-27  
**Status:** Ready for Development
