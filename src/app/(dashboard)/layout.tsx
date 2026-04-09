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
  Search
} from 'lucide-react'

const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['super_admin', 'admin', 'member', 'viewer', 'coordinator'] },
  { name: 'Events', icon: Calendar, href: '/events', roles: ['super_admin', 'admin', 'member', 'coordinator'] },
  { name: 'Clients', icon: Users, href: '/clients', roles: ['super_admin', 'admin', 'member', 'coordinator'] },
  { name: 'Vendors', icon: Users, href: '/vendors', roles: ['super_admin', 'admin', 'coordinator'] },
  { name: 'Finance', icon: CreditCard, href: '/finance', roles: ['super_admin', 'admin', 'coordinator'] },
  { name: 'Calendar', icon: Calendar, href: '/calendar', roles: ['super_admin', 'admin', 'coordinator'] },
]

import { createSupabaseBrowserClient } from '@/lib/db/supabase-browser'
import { useRouter } from 'next/navigation'
import { NotificationDropdown } from '@/components/layout/NotificationDropdown'
import { useQuery } from '@tanstack/react-query'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
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

  return (
    <div className="flex h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} 
        transition-all duration-300 border-r border-white/5 bg-[#0a0a09] flex flex-col
      `}>
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tighter bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
            7STAR OS
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {isSessionLoading ? (
            <div className="space-y-2 px-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-9 w-full bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            filteredNavItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${pathname === item.href 
                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))
          )}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-white transition-colors w-full group"
          >
            <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-neutral-400 hover:text-white p-2"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="max-w-md w-full relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                placeholder="Quick search commands..." 
                className="w-full bg-white/5 border border-white/10 rounded-full px-10 py-1.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-xl transition-all ${isNotificationsOpen ? 'bg-white/10 text-white shadow-lg' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-[#050505] flex items-center justify-center text-[10px] font-bold text-white px-1">3</span>
              </button>
              <NotificationDropdown 
                isOpen={isNotificationsOpen} 
                onClose={() => setIsNotificationsOpen(false)} 
              />
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-600 border border-white/20 shadow-lg cursor-pointer hover:scale-105 transition-transform" />
          </div>
        </header>

        {/* Page Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#0a0a0a] to-[#050505] relative">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
