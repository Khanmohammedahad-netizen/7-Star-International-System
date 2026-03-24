// @ts-nocheck
'use client'

import { useEvents } from '@/modules/events/hooks/useEvents'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Search, Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { DateTime } from 'luxon'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function EventsListPage() {
  const { data: events, isLoading } = useEvents()
  const [search, setSearch] = useState('')

  const filteredEvents = events?.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.venue_name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Events</h1>
          <p className="text-muted-foreground mt-1">Manage and coordinate all ongoing and upcoming events.</p>
        </div>
        <Link href="/events/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> New Event
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search events by name or venue..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          [1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />)
        ) : filteredEvents?.map(event => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <Card className="hover:border-primary/50 transition-colors p-5 h-full flex flex-col cursor-pointer border-t-4 shadow-sm hover:shadow" style={{ borderTopColor: event.color }}>
              <div className="flex justify-between items-start mb-4">
                <Badge variant="secondary" className="uppercase tracking-wider text-[10px]" style={{ color: event.color, borderColor: event.color }}>
                  {event.status.replace('_', ' ')}
                </Badge>
              </div>
              <h3 className="font-semibold text-xl line-clamp-2 leading-tight mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
                {event.name}
              </h3>
              
              <div className="mt-auto space-y-2.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{DateTime.fromISO(event.start_date).toFormat('MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{event.venue_name || 'TBA'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{event.expected_guests || '-'} Guests</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {!isLoading && filteredEvents?.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
            No events found matching "{search}"
          </div>
        )}
      </div>

    </div>
  )
}

