import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import type { SessionUser } from '@/types/auth'
import type { Role } from '@/config/roles.config'

export async function getSession(): Promise<SessionUser | null> {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return null

    // Fetch first active membership for the user
    const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .single()

    if (!membership) return null

    return {
        id: user.id,
        email: user.email || '',
        organizationId: membership.organization_id,
        role: membership.role as Role,
    }
}

export async function requireSession(): Promise<SessionUser> {
    const session = await getSession()
    if (!session) {
        throw new Error('Unauthorized')
    }
    return session
}
