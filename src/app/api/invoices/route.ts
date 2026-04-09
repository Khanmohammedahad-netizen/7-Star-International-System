import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const doc_type = searchParams.get('type') // 'invoice' or 'quotation'

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    let query = supabase
      .from('invoices')
      .select('id, doc_type, doc_number, issue_date, status, client_name, subtotal, vat_amount, total, event_id, line_items, created_at')
      .eq('org_id', session.organizationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (doc_type) {
      query = query.eq('doc_type', doc_type)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('API Error: GET /api/invoices', error)
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

    const subtotal = parseFloat(body.subtotal) || 0
    const vat_amount = Math.round(subtotal * 0.05 * 100) / 100
    const total = Math.round((subtotal + vat_amount) * 100) / 100

    const invoiceData = {
      org_id: session.organizationId,
      event_id: body.event_id || null,
      doc_type: body.doc_type || 'invoice',
      doc_number: body.doc_number,
      issue_date: body.issue_date || new Date().toISOString().split('T')[0],
      status: body.status || 'pending',
      client_name: body.client_name || null,
      subtotal,
      vat_amount,
      total,
      line_items: body.line_items || [],
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single()

    if (error) {
      console.error('DATABASE ERROR: POST /api/invoices', error)
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 })
    }

    // Log activity
    const docLabel = body.doc_type === 'quotation' ? 'Quotation' : 'Invoice'
    await supabase.from('activity_log').insert({
      org_id: session.organizationId,
      type: 'invoice_generated',
      title: `${docLabel} generated`,
      description: `${body.doc_number} — AED ${total.toLocaleString()} created for ${body.client_name || 'Unknown Client'}`
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('API Error: POST /api/invoices', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
