export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MEMBER: 'member',
    VIEWER: 'viewer',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_HIERARCHY: Record<Role, number> = {
    [ROLES.SUPER_ADMIN]: 100,
    [ROLES.ADMIN]: 75,
    [ROLES.MEMBER]: 50,
    [ROLES.VIEWER]: 25,
}

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}
