// @ts-nocheck
"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from "lucide-react"
import { Card, CardBody } from "../primitives/Card"
import { Skeleton } from "../primitives/Skeleton"
import { Badge } from "../primitives/Badge"
import { cn } from "@/lib/utils/cn"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  isLoading?: boolean
  currency?: string
}

export const StatsCard = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  isLoading,
  currency,
}: StatsCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardBody className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </CardBody>
      </Card>
    )
  }

  const isPositive = trend === 'up' || (change && change > 0)
  const isNegative = trend === 'down' || (change && change < 0)

  return (
    <Card isHoverable className="h-full">
      <CardBody className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            {title}
          </p>
          {icon && (
            <div className="p-2 rounded-lg bg-[var(--bg-subtle)] text-[var(--brand-primary)]">
              {icon}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 mt-auto">
          <motion.h3 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]"
          >
            {currency && <span className="mr-1 text-lg font-medium text-[var(--text-muted)]">{currency}</span>}
            {value}
          </motion.h3>

          <div className="flex items-center gap-2 mt-1">
            {change !== undefined && (
              <Badge 
                variant={isPositive ? 'success' : isNegative ? 'error' : 'default'} 
                size="sm"
                className="font-bold"
              >
                {isPositive ? <ArrowUpRight className="mr-1 h-3 w-3" /> : isNegative ? <ArrowDownRight className="mr-1 h-3 w-3" /> : <Minus className="mr-1 h-3 w-3" />}
                {Math.abs(change)}%
              </Badge>
            )}
            {changeLabel && (
              <span className="text-[11px] text-[var(--text-muted)]">
                {changeLabel}
              </span>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

