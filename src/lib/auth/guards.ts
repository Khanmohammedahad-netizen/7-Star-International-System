import { redirect } from 'next/navigation'
import { getSession } from './session'
import { hasMinimumRole, type Role } from '@/config/roles.config'
import { appConfig } from '@/config/app.config'

/**
 * Server-side role guard.
 * Call at the top of any Server Component or Route Handler.
 * Redirects to login if unauthenticated, or throws 403 if role insufficient.
 */
export async function requireRole(minimumRole: Role) {
    const session = await getSession()

    if (!session) {
        redirect(appConfig.auth.loginPath)
    }

    if (!hasMinimumRole(session.role, minimumRole)) {
        throw new Error(`Forbidden: requires ${minimumRole} role`)
    }

    return session
}
