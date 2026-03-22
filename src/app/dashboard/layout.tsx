import { AppShell } from '@/components/layout/app-shell'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { appConfig } from '@/config/app.config'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session) {
        redirect(appConfig.auth.loginPath)
    }

    return (
        <AppShell userEmail={session.email}>
            {children}
        </AppShell>
    )
}
