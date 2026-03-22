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
                    'relative bg-white rounded-xl border border-neutral-200 shadow-xl w-full max-w-lg mx-4 animate-in fade-in zoom-in-95',
                    className
                )}
            >
                <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                    <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
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
