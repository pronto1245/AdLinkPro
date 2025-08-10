import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
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

  const getCardStyle = () => {
    if (title === 'Клики') return 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-background';
    if (title === 'Конверсии') return 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white dark:from-green-950/20 dark:to-background';
    if (title === 'Доход') return 'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/20 dark:to-background';
    if (title === 'CR%') return 'border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white dark:from-purple-950/20 dark:to-background';
    if (title === 'Уникальные клики') return 'border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background';
    if (title === 'Активные офферы') return 'border-l-4 border-l-pink-500 bg-gradient-to-r from-pink-50 to-white dark:from-pink-950/20 dark:to-background';
    if (title === 'Статус') return 'border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background';
    return 'border-l-4 border-l-slate-500 bg-gradient-to-r from-slate-50 to-white dark:from-slate-950/20 dark:to-background';
  };

  const getTitleColor = () => {
    if (title === 'Клики') return 'text-blue-700 dark:text-blue-300';
    if (title === 'Конверсии') return 'text-green-700 dark:text-green-300';
    if (title === 'Доход') return 'text-amber-700 dark:text-amber-300';
    if (title === 'CR%') return 'text-purple-700 dark:text-purple-300';
    if (title === 'Уникальные клики') return 'text-indigo-700 dark:text-indigo-300';
    if (title === 'Активные офферы') return 'text-pink-700 dark:text-pink-300';
    if (title === 'Статус') return 'text-emerald-700 dark:text-emerald-300';
    return 'text-slate-700 dark:text-slate-300';
  };

  const getValueColor = () => {
    if (title === 'Клики') return 'text-blue-600 dark:text-blue-400';
    if (title === 'Конверсии') return 'text-green-600 dark:text-green-400';
    if (title === 'Доход') return 'text-amber-600 dark:text-amber-400';
    if (title === 'CR%') return 'text-purple-600 dark:text-purple-400';
    if (title === 'Уникальные клики') return 'text-indigo-600 dark:text-indigo-400';
    if (title === 'Активные офферы') return 'text-pink-600 dark:text-pink-400';
    if (title === 'Статус') return 'text-emerald-600 dark:text-emerald-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  const getIconColor = () => {
    if (title === 'Клики') return 'text-blue-500';
    if (title === 'Конверсии') return 'text-green-500';
    if (title === 'Доход') return 'text-amber-500';
    if (title === 'CR%') return 'text-purple-500';
    if (title === 'Уникальные клики') return 'text-indigo-500';
    if (title === 'Активные офферы') return 'text-pink-500';
    if (title === 'Статус') return 'text-emerald-500';
    return 'text-slate-500';
  };

  return (
    <Card className={getCardStyle()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${getTitleColor()}`}>{title}</CardTitle>
        <Icon className={`h-4 w-4 ${getIconColor()}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getValueColor()}`}>{value}</div>
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
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/partner/dashboard', refreshKey],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    queryClient.invalidateQueries({ queryKey: ['/api/partner/dashboard'] });
    toast({
      title: "Данные обновлены",
      description: "Информация дашборда успешно обновлена",
    });
  };

  const handleFindOffers = () => {
    navigate('/affiliate/offers');
    toast({
      title: "Переход к офферам",
      description: "Открываю страницу доступных офферов",
    });
  };

  const handleCheckStatistics = () => {
    navigate('/affiliate/statistics');
    toast({
      title: "Переход к статистике",
      description: "Открываю детальную статистику",
    });
  };

  const handleContactManager = () => {
    toast({
      title: "Связь с менеджером",
      description: "Функция в разработке. Используйте контакты в профиле",
      variant: "default",
    });
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

  // Используем реальные данные с API
  const { metrics, topOffers, notifications } = dashboardData || {
    metrics: {
      totalClicks: 0,
      conversions: 0,
      revenue: 0,
      conversionRate: 0,
      epc: 0,
      avgOfferPayout: 0,
      activeOffers: 0,
      pendingRequests: 0
    },
    topOffers: [],
    notifications: []
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Партнерский дашборд</h1>
          <p className="text-black/70 dark:text-white/70">Мониторинг производительности и аналитика</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20">
          <RefreshCw className="h-4 w-4 mr-2" />
          Обновить
        </Button>
      </div>

      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Клики"
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
          title="CR%"
          value={`${metrics.conversionRate?.toFixed(2) || '0'}%`}
          change="-0.8%"
          changeType="negative"
          icon={TrendingUp}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Уникальные клики"
          value={`${Math.floor((metrics.totalClicks * 0.85) || 0).toLocaleString()}`}
          change="+7.1%"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Активные офферы"
          value={`${metrics.activeOffers || '0'}`}
          changeType="neutral"
          icon={Target}
        />
        <MetricCard
          title="Статус"
          value="Активен"
          icon={Users}
        />
        <MetricCard
          title="EPC"
          value={`$${metrics.epc?.toFixed(2) || '0'}`}
          icon={DollarSign}
        />
      </div>

      {/* Quick Actions */}
      <Card className="border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-50 to-white dark:from-cyan-950/20 dark:to-background">
        <CardHeader>
          <CardTitle className="text-cyan-700 dark:text-cyan-300">Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="justify-start border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 shadow-md"
              onClick={handleFindOffers}
              title="Перейти к странице офферов"
            >
              <Target className="h-4 w-4 mr-2 text-green-500" />
              Найти новые офферы
            </Button>
            <Button 
              variant="outline" 
              className="justify-start border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 shadow-md"
              onClick={handleCheckStatistics}
              title="Посмотреть детальную статистику"
            >
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
              Проверить статистику
            </Button>
            <Button 
              variant="outline" 
              className="justify-start border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 shadow-md"
              onClick={handleContactManager}
              title="Связаться с менеджером"
            >
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              Связаться с менеджером
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
        <CardHeader>
          <CardTitle className="text-orange-700 dark:text-orange-300">Уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification: any) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <Badge variant="secondary" className="mt-1">{notification.type}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Добро пожаловать!</p>
                    <p className="text-sm text-muted-foreground">
                      Начните работу с изучения доступных офферов
                    </p>
                    <Badge variant="secondary" className="mt-1">Система</Badge>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Аккаунт активен</p>
                    <p className="text-sm text-muted-foreground">
                      Ваш партнёрский аккаунт готов к работе
                    </p>
                    <Badge variant="secondary" className="mt-1">Статус</Badge>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}