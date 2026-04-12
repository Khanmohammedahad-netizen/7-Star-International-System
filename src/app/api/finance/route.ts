import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    // Parallel queries for all finance data
    const [
      invoicePaidResult,
      invoicePendingResult,
      expensesResult,
      recentInvoicesResult,
      recentExpensesResult,
    ] = await Promise.all([
      // Total revenue = SUM of paid invoices
      supabase
        .from('invoices')
        .select('total')
        .eq('org_id', session.organizationId)
        .eq('status', 'paid'),

      // Pending payments = SUM of pending/overdue invoices
      supabase
        .from('invoices')
        .select('total')
        .eq('org_id', session.organizationId)
        .in('status', ['pending', 'overdue']),

      // Total expenses = SUM of all expenses
      supabase
        .from('expenses')
        .select('amount')
        .eq('org_id', session.organizationId),

      // Recent invoices (last 10) — use * to avoid schema mismatch on named columns
      supabase
        .from('invoices')
        .select('*')
        .eq('org_id', session.organizationId)
        .order('created_at', { ascending: false })
        .limit(10),

      // Recent expenses (last 10)
      supabase
        .from('expenses')
        .select('*')
        .eq('org_id', session.organizationId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    const total_revenue    = (invoicePaidResult.data    || []).reduce((s: number, r: any) => s + (Number(r.total) || 0), 0)
    const pending_payments = (invoicePendingResult.data || []).reduce((s: number, r: any) => s + (Number(r.total) || 0), 0)
    const total_expenses   = (expensesResult.data       || []).reduce((s: number, r: any) => s + (Number(r.amount) || 0), 0)
    const net_profit = total_revenue - total_expenses

    // Normalize invoice rows: handle both legacy (invoice_number) and new (doc_number) schemas
    const normalizeInvoice = (row: any) => ({
      ...row,
      doc_number: row.doc_number ?? row.invoice_number ?? '',
      doc_type:   row.doc_type   ?? row.type           ?? 'invoice',
    })

    return NextResponse.json({
      success: true,
      data: {
        summary: { total_revenue, pending_payments, total_expenses, net_profit },
        recent_invoices: (recentInvoicesResult.data || []).map(normalizeInvoice),
        recent_expenses: recentExpensesResult.data || [],
      }
    })
  } catch (error: any) {
    console.error('API Error: GET /api/finance', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
