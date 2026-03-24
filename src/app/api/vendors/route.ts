import { NextResponse } from 'next/server'
import { mockVendors } from '@/lib/mock/vendors'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { isMockMode } from '@/lib/utils/env'
import { getSession } from '@/lib/auth/session'

// PERFORMANCE: Select only necessary columns for the directory
const VENDOR_COLUMNS = 'id, name, category, contact_name, phone, email, rating, is_preferred, is_active'

export async function GET() {
  if (isMockMode()) {
    return NextResponse.json({ success: true, data: mockVendors })
  }

  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('event_vendors_directory') // Fixed table name from previous research
      .select(VENDOR_COLUMNS)
      .eq('org_id', session.organizationId)
      .order('name', { ascending: true })

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('API Error: GET /api/vendors', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
