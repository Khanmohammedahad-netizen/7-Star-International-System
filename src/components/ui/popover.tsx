"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"

export function Popover({ children, trigger, className }: { children: React.ReactNode; trigger: React.ReactNode; className?: string }) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer w-full">
        {trigger}
      </div>
      {open && (
        <div className={cn(
          "absolute z-50 mt-2 p-4 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200",
          className
        )}>
          {children}
        </div>
      )}
    </div>
  )
}
