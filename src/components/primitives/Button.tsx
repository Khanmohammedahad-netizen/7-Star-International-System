// @ts-nocheck
"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'brand'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  isFullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "md", 
    isLoading = false, 
    isFullWidth = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    
    const variantStyles = {
      primary: "bg-[var(--brand-primary)] text-[var(--bg-page)] hover:bg-[var(--brand-hover)] border-transparent",
      brand: "bg-[var(--brand-primary)] text-[var(--bg-page)] hover:bg-[var(--brand-hover)] border-transparent",
      secondary: "bg-transparent text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-subtle)] border",
      ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] border-transparent",
      danger: "bg-[var(--status-error)] text-white hover:bg-red-600 border-transparent",
      outline: "bg-transparent text-[var(--text-primary)] border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] border",
    }

    const sizeStyles = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm font-medium",
      lg: "h-12 px-8 text-base",
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-md)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          isFullWidth ? "w-full" : "",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </motion.button>
    )
  }
)

Button.displayName = "Button"

