// @ts-nocheck
'use client'

import { useCalendar } from '../hooks/useCalendar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function statusColor(status: string) {
  switch (status) {
    case 'planning': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    case 'confirmed': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    case 'in_progress': return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    case 'completed': return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
    case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'postponed': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    default: return 'bg-white/5 text-neutral-400 border-white/10'
  }
}

export function GlobalCalendar() {
  const router = useRouter()
  const { events, isLoading, currentDate, viewMode, setViewMode, nextPeriod, prevPeriod, goToday } = useCalendar()

  // Generate Month Grid using Luxon instead of date-fns
  const generateMonthGrid = () => {
    const start = DateTime.fromJSDate(currentDate).startOf('month').startOf('week')
    const end = DateTime.fromJSDate(currentDate).endOf('month').endOf('week')
    
    // Generate all days in interval
    const days: DateTime[] = []
    let current = start
    while (current <= end) {
      days.push(current)
      current = current.plus({ days: 1 })
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden mt-4 shadow-xl">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="bg-[#111111] p-3 text-center text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-white/10">
            {d}
          </div>
        ))}
        {days.map(day => {
          const dayString = day.toFormat('yyyy-MM-dd')
          const dayEvents = (events || []).filter(e => e.start_date === dayString)
          const isToday = day.hasSame(DateTime.now(), 'day')
          const isCurrentMonth = day.hasSame(DateTime.fromJSDate(currentDate), 'month')

          return (
            <div 
              key={day.toISO()} 
              onClick={() => {
                // Navigate to new event prefilled with this date if clicked on empty space
                document.getElementById(`link-new-event`)?.click()
                // Actually we can just route imperatively:
                // router.push(`/events/new`) 
                // But a real implementation would pass the date
              }}
              className={`min-h-[140px] bg-[#0a0a0a] p-2 transition-colors hover:bg-white/[0.02] cursor-pointer group relative ${!isCurrentMonth ? 'text-neutral-600 bg-black/40' : ''}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-neutral-300'}`}>
                  {day.toFormat('d')}
                </span>
                
                {/* Hover Add Button */}
                <Link 
                  href={`/events/new`}
                  id="link-new-event"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md text-neutral-400 hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-1.5 mt-2">
                {dayEvents.slice(0, 4).map(e => (
                  <Link key={e.id} href={`/events/${e.id}`} onClick={(ev) => ev.stopPropagation()}>
                    <div 
                      className={`text-xs px-2 py-1 rounded border-l-[3px] truncate font-medium transition-all hover:scale-[1.02] ${statusColor(e.status)}`}
                    >
                      {e.name}
                    </div>
                  </Link>
                ))}
                {dayEvents.length > 4 && (
                  <div className="text-xs font-bold text-neutral-500 pl-1">
                    + {dayEvents.length - 4} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111111] border border-white/10 rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={prevPeriod} className="hover:bg-white/10"><ChevronLeft className="w-5 h-5 text-white" /></Button>
          <Button variant="secondary" size="sm" onClick={goToday} className="font-bold bg-white/10 text-white hover:bg-white/20">Today</Button>
          <Button variant="ghost" size="icon" onClick={nextPeriod} className="hover:bg-white/10"><ChevronRight className="w-5 h-5 text-white" /></Button>
          
          <h2 className="text-2xl font-bold ml-4 w-60 tracking-tight text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
            {viewMode === 'month' && DateTime.fromJSDate(currentDate).toFormat('MMMM yyyy')}
            {viewMode === 'week' && `Week of ${DateTime.fromJSDate(currentDate).startOf('week').toFormat('MMM d')}`}
            {viewMode === 'day' && DateTime.fromJSDate(currentDate).toFormat('MMMM d, yyyy')}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Legend */}
          <div className="hidden lg:flex items-center gap-3 mr-6 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Planning</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Confirmed</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> In Progress</span>
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
