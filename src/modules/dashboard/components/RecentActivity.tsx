// @ts-nocheck
import { useDashboard } from '../hooks/useDashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DateTime } from 'luxon'

export function RecentActivity() {
  const { data, isLoading } = useDashboard()

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
          </div>
        ) : (
          <div className="space-y-6">
            {data?.recentActivity.map((log) => (
              <div key={log.id} className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">{log.userName}</span> {log.action}{' '}
                    {log.eventName && <span className="font-medium text-muted-foreground">in {log.eventName}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {DateTime.fromISO(log.timestamp).toRelative()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

