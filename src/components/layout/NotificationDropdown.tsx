'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Info, AlertTriangle, X, Radio, Loader2 } from 'lucide-react'

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
  // We use CSS display breakpoints to render differently: Bottom Sheet on Mobile, Dropdown on Desktop
  const [permission, setPermission] = useState<string>('granted')
  const [isSubscribing, setIsSubscribing] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    
    setIsSubscribing(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        
        if (!publicVapidKey) throw new Error('Missing VAPID key');

        // Convert key
        const padding = '='.repeat((4 - publicVapidKey.length % 4) % 4);
        const base64 = (publicVapidKey + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: outputArray
        });

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription })
        });
      }
    } catch (err) {
      console.error('Push setup failed:', err);
    } finally {
      setIsSubscribing(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100] md:z-40 bg-black/60 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            // On md (desktop): absolute positioning, floating standard dropdown
            // On mobile: fixed, bottom 0, full width, border-radius top
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl md:absolute md:bottom-auto md:left-auto md:right-0 md:top-12 md:max-h-auto md:w-80 bg-[#0f0f0f] border border-white/10 md:rounded-2xl shadow-2xl z-[101] md:z-50 overflow-hidden backdrop-blur-xl flex flex-col"
          >
            {/* Mobile Sheet Handle */}
            <div className="md:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 mb-2" />

            <div className="p-4 border-b border-white/5 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg md:text-sm text-white">Notifications</h3>
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold bg-white/5 px-2 py-1 rounded-full">3 New</span>
                <button onClick={onClose} className="md:hidden text-neutral-400 hover:text-white bg-white/5 p-1 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {permission === 'default' && (
              <div className="mx-4 mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Enable Push</h4>
                    <p className="text-xs text-blue-200">Get instant updates.</p>
                  </div>
                </div>
                <button 
                  onClick={subscribeToPush}
                  disabled={isSubscribing}
                  className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubscribing && <Loader2 className="w-3 h-3 animate-spin"/>}
                  Allow
                </button>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[300px] md:max-h-[400px]">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div 
                  key={n.id} 
                  className="p-4 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer group active:bg-white/[0.04]"
                >
                  <div className="flex gap-3">
                    <div className={`mt-1 p-1.5 rounded-lg bg-white/5 ${n.color} shrink-0`}>
                      <n.icon className="w-5 h-5 md:w-4 md:h-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base md:text-sm font-medium text-white group-hover:text-primary transition-colors">{n.title}</p>
                      <p className="text-sm md:text-xs text-neutral-400 line-clamp-2">{n.description}</p>
                      <p className="text-xs md:text-[10px] text-neutral-500 font-medium">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full p-4 md:p-3 text-sm md:text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-all font-medium border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
              View all activity
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
