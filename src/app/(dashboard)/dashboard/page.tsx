import { DashboardContent } from '@/modules/dashboard/components/DashboardContent'
import { requireSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  try {
    const session = await requireSession()
    
    return (
      <div className="p-6 space-y-6">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white">Operational Dashboard</h1>
            <p className="text-neutral-400">Welcome back, {session.email}</p>
          </div>
        </header>
        
        <DashboardContent />
      </div>
    )
  } catch (error) {
    console.error('Dashboard Render Error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">System Access Required</h1>
          <p className="text-neutral-400">Please sign in to access your dashboard.</p>
          <a href="/auth/login" className="inline-block bg-white text-black px-6 py-2 rounded-lg font-medium">
            Go to Login
          </a>
        </div>
      </div>
    )
  }
}
