import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

// PERFORMANCE: Select specific columns only to keep payload small (<1s target)
const EVENT_COLUMNS = 'id, name, type, status, start_date, end_date, location, client_id, created_at'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const today = searchParams.get('today')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    let query = supabase
      .from('events')
      .select(EVENT_COLUMNS, { count: 'exact' })
      .eq('org_id', session.organizationId)

    if (today === 'true') {
      const todayDate = new Date().toISOString().split('T')[0]
      query = query.lte('start_date', todayDate).gte('end_date', todayDate)
    }

    const { data, error, count } = await query
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data,
      meta: { 
        total: count,
        limit,
        offset
      }
    })
  } catch (error: any) {
    console.error('API Error: GET /api/events', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    // Inject organization ID for security and multi-tenancy
    const eventData = {
      ...body,
      org_id: session.organizationId
    }

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select(EVENT_COLUMNS)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('API Error: POST /api/events', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ error: 'Event ID required' }, { status: 400 })

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', session.organizationId) // Multi-tenant security
      .select(EVENT_COLUMNS)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('API Error: PUT /api/events', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Event ID required' }, { status: 400 })

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('org_id', session.organizationId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API Error: DELETE /api/events', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
