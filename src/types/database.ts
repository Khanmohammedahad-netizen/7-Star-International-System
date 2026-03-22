export interface Organization {
    id: string
    name: string
    slug: string
    createdAt: string
    updatedAt: string
}

export interface UserProfile {
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
    createdAt: string
    updatedAt: string
}

export interface Membership {
    id: string
    userId: string
    organizationId: string
    role: string
    createdAt: string
}

export interface AuditLog {
    id: string
    organizationId: string
    userId: string
    action: string
    resource: string
    resourceId: string | null
    metadata: Record<string, unknown> | null
    createdAt: string
}
