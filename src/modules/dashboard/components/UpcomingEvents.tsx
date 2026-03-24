// @ts-nocheck
import { useEvents } from '@/modules/events/hooks/useEvents'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { DateTime } from 'luxon'

export function UpcomingEvents() {
  const { data: events, isLoading } = useEvents({ limit: 10 })

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {events?.map((event) => (
              <div key={event.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <div className="flex gap-3">
                    <div className="text-sm font-medium text-muted-foreground w-16 shrink-0">
                      {DateTime.fromISO(event.start_date).toFormat('MMM dd')}
                    </div>
                    <Link href={`/events/${event.id}`} className="hover:underline truncate font-medium flex-1">
                      {event.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 pl-19 mt-1 text-sm text-muted-foreground">
                    <span className="truncate">{event.venue_name}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="ml-4 uppercase text-[10px] shrink-0">
                  {event.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

