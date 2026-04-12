import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { getSession } from '@/lib/auth/session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createSupabaseServerClient()
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })

    const today = new Date().toISOString().split('T')[0]

    const [
      activeEventsResult,
      paidInvoicesResult,
      upcomingEventsResult,
      recentActivityResult,
    ] = await Promise.all([
      // Count confirmed/in_progress events
      supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', session.organizationId)
        .in('status', ['confirmed', 'in_progress', 'planning']),

      // Revenue from paid invoices
      supabase
        .from('invoices')
        .select('total')
        .eq('org_id', session.organizationId)
        .eq('status', 'paid'),

      // Upcoming events (next 5 from today)
      supabase
        .from('events')
        .select('*')
        .eq('org_id', session.organizationId)
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .limit(5),

      // Recent activity log
      supabase
        .from('activity_log')
        .select('id, type, title, description, created_at')
        .eq('org_id', session.organizationId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    const totalRevenue = (paidInvoicesResult.data || []).reduce((s: number, inv: any) => s + (Number(inv.total) || 0), 0)

    const upcomingEvents = (upcomingEventsResult.data || []).map((e: any) => ({
      ...e,
      name: e.title,
      start_date: e.event_date,
    }))

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          activeEvents: activeEventsResult.count || 0,
          revenueThisMonth: totalRevenue,
          unconfirmedVendors: 0,
        },
        upcomingEvents,
        recentActivity: (recentActivityResult.data || []).map((log: any) => ({
          id: log.id,
          type: log.type,
          title: log.title,
          description: log.description,
          timestamp: log.created_at,
        })),
        criticalAlerts: [],
      }
    })
  } catch (error: any) {
    console.error('API Error: GET /api/dashboard', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
