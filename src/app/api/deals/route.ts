import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { dealSchema } from '@/modules/deals/schema'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(req.url)

    const page     = parseInt(searchParams.get('page') ?? '1')
    const limit    = parseInt(searchParams.get('limit') ?? '20')
    const search   = searchParams.get('search')
    const status   = searchParams.get('status')
    const stage_id = searchParams.get('stage_id')
    const from     = (page - 1) * limit

    let query = supabase
      .from('deals')
      .select('*, company:companies(id,name), contact:contacts(id,first_name,last_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (stage_id) {
      query = query.eq('stage_id', stage_id)
    }

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
    const validated = dealSchema.parse(body)

    const { data, error } = await supabase
      .from('deals')
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
