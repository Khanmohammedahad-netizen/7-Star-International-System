import { Event } from '@/modules/events/types'

export type CalendarViewMode = 'month' | 'week' | 'day'

export interface CalendarFilters {
  statuses: string[]
  coordinators: string[]
  venues: string[]
}

export interface DayCell {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: Event[]
}
