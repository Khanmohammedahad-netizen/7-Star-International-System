import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

// Normalize a raw DB row to a consistent shape the frontend expects.
// Handles both the legacy schema (invoice_number) and the new schema (doc_number).
function normalizeRow(row: any) {
  return {
    ...row,
    doc_number: row.doc_number ?? row.invoice_number ?? '',
    doc_type:   row.doc_type   ?? row.type          ?? 'invoice',
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
      // Try both column names so the query works regardless of schema version
      query = query.or(`doc_type.eq.${doc_type},type.eq.${doc_type}`)
    }

    const { data, error } = await query
    if (error) throw error

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

    const body    = await req.json()
    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    const subtotal   = parseFloat(body.subtotal) || 0
    const vat_amount = Math.round(subtotal * 0.05 * 100) / 100
    const total      = Math.round((subtotal + vat_amount) * 100) / 100
    const docNumber  = body.doc_number || `${body.doc_type === 'quotation' ? 'QT' : 'INV'}-${Date.now()}`
    const issueDate  = body.issue_date || new Date().toISOString().split('T')[0]

    // ── Strategy: probe which column the live table uses ──────────────────────
    // We check the schema cache error and retry with the other column name.
    // First attempt: new schema (doc_number, doc_type)
    const newSchemaPayload = {
      org_id:      session.organizationId,
      event_id:    body.event_id || null,
      doc_type:    body.doc_type || 'invoice',
      doc_number:  docNumber,
      issue_date:  issueDate,
      status:      body.status || 'pending',
      client_name: body.client_name || null,
      subtotal,
      vat_amount,
      total,
      line_items:  body.line_items || [],
    }

    let { data, error } = await supabase
      .from('invoices')
      .insert(newSchemaPayload)
      .select()
      .single()

    // If doc_number column doesn't exist → try legacy schema
    if (error && (error.message?.includes('doc_number') || error.message?.includes('invoice_number'))) {
      console.warn('doc_number column not found, retrying with legacy invoice_number column')
      const legacyPayload = {
        org_id:          session.organizationId,
        event_id:        body.event_id || null,
        type:            body.doc_type || 'invoice',   // legacy uses 'type'
        invoice_number:  docNumber,                    // legacy column name
        issue_date:      issueDate,
        status:          body.status || 'pending',
        client_name:     body.client_name || null,
        subtotal,
        vat_amount,
        total,
        line_items:      body.line_items || [],
      }
      const legacyResult = await supabase
        .from('invoices')
        .insert(legacyPayload)
        .select()
        .single()
      data  = legacyResult.data
      error = legacyResult.error
    }

    if (error) {
      console.error('DATABASE ERROR: POST /api/invoices', error)
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 })
    }

    // Log activity (best-effort — don't fail the response if this errors)
    const docLabel = body.doc_type === 'quotation' ? 'Quotation' : 'Invoice'
    await supabase.from('activity_log').insert({
      org_id:      session.organizationId,
      type:        'invoice_generated',
      title:       `${docLabel} generated`,
      description: `${docNumber} — AED ${total} created for ${body.client_name || 'Unknown Client'}`,
    }).catch(() => {/* swallow activity-log failures */})

    return NextResponse.json({ success: true, data: normalizeRow(data) })
  } catch (error: any) {
    console.error('API Error: POST /api/invoices', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
