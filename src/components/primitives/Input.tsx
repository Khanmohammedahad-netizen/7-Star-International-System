"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showCharacterCount?: boolean
  maxLength?: number
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    helperText, 
    error, 
    leftIcon, 
    rightIcon, 
    showCharacterCount, 
    maxLength, 
    value, 
    onChange, 
    ...props 
  }, ref) => {
    const characterCount = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-[13px] font-medium text-[var(--text-primary)]">
            {label}
          </label>
        )}
        
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            className={cn(
              "flex h-10 w-full rounded-[var(--radius-md)] border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-[var(--text-muted)]",
              leftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              error ? "border-[var(--status-error)] focus:ring-[var(--status-error)] focus:border-[var(--status-error)]" : "",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {rightIcon}
            </div>
          )}
        </div>

        <div className="flex justify-between items-start pt-1">
          {error ? (
            <p className="text-[12px] text-[var(--status-error)] font-medium">{error}</p>
          ) : helperText ? (
            <p className="text-[12px] text-[var(--text-muted)]">{helperText}</p>
          ) : <div />}
          
          {showCharacterCount && maxLength && (
            <span className="text-[11px] text-[var(--text-muted)]">
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = "Input"
