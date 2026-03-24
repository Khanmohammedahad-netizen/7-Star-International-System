import { cn } from '@/lib/utils/cn'
import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'bg-neutral-900 border border-white/5 rounded-xl shadow-sm overflow-hidden',
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
        <div className={cn('p-6 border-b border-white/5', className)} {...props}>
            {children}
        </div>
    )
}

export function CardTitle({ className, children, ...props }: CardProps) {
    return (
        <h3 className={cn('text-lg font-semibold text-white', className)} {...props}>
            {children}
        </h3>
    )
}

export function CardContent({ className, children, ...props }: CardProps) {
    return (
        <div className={cn('p-6', className)} {...props}>
            {children}
        </div>
    )
}
