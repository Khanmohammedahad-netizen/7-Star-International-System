"use client"

import * as React from "react"
import { Button, ButtonProps } from "@/components/primitives/Button"
import { cn } from "@/lib/utils/cn"

export interface AppButtonProps extends ButtonProps {
  /**
   * Optional permission key to check if the user can perform this action.
   */
  permission?: string
  /**
   * If true, the button will be hidden if the user doesn't have the required permission.
   */
  hideOnNoPermission?: boolean
  /**
   * Map for page header usages
   */
  icon?: React.ReactNode
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ permission, hideOnNoPermission = true, className, children, icon, leftIcon, ...props }, ref) => {
    // Permission mock
    const hasPermission = true 

    if (!hasPermission && hideOnNoPermission) {
      return null
    }

    return (
      <Button
        ref={ref}
        className={cn(className)}
        disabled={props.disabled || !hasPermission}
        leftIcon={icon || leftIcon}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

AppButton.displayName = "AppButton"

