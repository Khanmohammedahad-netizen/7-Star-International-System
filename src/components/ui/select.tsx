"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string }[]
  label?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, label, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && <label className="text-sm font-medium text-neutral-300 ml-1">{label}</label>}
        <div className="relative group">
          <select
            className={cn(
              "flex h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer hover:bg-white/[0.08]",
              className
            )}
            ref={ref}
            ...props
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0a0a0a] text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none group-hover:text-neutral-300 transition-colors" />
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
