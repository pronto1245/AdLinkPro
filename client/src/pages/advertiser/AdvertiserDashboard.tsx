import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DatePicker } from '../../components/ui/date-picker';
import { useToast } from '../../hooks/use-toast';
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
  uniqueVisitors: number;
  totalConversions: number;
  totalRevenue: number;
  topCountry: string;
  topDevice: string;
  avgCR?: number;
  epc?: number;
  activeOffers?: number;
  partnersCount?: number;
}

interface LiveStatistics {
  date: string;
  clicks: number;
  uniqueClicks: number;
  conversions: number;
  revenue: number;
  leads?: number;
  registrations?: number;
  deposits?: number;
}

export function AdvertiserDashboard() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date}>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [filters, setFilters] = useState({
    country: 'all',
    device: 'all',
    offerId: 'all'
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/advertiser/dashboard-metrics'],
  });

  const { data: liveStats, isLoading: chartLoading } = useQuery<LiveStatistics[]>({
    queryKey: ['/api/advertiser/live-statistics', dateRange, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('dateFrom', dateRange.from.toISOString());
      if (dateRange.to) params.append('dateTo', dateRange.to.toISOString());
      if (filters.country !== 'all') params.append('country', filters.country);
      if (filters.device !== 'all') params.append('device', filters.device);
      if (filters.offerId !== 'all') params.append('offerId', filters.offerId);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/advertiser/live-statistics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn('Failed to load statistics:', response.status);
        return []; // Возвращаем пустой массив вместо ошибки
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : []; // Гарантируем массив
    },
  });

  // Обработчики кнопок
  const handleFiltersClick = () => {
    // Открываем модальное окно с фильтрами (пока просто показываем фильтры)
    toast({
      title: "Фильтры",
      description: "Фильтры уже доступны в боковой панели",
    });
  };

  const handleCalendarClick = () => {
    // Можно открыть модальное окно календаря или показать встроенный picker
    toast({
      title: "Календарь",
      description: "Используйте кнопки 7д/30д ниже для быстрого выбора периода",
    });
  };

  const handleExportClick = () => {
    if (!liveStats || !Array.isArray(liveStats) || liveStats.length === 0) {
      toast({
        title: "Нет данных",
        description: "Нет данных для экспорта",
        variant: "destructive",
      });
      return;
    }

    // Подготавливаем данные для экспорта
    const csvContent = [
      ['Дата', 'Клики', 'Уники', 'Конверсии', 'Доход', 'CR%', 'EPC'],
      ...liveStats.map(stat => [
        stat?.date || 'N/A',
        stat?.clicks || 0,
        stat?.uniqueClicks || stat?.clicks || 0,
        stat?.conversions || 0,
        (stat?.revenue || 0).toFixed(2),
        (stat?.clicks || 0) > 0 ? (((stat?.conversions || 0) / stat.clicks) * 100).toFixed(2) : '0',
        (stat?.clicks || 0) > 0 ? ((stat?.revenue || 0) / stat.clicks).toFixed(2) : '0'
      ])
    ].map(row => row.join(',')).join('\n');

    // Создаем и скачиваем файл
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: "Экспорт завершен",
      description: "Данные успешно экспортированы в CSV файл",
    });
  };

  // Вычисляем метрики из живых данных с защитой от ошибок
  const calculatedMetrics = React.useMemo(() => {
    // Проверяем что liveStats существует и является массивом
    if (!liveStats || !Array.isArray(liveStats) || liveStats.length === 0) {
      return {
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        avgCR: 0,
        epc: 0,
        activeOffers: 0,
        partnersCount: 0
      };
    }
    
    const totalClicks = liveStats.reduce((sum, stat) => sum + (stat?.clicks || 0), 0);
    const totalConversions = liveStats.reduce((sum, stat) => sum + (stat?.conversions || 0), 0);
    const totalRevenue = liveStats.reduce((sum, stat) => sum + (stat?.revenue || 0), 0);
    const avgCR = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const epc = totalClicks > 0 ? totalRevenue / totalClicks : 0;
    
    return {
      totalClicks,
      totalConversions,
      totalRevenue,
      avgCR,
      epc,
      activeOffers: 5, // Заглушка
      partnersCount: 12 // Заглушка
    };
  }, [liveStats]);

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

  const overview = metrics || calculatedMetrics;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Дашборд рекламодателя</h1>
          <p className="text-muted-foreground">Обзор ключевых метрик и управление кампаниями</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-filter" onClick={handleFiltersClick}>
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
          </Button>
          <Button variant="outline" size="sm" data-testid="button-calendar" onClick={handleCalendarClick}>
            <Calendar className="h-4 w-4 mr-2" />
            Период
          </Button>
          <Button variant="outline" size="sm" data-testid="button-export" onClick={handleExportClick}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="text-lg">Фильтры и период</CardTitle>
          <CardDescription>Настройте отображаемые данные</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Страна</label>
              <Select value={filters.country} onValueChange={(value) => setFilters({...filters, country: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите страну" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все страны</SelectItem>
                  <SelectItem value="US">США</SelectItem>
                  <SelectItem value="CA">Канада</SelectItem>
                  <SelectItem value="GB">Великобритания</SelectItem>
                  <SelectItem value="DE">Германия</SelectItem>
                  <SelectItem value="FR">Франция</SelectItem>
                  <SelectItem value="RU">Россия</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Устройство</label>
              <Select value={filters.device} onValueChange={(value) => setFilters({...filters, device: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите устройство" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все устройства</SelectItem>
                  <SelectItem value="mobile">Мобильные</SelectItem>
                  <SelectItem value="desktop">Десктоп</SelectItem>
                  <SelectItem value="tablet">Планшеты</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Оффер</label>
              <Select value={filters.offerId} onValueChange={(value) => setFilters({...filters, offerId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите оффер" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все офферы</SelectItem>
                  <SelectItem value="offer_1">Casino Royal</SelectItem>
                  <SelectItem value="offer_2">Betting Pro</SelectItem>
                  <SelectItem value="offer_3">Sports King</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Период</label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDateRange({
                    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    to: new Date()
                  })}
                  className={dateRange.from && (Date.now() - dateRange.from.getTime()) <= 7 * 24 * 60 * 60 * 1000 ? 'bg-blue-100' : ''}
                >
                  7д
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDateRange({
                    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    to: new Date()
                  })}
                  className={dateRange.from && (Date.now() - dateRange.from.getTime()) <= 30 * 24 * 60 * 60 * 1000 && (Date.now() - dateRange.from.getTime()) > 7 * 24 * 60 * 60 * 1000 ? 'bg-blue-100' : ''}
                >
                  30д
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Statistics - 2 Rows x 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

      </div>

      {/* Second Row - 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
              <LineChart data={liveStats || []}>
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
              <AreaChart data={liveStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Лиды" />
                <Area type="monotone" dataKey="registrations" stackId="1" stroke="#10b981" fill="#10b981" name="Регистрации" />
                <Area type="monotone" dataKey="conversions" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Конверсии" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Create New Offer */}
          <Link to="/advertiser/offers/create">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 text-blue-700 shadow-sm" data-testid="button-create-offer">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium">Создать оффер</span>
            </Button>
          </Link>

          {/* View Analytics */}
          <Link to="/advertiser/analytics">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 text-green-700 shadow-sm" data-testid="button-view-analytics">
              <div className="p-2 bg-green-500 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium">Аналитика</span>
            </Button>
          </Link>

          {/* Manage Partners */}
          <Link to="/advertiser/partners">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200 text-purple-700 shadow-sm" data-testid="button-manage-partners">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium">Партнёры</span>
            </Button>
          </Link>

          {/* Financial Reports */}
          <Link to="/advertiser/finances">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200 text-orange-700 shadow-sm" data-testid="button-finances">
              <div className="p-2 bg-orange-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium">Финансы</span>
            </Button>
          </Link>

          {/* Settings */}
          <Link to="/advertiser/profile">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 border-rose-200 text-rose-700 shadow-sm" data-testid="button-settings">
              <div className="p-2 bg-rose-500 rounded-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium">Настройки</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}