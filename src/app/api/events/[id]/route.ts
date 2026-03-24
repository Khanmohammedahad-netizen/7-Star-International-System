import { NextResponse } from 'next/server'
import { mockEvents } from '@/lib/mock/events'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { isMockMode } from '@/lib/utils/env'

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  
  if (isMockMode()) {
    const event = mockEvents.find(e => e.id === params.id)
    if (!event) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: event })
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('events')
      .select('*, organization:organizations(*)')
      .eq('id', params.id)
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error(`API Error: GET /api/events/${params.id}`, error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const body = await req.json()

  if (isMockMode()) {
    return NextResponse.json({ success: true, data: { ...mockEvents[0], ...body } })
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('events')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  if (isMockMode()) {
    return NextResponse.json({ success: true })
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
