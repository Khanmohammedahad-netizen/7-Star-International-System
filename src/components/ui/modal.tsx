'use client'

import { cn } from '@/lib/utils/cn'
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
    open: boolean
    onClose: () => void
    title: string
    children: ReactNode
    className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (open) {
            document.body.style.overflow = 'hidden'
            document.addEventListener('keydown', handleEscape)
        } else {
            document.body.style.overflow = 'unset'
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-[100] flex md:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 md:bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Dialog / Bottom Sheet */}
            <div
                className={cn(
                    // Base styles
                    'relative bg-[#0a0a0a] border-white/10 shadow-2xl w-full flex flex-col',
                    // Mobile Bottom Sheet styles
                    'mt-auto md:mt-0 rounded-t-3xl md:rounded-2xl border-t md:border max-h-[90vh] md:max-h-[85vh] mx-0 md:mx-4 animate-slide-up md:animate-in md:fade-in md:zoom-in-95',
                    // Desktop styles
                    'md:max-w-lg',
                    className
                )}
            >
                {/* Mobile Handle */}
                <div className="md:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 shrink-0">
                    <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-cormorant)' }}>{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-500 hover:text-white transition-colors p-1.5 md:p-1 rounded-lg hover:bg-white/5 active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content Body */}
                <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar pb-[env(safe-area-inset-bottom)] md:pb-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
