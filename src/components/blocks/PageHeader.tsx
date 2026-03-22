"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  tabs?: React.ReactNode
}

export const PageHeader = ({
  title,
  description,
  breadcrumbs,
  actions,
  tabs,
}: PageHeaderProps) => {
  return (
    <div className="space-y-4 pb-4 border-b border-[var(--border-default)] mb-6">
      {breadcrumbs && (
        <nav className="flex items-center space-x-1 text-xs font-medium text-[var(--text-muted)]">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && <ChevronRight className="h-3 w-3" />}
              <span className={cn(index === breadcrumbs.length - 1 ? "text-[var(--text-primary)]" : "hover:text-[var(--text-secondary)] cursor-pointer")}>
                {item.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {tabs && (
        <div className="pt-2">
          {tabs}
        </div>
      )}
    </div>
  )
}
