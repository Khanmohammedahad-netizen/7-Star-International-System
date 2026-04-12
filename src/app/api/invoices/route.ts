import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

// Normalise a raw DB row to the canonical shape the frontend expects.
// Handles both the legacy schema (invoice_number, type) and the new schema (doc_number, doc_type).
function normalizeRow(row: any) {
  if (!row) return row
  return {
    ...row,
    doc_number: row.doc_number  ?? row.invoice_number ?? '',
    doc_type:   row.doc_type    ?? row.type           ?? 'invoice',
    status:     row.status      ?? 'pending',
    total:      Number(row.total ?? 0),
    subtotal:   Number(row.subtotal ?? 0),
    vat_amount: Number(row.vat_amount ?? 0),
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const limit    = parseInt(searchParams.get('limit') || '10', 10)
    const doc_type = searchParams.get('type')

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('org_id', session.organizationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (doc_type) {
      query = query.eq('doc_type', doc_type)
    }

    const { data, error } = await query

    if (error) {
      console.error('DATABASE ERROR: GET /api/invoices', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: (data || []).map(normalizeRow) })
  } catch (error: any) {
    console.error('API Error: GET /api/invoices', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body     = await req.json()
    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    const subtotal   = parseFloat(String(body.subtotal)) || 0
    const vat_amount = Math.round(subtotal * 0.05 * 100) / 100
    const total      = Math.round((subtotal + vat_amount) * 100) / 100
    const docNumber  = body.doc_number || `${body.doc_type === 'quotation' ? 'QT' : 'INV'}-${Date.now()}`
    const issueDate  = body.issue_date || new Date().toISOString().split('T')[0]

    // Single insert payload using the normalised column names (doc_number, doc_type).
    // If the live DB still has the legacy 'invoice_number' NOT NULL column,
    // we include it as well so neither constraint fires.
    const invoiceData: Record<string, any> = {
      org_id:          session.organizationId,
      event_id:        body.event_id || null,
      doc_type:        body.doc_type    || 'invoice',
      doc_number:      docNumber,
      // Include legacy column names as fallbacks — ignored by DB if they don't exist
      invoice_number:  docNumber,
      issue_date:      issueDate,
      status:          body.status      || 'pending',
      client_name:     body.client_name || null,
      subtotal,
      vat_amount,
      total,
      line_items:      body.line_items  || [],
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

    // Log activity — best-effort, don't fail the response
    const docLabel = body.doc_type === 'quotation' ? 'Quotation' : 'Invoice'
    supabase.from('activity_log').insert({
      org_id:      session.organizationId,
      type:        'invoice_generated',
      title:       `${docLabel} generated`,
      description: `${docNumber} — AED ${total} for ${body.client_name || 'Unknown Client'}`,
    }).then(() => {}).catch(() => {})

    return NextResponse.json({ success: true, data: normalizeRow(data) })
  } catch (error: any) {
    console.error('API Error: POST /api/invoices', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
