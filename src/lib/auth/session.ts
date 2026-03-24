import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import type { SessionUser } from '@/types/auth'
import type { Role } from '@/config/roles.config'
import { isMockMode } from '@/lib/utils/env'

export async function getSession(): Promise<SessionUser | null> {
    if (isMockMode()) {
        return {
            id: 'mock-user-123',
            email: 'operator@7star.com',
            organizationId: 'mock-org-456',
            role: 'coordinator' as Role
        }
    }

    try {
        const supabase = await createSupabaseServerClient()
        if (!supabase || !supabase.auth) {
            console.error('❌ Supabase client initialization failed: Missing URL or Key at runtime.')
            return null
        }
        
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) return null

        // Fetch first active membership for the user
        const { data: membership, error: memError } = await supabase
            .from('memberships')
            .select('organization_id, role')
            .eq('user_id', user.id)
            .limit(1)
            .single()

        if (memError || !membership) return null

        return {
            id: user.id,
            email: user.email || '',
            organizationId: membership.organization_id,
            role: membership.role as Role,
        }
    } catch (err) {
        console.error('Session Error:', err)
        return null
    }
}

export async function requireSession(): Promise<SessionUser> {
    const session = await getSession()
    if (!session) {
        throw new Error('Unauthorized')
    }
    return session
}
