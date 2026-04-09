// @ts-nocheck
import { useDashboard } from '../hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'

function statusColor(status: string) {
  switch (status) {
    case 'planning': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    case 'confirmed': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    case 'in_progress': return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    case 'completed': return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
    case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
    default: return 'bg-white/5 text-neutral-400 border-white/10'
  }
}

export function UpcomingEvents() {
  const { data, isLoading } = useDashboard()

  return (
    <Card className="h-full bg-white/5 border-white/10">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-400" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-14 bg-white/5 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : !data?.upcomingEvents?.length ? (
          <div className="py-8 text-center text-neutral-500 text-sm italic">
            No upcoming events scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {data.upcomingEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="block group">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/10">
                  <div 
                    className="w-1 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: event.color || '#C9A84C' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate group-hover:text-white transition-colors">
                      {event.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.start_date).toLocaleDateString('en-AE', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {event.venue_name && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {event.venue_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider shrink-0 ${statusColor(event.status)}`}>
                    {event.status?.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
            <Link href="/events" className="flex items-center justify-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors py-2 mt-2 border-t border-white/5">
              View all events <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
