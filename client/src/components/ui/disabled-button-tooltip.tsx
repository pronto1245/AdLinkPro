"use client"

import * as React from "react"
import { Button } from "./button"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "./tooltip"
import { cn } from "@/lib/utils"
import { Info, Lock, Clock, AlertCircle } from "lucide-react"

interface DisabledButtonTooltipProps extends React.ComponentPropsWithoutRef<typeof Button> {
  tooltipContent: React.ReactNode
  tooltipIcon?: 'info' | 'lock' | 'clock' | 'alert'
  showIcon?: boolean
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right'
}

const iconMap = {
  info: Info,
  lock: Lock,
  clock: Clock,
  alert: AlertCircle,
}

const DisabledButtonTooltip = React.forwardRef<
  React.ElementRef<typeof Button>,
  DisabledButtonTooltipProps
>(({ 
  children, 
  tooltipContent, 
  tooltipIcon = 'info', 
  showIcon = true, 
  tooltipSide = 'top',
  disabled = true,
  className,
  ...props 
}, ref) => {
  const IconComponent = iconMap[tooltipIcon]

  // If button is not disabled, render normally without tooltip
  if (!disabled) {
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
          <div className="inline-flex">
            <Button
              ref={ref}
              disabled={disabled}
              className={cn(
                "relative cursor-not-allowed",
                className
              )}
              {...props}
            >
              {children}
              {showIcon && (
                <IconComponent className="ml-2 h-3 w-3 opacity-70" />
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} className="max-w-xs">
          <div className="flex items-start gap-2">
            <IconComponent className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div className="text-sm">{tooltipContent}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

DisabledButtonTooltip.displayName = "DisabledButtonTooltip"

export { DisabledButtonTooltip }