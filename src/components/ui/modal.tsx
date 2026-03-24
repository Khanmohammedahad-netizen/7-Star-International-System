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
        if (open) document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Dialog */}
            <div
                className={cn(
                    'relative bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 backdrop-blur-md',
                    className
                )}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-cormorant)' }}>{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    )
}
