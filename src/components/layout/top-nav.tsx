import { appConfig } from '@/config/app.config'

interface TopNavProps {
    userEmail?: string
}

export function TopNav({ userEmail }: TopNavProps) {
    return (
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 sticky top-0 z-20">
            <div>
                <h2 className="text-sm font-medium text-neutral-500">
                    {appConfig.company}
                </h2>
            </div>
            <div className="flex items-center gap-4">
                {userEmail && (
                    <span className="text-sm text-neutral-600">{userEmail}</span>
                )}
                <form action="/auth/logout" method="POST">
                    <button
                        type="submit"
                        className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        Sign Out
                    </button>
                </form>
            </div>
        </header>
    )
}
