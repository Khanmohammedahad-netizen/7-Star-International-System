import { useQuery } from '@tanstack/react-query'
import { Event } from '../types'

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async (): Promise<Event> => {
      const res = await fetch(`/api/events/${id}`)
      if (!res.ok) throw new Error('Failed to fetch event')
      const json = await res.json()
      return json.data
    },
    enabled: !!id
  })
}
