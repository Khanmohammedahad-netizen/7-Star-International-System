'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Info, AlertTriangle } from 'lucide-react'

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New event created',
    description: 'Annual Gala 2024 has been initialized.',
    time: '2 mins ago',
    type: 'success',
    icon: Check,
    color: 'text-emerald-500'
  },
  {
    id: 2,
    title: 'Vendor assigned',
    description: 'Royal Catering added to Corporate Retreat.',
    time: '45 mins ago',
    type: 'info',
    icon: Info,
    color: 'text-blue-500'
  },
  {
    id: 3,
    title: 'Budget Alert',
    description: 'Conference expenses exceeding 90% of budget.',
    time: '2 hours ago',
    type: 'warning',
    icon: AlertTriangle,
    color: 'text-amber-500'
  }
]

export function NotificationDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-12 w-80 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-sm">Notifications</h3>
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">3 New</span>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div 
                  key={n.id} 
                  className="p-4 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <div className="flex gap-3">
                    <div className={`mt-1 p-1.5 rounded-lg bg-white/5 ${n.color}`}>
                      <n.icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{n.title}</p>
                      <p className="text-xs text-neutral-400 line-clamp-2">{n.description}</p>
                      <p className="text-[10px] text-neutral-500 font-medium">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full p-3 text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-all font-medium border-t border-white/5">
              View all activity
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
