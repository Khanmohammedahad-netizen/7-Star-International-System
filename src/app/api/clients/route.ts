import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

const CLIENT_COLUMNS = '*'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    const { data, error } = await supabase
      .from('clients')
      .select(CLIENT_COLUMNS)
      .eq('org_id', session.organizationId)
      .order('name', { ascending: true })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('API Error: GET /api/clients', error)
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

    const clientData = {
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      country: body.country || 'UAE',
      notes: body.notes || null,
      org_id: session.organizationId
    }

    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select(CLIENT_COLUMNS)
      .single()

    if (error) {
      console.error('DATABASE ERROR: POST /api/clients', error)
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      org_id: session.organizationId,
      type: 'client_added',
      title: `New client added`,
      description: `${data.name}${data.company ? ` (${data.company})` : ''} was added to the directory`
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('API Error: POST /api/clients', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ error: 'Client ID required' }, { status: 400 })

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', session.organizationId)
      .select(CLIENT_COLUMNS)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('API Error: PUT /api/clients', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Client ID required' }, { status: 400 })

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('org_id', session.organizationId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API Error: DELETE /api/clients', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
