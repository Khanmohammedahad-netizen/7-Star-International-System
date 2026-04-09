'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from './button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]"
    >
      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-neutral-500" />
      </div>
      <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
      <p className="text-neutral-400 mt-2 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <Button 
          onClick={onAction}
          className="mt-8 h-12 px-8 bg-white text-black font-bold hover:bg-neutral-200 transition-all rounded-xl"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
