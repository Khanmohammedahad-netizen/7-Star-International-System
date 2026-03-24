import { useQuery } from '@tanstack/react-query'
import { TimelineItem } from '@/modules/events/types'

export function useTimeline(eventId: string) {
  return useQuery({
    queryKey: ['timeline', eventId],
    queryFn: async (): Promise<TimelineItem[]> => {
      const res = await fetch(`/api/events/${eventId}/timeline`)
      if (!res.ok) throw new Error('Failed to fetch timeline')
      const json = await res.json()
      // Sort by time initially
      return json.data.sort((a: TimelineItem, b: TimelineItem) => a.time.localeCompare(b.time))
    },
    enabled: !!eventId
  })
}
