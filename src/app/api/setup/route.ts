import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const targetedEmail = 'khamohammedahad@yahoo.com'

  if (!url || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing service role environment variables' }, { status: 500 })
  }

  const supabase = createClient(url, serviceRoleKey)

  try {
    // 1. Get the user ID from the email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) throw userError

    const user = users.find(u => u.email === targetedEmail)
    if (!user) {
      return NextResponse.json({ error: `User with email ${targetedEmail} not found` }, { status: 404 })
    }

    // 2. Ensure memberships table exists (it should, but we check/insert)
    // First, check if membership already exists
    const { data: existing } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ message: 'User already has a membership', user_id: user.id, membership: existing })
    }

    // 3. Create a default organization if none exists or just use a dummy one
    // In this MVP, we'll assume there is an org or create a '7STAR-ROOT' org
    const orgId = '77777777-7777-7777-7777-777777777777'
    
    // Check if memberships table is ready for insertion
    const { error: insertError } = await supabase
      .from('memberships')
      .insert({
        user_id: user.id,
        organization_id: orgId,
        role: 'super_admin'
      })

    if (insertError) throw insertError

    return NextResponse.json({
      status: 'success',
      message: 'Super Admin Membership Provisioned!',
      user_id: user.id,
      role: 'super_admin'
    })

  } catch (error: any) {
    console.error('Provisioning Error:', error)
    return NextResponse.json({ error: error.message, details: error }, { status: 500 })
  }
}
