'use client'

import { useRouter } from 'next/navigation'

interface CalendarEvent {
  id: string
  name: string
  status: string
  start_date: string
  end_date: string | null
}

interface DayCell {
  date: Date
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

function getEventColorClass(status: string) {
  switch (status?.toLowerCase()) {
    case 'planning':     return 'bg-blue-600 text-white'
    case 'confirmed':    return 'bg-emerald-600 text-white'
    case 'in progress':  return 'bg-amber-500 text-black'
    case 'completed':    return 'bg-zinc-500 text-white'
    case 'cancelled':    return 'bg-red-600 text-white'
    default:             return 'bg-zinc-600 text-white'
  }
}

function buildCalendarDays(year: number, month: number, events: CalendarEvent[]): DayCell[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date()

  // Monday-based: Mon=0 ... Sun=6
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6

  const days: DayCell[] = []

  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({ date, dayNumber: date.getDate(), isCurrentMonth: false, isToday: false, events: [] })
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const isToday = date.toDateString() === today.toDateString()
    const dayEvents = events.filter(ev => {
      const start = new Date(ev.start_date)
      const end = ev.end_date ? new Date(ev.end_date) : start
      const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate())
      const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      return dateMidnight >= startMidnight && dateMidnight <= endMidnight
    })
    days.push({ date, dayNumber: d, isCurrentMonth: true, isToday, events: dayEvents })
  }

  // Next month leading days to fill grid
  const remainder = days.length % 7
  if (remainder !== 0) {
    for (let d = 1; d <= 7 - remainder; d++) {
      const date = new Date(year, month + 1, d)
      days.push({ date, dayNumber: d, isCurrentMonth: false, isToday: false, events: [] })
    }
  }

  return days
}

const DAY_HEADERS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function MonthGrid({ 
  year, 
  month, 
  events 
}: { 
  year: number
  month: number
  events: CalendarEvent[] 
}) {
  const router = useRouter()
  const days = buildCalendarDays(year, month, events)
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="flex flex-col w-full h-full border border-zinc-800 rounded-xl overflow-hidden">
      
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-zinc-900 border-b border-zinc-800">
        {DAY_HEADERS.map(day => (
          <div
            key={day}
            className="py-3 text-center text-xs font-bold text-zinc-400 
                       tracking-widest border-r border-zinc-800 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Week rows */}
      <div className="flex flex-col flex-1">
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid grid-cols-7 flex-1"
            style={{ minHeight: '120px' }}
          >
            {week.map((cell, di) => (
              <div
                key={di}
                onClick={() => router.push(`/events/new?date=${cell.date.toISOString().split('T')[0]}`)}
                className={[
                  'border-r border-b border-zinc-800 last:border-r-0 p-1.5',
                  'cursor-pointer transition-colors duration-150',
                  !cell.isCurrentMonth ? 'bg-zinc-900/60' : 'bg-transparent hover:bg-zinc-800/40',
                  cell.isToday ? 'ring-1 ring-inset ring-amber-400/50' : '',
                ].join(' ')}
              >
                {/* Date number */}
                <div className="flex items-start justify-start mb-1">
                  <span className={[
                    'text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full',
                    cell.isToday
                      ? 'bg-amber-400 text-black font-bold'
                      : cell.isCurrentMonth
                        ? 'text-white'
                        : 'text-zinc-600',
                  ].join(' ')}>
                    {cell.dayNumber}
                  </span>
                </div>

                {/* Event chips */}
                <div className="flex flex-col gap-0.5">
                  {cell.events.slice(0, 3).map(ev => (
                    <div
                      key={ev.id}
                      onClick={e => { e.stopPropagation(); router.push(`/events/${ev.id}`) }}
                      title={ev.name}
                      className={[
                        'text-[10px] font-medium px-1.5 py-0.5 rounded truncate',
                        'cursor-pointer hover:opacity-75 transition-opacity',
                        getEventColorClass(ev.status),
                      ].join(' ')}
                    >
                      {ev.name}
                    </div>
                  ))}
                  {cell.events.length > 3 && (
                    <div className="text-[10px] text-zinc-400 px-1.5 font-medium">
                      +{cell.events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
