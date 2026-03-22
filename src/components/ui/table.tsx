import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'

interface TableProps {
    children: ReactNode
    className?: string
}

export function Table({ children, className }: TableProps) {
    return (
        <div className={cn('bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden', className)}>
            <table className="w-full text-left border-collapse">
                {children}
            </table>
        </div>
    )
}

export function TableHeader({ children, className }: TableProps) {
    return (
        <thead>
            <tr className={cn('bg-neutral-50 border-b border-neutral-200', className)}>
                {children}
            </tr>
        </thead>
    )
}

export function TableHead({ children, className }: TableProps) {
    return (
        <th className={cn('p-4 text-xs font-semibold uppercase tracking-wider text-neutral-500', className)}>
            {children}
        </th>
    )
}

export function TableBody({ children, className }: TableProps) {
    return <tbody className={className}>{children}</tbody>
}

export function TableRow({ children, className }: TableProps) {
    return (
        <tr className={cn('border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors', className)}>
            {children}
        </tr>
    )
}

export function TableCell({ children, className }: TableProps) {
    return <td className={cn('p-4 text-sm text-neutral-700', className)}>{children}</td>
}
