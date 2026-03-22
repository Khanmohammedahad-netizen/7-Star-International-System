import { cn } from '@/lib/utils/cn'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<string, string> = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800 border-transparent',
    secondary: 'bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-300',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
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
                    'inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
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
