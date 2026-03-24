import { NextResponse } from 'next/server'
import { mockEvents, mockTodayEvents } from '@/lib/mock'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { isMockMode } from '@/lib/utils/env'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  
  if (isMockMode()) {
    const today = searchParams.get('today')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    
    let data = mockEvents
    if (today === 'true') {
      data = mockTodayEvents
    }

    data = data.slice(0, limit)

    return NextResponse.json({ 
      success: true, 
      data,
      meta: { total: data.length }
    })
  }

  try {
    const supabase = await createSupabaseServerClient()
    const today = searchParams.get('today')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    let query = supabase.from('events').select('*', { count: 'exact' })

    if (today === 'true') {
      const todayDate = new Date().toISOString().split('T')[0]
      query = query.eq('start_date', todayDate)
    }

    const { data, error, count } = await query
      .order('start_date', { ascending: true })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data,
      meta: { total: count }
    })
  } catch (error: any) {
    console.error('API Error: GET /api/events', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
