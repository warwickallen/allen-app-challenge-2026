import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'

export default async function AboutPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cheese-50 via-cheese-100 to-cream-light">
      {/* Simple Navigation Header */}
      <nav className="bg-cheese-500 text-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={user ? '/leaderboard' : '/'} className="flex items-center space-x-2 hover:text-gray-700">
              <span className="text-2xl">🧀</span>
              <span className="font-bold text-lg">Allen App Challenge</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/about"
                className="px-3 py-2 rounded-md text-sm font-medium bg-cheese-600 transition-colors"
              >
                About
              </Link>
              {user ? (
                <Link
                  href="/leaderboard"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-cheese-600 transition-colors"
                >
                  Leaderboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-cheese-600 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 border-2 border-cheese-300">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-cheese-600 mb-4">🧀</h1>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Allen App Challenge 2026</h2>
            <p className="text-lg text-gray-600">Leaderboard Web Application</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">About the Challenge</h3>
              <p className="text-gray-700 leading-relaxed">
                The Allen App Challenge 2026 is a family app development competition where participants compete to create the most profitable apps. Rankings are based on profit (revenue minus expenses), and the challenge runs from <strong>9 January 2026</strong> until <strong>9 January 2027</strong>, with a grand winner announced on <strong>10 January 2027</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Each participant may enter multiple apps, and apps are ranked individually by total profit. Participant rankings are based on their best-earning app at that time. The leaderboard operates on a trust model, where participants self-report their profits.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Challenge Details</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Challenge Name:</strong> Allen App Challenge 2026</li>
                <li><strong>Start Date:</strong> 9 January 2026</li>
                <li><strong>End Date:</strong> 9 January 2027</li>
                <li><strong>Grand Winner Announcement:</strong> 10 January 2027</li>
                <li><strong>Monthly Winners:</strong> Announced on the 10th of each month during the challenge period</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Prize</h3>
              <p className="text-gray-700 leading-relaxed">
                The grand winner will receive a block (or blocks) of cheese of their choosing, up to a total value of <strong>$40</strong>. The other participants will contribute in equal shares to buying the cheese.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Participants</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The challenge includes the following participants:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Azaria</li>
                <li>Eden</li>
                <li>Samara</li>
                <li>Warwick</li>
                <li>Wendy</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">About the Leaderboard App</h3>
              <p className="text-gray-700 leading-relaxed">
                This leaderboard web application is a password-protected system designed to track the family app development challenge. The application provides:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li><strong>Authentication:</strong> Individual passwords for each participant plus an admin account</li>
                <li><strong>Participant Dashboard:</strong> Manage apps, add transactions, and view profit charts</li>
                <li><strong>Leaderboard:</strong> Real-time app and participant rankings</li>
                <li><strong>Monthly Winners:</strong> Automatic calculation of monthly winners (announced on the 10th of each month)</li>
                <li><strong>Transaction Management:</strong> Track revenue and expenses with full history</li>
                <li><strong>Profit Charts:</strong> Visual profit history with interactive charts</li>
                <li><strong>Change Log:</strong> Complete audit trail of all changes</li>
                <li><strong>Admin Dashboard:</strong> Full control over all apps and transactions</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h3>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Profit Tracking</h4>
                  <p className="leading-relaxed">
                    Profit is calculated as <strong>Total Revenue - Total Expenses</strong>. Each transaction has a date, and historical profit is calculated cumulatively over time. Participants can add revenue and expense transactions to their apps, and all changes are logged in the change log.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Rankings</h4>
                  <p className="leading-relaxed">
                    <strong>App Rankings:</strong> All apps are ranked by total profit (highest to lowest).<br />
                    <strong>Participant Rankings:</strong> Participants are ranked by their best-earning app&apos;s profit. Rankings update in real-time as transactions are added.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Monthly Winners</h4>
                  <p className="leading-relaxed">
                    Monthly winners are calculated based on rankings as of the 10th of each month. The system stores both the monthly app winner and the monthly participant winner. These winners are displayed in the leaderboard&apos;s Monthly Winners section.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Technology</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                This application is built with modern web technologies:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Framework:</strong> Next.js 14+ (App Router) with TypeScript</li>
                <li><strong>Frontend:</strong> React 18+</li>
                <li><strong>Styling:</strong> Tailwind CSS</li>
                <li><strong>Database:</strong> Supabase (PostgreSQL)</li>
                <li><strong>Authentication:</strong> Supabase Auth</li>
                <li><strong>Charts:</strong> Recharts</li>
                <li><strong>Hosting:</strong> Vercel</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Source Code</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The source code for this application is available on GitHub:
              </p>
              <div className="bg-cheese-50 border border-cheese-300 rounded-lg p-4">
                <a
                  href="https://github.com/warwickallen/allen-app-challenge-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cheese-700 hover:text-cheese-800 font-semibold text-lg flex items-center space-x-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span>warwickallen/allen-app-challenge-2026</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </section>

            <section className="pt-8 border-t border-cheese-200">
              <div className="text-center">
                {user ? (
                  <Link
                    href="/leaderboard"
                    className="inline-block bg-cheese-500 hover:bg-cheese-600 text-black font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    View Leaderboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-block bg-cheese-500 hover:bg-cheese-600 text-black font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Login to View Leaderboard
                  </Link>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
