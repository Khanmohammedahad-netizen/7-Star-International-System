'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { appConfig } from '@/config/app.config'
import { sidebarVariants, pageEnter } from '@/motion/variants'
import { crmNav } from '@/config/nav'

interface AppShellProps {
    userEmail?: string
    children: React.ReactNode
}

export function AppShell({ userEmail, children }: AppShellProps) {
    const [isOpen, setIsOpen] = useState(true)
    const pathname = usePathname()

    return (
        <div className="flex min-h-screen bg-neutral-50 overflow-hidden">
            {/* Desktop Sidebar (Collapsible) */}
            <motion.aside
                variants={sidebarVariants as any}
                initial="open"
                animate={isOpen ? 'open' : 'closed'}
                className="hidden md:flex h-screen bg-neutral-900 text-neutral-300 flex-col fixed left-0 top-0 z-30 overflow-hidden shadow-xl"
            >
                {/* Brand */}
                <div className="h-16 flex items-center px-6 border-b border-neutral-800 shrink-0">
                    <span className={cn("text-lg font-bold text-white tracking-tight whitespace-nowrap transition-opacity duration-200", !isOpen && 'opacity-0')}>
                        {appConfig.name}
                    </span>
                    {!isOpen && <span className="absolute left-6 text-lg font-bold text-white tracking-tight">M</span>}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
                    {crmNav.map((section) => (
                        <div key={section.group} className="mb-6">
                            <p className={cn("px-3 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider transition-opacity duration-200", !isOpen && 'opacity-0')}>
                                {section.group}
                            </p>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                                                isActive
                                                    ? 'bg-neutral-800 text-white'
                                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                                            )}
                                        >
                                            <span className="flex-shrink-0"><item.icon className="w-[18px] h-[18px]" /></span>
                                            <span className={cn("transition-opacity duration-200", !isOpen && 'opacity-0')}>{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-neutral-800 shrink-0 flex items-center justify-between">
                    <p className={cn("text-xs text-neutral-500 whitespace-nowrap transition-opacity duration-200", !isOpen && 'opacity-0')}>{appConfig.company}</p>
                </div>
            </motion.aside>

            {/* Mobile Bottom Sheet (fixed at bottom for mobile) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-900 border-t border-neutral-800 flex items-center justify-around z-50">
                {crmNav.flatMap(g => g.items).slice(0, 5).map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors',
                                isActive
                                    ? 'text-white'
                                    : 'text-neutral-500 hover:text-white'
                            )}
                        >
                            <span className="flex-shrink-0 mb-1"><item.icon className="w-[18px] h-[18px]" /></span>
                            <span className="scale-x-90">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Main Content Area */}
            <motion.div 
                className="flex-1 flex flex-col min-h-screen"
                animate={{ marginLeft: isOpen ? 260 : 72 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
                <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 sticky top-0 z-20 shrink-0">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className="hidden md:flex p-2 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <h2 className="hidden md:block text-sm font-medium text-neutral-500">
                            {appConfig.company}
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {userEmail && (
                            <span className="text-sm font-medium text-neutral-600 px-3 py-1.5 bg-neutral-100 rounded-full">{userEmail}</span>
                        )}
                        <form action="/auth/logout" method="POST">
                            <button
                                type="submit"
                                className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-y-auto mb-16 md:mb-0">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={pathname}
                            variants={pageEnter}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </motion.div>
        </div>
    )
}
