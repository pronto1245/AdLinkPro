import React from 'react';
import { useSidebar } from '@/contexts/sidebar-context';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ResponsiveCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'compact' | 'dashboard';
  className?: string;
}

export function ResponsiveCard({ 
  children, 
  className, 
  variant = 'default'
}: ResponsiveCardProps) {
  const { collapsed } = useSidebar();
  
  const getResponsiveClasses = () => {
    switch (variant) {
      case 'compact':
        return cn(
          collapsed ? "p-4" : "p-6",
          collapsed ? "space-y-2" : "space-y-4"
        );
      case 'dashboard':
        return cn(
          collapsed ? "p-3" : "p-4 md:p-6",
          "transition-all duration-300"
        );
      default:
        return cn(
          collapsed ? "p-4 md:p-5" : "p-6 md:p-8",
          "transition-all duration-300"
        );
    }
  };
  
  return (
    <Card 
      className={cn(
        getResponsiveClasses(),
        className
      )}
    >
      {children}
    </Card>
  );
}

export default ResponsiveCard;