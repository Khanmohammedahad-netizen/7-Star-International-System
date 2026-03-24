import { NextResponse } from 'next/server'
import { initialTimelineItems } from '@/lib/mock/timeline'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { isMockMode } from '@/lib/utils/env'

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  
  if (isMockMode()) {
    const items = initialTimelineItems.find(t => t.id) || initialTimelineItems[0] || []
    return NextResponse.json({ success: true, data: items })
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('event_timeline')
      .select('*')
      .eq('event_id', params.id)
      .order('start_time', { ascending: true })

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error(`API Error: GET /api/events/${params.id}/timeline`, error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
