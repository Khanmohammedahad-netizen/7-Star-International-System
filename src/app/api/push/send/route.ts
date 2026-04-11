import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import webpush from '@/lib/push/webpush'

export async function POST(req: Request) {
  try {
    // Only administrators or the system itself should trigger pushes globally.
    // However, users can trigger pushes for themselves or their org.
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetUserId, payload } = await req.json()
    
    // We need service role to read other people's subscriptions.
    // Wait, the client SDK uses RLS which we limited to `user_id = auth.uid()`.
    // Since we are running on the server, we will use the admin client or just normal client if we want them to push to themselves.
    // For now, if we don't have the service role set up globally in the codebase, we'll try fetching normally.
    // If targetUserId is not provided, test push back to self.
    const receiverId = targetUserId || user.id

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', receiverId)

    if (error) throw error
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: false, message: 'No devices registered for push' })
    }

    const pushPayload = JSON.stringify({
      title: payload?.title || 'System Notification',
      body: payload?.body || 'You have a new update in 7STAR OS.',
      url: payload?.url || '/',
    })

    const results = await Promise.allSettled(
      subscriptions.map((sub: any) => 
        webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }, pushPayload)
      )
    )

    // Cleanup broken subscriptions
    const failedEndpoints: string[] = []
    results.forEach((res: any, index: number) => {
      if (res.status === 'rejected') {
        const error = res.reason
        if (error.statusCode === 404 || error.statusCode === 410) {
          failedEndpoints.push(subscriptions[index].endpoint)
        }
      }
    })

    if (failedEndpoints.length > 0) {
      await supabase.from('push_subscriptions').delete().in('endpoint', failedEndpoints)
    }

    return NextResponse.json({ success: true, delivered: results.length - failedEndpoints.length })
  } catch (error: any) {
    console.error('Push Send Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
