import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const session = await getSession()
  const supabase = await createSupabaseServerClient()
  
  let dbCheck = 'UNKNOWN'
  let tables: any[] = []
  
  if (supabase) {
    try {
      // Direct query check
      const { data: orgs, error: orgError } = await supabase.from('organizations').select('id').limit(1)
      dbCheck = orgError ? `ERROR: ${orgError.message} (Code: ${orgError.code})` : 'CONNECTED'
      
      // Probe structure via sampling
      const { data: clientRow } = await supabase.from('clients').select('*').limit(1)
      const { data: vendorRow } = await supabase.from('vendors').select('*').limit(1)
      const { data: eventRow } = await supabase.from('events').select('*').limit(1)
      const { data: memRow } = await supabase.from('memberships').select('*').limit(1)
      
      tables.push({ 
        name: 'clients', 
        columns: clientRow?.[0] ? Object.keys(clientRow[0]) : 'EMPTY'
      })
      tables.push({ 
        name: 'vendors', 
        columns: vendorRow?.[0] ? Object.keys(vendorRow[0]) : 'EMPTY'
      })
      tables.push({ 
        name: 'events', 
        columns: eventRow?.[0] ? Object.keys(eventRow[0]) : 'EMPTY'
      })
      tables.push({ 
        name: 'memberships', 
        columns: memRow?.[0] ? Object.keys(memRow[0]) : 'EMPTY'
      })
    } catch (e: any) {
      dbCheck = `EXCEPTION: ${e.message}`
    }
  }

  return NextResponse.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    session: session ? { role: session.role, org_id: session.organizationId, email: session.email } : 'NULL',
    db: dbCheck,
    tables,
    env: {
        node_env: process.env.NODE_ENV,
        use_mock: process.env.NEXT_PUBLIC_USE_MOCK
    }
  })
}
