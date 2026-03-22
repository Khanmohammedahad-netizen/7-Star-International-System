"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, LayoutDashboard, Settings, LogOut, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export interface NavItem {
  title: string
  href: string
  icon?: React.ReactNode
  badge?: string | number
  children?: NavItem[]
}

interface SidebarNavProps {
  items: NavItem[]
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export const SidebarNav = ({ items, isCollapsed, onToggleCollapse }: SidebarNavProps) => {
  const pathname = usePathname()

  return (
    <div className={cn(
      "flex flex-col h-full bg-[var(--bg-surface)] border-r border-[var(--border-default)] transition-all duration-300",
      isCollapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]"
    )}>
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center text-[var(--bg-page)] font-bold">M</div>
            <span className="font-bold tracking-tight text-[var(--text-primary)]">MAK OS</span>
          </motion.div>
        )}
        <button 
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <SidebarItem 
            key={item.href} 
            item={item} 
            isCollapsed={isCollapsed} 
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border-default)]">
        <SidebarItem 
          item={{ title: 'Settings', href: '/settings', icon: <Settings size={20} /> }} 
          isCollapsed={isCollapsed}
          isActive={pathname === '/settings'}
        />
        <button className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-md text-sm font-medium text-[var(--status-error)] hover:bg-[var(--status-error-bg)] transition-colors">
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

const SidebarItem = ({ 
  item, 
  isCollapsed, 
  isActive 
}: { 
  item: NavItem, 
  isCollapsed?: boolean, 
  isActive?: boolean 
}) => {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group relative",
        isActive 
          ? "bg-[var(--brand-primary)] text-[var(--bg-page)] shadow-[var(--shadow-sm)]" 
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]",
        isCollapsed && "justify-center px-0"
      )}
    >
      <div className={cn("flex-shrink-0", isActive ? "text-inherit" : "text-[var(--text-muted)] group-hover:text-[var(--brand-primary)]")}>
        {item.icon}
      </div>
      
      {!isCollapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 truncate"
        >
          {item.title}
        </motion.span>
      )}

      {!isCollapsed && item.badge && (
        <span className={cn(
          "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
          isActive ? "bg-[var(--bg-page)] text-[var(--brand-primary)]" : "bg-[var(--bg-muted)] text-[var(--text-muted)]"
        )}>
          {item.badge}
        </span>
      )}

      {isCollapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-[var(--bg-inverse)] text-[var(--text-inverse)] text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
          {item.title}
        </div>
      )}
    </Link>
  )
}
