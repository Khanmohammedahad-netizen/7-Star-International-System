"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"

export interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

/**
 * AppInput is the primary entry point for form inputs in MAK-OS SaaS products.
 */
export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(className)}
        {...props}
      />
    )
  }
)

AppInput.displayName = "AppInput"
