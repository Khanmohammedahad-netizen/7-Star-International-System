import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { activitySchema } from '@/modules/activities/schema'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(req.url)

    const page       = parseInt(searchParams.get('page') ?? '1')
    const limit      = parseInt(searchParams.get('limit') ?? '20')
    const type       = searchParams.get('type')
    const contact_id = searchParams.get('contact_id')
    const deal_id    = searchParams.get('deal_id')
    const from       = (page - 1) * limit

    let query = supabase
      .from('activities')
      .select('*, contact:contacts(id,first_name,last_name), deal:deals(id,title)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (type) query = query.eq('type', type)
    if (contact_id) query = query.eq('contact_id', contact_id)
    if (deal_id) query = query.eq('deal_id', deal_id)

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      meta: { total: count ?? 0, page, limit }
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await req.json()
    const validated = activitySchema.parse(body)

    const { data, error } = await supabase
      .from('activities')
      .insert(validated)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: err.errors },
        { status: 422 }
      )
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
