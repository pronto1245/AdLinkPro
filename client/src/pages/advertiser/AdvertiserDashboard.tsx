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

      {/* Main Statistics Row - 6 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        {/* Total Clicks */}
        <Card data-testid="card-total-clicks" className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Клики</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-900 dark:text-blue-100">{overview?.totalClicks || 0}</div>
            <p className="text-xs text-blue-700 dark:text-blue-400">всего кликов</p>
          </CardContent>
        </Card>

        {/* Conversions */}
        <Card data-testid="card-conversions" className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Конверсии</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg shadow-lg">
              <Target className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-900 dark:text-green-100">{overview?.totalConversions || 0}</div>
            <p className="text-xs text-green-700 dark:text-green-400">CR: {overview?.avgCR?.toFixed(2) || 0}%</p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card data-testid="card-revenue" className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Доход</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg shadow-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-100">${overview?.totalRevenue || 0}</div>
            <p className="text-xs text-purple-700 dark:text-purple-400">общий доход</p>
          </CardContent>
        </Card>

        {/* EPC */}
        <Card data-testid="card-epc" className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">EPC</CardTitle>
            <div className="p-2 bg-orange-500 rounded-lg shadow-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-900 dark:text-orange-100">${overview?.epc?.toFixed(2) || 0}</div>
            <p className="text-xs text-orange-700 dark:text-orange-400">за клик</p>
          </CardContent>
        </Card>

        {/* Active Offers */}
        <Card data-testid="card-active-offers" className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Офферы</CardTitle>
            <div className="p-2 bg-indigo-500 rounded-lg shadow-lg">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-indigo-900 dark:text-indigo-100">{overview?.activeOffers || 0}</div>
            <p className="text-xs text-indigo-700 dark:text-indigo-400">активных</p>
          </CardContent>
        </Card>

        {/* Partners */}
        <Card data-testid="card-partners" className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-rose-200 dark:border-rose-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-300">Партнёры</CardTitle>
            <div className="p-2 bg-rose-500 rounded-lg shadow-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-rose-900 dark:text-rose-100">{overview?.partnersCount || 0}</div>
            <p className="text-xs text-rose-700 dark:text-rose-400">подключено</p>
          </CardContent>
        </Card>
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