// @ts-nocheck
import { useEvents } from '@/modules/events/hooks/useEvents'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, MapPinIcon, ClockIcon } from 'lucide-react'
import Link from 'next/link'

export function TodayEvents() {
  const { data: events, isLoading } = useEvents({ today: true })

  if (isLoading) return <div className="h-32 bg-[#1a1a1a] border border-[#2a2a2a] animate-pulse rounded-xl" />
  
  if (!events?.length) return null

  return (
    <div className="mb-8 p-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-xl">
      <h2 className="text-sm font-bold uppercase tracking-widest text-[#C9A84C] mb-6 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {events.length} {events.length === 1 ? 'Event' : 'Events'} Happening Today
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <Card className="bg-[#111111] hover:bg-[#1a1a1a] hover:border-[#C9A84C]/50 transition-all p-5 cursor-pointer h-full border-l-4 group" style={{ borderLeftColor: event.color || '#C9A84C' }}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-white text-lg truncate flex-1 group-hover:text-[#C9A84C] transition-colors">
                  {event.name || event.title}
                </h3>
                <Badge variant={event.status === 'in_progress' ? 'default' : 'secondary'} className="ml-2 uppercase text-[10px] font-black tracking-tighter">
                  {event.status?.replace('_', ' ')}
                </Badge>
              </div>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{event.start_time || 'Check Schedule'} - {event.end_time || 'TBA'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-gray-500" />
                  <span className="truncate font-medium">{event.venue_name || event.location || 'Venue TBA'}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

