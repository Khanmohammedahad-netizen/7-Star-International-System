import { NextResponse } from 'next/server'
import { faker } from '@faker-js/faker'
import { DashboardData } from '@/modules/dashboard/types'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { isMockMode } from '@/lib/utils/env'
import { getSession } from '@/lib/auth/session'

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
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createSupabaseServerClient()
    
    // PERFORMANCE: Optimized parallel execution for aggregating dashboard stats
    const [
      { count: activeCount },
      { data: revenueData },
      { count: vendorCount }
    ] = await Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('org_id', session.organizationId).eq('status', 'confirmed'),
      supabase.from('invoices').select('total').eq('org_id', session.organizationId).eq('status', 'paid'),
      supabase.from('event_vendor_assignments').select('id', { count: 'exact', head: true }).eq('org_id', session.organizationId).eq('status', 'contacted')
    ])

    const totalRevenue = revenueData?.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          activeEvents: activeCount || 0,
          revenueThisMonth: totalRevenue,
          unconfirmedVendors: vendorCount || 0
        },
        criticalAlerts: [], // To be implemented with real logic if table exists
        recentActivity: []  // To be implemented with real activity log
      }
    })
  } catch (error: any) {
    console.error('API Error: GET /api/dashboard', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
