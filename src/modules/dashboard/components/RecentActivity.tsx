// @ts-nocheck
import { useDashboard } from '../hooks/useDashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Activity, CalendarPlus, UserPlus, FileText, Package } from 'lucide-react'

const TYPE_ICONS: Record<string, any> = {
  event_created: CalendarPlus,
  client_added: UserPlus,
  vendor_added: Package,
  invoice_generated: FileText,
}

const TYPE_COLORS: Record<string, string> = {
  event_created: 'text-blue-400 bg-blue-400/10',
  client_added: 'text-emerald-400 bg-emerald-400/10',
  vendor_added: 'text-purple-400 bg-purple-400/10',
  invoice_generated: 'text-amber-400 bg-amber-400/10',
}

function timeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'just now'
}

export function RecentActivity() {
  const { data, isLoading } = useDashboard()

  return (
    <Card className="h-full bg-white/5 border-white/10">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-neutral-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 animate-pulse rounded-xl" />)}
          </div>
        ) : !data?.recentActivity?.length ? (
          <div className="py-8 text-center text-neutral-500 text-sm italic">
            No recent activity. Start by creating an event or adding a client.
          </div>
        ) : (
          <div className="space-y-3">
            {data.recentActivity.map((log) => {
              const Icon = TYPE_ICONS[log.type] || Activity
              const colorClass = TYPE_COLORS[log.type] || 'text-neutral-400 bg-white/5'
              return (
                <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{log.title}</p>
                    {log.description && (
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">{log.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-600 shrink-0 mt-0.5">{timeAgo(log.timestamp)}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
