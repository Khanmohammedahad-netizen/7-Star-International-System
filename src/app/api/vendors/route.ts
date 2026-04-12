import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

const VENDOR_COLUMNS = '*'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    const { data, error } = await supabase
      .from('vendors')
      .select(VENDOR_COLUMNS)
      .eq('org_id', session.organizationId)
      .order('name', { ascending: true })
      .limit(limit)

    if (error) throw error

    // Normalize: prefer category over legacy service_type
    const normalized = (data || []).map((v: any) => ({
      ...v,
      category: v.category || v.service_type || 'other',
    }))

    return NextResponse.json({ success: true, data: normalized })
  } catch (error: any) {
    console.error('API Error: GET /api/vendors', error)
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

    const vendorData = {
      name: body.name,
      category: body.category || 'other',
      service_type: body.category || body.service_type || 'other', // Keep legacy column in sync
      contact: body.contact || null,
      email: body.email || null,
      phone: body.phone || null,
      rating: typeof body.rating === 'number' ? body.rating : 0,
      notes: body.notes || null,
      cost_basis: body.cost_basis ? parseFloat(body.cost_basis) : 0,
      org_id: session.organizationId
    }

    const { data, error } = await supabase
      .from('vendors')
      .insert(vendorData)
      .select(VENDOR_COLUMNS)
      .single()

    if (error) {
      console.error('DATABASE ERROR: POST /api/vendors', error)
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      org_id: session.organizationId,
      type: 'vendor_added',
      title: `New vendor added`,
      description: `${data.name} (${data.category}) was added to the vendor directory`
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('API Error: POST /api/vendors', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id, ...updateData } = body
    if (!id) return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 })

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    const { data, error } = await supabase
      .from('vendors')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', session.organizationId)
      .select(VENDOR_COLUMNS)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('API Error: PUT /api/vendors', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 })

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id)
      .eq('org_id', session.organizationId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API Error: DELETE /api/vendors', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
