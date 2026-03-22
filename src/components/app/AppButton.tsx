"use client"

import * as React from "react"
import { Button, ButtonProps } from "../primitives/Button"

export interface AppButtonProps extends ButtonProps {
  permission?: string
  hideOnNoPermission?: boolean
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ permission, hideOnNoPermission = true, ...props }, ref) => {
    // Placeholder for RBAC logic
    const hasPermission = true 

    if (!hasPermission && hideOnNoPermission) {
      return null
    }

    return (
      <Button
        ref={ref}
        disabled={props.disabled || !hasPermission}
        {...props}
      />
    )
  }
)

AppButton.displayName = "AppButton"
