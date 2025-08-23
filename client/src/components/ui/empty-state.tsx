import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  details?: {
    totalItems: number;
    dataType: string;
    isArray: boolean;
    additionalInfo?: string;
  };
  className?: string;
  showDetails?: boolean;
  onRefresh?: () => void;
}

export function EmptyState({
  icon = <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />,
  title,
  description,
  action,
  secondaryAction,
  details,
  className,
  showDetails = true,
  onRefresh,
}: EmptyStateProps) {
  const handleRefresh = () => {
    console.log('🔄 EmptyState: Forced refresh triggered', {
      timestamp: new Date().toISOString(),
      details,
    });

    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Card className={cn('', className)} data-testid="empty-state">
      <CardContent className="text-center py-8">
        {icon}
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center mb-6">
          {action && (
            <Button onClick={action.onClick} className="gap-2">
              {action.icon}
              {action.label}
            </Button>
          )}

          {onRefresh && (
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Обновить данные
            </Button>
          )}

          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline" className="gap-2">
              {secondaryAction.icon}
              {secondaryAction.label}
            </Button>
          )}
        </div>

        {/* Details Section */}
        {showDetails && details && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Отладочная информация
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  Всего: {details.totalItems}
                </Badge>
              </div>

              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  Тип: {details.dataType}
                </Badge>
              </div>

              <div className="text-center">
                <Badge
                  variant={details.isArray ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {details.isArray ? 'Массив' : 'Не массив'}
                </Badge>
              </div>

              {details.additionalInfo && (
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    {details.additionalInfo}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
