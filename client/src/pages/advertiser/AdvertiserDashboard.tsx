import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Target, 
  Users, 
  DollarSign, 
  Shield, 
  Bell,
  TrendingUp,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Settings
} from 'lucide-react';
import { Link } from 'wouter';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

interface DashboardMetrics {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  avgCR: number;
  epc: number;
  activeOffers: number;
  partnersCount: number;
  fraudActivity: number;
}

interface ChartData {
  traffic: Array<{ date: string; clicks: number; uniqueClicks: number }>;
  conversions: Array<{ date: string; leads: number; registrations: number; deposits: number }>;
}

export function AdvertiserDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<{ metrics: DashboardMetrics }>({
    queryKey: ['/api/advertiser/dashboard'],
  });

  const { data: chartData, isLoading: chartLoading } = useQuery<ChartData>({
    queryKey: ['/api/advertiser/charts'],
  });

  const topOffers = [
    { id: 1, name: 'Casino Royal', cr: 15.2, status: 'active', revenue: 12500 },
    { id: 2, name: 'Betting Pro', cr: 12.8, status: 'active', revenue: 9800 },
    { id: 3, name: 'Sports King', cr: 11.5, status: 'paused', revenue: 7600 },
  ];

  const notifications = [
    { id: 1, title: 'Новый партнёр', message: 'Partner_123 подключился к офферу Casino Royal', time: '5 мин назад' },
    { id: 2, title: 'Подозрительная активность', message: 'Обнаружен фрод в оффере Betting Pro', time: '15 мин назад' },
    { id: 3, title: 'Цель достигнута', message: 'Оффер Sports King достиг 1000 конверсий', time: '1 час назад' },
  ];

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка дашборда...</div>
      </div>
    );
  }

  const overview = metrics?.metrics;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Дашборд рекламодателя</h1>
          <p className="text-muted-foreground">Обзор ключевых метрик и управление кампаниями</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-filter">
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
          </Button>
          <Button variant="outline" size="sm" data-testid="button-calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Период
          </Button>
          <Button variant="outline" size="sm" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Main Row: Conversions + Notifications + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Conversions Card */}
        <Card data-testid="card-conversions" className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Конверсии</CardTitle>
            <div className="p-3 bg-green-500 rounded-xl shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{overview?.totalConversions || 0}</div>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3 mr-1" />
              CR: {overview?.avgCR?.toFixed(2) || 0}%
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card data-testid="card-notifications" className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Уведомления</CardTitle>
            <div className="p-3 bg-amber-500 rounded-xl shadow-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{notifications.length}</div>
            <p className="text-xs text-amber-700 dark:text-amber-400">новых сообщений</p>
          </CardContent>
        </Card>

        {/* Quick Action - Traffic */}
        <Link to="/advertiser/analytics">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700" data-testid="button-quick-traffic">
            <Activity className="h-8 w-8" />
            <span className="text-sm font-medium">Аналитика трафика</span>
          </Button>
        </Link>
        
        {/* Quick Action - Analytics */}
        <Link to="/advertiser/analytics">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700" data-testid="button-quick-analytics">
            <BarChart3 className="h-8 w-8" />
            <span className="text-sm font-medium">Детальная аналитика</span>
          </Button>
        </Link>
      </div>

      {/* Bottom Row: Top Offers + Recent Notifications + Traffic Chart + Conversions Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Top Offers */}
        <Card data-testid="card-top-offers">
          <CardHeader>
            <CardTitle className="text-lg">Топ-офферы</CardTitle>
            <CardDescription>Лучшие офферы по эффективности</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topOffers.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{offer.name}</span>
                    <span className="text-xs text-muted-foreground">CR: {offer.cr}% • ${offer.revenue}</span>
                  </div>
                  <Badge variant={offer.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {offer.status === 'active' ? 'Активен' : 'Пауза'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card data-testid="card-recent-notifications">
          <CardHeader>
            <CardTitle className="text-lg">Последние уведомления</CardTitle>
            <CardDescription>Важные события системы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{notification.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{notification.message}</div>
                    <div className="text-xs text-muted-foreground mt-2">{notification.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Chart */}
        <Card data-testid="chart-traffic">
          <CardHeader>
            <CardTitle className="text-lg">Трафик по времени</CardTitle>
            <CardDescription>Клики и уникальные посетители</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData?.traffic || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="clicks" stroke="#3b82f6" name="Клики" strokeWidth={2} />
                <Line type="monotone" dataKey="uniqueClicks" stroke="#10b981" name="Уники" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversions Chart */}
        <Card data-testid="chart-conversions">
          <CardHeader>
            <CardTitle className="text-lg">Конверсии</CardTitle>
            <CardDescription>Лиды, регистрации и депозиты</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData?.conversions || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Лиды" />
                <Area type="monotone" dataKey="registrations" stackId="1" stroke="#10b981" fill="#10b981" name="Регистрации" />
                <Area type="monotone" dataKey="deposits" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Депозиты" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}