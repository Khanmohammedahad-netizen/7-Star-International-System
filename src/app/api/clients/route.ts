import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createSupabaseServerClient()

    // PERFORMANCE: Fetch only name and ID for dropdowns
    const { data, error } = await supabase
      .from('contacts')
      .select('id, first_name, last_name')
      .eq('org_id', session.organizationId)
      .order('first_name', { ascending: true })

    if (error) throw error

    const clients = data.map(c => ({
      id: c.id,
      name: `${c.first_name} ${c.last_name || ''}`.trim()
    }))

    return NextResponse.json({ success: true, data: clients })
  } catch (error: any) {
    console.error('API Error: GET /api/clients', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
