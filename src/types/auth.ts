import type { Role } from '@/config/roles.config'

export interface AuthUser {
    id: string
    email: string
}

export interface SessionUser extends AuthUser {
    organizationId: string
    role: Role
}

export interface Membership {
    id: string
    userId: string
    organizationId: string
    role: Role
    createdAt: string
}
