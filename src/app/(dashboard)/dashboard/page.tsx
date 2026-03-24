import { DashboardContent } from '@/modules/dashboard/components/DashboardContent'
import { requireSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
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
}
