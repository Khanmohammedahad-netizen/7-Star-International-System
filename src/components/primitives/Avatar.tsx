"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  initials?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'away' | 'offline' | 'busy'
}

export const Avatar = ({ 
  src, 
  alt, 
  initials, 
  size = 'md', 
  status, 
  className, 
  ...props 
}: AvatarProps) => {

  const sizeStyles = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-[12px]",
    md: "h-10 w-10 text-[14px]",
    lg: "h-12 w-12 text-[16px]",
    xl: "h-16 w-16 text-[20px]",
  }

  const statusStyles = {
    online: "bg-[var(--status-success)]",
    away: "bg-[var(--status-warning)]",
    offline: "bg-[var(--text-disabled)]",
    busy: "bg-[var(--status-error)]",
  }

  return (
    <div 
      className={cn(
        "relative inline-flex flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-semibold",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="h-full w-full rounded-full object-cover" 
        />
      ) : (
        <span>{initials}</span>
      )}
      
      {status && (
        <span 
          className={cn(
            "absolute bottom-0 right-0 h-[25%] w-[25%] rounded-full border-2 border-[var(--bg-surface)]",
            statusStyles[status]
          )} 
        />
      )}
    </div>
  )
}

export const AvatarGroup = ({ 
  children, 
  limit = 4, 
  className 
}: { 
  children: React.ReactNode, 
  limit?: number, 
  className?: string 
}) => {
  const avatars = React.Children.toArray(children)
  const visibleAvatars = avatars.slice(0, limit)
  const remainingCount = avatars.length - limit

  return (
    <div className={cn("flex -space-x-3", className)}>
      {visibleAvatars}
      {remainingCount > 0 && (
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--bg-surface)] bg-[var(--bg-subtle)] text-[12px] font-medium text-[var(--text-muted)]">
          +{remainingCount}
        </div>
      )}
    </div>
  )
}
