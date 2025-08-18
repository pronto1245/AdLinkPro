"use client"

import * as React from "react"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "./tooltip"
import { HelpCircle, Info, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContextualHelpProps {
  content: React.ReactNode
  title?: string
  icon?: 'help' | 'info' | 'lightbulb'
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  iconClassName?: string
  size?: 'sm' | 'md' | 'lg'
  trigger?: 'hover' | 'click'
}

const iconMap = {
  help: HelpCircle,
  info: Info,
  lightbulb: Lightbulb,
}

const sizeMap = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({
  content,
  title,
  icon = 'help',
  side = 'top',
  className,
  iconClassName,
  size = 'sm',
  trigger = 'hover'
}) => {
  const IconComponent = iconMap[icon]
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-full transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "text-muted-foreground hover:text-foreground",
              className
            )}
          >
            <IconComponent 
              className={cn(
                sizeMap[size],
                iconClassName
              )} 
            />
            <span className="sr-only">Help</span>
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs"
          onClick={(e) => trigger === 'click' && e.stopPropagation()}
        >
          <div className="space-y-1">
            {title && (
              <div className="font-semibold text-sm">{title}</div>
            )}
            <div className="text-sm">{content}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Inline help component that can be placed next to labels or inputs
interface InlineHelpProps extends Omit<ContextualHelpProps, 'className'> {
  label?: string
  children: React.ReactNode
  helpPosition?: 'after' | 'below'
  className?: string
  labelClassName?: string
}

const InlineHelp: React.FC<InlineHelpProps> = ({
  label,
  children,
  helpPosition = 'after',
  className,
  labelClassName,
  ...helpProps
}) => {
  if (helpPosition === 'below') {
    return (
      <div className={cn("space-y-1", className)}>
        {label && (
          <div className={cn("text-sm font-medium", labelClassName)}>
            {label}
          </div>
        )}
        {children}
        <div className="flex items-center gap-2">
          <ContextualHelp {...helpProps} />
          <span className="text-xs text-muted-foreground">Need help?</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className={cn("text-sm font-medium flex items-center gap-2", labelClassName)}>
          {label}
          <ContextualHelp {...helpProps} />
        </div>
      )}
      {children}
    </div>
  )
}

// Help section for forms or complex interfaces
interface HelpSectionProps {
  title: string
  items: Array<{
    label: string
    content: React.ReactNode
    icon?: 'help' | 'info' | 'lightbulb'
  }>
  className?: string
}

const HelpSection: React.FC<HelpSectionProps> = ({ 
  title, 
  items, 
  className 
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Lightbulb className="h-4 w-4" />
        {title}
      </h4>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <ContextualHelp
              content={item.content}
              icon={item.icon}
              size="sm"
            />
            <span className="text-sm text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { ContextualHelp, InlineHelp, HelpSection }