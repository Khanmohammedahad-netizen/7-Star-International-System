// @ts-nocheck
'use client'

import { useCalendar } from '../hooks/useCalendar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function getEventColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'planning':     return 'bg-blue-500/80 text-white border-blue-500'
    case 'confirmed':    return 'bg-emerald-500/80 text-white border-emerald-500'
    case 'in progress':
    case 'in_progress':  return 'bg-amber-500/80 text-black border-amber-500'
    case 'completed':    return 'bg-zinc-500/80 text-white border-zinc-500'
    case 'cancelled':    return 'bg-red-500/80 text-white line-through border-red-500'
    case 'postponed':    return 'bg-purple-500/80 text-white border-purple-500'
    default:             return 'bg-zinc-600/80 text-white border-zinc-500'
  }
}

export function GlobalCalendar() {
  const router = useRouter()
  const { events, isLoading, currentDate, viewMode, setViewMode, nextPeriod, prevPeriod, goToday } = useCalendar()

  // Generate Month Grid perfectly mapping to user's specified 7-col split geometry
  const generateMonthGrid = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    // Get Monday-based start (0=Mon, 6=Sun)
    let startDow = firstDayOfMonth.getDay() // 0=Sun,1=Mon...6=Sat
    startDow = startDow === 0 ? 6 : startDow - 1 // convert to Mon=0
    
    const days = []
    
    // Fill leading days from previous month
    for (let i = startDow - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, dayNumber: date.getDate(), isCurrentMonth: false, isToday: false, events: [] })
    }
    
    // Fill current month days
    const today = new Date()
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const date = new Date(year, month, d)
      const isToday = date.toDateString() === today.toDateString()
      const dayEvents = (events || []).filter((e: any) => {
        const start = new Date(e.start_date)
        const end = new Date(e.end_date || e.start_date)
        // Reset hours for pure date tracking
        start.setHours(0,0,0,0)
        end.setHours(0,0,0,0)
        return date >= start && date <= end
      })
      days.push({ date, dayNumber: d, isCurrentMonth: true, isToday, events: dayEvents })
    }
    
    // Fill trailing days to complete the grid (must be multiple of 7)
    const remaining = 7 - (days.length % 7)
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const date = new Date(year, month + 1, d)
        days.push({ date, dayNumber: d, isCurrentMonth: false, isToday: false, events: [] })
      }
    }

    return (
      <div className="flex flex-col h-full bg-[#0a0a0a] border border-zinc-800 rounded-xl overflow-hidden mt-4 shadow-xl">
        
        {/* Day headers row */}
        <div className="grid grid-cols-7 border-b border-zinc-800 bg-[#111111]">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
            <div 
              key={day} 
              className="py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold text-zinc-400 tracking-widest border-r border-zinc-800 last:border-r-0"
            >
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1">
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => {
                document.getElementById(`link-new-event`)?.click()
              }}
              className={`
                min-h-[80px] md:min-h-[120px] p-1.5 border-r border-b border-zinc-800 
                last:border-r-0 relative group
                ${!day.isCurrentMonth ? 'bg-zinc-900/50' : 'bg-transparent'}
                ${day.isToday ? 'ring-1 ring-inset ring-[#C9A84C]/60 z-10' : ''}
                hover:bg-zinc-800/40 cursor-pointer transition-colors
              `}
            >
              <div className="flex justify-between items-start">
                  <span className={`
                    text-xs md:text-sm font-medium inline-flex items-center justify-center 
                    w-6 h-6 md:w-7 md:h-7 rounded-full
                    ${day.isToday 
                      ? 'bg-[#C9A84C] text-black font-bold shadow-[0_0_15px_rgba(201,168,76,0.3)]' 
                      : day.isCurrentMonth 
                        ? 'text-white' 
                        : 'text-zinc-600'
                    }
                  `}>
                    {day.dayNumber}
                  </span>
                  
                  {/* Hover Add Button */}
                  <Link 
                    href={`/events/new`}
                    id="link-new-event"
                    className="hidden md:inline-flex opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Link>
              </div>

              {/* Event chips */}
              <div className="mt-1 space-y-0.5">
                {day.events.slice(0, 2).map((event: any) => (
                  <Link key={event.id} href={`/events/${event.id}`} onClick={(e) => e.stopPropagation()} className="block">
                    <div
                      className={`
                        text-[9px] md:text-xs px-1 md:px-1.5 py-0.5 md:py-1 rounded truncate cursor-pointer
                        hover:opacity-80 transition-opacity font-medium border-l-[2px] md:border-l-[3px]
                        ${getEventColor(event.status)}
                      `}
                      title={event.name}
                    >
                      {event.name}
                    </div>
                  </Link>
                ))}
                {day.events.length > 2 && (
                  <div className="text-[9px] md:text-xs text-zinc-400 px-1 pt-0.5 font-bold hover:text-white cursor-pointer" title="More events">
                    +{day.events.length - 2} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111111] border border-white/10 rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-1 md:gap-3 flex-1 overflow-hidden">
          <Button variant="ghost" size="icon" onClick={prevPeriod} className="hover:bg-white/10 shrink-0"><ChevronLeft className="w-5 h-5 text-white" /></Button>
          <Button variant="secondary" size="sm" onClick={goToday} className="font-bold bg-white/10 text-white hover:bg-white/20 hidden md:inline-flex shrink-0">Today</Button>
          <Button variant="ghost" size="icon" onClick={nextPeriod} className="hover:bg-white/10 shrink-0"><ChevronRight className="w-5 h-5 text-white" /></Button>
          
          <h2 className="text-lg md:text-2xl font-bold ml-1 md:ml-4 tracking-tight text-white truncate" style={{ fontFamily: 'var(--font-cormorant)' }}>
            {viewMode === 'month' && DateTime.fromJSDate(currentDate).toFormat('MMMM yyyy')}
            {viewMode === 'week' && `Week of ${DateTime.fromJSDate(currentDate).startOf('week').toFormat('MMM d')}`}
            {viewMode === 'day' && DateTime.fromJSDate(currentDate).toFormat('MMMM d, yyyy')}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Legend */}
          <div className="hidden lg:flex items-center gap-4 mr-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">STATUS:</span>
            {[
              { label: 'Planning',    color: 'bg-blue-500' },
              { label: 'Confirmed',   color: 'bg-emerald-500' },
              { label: 'In Progress', color: 'bg-amber-500' },
              { label: 'Completed',   color: 'bg-zinc-500' },
              { label: 'Cancelled',   color: 'bg-red-500' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    viewMode === 'month' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-300'
                }`}
            >
                Month
            </button>
            <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    viewMode === 'week' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-300'
                }`}
            >
                Week
            </button>
            <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    viewMode === 'day' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-300'
                }`}
            >
                Day
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="flex-1 mt-4 grid place-items-center rounded-xl border border-white/10 text-neutral-500 bg-[#111111]/50">
          <div className="flex flex-col items-center gap-4">
            <CalendarIcon className="w-8 h-8 animate-pulse text-white/20" />
            <p className="font-medium tracking-wide">Syncing Command Center...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {viewMode === 'month' && generateMonthGrid()}
          {viewMode !== 'month' && (
            <div className="flex flex-col items-center justify-center h-[600px] border border-white/10 rounded-xl mt-4 bg-[#111111]">
              <CalendarIcon className="w-16 h-16 text-white/10 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">{viewMode === 'week' ? 'Weekly Outlook' : 'Daily Schedule'}</h3>
              <p className="text-neutral-500 max-w-md text-center text-sm">
                Advanced time-blocking and resource scheduling for the selected {viewMode} will be available in the upcoming Dnd-kit integration. For now, use the Month view for high-level command.
              </p>
              <Button variant="outline" className="mt-8 border-white/20" onClick={() => setViewMode('month')}>
                Switch to Month View
              </Button>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
