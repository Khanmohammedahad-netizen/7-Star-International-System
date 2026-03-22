"use client"

import * as React from "react"
import { Card, CardHeader, CardBody, CardFooter } from "@/components/primitives/Card"
import { cn } from "@/lib/utils/cn"

export interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "flat" | "elevated"
  title?: string
  description?: string
  footer?: React.ReactNode
}

/**
 * AppCard provides a high-level abstraction for cards with built-in variants and common patterns.
 */
export const AppCard = React.forwardRef<HTMLDivElement, AppCardProps>(
  ({ variant = "default", title, description, footer, children, className, ...props }, ref) => {
    const variants = {
      default: "bg-card shadow-subtle",
      glass: "bg-background/40 backdrop-blur-xl border-white/10 shadow-glass",
      flat: "bg-muted/50 border-none shadow-none",
      elevated: "bg-card shadow-premium border-none",
    }

    return (
        <Card
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {(title || description) && (
          <CardHeader>
            {title && <h3 className="text-lg font-semibold leading-none tracking-tight text-[var(--text-primary)]">{title}</h3>}
            {description && <p className="text-sm text-[var(--text-muted)] mt-1.5">{description}</p>}
          </CardHeader>
        )}
        <CardBody>{children}</CardBody>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    )
  }
)

AppCard.displayName = "AppCard"
