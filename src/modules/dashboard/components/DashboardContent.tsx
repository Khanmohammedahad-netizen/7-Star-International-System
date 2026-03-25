'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TodayEvents } from './TodayEvents'
import { UpcomingEvents } from './UpcomingEvents'
import { CriticalAlerts } from './CriticalAlerts'
import { RecentActivity } from './RecentActivity'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function DashboardContent() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-2 space-y-6">
        <motion.div variants={item}>
          <TodayEvents />
        </motion.div>
        <motion.div variants={item}>
          <UpcomingEvents />
        </motion.div>
      </div>
      <div className="space-y-6">
        <motion.div variants={item}>
          <CriticalAlerts />
        </motion.div>
        <motion.div variants={item}>
          <RecentActivity />
        </motion.div>
      </div>
    </motion.div>
  )
}
