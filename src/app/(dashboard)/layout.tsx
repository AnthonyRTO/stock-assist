import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, LayoutDashboard, Briefcase, GraduationCap, LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth'

async function handleSignOut() {
  'use server'
  await signOut({ redirectTo: '/' })
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold">Stock-Assist</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/portfolio"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                Portfolio
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <GraduationCap className="w-4 h-4" />
                Learn
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                {session.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline">{session.user?.name || 'User'}</span>
            </div>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="text-white/60 hover:text-white transition-colors p-2"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
