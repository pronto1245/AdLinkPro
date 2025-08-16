import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Clock, DollarSign, Shield, User } from 'lucide-react';

// Безопасная функция для форматирования дат
const safeFormatDate = (dateString: string, defaultText = 'Дата неизвестна') => {
  try {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return defaultText;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date for formatting:', dateString);
      return defaultText;
    }
    
    return date.toLocaleString('ru-RU');
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return defaultText;
  }
};

interface EventHistoryItem {
  id: string;
  type: 'reg' | 'purchase';
  clickid: string;
  txid: string;
  value?: number;
  currency?: string;
  status: string;
  antifraudLevel?: string;
  createdAt: string;
}

interface EventHistoryProps {
  events?: EventHistoryItem[];
  isLoading?: boolean;
}

export function EventHistory({ events = [], isLoading = false }: EventHistoryProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reg': return <User className="h-4 w-4" />;
      case 'purchase': return <DollarSign className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'reg': return 'Регистрация';
      case 'purchase': return 'Покупка';
      default: return type;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'initiated': return 'default';
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'declined': return 'destructive';
      default: return 'outline';
    }
  };

  const getAntifraudColor = (level?: string) => {
    switch (level) {
      case 'ok': return 'text-green-600';
      case 'soft': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            История событий
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          История событий
        </CardTitle>
        <CardDescription>
          Последние отправленные события
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Нет отправленных событий
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(event.type)}
                      <span className="font-medium">{getTypeLabel(event.type)}</span>
                      <Badge variant={getStatusVariant(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    {event.antifraudLevel && (
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        <span className={`text-sm font-medium ${getAntifraudColor(event.antifraudLevel)}`}>
                          {event.antifraudLevel.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Click ID:</span>
                      <code className="ml-1 bg-muted px-1 rounded text-xs">
                        {event.clickid}
                      </code>
                    </div>
                    <div>
                      <span className="font-medium">TX ID:</span>
                      <code className="ml-1 bg-muted px-1 rounded text-xs">
                        {event.txid}
                      </code>
                    </div>
                  </div>
                  
                  {event.value && (
                    <div className="text-sm">
                      <span className="font-medium">Сумма:</span>
                      <span className="ml-1">
                        {event.value} {event.currency || 'USD'}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {safeFormatDate(event.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}