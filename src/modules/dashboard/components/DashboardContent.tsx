'use client'

import React from 'react'
import { TodayEvents } from './TodayEvents'
import { UpcomingEvents } from './UpcomingEvents'
import { CriticalAlerts } from './CriticalAlerts'
import { RecentActivity } from './RecentActivity'

export function DashboardContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <TodayEvents />
        <UpcomingEvents />
      </div>
      <div className="space-y-6">
        <CriticalAlerts />
        <RecentActivity />
      </div>
    </div>
  )
}
