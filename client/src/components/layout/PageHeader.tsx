import React from 'react';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
  className
}: PageHeaderProps) {
  const { collapsed } = useSidebar();

  return (
    <div className={cn(
      'flex flex-col space-y-4 pb-6 border-b border-gray-200 dark:border-gray-800',
      className
    )}>
      {breadcrumb && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {breadcrumb}
        </div>
      )}

      <div className={cn(
        'flex items-start justify-between',
        collapsed ? 'flex-row' : 'flex-col sm:flex-row',
        'gap-4'
      )}>
        <div className="min-w-0 flex-1">
          <h1 className={cn(
            'font-bold text-gray-900 dark:text-gray-100 tracking-tight',
            collapsed ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'
          )}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn(
              'text-gray-600 dark:text-gray-400 mt-1',
              collapsed ? 'text-sm' : 'text-base'
            )}>
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className={cn(
            'flex items-center space-x-3',
            collapsed ? 'flex-wrap gap-2' : ''
          )}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
