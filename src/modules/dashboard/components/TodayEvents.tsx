// @ts-nocheck
import { useEvents } from '@/modules/events/hooks/useEvents'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, MapPinIcon, ClockIcon } from 'lucide-react'
import Link from 'next/link'

export function TodayEvents() {
  const { data: events, isLoading } = useEvents({ today: true })

  if (isLoading) return <div className="h-32 bg-muted animate-pulse rounded-lg" />
  
  if (!events?.length) return null

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        {events.length} {events.length === 1 ? 'Event' : 'Events'} Happening Today
      </h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <Card className="hover:border-primary/50 transition-colors p-4 cursor-pointer h-full border-t-4" style={{ borderTopColor: event.color }}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg truncate flex-1">{event.name}</h3>
                <Badge variant={event.status === 'in_progress' ? 'default' : 'secondary'} className="ml-2 uppercase text-xs">
                  {event.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="space-y-2 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{event.start_time || 'TBA'} - {event.end_time || 'TBA'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="truncate">{event.venue_name || 'Venue TBA'}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

