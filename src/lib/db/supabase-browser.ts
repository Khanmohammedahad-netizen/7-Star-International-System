import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If environment variables are missing (e.g., during build phase), 
    // return a dummy client to prevent the build from crashing.
    if (!url || !key) {
        return {} as any
    }

    return createBrowserClient(url, key)
}
