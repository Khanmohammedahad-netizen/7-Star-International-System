"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { scaleIn, fadeIn } from "@/motion/variants"

export const Modal = DialogPrimitive.Root
export const ModalTrigger = DialogPrimitive.Trigger

export const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen' }
>(({ className, children, size = 'md', ...props }, ref) => {
  
  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    fullscreen: "max-w-[95vw] h-[95vh]",
  }

  return (
    <DialogPrimitive.Portal forceMount>
      <DialogPrimitive.Overlay asChild>
        <motion.div
          {...(fadeIn as any)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        />
      </DialogPrimitive.Overlay>
      <DialogPrimitive.Content asChild {...props}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            ref={ref as any}
            {...(scaleIn as any)}
            className={cn(
              "relative w-full overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-surface)] shadow-[var(--shadow-xl)] flex flex-col",
              sizeStyles[size],
              className
            )}
          >
            {children}
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] bg-[var(--bg-subtle)]">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </motion.div>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
})

export const ModalHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-4 border-b border-[var(--border-default)]", className)} {...props} />
)

export const ModalTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <DialogPrimitive.Title className={cn("text-lg font-semibold text-[var(--text-primary)]", className)} {...props} />
)

export const ModalDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <DialogPrimitive.Description className={cn("text-sm text-[var(--text-secondary)]", className)} {...props} />
)

export const ModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-4 border-t border-[var(--border-default)] bg-[var(--bg-subtle)]/30 flex justify-end gap-3", className)} {...props} />
)

ModalContent.displayName = "ModalContent"
