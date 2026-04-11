'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/db/supabase-browser'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MonthGrid from '@/components/calendar/MonthGrid'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const STATUS_LEGEND = [
  { label: 'Planning',    className: 'bg-blue-600' },
  { label: 'Confirmed',   className: 'bg-emerald-600' },
  { label: 'In Progress', className: 'bg-amber-500' },
  { label: 'Completed',   className: 'bg-zinc-500' },
  { label: 'Cancelled',   className: 'bg-red-600' },
]

export default function CalendarPage() {
  const supabase = createSupabaseBrowserClient()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      try {
        const firstDay = new Date(year, month, 1).toISOString()
        const lastDay = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
        if (!supabase.from) throw new Error('Supabase client not initialized')
        
        const { data, error } = await supabase
          .from('events')
          .select('id, title, status, event_date, end_date')
          .lte('event_date', lastDay)
          .or(`event_date.gte.${firstDay},end_date.gte.${firstDay}`)
          
        if (error) throw error
        
        const mappedData = (data || []).map((e: any) => ({
          ...e,
          name: e.title,
          start_date: e.event_date
        }))
        
        setEvents(mappedData)
      } catch (err) {
        console.error('Failed to fetch events:', err)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [year, month, supabase])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function goToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] px-6 py-4 gap-4">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Global Calendar</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Multi-event visibility and scheduling.</p>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-zinc-700 text-zinc-300 
                       hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border 
                       border-zinc-700 text-zinc-300 hover:bg-zinc-800 
                       hover:text-white transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-zinc-700 text-zinc-300 
                       hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <h2 className="text-lg font-bold text-white ml-2">
            {MONTH_NAMES[month]} {year}
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap">
          {STATUS_LEGEND.map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${s.className}`} />
              <span className="text-xs text-zinc-400 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid — takes remaining height */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="w-full h-full rounded-xl border border-zinc-800 
                          animate-pulse bg-zinc-900/50" />
        ) : (
          <MonthGrid year={year} month={month} events={events} />
        )}
      </div>

    </div>
  )
}
