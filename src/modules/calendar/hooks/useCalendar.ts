// @ts-nocheck
import { useEvents } from '@/modules/events/hooks/useEvents'
import { CalendarViewMode, CalendarFilters } from '../types'
import { useState, useMemo } from 'react'

export function useCalendar() {
  const { data: allEvents, isLoading } = useEvents()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month')
  const [filters, setFilters] = useState<CalendarFilters>({
    statuses: [],
    coordinators: [],
    venues: []
  })

  // Basic filtering
  const filteredEvents = useMemo(() => {
    if (!allEvents) return []
    return allEvents.filter(event => {
      if (filters.statuses.length && !filters.statuses.includes(event.status)) return false
      if (filters.venues.length && event.venue_name && !filters.venues.includes(event.venue_name)) return false
      return true
    })
  }, [allEvents, filters])

  // Simple next/prev month nav
  const nextPeriod = () => {
    const next = new Date(currentDate)
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1)
    if (viewMode === 'week') next.setDate(next.getDate() + 7)
    if (viewMode === 'day') next.setDate(next.getDate() + 1)
    setCurrentDate(next)
  }

  const prevPeriod = () => {
    const prev = new Date(currentDate)
    if (viewMode === 'month') prev.setMonth(prev.getMonth() - 1)
    if (viewMode === 'week') prev.setDate(prev.getDate() - 7)
    if (viewMode === 'day') prev.setDate(prev.getDate() - 1)
    setCurrentDate(prev)
  }

  const goToday = () => setCurrentDate(new Date())

  return {
    events: filteredEvents,
    isLoading,
    currentDate,
    viewMode,
    filters,
    setViewMode,
    setFilters,
    nextPeriod,
    prevPeriod,
    goToday
  }
}

