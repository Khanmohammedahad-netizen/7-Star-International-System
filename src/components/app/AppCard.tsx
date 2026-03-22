"use client"

import * as React from "react"
import { Card, CardProps } from "../primitives/Card"
import { Spinner } from "../primitives/Spinner"

export interface AppCardProps extends CardProps {
  isLoading?: boolean
}

export const AppCard = ({ isLoading, children, ...props }: AppCardProps) => {
  return (
    <Card {...props} className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg-surface)]/50 rounded-inherit backdrop-blur-[2px]">
          <Spinner size="md" />
        </div>
      )}
      {children}
    </Card>
  )
}
