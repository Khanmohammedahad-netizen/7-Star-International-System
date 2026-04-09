import { cn } from '@/lib/utils/cn'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
    size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<string, string> = {
    // High-contrast white CTA — visible on all dark backgrounds
    primary: 'bg-white text-black hover:bg-neutral-200 border-transparent font-semibold shadow-lg shadow-white/10',
    // Subtle dark ghost with white border
    secondary: 'bg-white/10 text-white hover:bg-white/20 border-white/20',
    // Transparent ghost for inline actions
    ghost: 'bg-transparent text-neutral-300 hover:text-white hover:bg-white/10 border-transparent',
    // Danger / destructive
    danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
    // Gold accent CTA
    gold: 'bg-[#C9A84C] text-black hover:bg-[#d4b060] border-transparent font-semibold shadow-lg shadow-[#C9A84C]/20',
}

const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled}
                className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed',
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                {...props}
            />
        )
    }
)

Button.displayName = 'Button'
