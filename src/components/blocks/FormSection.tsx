"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export const FormSection = ({
  title,
  description,
  children,
  className,
}: FormSectionProps) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-8 py-8 first:pt-0 last:pb-0", className)}>
      <div className="md:col-span-1 space-y-1">
        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="md:col-span-2">
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}
