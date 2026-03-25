import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  const { isMockMode } = await import('@/lib/utils/env')
  
  if (isMockMode()) {
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_revenue: 1250000,
          pending_payments: 450000,
          total_expenses: 320000,
          net_profit: 930000
        },
        recent_invoices: [],
        recent_estimates: [],
        recent_expenses: []
      }
    })
  }

  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createSupabaseServerClient()

    // Aggregate data for the Finance Dashboard
    // 1. Fetch Invoices Summary
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('id, total, status, amount_paid, created_at')
      .limit(100)

    if (invError) throw invError

    // 2. Fetch Estimates/Quotations Summary
    const { data: estimates, error: estError } = await supabase
      .from('estimates')
      .select('id, total, status, created_at')
      .limit(100)

    if (estError) throw estError

    // 3. Fetch Expenses
    const { data: expenses, error: expError } = await supabase
      .from('event_expenses')
      .select('id, amount, status, category')
      .limit(100)

    if (expError) throw expError

    // Calculate metrics
    const total_revenue = invoices?.reduce((acc, inv) => acc + (inv.total || 0), 0) || 0
    const pending_payments = invoices?.filter(i => i.status !== 'paid').reduce((acc, inv) => acc + ((inv.total || 0) - (inv.amount_paid || 0)), 0) || 0
    const total_expenses = expenses?.reduce((acc, exp) => acc + (exp.amount || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_revenue,
          pending_payments,
          total_expenses,
          net_profit: total_revenue - total_expenses
        },
        recent_invoices: invoices?.slice(0, 10) || [],
        recent_estimates: estimates?.slice(0, 10) || [],
        recent_expenses: expenses?.slice(0, 10) || []
      }
    })
  } catch (error: any) {
    console.error('API Error: GET /api/finance', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
