"use client"

import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface TooltipButtonProps extends ButtonProps {
  tooltip?: string
  tooltipSide?: "top" | "bottom" | "left" | "right"
  showTooltipWhenDisabled?: boolean
}

const TooltipButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  TooltipButtonProps
>(({ 
  tooltip, 
  tooltipSide = "top", 
  showTooltipWhenDisabled = true, 
  children, 
  disabled, 
  className,
  ...props 
}, ref) => {
  const shouldShowTooltip = tooltip && (showTooltipWhenDisabled ? disabled : true)

  if (!shouldShowTooltip) {
    return (
      <Button
        ref={ref}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </Button>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-block", disabled && "cursor-not-allowed")}>
            <Button
              ref={ref}
              disabled={disabled}
              className={cn(
                className,
                disabled && "pointer-events-none"
              )}
              {...props}
            >
              {children}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

TooltipButton.displayName = "TooltipButton"

export { TooltipButton }