# 🧀 Allen App Challenge 2026 - Leaderboard

A password-protected leaderboard web application for tracking a family app development challenge. Participants compete to create the most profitable apps, with rankings based on profit (revenue minus expenses).

## Features

- ✅ **Authentication**: Individual passwords for each participant + admin account
- ✅ **Participant Dashboard**: Manage apps, add transactions, view profit charts
- ✅ **Leaderboard**: Real-time app and participant rankings
- ✅ **Monthly Winners**: Automatic calculation of monthly winners (announced on 10th of each month)
- ✅ **Transaction Management**: Track revenue and expenses with full history
- ✅ **Profit Charts**: Visual profit history with Recharts
- ✅ **Change Log**: Complete audit trail of all changes
- ✅ **Admin Dashboard**: Full control over all apps and transactions
- ✅ **Cheese Theme**: Beautiful yellow, orange, and cream colour scheme 🧀

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Frontend**: React 18+
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Hosting**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account (free tier available)
- A Vercel account (free tier available)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/allen-app-challenge-2026.git
   cd allen-app-challenge-2026
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run database migrations**
   See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

5. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Verify Setup

Run the verification script to check your configuration:

```bash
npm run verify-setup
```

This will check:
- Environment variables are set
- Supabase connection works
- Database tables exist
- Participants are configured

## Deployment

For detailed deployment instructions, see **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**.

Quick summary:
1. Set up Supabase project
2. Run database migrations
3. Create participant accounts in Supabase Auth
4. Link users to participants table
5. Deploy to Vercel

For a condensed version, see **[QUICK_START.md](./QUICK_START.md)**.

## Project Structure

```
allen-app-challenge-2026/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   └── login/
│   ├── (protected)/         # Protected routes
│   │   ├── dashboard/       # Participant dashboard
│   │   ├── leaderboard/     # Main leaderboard page
│   │   ├── changelog/       # Change log
│   │   └── admin/           # Admin dashboard
│   └── api/                 # API routes
├── components/              # React components
│   ├── Navigation.tsx
│   ├── ProfitChart.tsx
│   └── TransactionDeleteButton.tsx
├── lib/                     # Utility libraries
│   ├── auth.ts             # Authentication helpers
│   ├── calculations.ts     # Business logic
│   ├── supabase/           # Supabase clients
│   └── utils.ts            # Utility functions
├── supabase/
│   └── migrations/         # Database migrations
├── types/
│   └── index.ts            # TypeScript types
├── scripts/
│   └── verify-setup.js     # Setup verification script
├── DEPLOYMENT_GUIDE.md     # Detailed deployment guide
├── QUICK_START.md          # Quick start guide
└── README.md               # This file
```

## Challenge Details

- **Challenge Name**: Allen App Challenge 2026
- **Start Date**: 9 January 2026
- **End Date**: 9 January 2027
- **Grand Winner Announcement**: 10 January 2027
- **Monthly Winners**: Announced on the 10th of each month

### Participants

- Azaria
- Eden
- Samara
- Warwick
- Wendy
- Admin (administrator)

## Key Features Explained

### Authentication

- Each participant has their own login credentials
- Admin account with elevated permissions
- Secure session management via Supabase Auth

### Profit Tracking

- Profit = Total Revenue - Total Expenses
- Transactions tracked with dates
- Historical profit calculations for charts
- Real-time profit updates

### Rankings

- **App Rankings**: All apps ranked by total profit
- **Participant Rankings**: Participants ranked by their best-earning app
- Rankings update in real-time as transactions are added

### Monthly Winners

- Calculated based on rankings as of the 10th of each month
- Stores both app winner and participant winner
- Admin can trigger calculation for all months

### Change Log

- Records all changes to apps and transactions
- Shows who made the change, when, and what changed
- Accessible to all authenticated users

## API Routes

- `GET /api/apps` - List apps (with permissions)
- `POST /api/apps` - Create app
- `GET /api/apps/[id]` - Get app details
- `PATCH /api/apps/[id]` - Update app
- `DELETE /api/apps/[id]` - Delete app
- `GET /api/apps/[id]/transactions` - Get app transactions
- `POST /api/apps/[id]/transactions` - Add transaction
- `GET /api/transactions/[id]` - Get transaction
- `PATCH /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction
- `GET /api/leaderboard` - Get rankings
- `GET /api/monthly-winners` - Get monthly winners
- `POST /api/monthly-winners/calculate` - Calculate winners (admin)
- `GET /api/changelog` - Get change log

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for the complete database schema.

Main tables:
- `participants` - User accounts
- `apps` - App entries
- `transactions` - Revenue and expense transactions
- `change_log` - Audit trail
- `monthly_winners` - Cached monthly winner data

## Security

- Row-Level Security (RLS) enabled on all tables
- Authentication required for all protected routes
- Role-based access control (participant vs admin)
- Service role key kept secure (never exposed to client)
- All user inputs validated and sanitised

## Contributing

This is a private family project, but if you're contributing:

1. Follow the existing code style
2. Use TypeScript for all new files
3. Add comments for complex business logic
4. Test thoroughly before submitting

## License

Private project - All rights reserved.

## Support

For issues or questions:
1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) troubleshooting section
2. Review Supabase and Vercel logs
3. Check browser console for client-side errors

---

**Built with 🧀 for the Allen family challenge!**
