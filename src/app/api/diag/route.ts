import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const envCheck = {
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
    supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
    service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENT' : 'MISSING',
    app_url: process.env.NEXT_PUBLIC_APP_URL ? 'PRESENT' : 'MISSING',
    node_env: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV || 'unknown'
  }

  return NextResponse.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    diagnostics: envCheck
  })
}
