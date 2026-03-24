import {
  LayoutDashboard, CalendarDays, FolderKanban,
  Store, Receipt, BarChart3, Settings
} from 'lucide-react'

export const eventCommandNav = [
  {
    group: 'Operations',
    items: [
      { label: 'Command',  href: '/dashboard',  icon: LayoutDashboard },
      { label: 'Calendar', href: '/calendar',   icon: CalendarDays },
      { label: 'Events',   href: '/events',     icon: FolderKanban },
    ]
  },
  {
    group: 'Resources',
    items: [
      { label: 'Vendors',  href: '/vendors',    icon: Store },
      { label: 'Finance',  href: '/finance',    icon: Receipt },
    ]
  },
  {
    group: 'System',
    items: [
      { label: 'Reports',  href: '/reports',    icon: BarChart3 },
      { label: 'Settings', href: '/settings',   icon: Settings },
    ]
  },
]
