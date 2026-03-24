import { NextResponse } from 'next/server'
import { faker } from '@faker-js/faker'
import { DashboardData } from '@/modules/dashboard/types'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { isMockMode } from '@/lib/utils/env'

export async function GET() {
  if (isMockMode()) {
    const mockData: DashboardData = {
      stats: {
        activeEvents: faker.number.int({ min: 5, max: 15 }),
        revenueThisMonth: faker.number.int({ min: 100000, max: 800000 }),
        unconfirmedVendors: faker.number.int({ min: 0, max: 8 })
      },
      criticalAlerts: [
        {
          id: faker.string.uuid(),
          type: 'vendor_unconfirmed',
          message: '3 vendors unconfirmed — Al Noor Gala (3 days away)',
          eventId: faker.string.uuid(),
          severity: 'critical'
        },
        {
          id: faker.string.uuid(),
          type: 'invoice_overdue',
          message: 'Invoice INV-0108 overdue — AED 42,500 outstanding',
          eventId: faker.string.uuid(),
          severity: 'critical'
        },
        {
          id: faker.string.uuid(),
          type: 'task_overdue',
          message: '2 tasks overdue — Tech Summit',
          eventId: faker.string.uuid(),
          severity: 'high'
        }
      ],
      recentActivity: Array.from({ length: 10 }, () => ({
        id: faker.string.uuid(),
        userName: faker.person.firstName(),
        action: faker.helpers.arrayElement(['confirmed vendor', 'sent invoice', 'changed event date', 'updated timeline']),
        eventName: faker.company.name() + ' Event',
        timestamp: faker.date.recent().toISOString()
      }))
    }
    return NextResponse.json({ success: true, data: mockData })
  }

  try {
    const supabase = await createSupabaseServerClient()
    
    // Aggregate stats from various tables
    const { count: activeEvents } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'confirmed')
    const { data: revenue } = await supabase.from('invoices').select('amount').eq('status', 'paid')
    const { count: unconfirmedVendors } = await supabase.from('event_vendors').select('*', { count: 'exact', head: true }).eq('status', 'tentative')

    const totalRevenue = revenue?.reduce((sum, inv) => sum + inv.amount, 0) || 0

    // Fetch alerts and history
    const { data: alerts } = await supabase.from('critical_alerts').select('*').limit(5)
    const { data: activity } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(10)

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          activeEvents: activeEvents || 0,
          revenueThisMonth: totalRevenue,
          unconfirmedVendors: unconfirmedVendors || 0
        },
        criticalAlerts: alerts || [],
        recentActivity: activity || []
      }
    })
  } catch (error: any) {
    console.error('API Error: GET /api/dashboard', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
