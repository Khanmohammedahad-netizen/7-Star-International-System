"use client"

import * as React from "react"
import { AppCard, AppCardProps } from "@/components/primitives/AppCard"
import { cn } from "@/lib/utils/cn"

export interface DashboardCardProps extends AppCardProps {
  /**
   * Optional loading state for the card content.
   */
  isLoading?: boolean
}

/**
 * DashboardCard is a specialized AppCard for dashboard layouts.
 * It includes built-in loading skeletons (placeholder) and consistent padding.
 */
export function DashboardCard({ isLoading, children, className, ...props }: DashboardCardProps) {
  return (
    <AppCard 
      className={cn("h-full", className)} 
      variant="default"
      {...props}
    >
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-1/3 bg-muted rounded" />
          <div className="h-24 bg-muted/40 rounded-lg" />
          <div className="space-y-2">
            <div className="h-2 w-full bg-muted rounded" />
            <div className="h-2 w-5/6 bg-muted rounded" />
          </div>
        </div>
      ) : (
        children
      )}
    </AppCard>
  )
}
