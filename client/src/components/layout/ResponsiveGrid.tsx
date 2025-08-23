import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 }, 
  gap = 4,
  className 
}: ResponsiveGridProps) {
  const getGridClasses = () => {
    const classes = ['grid'];
    
    if (cols.xs) {classes.push(`grid-cols-${cols.xs}`);}
    if (cols.sm) {classes.push(`sm:grid-cols-${cols.sm}`);}
    if (cols.md) {classes.push(`md:grid-cols-${cols.md}`);}
    if (cols.lg) {classes.push(`lg:grid-cols-${cols.lg}`);}
    if (cols.xl) {classes.push(`xl:grid-cols-${cols.xl}`);}
    
    classes.push(`gap-${gap}`);
    
    return classes.join(' ');
  };

  return (
    <div className={cn(getGridClasses(), className)}>
      {children}
    </div>
  );
}