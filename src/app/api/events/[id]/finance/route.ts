import { NextResponse } from 'next/server'
import { mockExpenses } from '@/lib/mock/expenses'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { isMockMode } from '@/lib/utils/env'

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  
  if (isMockMode()) {
    return NextResponse.json({
      success: true,
      data: {
        event_id: params.id,
        total_quoted: 125000,
        total_invoiced: 75000,
        total_received: 75000,
        total_outstanding: 0,
        total_estimated_expenses: 85000,
        total_actual_expenses: mockExpenses.reduce((acc, exp) => acc + exp.amount, 0),
        expenses: mockExpenses
      }
    })
  }

  try {
    const supabase = await createSupabaseServerClient()
    
    // Fetch summary stats and expenses for the event
    const { data: expenses, error: expError } = await supabase
      .from('event_expenses')
      .select('*')
      .eq('event_id', params.id)

    if (expError) throw expError

    const { data: summary, error: sumError } = await supabase
      .from('event_finance_summery')
      .select('*')
      .eq('event_id', params.id)
      .single()

    // Fallback if summary row doesn't exist yet
    if (sumError && sumError.code !== 'PGRST116') throw sumError

    return NextResponse.json({
      success: true,
      data: {
        event_id: params.id,
        total_quoted: summary?.total_quoted || 0,
        total_invoiced: summary?.total_invoiced || 0,
        total_received: summary?.total_received || 0,
        total_outstanding: summary?.total_outstanding || 0,
        total_estimated_expenses: summary?.total_estimated_expenses || 0,
        total_actual_expenses: expenses?.reduce((acc, exp) => acc + exp.amount, 0) || 0,
        expenses: expenses || []
      }
    })
  } catch (error: any) {
    console.error(`API Error: GET /api/events/${params.id}/finance`, error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
