import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

// PERFORMANCE: Select specific columns for speed (<1s)
const EVENT_DETAIL_COLUMNS = '*, client:clients(name, company)'

function mapEventFromDB(e: any) {
  return {
    ...e,
    name: e.title,
    start_date: e.event_date,
    type: e.type || 'corporate',
    color: e.color || '#C9A84C',
  }
}

export async function GET(req: Request, props: { params: Promise<{ id: string }> | { id: string } }) {
  // Support both Next.js 14 and 15 params API gracefully
  const params = await Promise.resolve(props.params)
  
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('events')
      .select(EVENT_DETAIL_COLUMNS)
      .eq('id', params.id)
      .eq('org_id', session.organizationId)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: mapEventFromDB(data) })
  } catch (error: any) {
    console.error(`API Error: GET /api/events/${params.id}`, error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const body = await req.json()

  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('events')
      .update(body)
      .eq('id', params.id)
      .eq('org_id', session.organizationId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error(`API Error: PATCH /api/events/${params.id}`, error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', params.id)
      .eq('org_id', session.organizationId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`API Error: DELETE /api/events/${params.id}`, error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
