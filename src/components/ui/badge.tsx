import { cn } from '@/lib/utils/cn'

interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline'
    children: React.ReactNode
    className?: string
}

const variantStyles: Record<string, string> = {
    default: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    secondary: 'bg-white/5 text-neutral-400 border-white/10',
    outline: 'bg-transparent text-neutral-400 border-white/20',
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-500 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                variantStyles[variant],
                className
            )}
        >
            {children}
        </span>
    )
}
