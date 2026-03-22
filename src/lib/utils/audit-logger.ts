import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

interface AuditLogEntry {
    action: string
    resource: string
    resourceId?: string
    metadata?: Record<string, any>
}

export async function logAuditAction(entry: AuditLogEntry) {
    const session = await getSession()
    const supabase = await createSupabaseServerClient()

    const { error } = await supabase.from('audit_logs').insert({
        organization_id: session?.organizationId || null,
        user_id: session?.id || null,
        action: entry.action,
        resource: entry.resource,
        resource_id: entry.resourceId || null,
        metadata: entry.metadata || null,
    })

    if (error) {
        console.error('Audit Log Error:', error)
    }
}
