'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CreditCard, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Package
} from 'lucide-react'

const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['super_admin', 'admin', 'member', 'viewer', 'coordinator'] },
  { name: 'Events', icon: Calendar, href: '/events', roles: ['super_admin', 'admin', 'member', 'coordinator'] },
  { name: 'Clients', icon: Users, href: '/clients', roles: ['super_admin', 'admin', 'member', 'coordinator'] },
  { name: 'Vendors', icon: Package, href: '/vendors', roles: ['super_admin', 'admin', 'coordinator'] },
  { name: 'Finance', icon: CreditCard, href: '/finance', roles: ['super_admin', 'admin', 'coordinator'] },
  { name: 'Calendar', icon: Calendar, href: '/calendar', roles: ['super_admin', 'admin', 'coordinator'] },
]

// Mobile Bottom Nav Tabs (Main 5 items excluding Logout, Vendors etc if over 5, but we can fit 5)
// Design calls for: Dashboard, Events, Clients, Finance, Calendar
const MOBILE_TABS = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Events', icon: Calendar, href: '/events' },
  { name: 'Clients', icon: Users, href: '/clients' },
  { name: 'Finance', icon: CreditCard, href: '/finance' },
  { name: 'Calendar', icon: Calendar, href: '/calendar' },
]

import { createSupabaseBrowserClient } from '@/lib/db/supabase-browser'
import { useRouter } from 'next/navigation'
import { NotificationDropdown } from '@/components/layout/NotificationDropdown'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  // Layout logic:
  // Desktop: Fixed sidebar (180px - expanded/collapsed)
  // Tablet: Collapsed sidebar (60px)
  // Mobile: Bottom tab bar (hidden sidebar entirely), Top header with hamburger
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true) // For desktop
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false)
  
  const supabase = createSupabaseBrowserClient()

  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/session')
      if (!res.ok) return null
      const json = await res.json()
      return json.data
    }
  })

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/auth/login')
    }
  }

  const filteredNavItems = NAV_ITEMS.filter(item => 
    !session || item.roles.includes(session.role)
  )

  const activeTabColor = '#C9A84C'

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      
      {/* ─── DESKTOP/TABLET SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className={`
        hidden md:flex flex-col border-r border-white/5 bg-[#0a0a09] transition-all duration-300 z-30
        ${isSidebarExpanded ? 'w-[180px] lg:w-64' : 'w-16 items-center'}
      `}>
        <div className={`p-4 ${isSidebarExpanded ? 'px-6' : 'px-2'} flex items-center h-16 shrink-0`}>
          {isSidebarExpanded ? (
            <h2 className="text-xl font-bold tracking-tighter bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent truncate cursor-pointer" onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}>
              7STAR OS
            </h2>
          ) : (
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-lg cursor-pointer mx-auto" onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}>
              7
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 space-y-1 mt-4 overflow-y-auto hide-scrollbar">
          {isSessionLoading ? (
            <div className="space-y-2 px-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 w-full bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            filteredNavItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                  ${isSidebarExpanded ? 'px-3' : 'justify-center'}
                  ${pathname === item.href 
                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'}
                `}
                title={!isSidebarExpanded ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {isSidebarExpanded && <span className="truncate">{item.name}</span>}
              </Link>
            ))
          )}
        </nav>

        <div className="p-3 border-t border-white/5 shrink-0">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 py-2.5 text-neutral-400 hover:text-white transition-colors w-full group rounded-lg hover:bg-white/5
              ${isSidebarExpanded ? 'px-3' : 'justify-center'}
            `}
            title={!isSidebarExpanded ? 'Log out' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
            {isSidebarExpanded && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER (HAMBURGER) ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-64 bg-[#0a0a09] border-r border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-4 flex items-center justify-between border-b border-white/5 h-14">
                <h2 className="text-lg font-bold tracking-tighter text-white">7STAR OS</h2>
                <button onClick={() => setIsMobileDrawerOpen(false)} className="p-2 text-neutral-400 hover:text-white bg-white/5 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-2 mb-4 block">Navigation</span>
                {filteredNavItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={`
                      flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all
                      ${pathname === item.href 
                        ? 'bg-[#C9A84C]/10 text-[#C9A84C]' 
                        : 'text-neutral-300 hover:bg-white/5 active:bg-white/10'}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="p-4 py-6 border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
                 <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 px-4 py-3.5 w-full text-neutral-400 hover:text-white rounded-xl active:bg-white/5"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-base font-semibold">Log out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT WRAPPER ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* ─── DESKTOP + MOBILE HEADER ────────────────────────────────────────────── */}
        <header className="h-14 md:h-16 shrink-0 border-b border-white/5 bg-[#0f0f0f] md:bg-black/40 backdrop-blur-xl flex items-center justify-between px-3 md:px-6 z-20">
          
          <div className="flex items-center gap-3 flex-1 h-full">
            {/* Mobile hamburger icon */}
            <button 
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-2 text-neutral-300 hover:text-white active:scale-95 transition-transform"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="md:hidden text-base font-bold text-white tracking-tight ml-2">7STAR OS</h1>

            {/* Desktop Quick Search */}
            <div className="max-w-md w-full relative hidden md:block ml-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                placeholder="Quick search commands..." 
                className="w-full bg-white/5 border border-white/10 rounded-full px-10 py-1.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-full transition-all active:scale-95 ${isNotificationsOpen ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white bg-white/5'}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute max-md:top-1 max-md:right-1 -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 rounded-full border-2 border-[#0f0f0f] flex items-center justify-center text-[9px] font-bold text-white px-1">3</span>
              </button>
            </div>
            {/* Desktop Avatar (Hidden on Mobile) */}
            <div className="hidden md:block w-8 h-8 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-600 border border-white/20 shadow-lg cursor-pointer hover:scale-105 transition-transform" />
          </div>
        </header>

        <NotificationDropdown 
            isOpen={isNotificationsOpen} 
            onClose={() => setIsNotificationsOpen(false)} 
        />

        {/* ─── SCROLLABLE PAGE CONTENT ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#0a0a0a] to-[#050505] relative z-10 w-full md:pb-0 pb-[80px]">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-50 hidden md:block">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="relative z-10 h-full">
            {children}
          </div>
        </div>
      </main>

      {/* ─── MOBILE BOTTOM TAB BAR ──────────────────────────────────────────────────────── */}
      {/* 64px height + safe area inset padding via flex-1 / styled classes */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0f0f0f]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pt-1 h-[68px]"
      >
        {MOBILE_TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={`
                flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform
                ${isActive ? 'text-[#C9A84C]' : 'text-neutral-500 hover:text-neutral-300'}
              `}
            >
              <div className={`relative flex items-center justify-center p-1 rounded-full ${isActive ? 'bg-[#C9A84C]/10' : ''}`}>
                <tab.icon className={`w-6 h-6 stroke-[1.5px] ${isActive ? 'fill-[#C9A84C]/20 stroke-2' : ''}`} />
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>
                {tab.name}
              </span>
            </Link>
          )
        })}
      </div>

    </div>
  )
}
