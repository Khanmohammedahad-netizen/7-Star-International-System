import { NextResponse } from 'next/server'
import { mockEvents, mockTodayEvents } from '@/lib/mock'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { isMockMode } from '@/lib/utils/env'
import { getSession } from '@/lib/auth/session'

// PERFORMANCE: Select specific columns only to keep payload small (<1s target)
const EVENT_COLUMNS = 'id, name, type, status, start_date, end_date, start_time, end_time, venue_name, venue_city, expected_guests, color, client_id'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  
  if (isMockMode()) {
    const today = searchParams.get('today')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    
    let data = mockEvents
    if (today === 'true') {
      data = mockTodayEvents
    }

    data = data.slice(0, limit)

    return NextResponse.json({ 
      success: true, 
      data,
      meta: { total: data.length }
    })
  }

  try {
    const supabase = await createSupabaseServerClient()
    const today = searchParams.get('today')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    let query = supabase.from('events').select(EVENT_COLUMNS, { count: 'exact' })

    if (today === 'true') {
      const todayDate = new Date().toISOString().split('T')[0]
      query = query.eq('start_date', todayDate)
    }

    const { data, error, count } = await query
      .order('start_date', { ascending: true })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data,
      meta: { total: count }
    })
  } catch (error: any) {
    console.error('API Error: GET /api/events', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (isMockMode()) {
      return NextResponse.json({ 
        success: true, 
        data: { 
          id: `mock-${Date.now()}`,
          ...body,
          created_at: new Date().toISOString()
        } 
      })
    }

    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createSupabaseServerClient()

    // Add org_id from session automatically
    const eventData = {
      ...body,
      org_id: session.organizationId,
      created_by: session.id
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
