"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { AppCard } from "@/components/primitives/AppCard"
import { AppInput } from "@/components/primitives/AppInput"
import { Search, SlidersHorizontal } from "lucide-react"
import { AppButton } from "@/components/primitives/AppButton"

export interface DataTableWrapperProps {
  title?: string
  description?: string
  children: React.ReactNode
  onSearch?: (value: string) => void
  actions?: React.ReactNode
  className?: string
}

export function DataTableWrapper({ 
  title, 
  description, 
  children,
  onSearch,
  actions,
  className 
}: DataTableWrapperProps) {
  return (
    <AppCard className={cn("p-0 overflow-hidden border-none", className)}>
      {(title || description || onSearch || actions) && (
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {(title || description) && (
              <div className="space-y-1">
                {title && <h3 className="text-xl font-bold tracking-tight">{title}</h3>}
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
              </div>
            )}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {onSearch && (
              <div className="relative w-full sm:max-w-xs">
                <AppInput 
                  placeholder="Search repository..." 
                  leftIcon={<Search size={16} />}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <AppButton variant="outline" size="sm" leftIcon={<SlidersHorizontal size={14} />}>
                Filters
              </AppButton>
            </div>
          </div>
        </div>
      )}
      <div className="border-t">
        {children}
      </div>
    </AppCard>
  )
}
