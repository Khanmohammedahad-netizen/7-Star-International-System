import { cn } from '@/lib/utils/cn'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label htmlFor={id} className="text-sm font-medium text-neutral-300">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={id}
                    className={cn(
                        // Dark-mode input: dark bg, white text, subtle border
                        'w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-neutral-500 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed',
                        error && 'border-red-500/60 focus:ring-red-500/30',
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
        )
    }
)

Input.displayName = 'Input'
