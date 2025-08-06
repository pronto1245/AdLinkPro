import React from 'react';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  columns = 3, 
  gap = 'md', 
  className 
}: ResponsiveGridProps) {
  const { collapsed } = useSidebar();
  
  const getGridClasses = () => {
    const gapClasses = {
      sm: collapsed ? 'gap-3' : 'gap-4',
      md: collapsed ? 'gap-4' : 'gap-6',
      lg: collapsed ? 'gap-6' : 'gap-8'
    };
    
    // Адаптивные колонки в зависимости от состояния сайдбара
    const columnClasses = {
      1: 'grid-cols-1',
      2: collapsed ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2',
      3: collapsed 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
      4: collapsed 
        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
      5: collapsed
        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5',
      6: collapsed
        ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
    };
    
    return cn(
      'grid',
      gapClasses[gap],
      columnClasses[columns],
      'transition-all duration-300'
    );
  };
  
  return (
    <div className={cn(getGridClasses(), className)}>
      {children}
    </div>
  );
}

export default ResponsiveGrid;