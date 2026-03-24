export interface DashboardStats {
  activeEvents: number
  revenueThisMonth: number
  unconfirmedVendors: number
}

export interface CriticalAlert {
  id: string
  type: 'vendor_unconfirmed' | 'invoice_overdue' | 'event_planning_urgent' | 'task_overdue'
  message: string
  eventId: string | null
  severity: 'high' | 'critical'
}

export interface ActivityLog {
  id: string
  userName: string
  action: string
  eventName: string | null
  timestamp: string
}

export interface DashboardData {
  stats: DashboardStats
  criticalAlerts: CriticalAlert[]
  recentActivity: ActivityLog[]
}
