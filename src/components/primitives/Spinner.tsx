"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface SpinnerProps extends React.HTMLAttributes<SVGElement> {
  size?: 'sm' | 'md' | 'lg'
}

export const Spinner = ({ 
  size = 'md', 
  className, 
  ...props 
}: SpinnerProps) => {

  const sizeStyles = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  }

  return (
    <Loader2 
      className={cn(
        "animate-spin text-[var(--accent-primary)]",
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
}
