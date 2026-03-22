import { cn } from '@/lib/utils/cn'

interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
    children: React.ReactNode
    className?: string
}

const variantStyles: Record<string, string> = {
    default: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
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
