// @ts-nocheck
import { Event } from '../types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, MoreHorizontal, Plus, FileText } from 'lucide-react'
import Link from 'next/link'
import { DateTime } from 'luxon'

export function EventHeader({ event }: { event: Event }) {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-4 pt-2 -mx-6 px-6 -mt-2">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between mb-4 mt-2 slide-in-from-top-2 animate-in duration-300">
        <Link href="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Events
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="hidden sm:flex items-center gap-2">
            <Plus className="w-4 h-4" /> Vendor
          </Button>
          <Button variant="secondary" size="sm" className="hidden sm:flex items-center gap-2">
            <Plus className="w-4 h-4" /> Task
          </Button>
          <Button variant="default" size="sm" className="hidden sm:flex items-center gap-2">
            <FileText className="w-4 h-4" /> Invoice
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Title Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl capitalize tracking-tight" style={{ fontFamily: 'var(--font-cormorant)' }}>
              {event.name}
            </h1>
            <Badge variant="secondary" className="uppercase tracking-wider px-2 py-0.5" style={{ color: event.color, borderColor: event.color }}>
              {event.status.replace('_', ' ')} ▾
            </Badge>
          </div>
          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm md:text-base">
            <span className="font-medium text-foreground">{DateTime.fromISO(event.start_date).toFormat('MMM dd, yyyy')}</span>
            <span className="border-l border-border/50 pl-4">Venue: {event.venue_name || 'TBA'}</span>
            <span className="border-l border-border/50 pl-4">{event.client?.company || 'No Client Linked'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

