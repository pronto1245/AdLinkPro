import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  MousePointer,
  Target,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

const MetricCard = ({ title, value, change, changeType, icon: Icon }: MetricCardProps) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return <TrendingUp className="h-3 w-3" />;
    if (changeType === 'negative') return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className={`flex items-center gap-1 text-xs ${getChangeColor()}`}>
            {getChangeIcon()}
            <span>{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function PartnerDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/partner/dashboard', refreshKey],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    queryClient.invalidateQueries({ queryKey: ['/api/partner/dashboard'] });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold">Ошибка загрузки данных</h3>
          <p className="text-muted-foreground">Не удалось загрузить данные дашборда</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Повторить
          </Button>
        </div>
      </div>
    );
  }

  // Mock data для демонстрации пока не исправлен backend
  const mockData = {
    metrics: {
      totalClicks: 1250,
      conversions: 48,
      revenue: 2840.50,
      conversionRate: 3.84,
      epc: 2.27,
      avgOfferPayout: 59.18,
      activeOffers: 12,
      pendingRequests: 3
    }
  };

  const { metrics } = dashboardData || mockData;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Партнерский дашборд</h1>
          <p className="text-muted-foreground">Мониторинг производительности и аналитика</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Обновить
        </Button>
      </div>

      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Всего кликов"
          value={metrics.totalClicks?.toLocaleString() || '0'}
          change="+12.5%"
          changeType="positive"
          icon={MousePointer}
        />
        <MetricCard
          title="Конверсии"
          value={metrics.conversions?.toLocaleString() || '0'}
          change="+5.2%"
          changeType="positive"
          icon={Target}
        />
        <MetricCard
          title="Доход"
          value={`$${metrics.revenue?.toLocaleString() || '0'}`}
          change="+18.3%"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="CR"
          value={`${metrics.conversionRate?.toFixed(2) || '0'}%`}
          change="-0.8%"
          changeType="negative"
          icon={TrendingUp}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="EPC"
          value={`$${metrics.epc?.toFixed(2) || '0'}`}
          change="+7.1%"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="Средний payout"
          value={`$${metrics.avgOfferPayout?.toFixed(2) || '0'}`}
          changeType="neutral"
          icon={DollarSign}
        />
        <MetricCard
          title="Активные офферы"
          value={metrics.activeOffers || '0'}
          icon={Users}
        />
        <MetricCard
          title="Ожидают одобрения"
          value={metrics.pendingRequests || '0'}
          icon={AlertTriangle}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <Target className="h-4 w-4 mr-2" />
              Найти новые офферы
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Проверить статистику
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              Связаться с менеджером
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Target className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Новый оффер доступен</p>
                <p className="text-sm text-muted-foreground">
                  "Crypto Trading Pro" - высокий payout $120
                </p>
                <Badge variant="secondary" className="mt-1">Финансы</Badge>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Запрос одобрен</p>
                <p className="text-sm text-muted-foreground">
                  Доступ к "Aviator Game" получен
                </p>
                <Badge variant="secondary" className="mt-1">Игры</Badge>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Требует внимания</p>
                <p className="text-sm text-muted-foreground">
                  Низкая конверсия по офферу "VPN Service"
                </p>
                <Badge variant="secondary" className="mt-1">Оптимизация</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}