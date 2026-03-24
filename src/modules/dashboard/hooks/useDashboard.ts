import { useQuery } from '@tanstack/react-query'
import { DashboardData } from '../types'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      const json = await res.json()
      return json.data
    }
  })
}
