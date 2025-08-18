"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const EnhancedTabs = TabsPrimitive.Root

const EnhancedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground transition-all duration-200",
      className
    )}
    {...props}
  />
))
EnhancedTabsList.displayName = TabsPrimitive.List.displayName

const EnhancedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    showBadge?: boolean;
    badgeCount?: number;
    isLoading?: boolean;
  }
>(({ className, children, showBadge, badgeCount, isLoading, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-background/50 hover:text-foreground/80",
      className
    )}
    {...props}
  >
    <motion.div
      className="flex items-center gap-2"
      initial={false}
      animate={{ scale: isLoading ? 0.95 : 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
      {showBadge && badgeCount !== undefined && badgeCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground"
        >
          {badgeCount}
        </motion.span>
      )}
      {isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="ml-1 h-3 w-3 rounded-full border-2 border-current border-t-transparent"
        />
      )}
    </motion.div>
  </TabsPrimitive.Trigger>
))
EnhancedTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

interface EnhancedTabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  animationDirection?: 'horizontal' | 'vertical';
}

const EnhancedTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  EnhancedTabsContentProps
>(({ className, children, isLoading, loadingComponent, animationDirection = 'horizontal', ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 relative overflow-hidden",
      className
    )}
    {...props}
  >
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center py-8"
        >
          {loadingComponent || (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-6 w-6 rounded-full border-2 border-current border-t-transparent"
              />
              <span>Loading...</span>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ 
            opacity: 0,
            x: animationDirection === 'horizontal' ? 20 : 0,
            y: animationDirection === 'vertical' ? 20 : 0
          }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ 
            opacity: 0,
            x: animationDirection === 'horizontal' ? -20 : 0,
            y: animationDirection === 'vertical' ? -20 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </TabsPrimitive.Content>
))
EnhancedTabsContent.displayName = TabsPrimitive.Content.displayName

export { 
  EnhancedTabs, 
  EnhancedTabsList, 
  EnhancedTabsTrigger, 
  EnhancedTabsContent,
  // Export regular versions too for compatibility
  EnhancedTabs as Tabs,
  EnhancedTabsList as TabsList,
  EnhancedTabsTrigger as TabsTrigger,
  EnhancedTabsContent as TabsContent
}