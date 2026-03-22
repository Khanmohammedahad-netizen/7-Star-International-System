"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils/cn"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost'
  isHoverable?: boolean
  isClickable?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", isHoverable, isClickable, ...props }, ref) => {
    
    const variantStyles = {
      default: "bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]",
      outlined: "bg-transparent border border-[var(--border-default)]",
      elevated: "bg-[var(--bg-surface)] shadow-[var(--shadow-md)]",
      ghost: "bg-transparent hover:bg-[var(--bg-subtle)] transition-colors",
    }

    const Comp = isClickable ? motion.div : 'div'

    return (
      <Comp
        ref={ref as any}
        className={cn(
          "rounded-[var(--radius-xl)]",
          variantStyles[variant],
          isHoverable && "hover:shadow-[var(--shadow-md)] transition-shadow",
          isClickable && "cursor-pointer active:scale-[0.98] transition-transform",
          className
        )}
        {...(props as any)}
      />
    )
  }
)

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-4 border-b border-[var(--border-default)]", className)} {...props} />
)

export const CardBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6", className)} {...props} />
)

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-4 border-t border-[var(--border-default)]", className)} {...props} />
)

Card.displayName = "Card"
