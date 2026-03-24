// @ts-nocheck
'use client'

import { useCalendar } from '../hooks/useCalendar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { DateTime } from 'luxon'
import Link from 'next/link'

export function GlobalCalendar() {
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
      <div className="grid grid-cols-7 gap-px bg-border/50 border border-border/50 rounded-xl overflow-hidden mt-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="bg-muted/50 p-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {d}
          </div>
        ))}
        {days.map(day => {
          const dayEvents = events.filter(e => e.start_date === day.toFormat('yyyy-MM-dd'))
          const isToday = day.hasSame(DateTime.now(), 'day')
          const isCurrentMonth = day.hasSame(DateTime.fromJSDate(currentDate), 'month')

          return (
            <div key={day.toISO()} className={`min-h-[120px] bg-background p-2 transition-colors hover:bg-muted/10 ${!isCurrentMonth && 'text-muted-foreground bg-muted/5'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                  {day.toFormat('d')}
                </span>
                {dayEvents.length > 0 && <span className="text-xs text-muted-foreground">{dayEvents.length} events</span>}
              </div>
              <div className="space-y-1 mt-2">
                {dayEvents.slice(0, 3).map(e => (
                  <Link key={e.id} href={`/events/${e.id}`}>
                    <div 
                      className="text-xs truncate px-1.5 py-1 rounded shadow-sm hover:opacity-80 transition-opacity border-l-2 text-primary-foreground" 
                      style={{ backgroundColor: e.color + 'E6', borderLeftColor: e.color }}
                    >
                      {e.name}
                    </div>
                  </Link>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground pl-1">+ {dayEvents.length - 3} more</div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-lg p-2 px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={prevPeriod}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="secondary" size="sm" onClick={goToday}>Today</Button>
          <Button variant="secondary" size="icon" onClick={nextPeriod}><ChevronRight className="w-4 h-4" /></Button>
          <h2 className="text-xl font-semibold ml-4 w-48 font-mono">
            {viewMode === 'month' && DateTime.fromJSDate(currentDate).toFormat('MMMM yyyy')}
            {viewMode === 'week' && `Week of ${DateTime.fromJSDate(currentDate).startOf('week').toFormat('MMM d')}`}
            {viewMode === 'day' && DateTime.fromJSDate(currentDate).toFormat('MMMM d, yyyy')}
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md">
          <Button variant={viewMode === 'month' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('month')}>Month</Button>
          <Button variant={viewMode === 'week' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('week')}>Week</Button>
          <Button variant={viewMode === 'day' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('day')}>Day</Button>
        </div>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="flex-1 mt-4 grid place-items-center rounded-xl border border-dashed text-muted-foreground">
          Loading calendar...
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {viewMode === 'month' && generateMonthGrid()}
          {viewMode !== 'month' && (
            <div className="flex flex-col items-center justify-center p-24 text-center border rounded-xl mt-4 border-dashed bg-muted/20">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">{viewMode === 'week' ? 'Week' : 'Day'} View Placeholder</h3>
              <p className="text-muted-foreground max-w-sm mt-2">Dnd-kit based time-blocking scheduler will be rendered here for granular timeslot management.</p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

