'use client'

import { GlobalCalendar } from '@/modules/calendar/components/GlobalCalendar'

export default function CalendarPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto h-[calc(100vh-64px)] flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Calendar</h1>
        <p className="text-muted-foreground mt-1">Multi-event visibility and scheduling.</p>
      </div>
      <div className="flex-1 pb-6">
        <GlobalCalendar />
      </div>
    </div>
  )
}
