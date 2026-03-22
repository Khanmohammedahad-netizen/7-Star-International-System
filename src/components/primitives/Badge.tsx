"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'brand'
  size?: 'sm' | 'md'
  withDot?: boolean
  onDismiss?: () => void
}

export const Badge = ({
  className,
  variant = "default",
  size = "md",
  withDot = false,
  onDismiss,
  children,
  ...props
}: BadgeProps) => {

  const variantStyles = {
    default: "bg-[var(--bg-subtle)] text-[var(--text-secondary)]",
    success: "bg-[var(--status-success-bg)] text-[var(--status-success)]",
    error: "bg-[var(--status-error-bg)] text-[var(--status-error)]",
    warning: "bg-[rgba(234,179,8,0.1)] text-[var(--status-warning)]",
    info: "bg-[var(--accent-light)] text-[var(--accent-primary)]",
    brand: "bg-[var(--brand-light)] text-[var(--brand-primary)]",
  }

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-[11px]",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center font-medium rounded-full transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {withDot && (
        <span className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          variant === 'default' ? "bg-[var(--text-muted)]" : "bg-current"
        )} />
      )}
      {children}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-1.5 p-0.5 hover:bg-black/10 rounded-full transition-colors"
        >
          <X size={10} />
        </button>
      )}
    </div>
  )
}
