import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/auth-context';
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
  Settings,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Link } from 'wouter';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

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

interface ClickMapData {
  country: string;
  clicks: number;
  color: string;
}

export default function AdvertiserDashboard() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date}>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [filters, setFilters] = useState({
    geo: 'all',
    device: 'all',
    offer: 'all'
  });

  // WebSocket integration for real-time updates
  const { connectionState, lastMessage } = useWebSocket();

  // React to WebSocket messages for live dashboard updates
  React.useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        if (data.type === 'dashboard_update') {
          // Refetch dashboard data when updates arrive
          refetch();
          toast({
            title: "Dashboard Updated",
            description: "New data received",
            variant: "default",
          });
        } else if (data.type === 'new_click' || data.type === 'new_conversion') {
          // Show real-time notification for important events
          toast({
            title: data.type === 'new_click' ? "New Click" : "New Conversion",
            description: `From ${data.country || 'Unknown'} - ${data.offer || 'Offer'}`,
            variant: "default",
          });
        }
      } catch (error) {
        console.warn('Failed to parse WebSocket message:', error);
      }
    }
  }, [lastMessage, refetch, toast]);

  // Data fetching
  const { data: metrics, isLoading: metricsLoading, refetch } = useQuery<DashboardMetrics>({
    queryKey: ['advertiser-dashboard-metrics'],
    queryFn: async () => {
      // Mock data for now - in real app this would be an API call
      return {
        totalClicks: 12845,
        uniqueVisitors: 8432,
        totalConversions: 234,
        totalRevenue: 15678.90,
        topCountry: 'US',
        topDevice: 'mobile',
        avgCR: 1.82,
        epc: 1.22,
        activeOffers: 15,
        partnersCount: 47
      };
    },
  });

  const { data: liveStats, isLoading: chartLoading } = useQuery<LiveStatistics[]>({
    queryKey: ['advertiser-live-statistics', dateRange, filters],
    queryFn: async () => {
      // Mock data for charts
      const mockData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push({
          date: date.toISOString().split('T')[0],
          clicks: Math.floor(Math.random() * 2000) + 500,
          uniqueClicks: Math.floor(Math.random() * 1500) + 400,
          conversions: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 5000) + 1000,
          leads: Math.floor(Math.random() * 30) + 5,
          registrations: Math.floor(Math.random() * 20) + 3,
          deposits: Math.floor(Math.random() * 15) + 2,
        });
      }
      return mockData;
    },
  });

  // Export functionality
  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!liveStats || liveStats.length === 0) {
        throw new Error('Нет данных для экспорта');
      }

      // Prepare CSV data
      const csvContent = [
        ['Дата', 'Клики', 'Уники', 'Конверсии', 'Доход', 'Лиды', 'Регистрации', 'Депозиты'],
        ...liveStats.map(stat => [
          stat.date,
          stat.clicks,
          stat.uniqueClicks,
          stat.conversions,
          stat.revenue.toFixed(2),
          stat.leads || 0,
          stat.registrations || 0,
          stat.deposits || 0,
        ])
      ].map(row => row.join(',')).join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `advertiser-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Экспорт завершен",
        description: "Данные успешно экспортированы в CSV файл",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка экспорта",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Click map data for visualization
  const clickMapData: ClickMapData[] = [
    { country: 'US', clicks: 4500, color: '#ef4444' },
    { country: 'CA', clicks: 2200, color: '#f59e0b' },
    { country: 'GB', clicks: 1800, color: '#10b981' },
    { country: 'DE', clicks: 1500, color: '#3b82f6' },
    { country: 'FR', clicks: 1200, color: '#8b5cf6' },
    { country: 'Other', clicks: 1645, color: '#6b7280' }
  ];

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка дашборда...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header with greeting from main branch */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('dashboard.advertiser.title', 'Панель рекламодателя')}
          </h1>
          <p className="text-muted-foreground">
            {user?.username ? 
              `${t('dashboard.welcome', 'Добро пожаловать')}, ${user.username}! ${t('dashboard.advertiser.subtitle', 'Раздел рекламодателя Affilix.Click')}` :
              t('dashboard.advertiser.subtitle', 'Добро пожаловать в Affilix.Click — раздел рекламодателя')
            }
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* WebSocket Status Indicator */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-md text-sm">
            {connectionState === WebSocket.OPEN ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-600">{t('common.connected', 'Live')}</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-600">{t('common.offline', 'Offline')}</span>
              </>
            )}
          </div>
          
          <Button variant="outline" size="icon" onClick={() => refetch()} data-testid="button-refresh" title="Обновить данные">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" onClick={() => exportMutation.mutate()} data-testid="button-export" title="Экспорт статистики">
            <Download className="h-4 w-4 mr-2" />
            {t('common.export', 'Экспорт')}
          </Button>
          
          <ThemeToggle />
          
          <Link to="/advertiser/offers/new">
            <Button data-testid="button-create-offer" title="Создать новый оффер">
              <Plus className="h-4 w-4 mr-2" />
              Новый оффер
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="text-lg">Фильтры и настройки</CardTitle>
          <CardDescription>Настройте отображение данных по вашим критериям</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filters.geo} onValueChange={(value) => setFilters(prev => ({ ...prev, geo: value }))}>
              <SelectTrigger className="w-full" data-testid="select-geo">
                <SelectValue placeholder="Гео" />
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

            <Select value={filters.device} onValueChange={(value) => setFilters(prev => ({ ...prev, device: value }))}>
              <SelectTrigger className="w-full" data-testid="select-device">
                <SelectValue placeholder="Устройство" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все устройства</SelectItem>
                <SelectItem value="mobile">Мобильные</SelectItem>
                <SelectItem value="desktop">Десктоп</SelectItem>
                <SelectItem value="tablet">Планшеты</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.offer} onValueChange={(value) => setFilters(prev => ({ ...prev, offer: value }))}>
              <SelectTrigger className="w-full" data-testid="select-offer">
                <SelectValue placeholder="Оффер" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все офферы</SelectItem>
                <SelectItem value="casino">Casino Royal</SelectItem>
                <SelectItem value="crypto">Crypto Bot</SelectItem>
                <SelectItem value="dating">Dating Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Clicks */}
        <Card data-testid="card-clicks" className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Клики</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics?.totalClicks?.toLocaleString() || '0'}</div>
            <p className="text-xs text-blue-700">всего переходов</p>
          </CardContent>
        </Card>

        {/* Conversions */}
        <Card data-testid="card-conversions" className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Конверсии</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics?.totalConversions || '0'}</div>
            <p className="text-xs text-green-700">CR: {metrics?.avgCR?.toFixed(2) || '0'}%</p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card data-testid="card-revenue" className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Доход</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">${metrics?.totalRevenue?.toFixed(2) || '0'}</div>
            <p className="text-xs text-purple-700">общий доход</p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* EPC */}
        <Card data-testid="card-epc" className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">EPC</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">${metrics?.epc?.toFixed(2) || '0'}</div>
            <p className="text-xs text-orange-700">доход за клик</p>
          </CardContent>
        </Card>

        {/* Active Offers */}
        <Card data-testid="card-active-offers" className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">Активные офферы</CardTitle>
            <BarChart3 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{metrics?.activeOffers || '0'}</div>
            <p className="text-xs text-indigo-700">запущенных кампаний</p>
          </CardContent>
        </Card>

        {/* Partners */}
        <Card data-testid="card-partners" className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-rose-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-700">Количество партнёров</CardTitle>
            <Users className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-900">{metrics?.partnersCount || '0'}</div>
            <p className="text-xs text-rose-700">подключенных вебмастеров</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Live Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Click Map */}
        <Card data-testid="card-click-map">
          <CardHeader>
            <CardTitle>Карта кликов</CardTitle>
            <CardDescription>География трафика</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={clickMapData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="clicks"
                >
                  {clickMapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Chart */}
        <Card data-testid="chart-traffic">
          <CardHeader>
            <CardTitle>Трафик</CardTitle>
            <CardDescription>Клики и уникальные посетители</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={liveStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="clicks" stroke="#3b82f6" name="Клики" />
                <Line type="monotone" dataKey="uniqueClicks" stroke="#10b981" name="Уники" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversions Chart */}
        <Card data-testid="chart-conversions">
          <CardHeader>
            <CardTitle>График конверсий</CardTitle>
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
                <Area type="monotone" dataKey="deposits" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Депозиты" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card data-testid="chart-revenue">
          <CardHeader>
            <CardTitle>Доходы</CardTitle>
            <CardDescription>Динамика заработка</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={liveStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf6" name="Доход" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <Link to="/advertiser/offers">
          <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700" data-testid="button-quick-offers">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-medium">Мои офферы</span>
          </Button>
        </Link>

        <Link to="/advertiser/partners">
          <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-700" data-testid="button-quick-partners">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Партнёры</span>
          </Button>
        </Link>

        <Link to="/advertiser/finances">
          <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700" data-testid="button-quick-finances">
            <DollarSign className="h-5 w-5" />
            <span className="text-sm font-medium">Финансы</span>
          </Button>
        </Link>

        <Link to="/advertiser/analytics">
          <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700" data-testid="button-quick-analytics">
            <Target className="h-5 w-5" />
            <span className="text-sm font-medium">Аналитика</span>
          </Button>
        </Link>

        <Link to="/dashboard/advertiser/anti-fraud">
          <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-red-50 hover:bg-red-100 border-red-200 text-red-700" data-testid="button-quick-anti-fraud">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">Антифрод</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
