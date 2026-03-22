import type { Role } from './roles.config'

export interface NavItem {
    label: string
    href: string
    icon: string
    requiredRole?: Role
}

export const sidebarNavigation: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: 'home' },
    { label: 'Members', href: '/dashboard/members', icon: 'users', requiredRole: 'admin' },
    { label: 'Settings', href: '/dashboard/settings', icon: 'settings', requiredRole: 'admin' },
]
