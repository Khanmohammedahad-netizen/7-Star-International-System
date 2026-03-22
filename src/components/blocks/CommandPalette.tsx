"use client"

import * as React from "react"
import { Search, Command as CommandIcon, FileText, User, Settings, Layout, LayoutDashboard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils/cn"
import { scaleIn, fadeIn } from "@/motion/variants"

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DialogPrimitive.Portal forceMount>
        <AnimatePresence>
          {isOpen && (
            <>
              <DialogPrimitive.Overlay asChild>
                <motion.div
                  {...(fadeIn as any)}
                  className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
                />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content asChild>
                <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] p-4">
                  <motion.div
                    {...(scaleIn as any)}
                    className="relative w-full max-w-xl overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-surface)] shadow-[var(--shadow-2xl)] border border-[var(--border-default)] flex flex-col"
                  >
                    <div className="flex items-center border-b border-[var(--border-default)] px-4">
                      <Search className="mr-3 h-5 w-5 text-[var(--text-muted)]" />
                      <input
                        placeholder="Type a command or search..."
                        className="flex h-14 w-full bg-transparent py-3 text-sm outline-none placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
                      />
                      <div className="rounded border border-[var(--border-default)] bg-[var(--bg-subtle)] px-2 py-1 text-[10px] font-bold text-[var(--text-muted)]">
                        ESC
                      </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto p-2">
                      <div className="px-2 py-3">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 px-2">
                          Quick Actions
                        </p>
                        <CommandItem icon={<Plus size={16} />} label="Add New Lead" shortcut="N" />
                        <CommandItem icon={<FileText size={16} />} label="Create Invoice" shortcut="I" />
                        <CommandItem icon={<User size={16} />} label="Invite Team Member" />
                      </div>

                      <div className="px-2 py-3 border-t border-[var(--border-default)]">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 px-2">
                          Navigate
                        </p>
                        <CommandItem icon={<LayoutDashboard size={16} />} label="Go to Dashboard" />
                        <CommandItem icon={<Layout size={16} />} label="Components Library" />
                        <CommandItem icon={<Settings size={16} />} label="System Settings" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[var(--border-default)] px-4 py-3 bg-[var(--bg-subtle)]/30">
                      <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)] font-medium">
                        <span className="flex items-center gap-1">
                          <kbd className="rounded bg-[var(--bg-muted)] px-1.5 py-0.5 border border-[var(--border-default)]">↵</kbd> select
                        </span>
                        <span className="flex items-center gap-1">
                          <kbd className="rounded bg-[var(--bg-muted)] px-1.5 py-0.5 border border-[var(--border-default)]">↑↓</kbd> navigate
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </DialogPrimitive.Content>
            </>
          )}
        </AnimatePresence>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

const CommandItem = ({ icon, label, shortcut }: { icon: React.ReactNode, label: string, shortcut?: string }) => (
  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[var(--bg-subtle)] cursor-pointer group transition-colors">
    <div className="flex items-center gap-3">
      <div className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
        {label}
      </span>
    </div>
    {shortcut && (
      <kbd className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-muted)]/50 px-1.5 py-0.5 rounded border border-[var(--border-default)]">
        {shortcut}
      </kbd>
    )}
  </div>
)

const Plus = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
)
