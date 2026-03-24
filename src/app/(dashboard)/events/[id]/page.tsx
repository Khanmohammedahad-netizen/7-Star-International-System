'use client'

import { EventCommandCenter } from '@/modules/events/components/EventCommandCenter'

export default function EventPage({ params }: { params: { id: string } }) {
  // Page component is kept lean, acting just as a wrapper for the Command Center
  return (
    <div className="h-full flex flex-col">
      <EventCommandCenter eventId={params.id} />
    </div>
  )
}
