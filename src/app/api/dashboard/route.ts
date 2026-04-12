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
      criticalAlertsResult,
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

      // Critical alerts (e.g. pending payments > 30 days)
      supabase
        .from('invoices')
        .select('*')
        .eq('org_id', session.organizationId)
        .eq('status', 'pending')
        .limit(5),
    ])

    const totalRevenue = (paidInvoicesResult.data || []).reduce((s: number, inv: any) => 
      s + (Number(inv.total || inv.total_amount || inv.amount) || 0), 0)

    const upcomingEvents = (upcomingEventsResult.data || []).map((e: any) => ({
      ...e,
      name: e.title || e.name || 'Untitled Event',
      start_date: e.event_date || e.start_date || e.created_at?.split('T')[0],
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
          title: log.title || log.msg || 'Activity Recorded',
          description: log.description || log.details || null,
          timestamp: log.created_at || log.time || log.timestamp,
        })),
        criticalAlerts: (criticalAlertsResult.data || []).map((alert: any) => ({
          id: alert.id,
          severity: 'warning',
          message: `Pending item: ${alert.doc_number || alert.invoice_number || alert.id}`,
        })),
      }
    })
  } catch (error: any) {
    console.error('API Error: GET /api/dashboard', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
