import { useQuery } from '@tanstack/react-query'
import { Event } from '../types'

interface UseEventsParams {
  today?: boolean
  limit?: number
}

export function useEvents(params?: UseEventsParams) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async (): Promise<Event[]> => {
      const qs = new URLSearchParams()
      if (params?.today) qs.set('today', 'true')
      if (params?.limit) qs.set('limit', params.limit.toString())
      
      const res = await fetch(`/api/events?${qs.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch events')
      const json = await res.json()
      return json.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,    // 30 minutes
  })
}
