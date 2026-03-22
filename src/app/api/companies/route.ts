import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { companySchema } from '@/modules/companies/schema'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(req.url)

    const page     = parseInt(searchParams.get('page') ?? '1')
    const limit    = parseInt(searchParams.get('limit') ?? '20')
    const search   = searchParams.get('search')
    const industry = searchParams.get('industry')
    const from     = (page - 1) * limit

    let query = supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (industry) {
      query = query.eq('industry', industry)
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
    const validated = companySchema.parse(body)

    const { data, error } = await supabase
      .from('companies')
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
