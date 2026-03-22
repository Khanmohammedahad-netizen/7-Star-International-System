"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rectangle' | 'card'
}

export const Skeleton = ({ 
  className, 
  variant = 'rectangle', 
  ...props 
}: SkeletonProps) => {

  const variantStyles = {
    text: "h-3 w-full rounded-md",
    circle: "h-10 w-10 rounded-full",
    rectangle: "h-24 w-full rounded-md",
    card: "h-48 w-full rounded-[var(--radius-xl)]",
  }

  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--bg-subtle)]",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
