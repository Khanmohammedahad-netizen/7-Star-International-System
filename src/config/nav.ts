import { LayoutDashboard, CalendarDays, Calendar, Plus, Users, ClipboardList, Mic, Store, Building2, CheckSquare, Banknote, Receipt, CreditCard, BarChart3, Settings } from "lucide-react"
export const navConfig = [
  { group: 'Overview', items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }] },
  { group: 'Events', items: [{ label: 'All Events', href: '/dashboard/events', icon: CalendarDays },{ label: 'Calendar', href: '/dashboard/events/calendar', icon: Calendar }] },
  { group: 'People', items: [{ label: 'Registrations', href: '/dashboard/registrations', icon: ClipboardList },{ label: 'Speakers', href: '/dashboard/speakers', icon: Mic }] },
  { group: 'Operations', items: [{ label: 'Vendors', href: '/dashboard/vendors', icon: Store },{ label: 'Venues', href: '/dashboard/venues', icon: Building2 },{ label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare }] },
  { group: 'Finance', items: [{ label: 'Budget', href: '/dashboard/finance/budget', icon: Banknote }] },
  { group: 'System', items: [{ label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },{ label: 'Settings', href: '/dashboard/settings', icon: Settings }] },
]
