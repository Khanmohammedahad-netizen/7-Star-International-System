import { NextResponse } from 'next/server'
import { mockVendors } from '@/lib/mock/vendors'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { isMockMode } from '@/lib/utils/env'

export async function GET() {
  if (isMockMode()) {
    return NextResponse.json({ success: true, data: mockVendors })
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.from('vendors').select('*').order('name', { ascending: true })

    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('API Error: GET /api/vendors', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
