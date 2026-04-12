import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

// Select columns that actually exist in the DB schema
const EVENT_COLUMNS = '*'

function mapEventFromDB(e: any) {
  return {
    ...e,
    // Map legacy column names → modern frontend schema
    name: e.title,
    start_date: e.event_date,
    type: e.type || 'corporate',
    color: e.color || '#C9A84C',
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const today = searchParams.get('today')
    const upcoming = searchParams.get('upcoming')
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
      query = query.lte('event_date', todayDate).gte('end_date', todayDate)
    }

    if (upcoming === 'true') {
      const todayDate = new Date().toISOString().split('T')[0]
      query = query.gte('event_date', todayDate)
    }

    const { data, error, count } = await query
      .order('event_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const mappedData = (data || []).map(mapEventFromDB)

    return NextResponse.json({ 
      success: true, 
      data: mappedData,
      meta: { total: count, limit, offset }
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

    // Sanitize all fields before insert
    const eventData = {
      title: body.name,                                                 // name → title (legacy col)
      event_date: body.start_date || null,                             // start_date → event_date
      end_date: body.end_date || null,
      location: body.location || body.venue_name || null,
      status: body.status || 'planning',
      client_id: body.client_id && body.client_id !== '' ? body.client_id : null,
      type: body.type || 'corporate',
      venue_name: body.venue_name || null,
      expected_guests: typeof body.expected_guests === 'number' && !isNaN(body.expected_guests)
        ? body.expected_guests : null,
      budget_total: typeof body.budget_total === 'number' && !isNaN(body.budget_total)
        ? body.budget_total : 0,
      color: body.color || '#C9A84C',
      notes: body.notes || null,
      org_id: session.organizationId
    }

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select(EVENT_COLUMNS)
      .single()

    if (error) {
      console.error('DATABASE ERROR: POST /api/events', error)
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      org_id: session.organizationId,
      type: 'event_created',
      title: `New event created`,
      description: `${data.title} was scheduled for ${data.event_date}`
    })

    return NextResponse.json({ success: true, data: mapEventFromDB(data) })
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
    const { id, ...rest } = body
    if (!id) return NextResponse.json({ error: 'Event ID required' }, { status: 400 })

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    // Map modern field names → legacy DB columns for update
    const updateData: any = {}
    if (rest.name !== undefined) updateData.title = rest.name
    if (rest.start_date !== undefined) updateData.event_date = rest.start_date
    if (rest.end_date !== undefined) updateData.end_date = rest.end_date
    if (rest.status !== undefined) updateData.status = rest.status
    if (rest.venue_name !== undefined) updateData.venue_name = rest.venue_name
    if (rest.notes !== undefined) updateData.notes = rest.notes
    if (rest.color !== undefined) updateData.color = rest.color
    // Copy any remaining fields directly
    const directFields = ['location', 'client_id', 'type', 'expected_guests', 'budget_total']
    directFields.forEach(f => { if (rest[f] !== undefined) updateData[f] = rest[f] })

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', session.organizationId)
      .select(EVENT_COLUMNS)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: mapEventFromDB(data) })
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
