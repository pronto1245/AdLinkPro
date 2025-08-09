import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { ResponsiveCard } from "@/components/layout/ResponsiveCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Target, 
  Users, 
  BarChart3, 
  Settings, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  User,
  Briefcase,
  Wallet,
  Send,
  Building2,
  Bell,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Shield,
  Eye,
  FileText,
  Download,
  Upload,
  RefreshCw,
  MousePointer,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface DashboardData {
  overview: {
    totalOffers: number;
    activeOffers: number;
    pendingOffers: number;
    rejectedOffers: number;
    totalBudget: number;
    totalSpent: number;
    advertiserRevenue: number;
    partnersCount: number;
    avgCR: number;
    epc: number;
    postbacksSent: number;
    postbacksReceived: number;
    postbackErrors: number;
    fraudActivity: number;
    offersChange: number;
    budgetChange: number;
    revenueChange: number;
    partnersChange: number;
    crChange: number;
    epcChange: number;
    postbacksChange: number;
    fraudChange: number;
  };
  chartData: {
    traffic: Array<{ date: string; clicks: number; uniqueClicks: number }>;
    conversions: Array<{ date: string; leads: number; registrations: number; deposits: number }>;
    spending: Array<{ date: string; spent: number; payouts: number }>;
    postbacks: Array<{ date: string; sent: number; successful: number; failed: number }>;
    fraud: Array<{ date: string; detected: number; blocked: number }>;
  };
  topOffers: Array<{
    id: string;
    name: string;
    status: 'active' | 'pending' | 'rejected' | 'paused' | 'archived';
    clicks: number;
    cr: number;
    conversions: number;
    spent: number;
    postbacks: number;
    fraudRate: number;
  }>;
  notifications: Array<{
    id: string;
    type: 'partner_request' | 'postback_error' | 'offer_pending' | 'fraud_alert' | 'traffic_issue';
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high';
  }>;
  offerStatus: {
    pending: number;
    active: number;
    hidden: number;
    archived: number;
  };
}

export default function AdvertiserDashboard() {
  const { user } = useAuth();
  const { collapsed } = useSidebar();
  const queryClient = useQueryClient();
  
  // Состояние фильтров
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [filters, setFilters] = useState({
    period: '7d',
    geo: 'all',
    device: 'all',
    offerId: 'all',
    status: 'all'
  });

  // Получение данных дашборда
  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['/api/advertiser/dashboard', dateRange, filters],
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000,
  }) as { data: DashboardData | undefined; isLoading: boolean; refetch: () => void };

  // Мутации для действий
  const exportMutation = useMutation({
    mutationFn: (format: 'csv' | 'excel') => {
      // Заглушка для экспорта
      return Promise.resolve();
    },
    onSuccess: () => {
      alert('Статистика экспортирована успешно');
    }
  });

  const markNotificationRead = useMutation({
    mutationFn: (notificationId: string) => {
      // Заглушка для уведомлений
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/dashboard'] });
    }
  });

  // Обработчики фильтров
  const handlePeriodChange = (period: string) => {
    const now = new Date();
    let from: Date;
    
    switch (period) {
      case '1d':
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    setDateRange({ from, to: now });
    setFilters(prev => ({ ...prev, period }));
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, text: 'Активный' },
      pending: { variant: 'secondary' as const, text: 'На модерации' },
      rejected: { variant: 'destructive' as const, text: 'Отклонён' },
      paused: { variant: 'outline' as const, text: 'Приостановлен' },
      archived: { variant: 'secondary' as const, text: 'Архив' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'partner_request': return <Users className="h-4 w-4 text-blue-600" />;
      case 'postback_error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'offer_pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'fraud_alert': return <Shield className="h-4 w-4 text-red-600" />;
      case 'traffic_issue': return <Activity className="h-4 w-4 text-orange-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-6", collapsed ? "p-4" : "p-6")}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const overview = dashboard?.overview;
  const chartData = dashboard?.chartData;
  const topOffers = dashboard?.topOffers || [];
  const notifications = dashboard?.notifications || [];

  return (
    <div className={cn("space-y-6", collapsed ? "p-4" : "p-6")}>
      <PageHeader
        title="Дашборд рекламодателя"
        subtitle="Обзор эффективности ваших офферов и взаимодействия с партнёрами"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()} data-testid="button-refresh" title="Обновить данные">
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" onClick={() => exportMutation.mutate('excel')} data-testid="button-export" title="Экспорт статистики">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            
            <Link to="/advertiser/offers/new">
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-offer" title="Создать новый оффер">
                <Plus className="h-4 w-4 mr-2" />
                Новый оффер
              </Button>
            </Link>
          </div>
        }
      />

      {/* Фильтры */}
      <ResponsiveCard variant="compact" className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
        <div className={cn(
          "grid gap-3 items-center",
          collapsed ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
        )}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Период</label>
            <Select value={filters.period} onValueChange={handlePeriodChange} data-testid="select-period">
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Сегодня</SelectItem>
                <SelectItem value="7d">7 дней</SelectItem>
                <SelectItem value="30d">30 дней</SelectItem>
                <SelectItem value="90d">3 месяца</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ResponsiveCard>

      {/* Основные метрики */}
      <ResponsiveGrid columns={4}>
        {/* Количество офферов */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Офферы</CardTitle>
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{overview?.totalOffers || 0}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {getChangeIcon(overview?.offersChange || 0)}
              <span className={getChangeColor(overview?.offersChange || 0)}>
                {overview?.offersChange ? `${overview.offersChange > 0 ? '+' : ''}${overview.offersChange}%` : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Доходы */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Доходы</CardTitle>
            <div className="p-3 bg-green-500 rounded-xl shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{formatCurrency(overview?.advertiserRevenue || 0)}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {getChangeIcon(overview?.revenueChange || 0)}
              <span className={getChangeColor(overview?.revenueChange || 0)}>
                {overview?.revenueChange ? `${overview.revenueChange > 0 ? '+' : ''}${overview.revenueChange}%` : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Партнеры */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Партнеры</CardTitle>
            <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{overview?.partnersCount || 0}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {getChangeIcon(overview?.partnersChange || 0)}
              <span className={getChangeColor(overview?.partnersChange || 0)}>
                {overview?.partnersChange ? `${overview.partnersChange > 0 ? '+' : ''}${overview.partnersChange}%` : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Конверсия */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Конверсия</CardTitle>
            <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{overview?.avgCR ? `${overview.avgCR}%` : '0%'}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {getChangeIcon(overview?.crChange || 0)}
              <span className={getChangeColor(overview?.crChange || 0)}>
                {overview?.crChange ? `${overview.crChange > 0 ? '+' : ''}${overview.crChange}%` : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Дополнительные метрики */}
      <ResponsiveGrid columns={4}>
        {/* Расходы */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Расходы</CardTitle>
            <div className="p-3 bg-red-500 rounded-xl shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{formatCurrency(overview?.totalSpent || 0)}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {getChangeIcon(overview?.budgetChange || 0)}
              <span className={getChangeColor(overview?.budgetChange || 0)}>
                {overview?.budgetChange ? `${overview.budgetChange > 0 ? '+' : ''}${overview.budgetChange}%` : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* EPC */}
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-300">EPC</CardTitle>
            <div className="p-3 bg-teal-500 rounded-xl shadow-lg">
              <MousePointer className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">{formatCurrency(overview?.epc || 0)}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {getChangeIcon(overview?.epcChange || 0)}
              <span className={getChangeColor(overview?.epcChange || 0)}>
                {overview?.epcChange ? `${overview.epcChange > 0 ? '+' : ''}${overview.epcChange}%` : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Постбэки */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Постбэки</CardTitle>
            <div className="p-3 bg-indigo-500 rounded-xl shadow-lg">
              <Send className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{overview?.postbacksSent || 0}</div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
              Ошибок: {overview?.postbackErrors || 0}
            </div>
          </CardContent>
        </Card>

        {/* Антифрод */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Фрод активность</CardTitle>
            <div className="p-3 bg-yellow-500 rounded-xl shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{overview?.fraudActivity || 0}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {getChangeIcon(overview?.fraudChange || 0)}
              <span className={getChangeColor(overview?.fraudChange || 0)}>
                {overview?.fraudChange ? `${overview.fraudChange > 0 ? '+' : ''}${overview.fraudChange}%` : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Графики */}
      <ResponsiveGrid columns={2}>
        {/* Трафик */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Трафик</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Клики</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Уникальные</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData?.traffic || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="uniqueClicks" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Конверсии */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Конверсии</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Лиды</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Депозиты</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData?.conversions || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Area type="monotone" dataKey="leads" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="deposits" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Топ офферы и уведомления */}
      <ResponsiveGrid columns={2}>
        {/* Топ офферы */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Топ офферы</CardTitle>
              <Link to="/advertiser/offers">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  Все офферы
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOffers.slice(0, 5).map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{offer.name}</h4>
                      {getStatusBadge(offer.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Клики: {formatNumber(offer.clicks)}</span>
                      <span>CR: {offer.cr}%</span>
                      <span>Фрод: {offer.fraudRate}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">{formatCurrency(offer.spent)}</div>
                    <div className="text-xs text-muted-foreground">{offer.conversions} конв.</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Уведомления */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Уведомления</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                Все уведомления
                <Bell className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    notification.isRead 
                      ? "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700" 
                      : "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-l-4 border-blue-500"
                  )}
                  onClick={() => markNotificationRead.mutate(notification.id)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn("text-sm font-medium", !notification.isRead && "text-blue-900 dark:text-blue-100")}>
                      {notification.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.createdAt}</p>
                  </div>
                  {notification.priority === 'high' && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link to="/advertiser/offers/new">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-200">
                <Plus className="h-6 w-6 text-blue-600" />
                <span className="text-xs">Новый оффер</span>
              </Button>
            </Link>
            
            <Link to="/advertiser/analytics">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-200">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <span className="text-xs">Аналитика</span>
              </Button>
            </Link>
            
            <Link to="/advertiser/partners">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-200">
                <Users className="h-6 w-6 text-purple-600" />
                <span className="text-xs">Партнеры</span>
              </Button>
            </Link>
            
            <Link to="/advertiser/finances">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2 hover:bg-yellow-50 hover:border-yellow-200">
                <Wallet className="h-6 w-6 text-yellow-600" />
                <span className="text-xs">Финансы</span>
              </Button>
            </Link>
            
            <Link to="/advertiser/antifraud">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2 hover:bg-red-50 hover:border-red-200">
                <Shield className="h-6 w-6 text-red-600" />
                <span className="text-xs">Антифрод</span>
              </Button>
            </Link>
            
            <Link to="/advertiser/profile">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center gap-2 hover:bg-gray-50 hover:border-gray-200">
                <Settings className="h-6 w-6 text-gray-600" />
                <span className="text-xs">Настройки</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}