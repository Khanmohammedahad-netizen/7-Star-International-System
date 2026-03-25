import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    // 1. Fetch Finance Summary (Aggregated metrics per Org)
    const { data: summaryData, error: sumError } = await supabase
      .from('finances')
      .select('budget, actual_cost, revenue, revenue_collected')
      .eq('org_id', session.organizationId)

    if (sumError) throw sumError

    // 2. Calculate Dashboard Totals with explicit types to fix lint errors
    const total_revenue = summaryData?.reduce((acc: number, f: any) => acc + (Number(f.revenue) || 0), 0) || 0
    const total_expenses = summaryData?.reduce((acc: number, f: any) => acc + (Number(f.actual_cost) || 0), 0) || 0
    const pending_payments = summaryData?.reduce((acc: number, f: any) => acc + (Math.max(0, (Number(f.revenue) || 0) - (Number(f.revenue_collected) || 0))), 0) || 0
    
    // 3. Fetch Recent Financial Activities (Events with Finance data)
    const { data: recentEvents, error: eventError } = await supabase
      .from('events')
      .select(`
        id,
        name,
        status,
        start_date,
        finance:finances(budget, actual_cost, revenue)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (eventError) throw eventError

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_revenue,
          pending_payments,
          total_expenses,
          net_profit: total_revenue - total_expenses
        },
        recent_invoices: [], 
        recent_expenses: [], 
        events_with_finance: recentEvents
      }
    })
  } catch (error: any) {
    console.error('API Error: GET /api/finance', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
