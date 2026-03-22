import { createSupabaseServerClient } from '@/lib/db/supabase-server'
import { redirect } from 'next/navigation'
import { appConfig } from '@/config/app.config'

export async function POST() {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
    redirect(appConfig.auth.logoutRedirect)
}
