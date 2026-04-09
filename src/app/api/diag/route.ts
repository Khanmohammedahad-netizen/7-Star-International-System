import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  const supabase = await createSupabaseServerClient()
  
  let dbCheck = 'UNKNOWN'
  let tables: any[] = []
  
  if (supabase) {
    try {
      const { data, error } = await supabase.from('organizations').select('count', { count: 'exact', head: true })
      dbCheck = error ? `ERROR: ${error.message}` : 'CONNECTED'
      
      // Probe tables
      const { data: clientTable, error: clientError } = await supabase.from('clients').select('*', { count: 'exact', head: true })
      tables.push({ 
        name: 'clients', 
        status: clientError ? `ERROR: ${clientError.message}` : 'EXISTS',
        count: clientTable
      })

      const { data: vendorTable, error: vendorError } = await supabase.from('vendors').select('*', { count: 'exact', head: true })
      tables.push({ 
        name: 'vendors', 
        status: vendorError ? `ERROR: ${vendorError.message}` : 'EXISTS',
        count: vendorTable
      })
    } catch (e: any) {
      dbCheck = `EXCEPTION: ${e.message}`
    }
  }

  const envCheck = {
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
    service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENT' : 'MISSING',
    node_env: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV || 'unknown'
  }

  return NextResponse.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    session: session ? { role: session.role, org_id: session.organizationId } : 'NULL',
    db: dbCheck,
    tables,
    diagnostics: envCheck
  })
}
