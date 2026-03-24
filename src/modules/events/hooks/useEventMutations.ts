// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Event } from '../types'

export function useEventMutations() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (newEvent: Partial<Event>) => {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      })
      if (!res.ok) throw new Error('Failed to create event')
      const json = await res.json()
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Event> }) => {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error('Failed to update event')
      const json = await res.json()
      return json.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] })
    }
  })

  return { createEvent: createMutation.mutateAsync, updateEvent: updateMutation.mutateAsync }
}

