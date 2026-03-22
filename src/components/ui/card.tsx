import { cn } from '@/lib/utils/cn'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardHeader({ className, children, ...props }: CardProps) {
    return (
        <div className={cn('p-6 border-b border-neutral-100', className)} {...props}>
            {children}
        </div>
    )
}

export function CardContent({ className, children, ...props }: CardProps) {
    return (
        <div className={cn('p-6', className)} {...props}>
            {children}
        </div>
    )
}
