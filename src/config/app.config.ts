export const appConfig = {
    name: 'MVP Skeleton',
    version: '1.0.0',
    company: 'MAK Software Solutions',
    description: 'Enterprise SaaS Skeleton Framework',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    },
    auth: {
        loginPath: '/auth/login',
        dashboardPath: '/dashboard',
        logoutRedirect: '/auth/login',
    },
    useMock: process.env.NEXT_PUBLIC_USE_MOCK === 'true',
} as const
