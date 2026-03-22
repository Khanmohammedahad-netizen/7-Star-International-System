"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { scaleIn } from "@/motion/variants"

export const Dropdown = DropdownMenuPrimitive.Root
export const DropdownTrigger = DropdownMenuPrimitive.Trigger
export const DropdownGroup = DropdownMenuPrimitive.Group
export const DropdownPortal = DropdownMenuPrimitive.Portal
export const DropdownSub = DropdownMenuPrimitive.Sub
export const DropdownRadioGroup = DropdownMenuPrimitive.RadioGroup

export const DropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal forceMount>
    <DropdownMenuPrimitive.Content asChild sideOffset={sideOffset} {...props}>
      <motion.div
        ref={ref as any}
        {...(scaleIn as any)}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-1 text-[var(--text-primary)] shadow-[var(--shadow-md)]",
          className
        )}
      >
        {props.children}
      </motion.div>
    </DropdownMenuPrimitive.Content>
  </DropdownMenuPrimitive.Portal>
))

export const DropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { variant?: 'default' | 'destructive' }
>(({ className, variant = 'default', ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-[var(--bg-subtle)] focus:text-[var(--text-primary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      variant === 'destructive' && "text-[var(--status-error)] focus:bg-[var(--status-error-bg)] focus:text-[var(--status-error)]",
      className
    )}
    {...props}
  />
))

export const DropdownSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-[var(--border-default)]", className)}
    {...props}
  />
))

export const DropdownLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider", className)}
    {...props}
  />
))

DropdownContent.displayName = "DropdownContent"
DropdownItem.displayName = "DropdownItem"
