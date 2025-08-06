import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
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
import RoleBasedLayout from "@/components/layout/RoleBasedLayout";
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
  Calendar,
  Filter,
  AlertTriangle,
  Copy,
  ExternalLink,
  MousePointer,
  Zap,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Pause,
  Archive,
  Edit,
  Trash2,
  Search,
  SortAsc,
  SortDesc
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
    // Изменения по сравнению с предыдущим периодом
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
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('day');

  // Получение данных дашборда
  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['/api/advertiser/dashboard', dateRange, filters],
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Обновление каждые 5 минут
  }) as { data: DashboardData | undefined; isLoading: boolean; refetch: () => void };

  // Мутации для действий
  const exportMutation = useMutation({
    mutationFn: (format: 'csv' | 'excel') => apiRequest('/api/advertiser/export', {
      method: 'POST',
      body: { format, dateRange, filters }
    }),
    onSuccess: () => {
      alert('Статистика экспортирована успешно');
    }
  });

  const markNotificationRead = useMutation({
    mutationFn: (notificationId: string) => apiRequest(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH'
    }),
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
      <RoleBasedLayout>
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  const overview = dashboard?.overview;
  const chartData = dashboard?.chartData;
  const topOffers = dashboard?.topOffers || [];
  const notifications = dashboard?.notifications || [];

  return (
    <RoleBasedLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Заголовок и основные действия */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Дашборд рекламодателя</h1>
            <p className="text-muted-foreground">
              Обзор эффективности ваших офферов и взаимодействия с партнёрами
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()} data-testid="button-refresh" title="Обновить данные">
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" onClick={() => exportMutation.mutate('excel')} data-testid="button-export" title="Экспорт статистики">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            
            <Link to="/advertiser/offers/new">
              <Button data-testid="button-create-offer" title="Создать новый оффер">
                <Plus className="h-4 w-4 mr-2" />
                Новый оффер
              </Button>
            </Link>
          </div>
        </div>

        {/* Интерактивные фильтры */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Фильтры и период</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Select value={filters.period} onValueChange={handlePeriodChange} data-testid="select-period">
                <SelectTrigger>
                  <SelectValue placeholder="Период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Сегодня</SelectItem>
                  <SelectItem value="7d">7 дней</SelectItem>
                  <SelectItem value="30d">30 дней</SelectItem>
                  <SelectItem value="90d">3 месяца</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.geo} onValueChange={(value) => setFilters(prev => ({ ...prev, geo: value }))} data-testid="select-geo">
                <SelectTrigger>
                  <SelectValue placeholder="Страна" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все страны</SelectItem>
                  <SelectItem value="IN">Индия</SelectItem>
                  <SelectItem value="BR">Бразилия</SelectItem>
                  <SelectItem value="RU">Россия</SelectItem>
                  <SelectItem value="BD">Бангладеш</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.device} onValueChange={(value) => setFilters(prev => ({ ...prev, device: value }))} data-testid="select-device">
                <SelectTrigger>
                  <SelectValue placeholder="Устройство" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все устройства</SelectItem>
                  <SelectItem value="mobile">Мобильные</SelectItem>
                  <SelectItem value="desktop">Десктоп</SelectItem>
                  <SelectItem value="tablet">Планшеты</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.offerId} onValueChange={(value) => setFilters(prev => ({ ...prev, offerId: value }))} data-testid="select-offer">
                <SelectTrigger>
                  <SelectValue placeholder="Оффер" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все офферы</SelectItem>
                  {topOffers.slice(0, 5).map((offer) => (
                    <SelectItem key={offer.id} value={offer.id}>{offer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))} data-testid="select-status">
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="pending">На модерации</SelectItem>
                  <SelectItem value="paused">Приостановлены</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateRange.from.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                  className="w-auto"
                  data-testid="input-date-from"
                />
                <span className="text-muted-foreground">до</span>
                <Input
                  type="date"
                  value={dateRange.to.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                  className="w-auto"
                  data-testid="input-date-to"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Быстрые действия */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Link to="/analytics/traffic">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700" data-testid="button-quick-traffic" title="Анализ трафика">
              <Activity className="h-5 w-5" />
              <span className="text-sm font-medium">Трафик</span>
            </Button>
          </Link>
          
          <Link to="/analytics/conversions">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-700" data-testid="button-quick-conversions" title="Анализ конверсий">
              <Target className="h-5 w-5" />
              <span className="text-sm font-medium">Конверсии</span>
            </Button>
          </Link>
          
          <Link to="/advertiser/finances">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700" data-testid="button-quick-spending" title="История расходов">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">Расходы</span>
            </Button>
          </Link>
          
          <Link to="/advertiser/postbacks">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700" data-testid="button-quick-postbacks" title="Управление постбеками">
              <Send className="h-5 w-5" />
              <span className="text-sm font-medium">Постбеки</span>
            </Button>
          </Link>
          
          <Link to="/fraud-detection">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-red-50 hover:bg-red-100 border-red-200 text-red-700" data-testid="button-quick-fraud" title="Антифрод система">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Фрод</span>
            </Button>
          </Link>
        </div>

        {/* Карточки основных метрик KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Количество офферов */}
          <Card data-testid="card-offers">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Офферы</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalOffers || 0}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {getChangeIcon(overview?.offersChange || 0)}
                <span className={getChangeColor(overview?.offersChange || 0)}>
                  {overview?.offersChange ? `${overview.offersChange > 0 ? '+' : ''}${overview.offersChange}%` : '0%'}
                </span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                <span className="text-green-600">Активных: {overview?.activeOffers || 0}</span>
                <span className="text-yellow-600">На модерации: {overview?.pendingOffers || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Бюджет / Расход */}
          <Card data-testid="card-budget">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Бюджет / Расход</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overview?.totalSpent || 0)}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {getChangeIcon(overview?.budgetChange || 0)}
                <span className={getChangeColor(overview?.budgetChange || 0)}>
                  {overview?.budgetChange ? `${overview.budgetChange > 0 ? '+' : ''}${overview.budgetChange}%` : '0%'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">из {formatCurrency(overview?.totalBudget || 0)}</p>
              <Progress 
                value={overview?.totalBudget ? (overview.totalSpent / overview.totalBudget) * 100 : 0} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          {/* Доход рекламодателя */}
          <Card data-testid="card-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Доход рекламодателя</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overview?.advertiserRevenue || 0)}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {getChangeIcon(overview?.revenueChange || 0)}
                <span className={getChangeColor(overview?.revenueChange || 0)}>
                  {overview?.revenueChange ? `${overview.revenueChange > 0 ? '+' : ''}${overview.revenueChange}%` : '0%'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">выплачено платформе</p>
            </CardContent>
          </Card>

          {/* Постбеки */}
          <Card data-testid="card-postbacks">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Постбеки</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.postbacksSent || 0}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {getChangeIcon(overview?.postbacksChange || 0)}
                <span className={getChangeColor(overview?.postbacksChange || 0)}>
                  {overview?.postbacksChange ? `${overview.postbacksChange > 0 ? '+' : ''}${overview.postbacksChange}%` : '0%'}
                </span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600">Получено: {overview?.postbacksReceived || 0}</span>
                <span className="text-red-600">Ошибок: {overview?.postbackErrors || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Партнёры */}
          <Card data-testid="card-partners">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Партнёры</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.partnersCount || 0}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {getChangeIcon(overview?.partnersChange || 0)}
                <span className={getChangeColor(overview?.partnersChange || 0)}>
                  {overview?.partnersChange ? `${overview.partnersChange > 0 ? '+' : ''}${overview.partnersChange}%` : '0%'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">работают с офферами</p>
            </CardContent>
          </Card>

          {/* CR (Conversion Rate) */}
          <Card data-testid="card-cr">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CR (%)</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.avgCR?.toFixed(2) || 0}%</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {getChangeIcon(overview?.crChange || 0)}
                <span className={getChangeColor(overview?.crChange || 0)}>
                  {overview?.crChange ? `${overview.crChange > 0 ? '+' : ''}${overview.crChange}%` : '0%'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">средний по офферам</p>
            </CardContent>
          </Card>

          {/* EPC (Earnings Per Click) */}
          <Card data-testid="card-epc">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">EPC ($)</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${overview?.epc?.toFixed(2) || 0}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {getChangeIcon(overview?.epcChange || 0)}
                <span className={getChangeColor(overview?.epcChange || 0)}>
                  {overview?.epcChange ? `${overview.epcChange > 0 ? '+' : ''}${overview.epcChange}%` : '0%'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">по всем кликам</p>
            </CardContent>
          </Card>

          {/* Фрод-активность */}
          <Card data-testid="card-fraud">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Фрод-активность</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overview?.fraudActivity || 0}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {getChangeIcon(overview?.fraudChange || 0)}
                <span className={getChangeColor(overview?.fraudChange || 0)}>
                  {overview?.fraudChange ? `${overview.fraudChange > 0 ? '+' : ''}${overview.fraudChange}%` : '0%'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">случаев за период</p>
            </CardContent>
          </Card>
        </div>

        {/* Интерактивные графики */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Аналитические графики</CardTitle>
              <Select value={chartPeriod} onValueChange={(value: 'day' | 'week' | 'month') => setChartPeriod(value)} data-testid="select-chart-period">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">День</SelectItem>
                  <SelectItem value="week">Неделя</SelectItem>
                  <SelectItem value="month">Месяц</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="traffic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="traffic" data-testid="tab-traffic">Трафик</TabsTrigger>
                <TabsTrigger value="conversions" data-testid="tab-conversions">Конверсии</TabsTrigger>
                <TabsTrigger value="spending" data-testid="tab-spending">Расходы</TabsTrigger>
                <TabsTrigger value="postbacks" data-testid="tab-postbacks">Постбеки</TabsTrigger>
              </TabsList>

              <TabsContent value="traffic" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData?.traffic || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="clicks" stroke="#3b82f6" name="Клики" strokeWidth={2} />
                      <Line type="monotone" dataKey="uniqueClicks" stroke="#10b981" name="Уникальные" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="conversions" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
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
                </div>
              </TabsContent>

              <TabsContent value="spending" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData?.spending || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="spent" fill="#ef4444" name="Расходы" />
                      <Bar dataKey="payouts" fill="#10b981" name="Выплаты" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="postbacks" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData?.postbacks || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sent" stroke="#3b82f6" name="Отправлено" strokeWidth={2} />
                      <Line type="monotone" dataKey="successful" stroke="#10b981" name="Успешно" strokeWidth={2} />
                      <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Ошибки" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Нижняя секция: Таблица топ-офферов, статус офферов и уведомления */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Таблица топ-офферов */}
          <Card className="lg:col-span-2" data-testid="table-top-offers">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Топ-офферы рекламодателя</CardTitle>
                  <CardDescription>Сортируемая таблица с основными метриками</CardDescription>
                </div>
                <Link to="/advertiser/offers">
                  <Button variant="outline" size="sm" data-testid="button-view-all-offers" title="Посмотреть все офферы">
                    <Eye className="h-4 w-4 mr-2" />
                    Все офферы
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-muted/50" data-testid="sort-offer">
                      Оффер <SortAsc className="h-3 w-3 inline ml-1" />
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" data-testid="sort-status">
                      Статус
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" data-testid="sort-clicks">
                      Клики <SortDesc className="h-3 w-3 inline ml-1" />
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" data-testid="sort-cr">
                      CR
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" data-testid="sort-conversions">
                      Конверсии
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" data-testid="sort-spent">
                      Расход
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" data-testid="sort-postbacks">
                      Постбеки
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" data-testid="sort-fraud">
                      Фрод %
                    </TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topOffers.map((offer) => (
                    <TableRow key={offer.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link to={`/advertiser/offers/${offer.id}`} className="hover:underline">
                          {offer.name}
                        </Link>
                      </TableCell>
                      <TableCell>{getStatusBadge(offer.status)}</TableCell>
                      <TableCell className="font-mono">{formatNumber(offer.clicks)}</TableCell>
                      <TableCell className="font-mono">{offer.cr.toFixed(2)}%</TableCell>
                      <TableCell className="font-mono">{formatNumber(offer.conversions)}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(offer.spent)}</TableCell>
                      <TableCell className="font-mono">{offer.postbacks}</TableCell>
                      <TableCell className={cn(
                        "font-mono",
                        offer.fraudRate > 5 ? 'text-red-600' : offer.fraudRate > 2 ? 'text-yellow-600' : 'text-green-600'
                      )}>
                        {offer.fraudRate.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Link to={`/advertiser/offers/${offer.id}`}>
                            <Button variant="ghost" size="sm" data-testid={`button-view-${offer.id}`} title="Просмотр офера">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Link to={`/advertiser/offers/${offer.id}/edit`}>
                            <Button variant="ghost" size="sm" data-testid={`button-edit-${offer.id}`} title="Редактировать оффер">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" data-testid={`button-more-${offer.id}`} title="Больше действий">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Боковая панель: Статус офферов и уведомления */}
          <div className="space-y-6">
            {/* Статус по офферам */}
            <Card data-testid="card-offer-status">
              <CardHeader>
                <CardTitle>Статус по офферам</CardTitle>
                <CardDescription>Визуализация статуса ваших офферов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">На модерации</span>
                  </div>
                  <Badge variant="secondary">{dashboard?.offerStatus?.pending || 0}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Активные</span>
                  </div>
                  <Badge variant="default">{dashboard?.offerStatus?.active || 0}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Pause className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Скрытые</span>
                  </div>
                  <Badge variant="outline">{dashboard?.offerStatus?.hidden || 0}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Архив</span>
                  </div>
                  <Badge variant="secondary">{dashboard?.offerStatus?.archived || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Уведомления */}
            <Card data-testid="card-notifications">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Уведомления / Задачи</CardTitle>
                    <CardDescription>Важные события и действия</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" data-testid="button-mark-all-read" title="Отметить все как прочитанные">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id} 
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50",
                      !notification.isRead ? "bg-blue-50 border-l-2 border-blue-500" : "bg-muted/20",
                      notification.priority === 'high' && "border-l-2 border-red-500"
                    )}
                    onClick={() => markNotificationRead.mutate(notification.id)}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={cn(
                        "text-sm",
                        !notification.isRead ? "font-medium" : "font-normal"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                ))}
                
                <Link to="/notifications">
                  <Button variant="outline" className="w-full" data-testid="button-view-all-notifications">
                    Все уведомления
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}