import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ExternalLink
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
    totalRevenue: number;
    partnersCount: number;
    avgCR: number;
    epc: number;
    postbacksSent: number;
    postbacksReceived: number;
    postbackErrors: number;
    fraudActivity: number;
  };
  chartData: {
    traffic: Array<{ date: string; clicks: number; uniqueClicks: number }>;
    conversions: Array<{ date: string; leads: number; registrations: number; deposits: number }>;
    spending: Array<{ date: string; spent: number; revenue: number }>;
    postbacks: Array<{ date: string; sent: number; successful: number; failed: number }>;
    fraud: Array<{ date: string; detected: number; blocked: number }>;
  };
  topOffers: Array<{
    id: string;
    name: string;
    status: string;
    clicks: number;
    cr: number;
    conversions: number;
    spent: number;
    postbacks: number;
    fraudRate: number;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
  }>;
  offerStatus: {
    pending: number;
    active: number;
    hidden: number;
    archived: number;
  };
}

export default function AdvertiserDashboardNew() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for filters
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const [filters, setFilters] = useState({
    geo: 'all',
    device: 'all',
    offerId: 'all',
    partnerId: 'all'
  });


  // Fetch dashboard data
  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['/api/advertiser/dashboard', dateRange, filters],
    enabled: !!user
  }) as { data: DashboardData | undefined; isLoading: boolean; refetch: () => void };

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: () => apiRequest('/api/advertiser/export'),
    onSuccess: () => {
      alert('Данные экспортированы успешно');
    }
  });

  if (!user) {
    return <div>Загрузка...</div>;
  }

  if (isLoading) {
    return (
      <div className="w-full">
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
    <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Дашборд рекламодателя</h1>
            <p className="text-muted-foreground">Обзор эффективности ваших офферов и партнёров</p>
          </div>
          
          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Select onValueChange={(value) => setFilters(prev => ({ ...prev, geo: value }))}>
              <SelectTrigger className="w-32" data-testid="select-geo">
                <SelectValue placeholder="Гео" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все страны</SelectItem>
                <SelectItem value="IN">Индия</SelectItem>
                <SelectItem value="US">США</SelectItem>
                <SelectItem value="DE">Германия</SelectItem>
                <SelectItem value="UK">Великобритания</SelectItem>
              </SelectContent>
            </Select>
            
            <Select onValueChange={(value) => setFilters(prev => ({ ...prev, device: value }))}>
              <SelectTrigger className="w-32" data-testid="select-device">
                <SelectValue placeholder="Устройство" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все устройства</SelectItem>
                <SelectItem value="mobile">Мобильные</SelectItem>
                <SelectItem value="desktop">Десктопы</SelectItem>
                <SelectItem value="tablet">Планшеты</SelectItem>
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
              <span className="text-muted-foreground">-</span>
              <Input
                type="date"
                value={dateRange.to.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                className="w-auto"
                data-testid="input-date-to"
              />
            </div>
            
            <Button variant="outline" size="icon" title="Фильтры" data-testid="button-filters">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon" onClick={() => refetch()} data-testid="button-refresh" title="Обновить данные">
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" onClick={() => exportMutation.mutate()} data-testid="button-export" title="Экспорт статистики">
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

        {/* Combined section: Conversions + Notifications + Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* KPI Cards first */}
          <Card data-testid="card-conversions" className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Конверсии</CardTitle>
              <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{overview?.totalConversions || 0}</div>
              <p className="text-xs text-green-700 dark:text-green-400">за период</p>
            </CardContent>
          </Card>

          <Card data-testid="card-notifications" className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Уведомления</CardTitle>
              <div className="p-3 bg-amber-500 rounded-xl shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{Math.floor(Math.random() * 15) + 5}</div>
              <p className="text-xs text-amber-700 dark:text-amber-400">новых сообщений</p>
            </CardContent>
          </Card>

          {/* Quick Actions on the right */}
          <Link to="/analytics/traffic">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700" data-testid="button-quick-traffic">
              <Activity className="h-5 w-5" />
              <span className="text-sm font-medium">Трафик</span>
            </Button>
          </Link>
          
          <Link to="/analytics/conversions">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700" data-testid="button-quick-conversions">
              <Target className="h-5 w-5" />
              <span className="text-sm font-medium">Аналитика</span>
            </Button>
          </Link>
        </div>

        {/* Charts Section - aligned to match Quick Actions width */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Offer Status Card */}
          <Card data-testid="card-offer-status">
            <CardHeader>
              <CardTitle>Топ-офферы</CardTitle>
              <CardDescription>Лучшие офферы по эффективности</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topOffers.slice(0, 3).map((offer: any) => (
                  <div key={offer.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{offer.name}</span>
                      <span className="text-xs text-muted-foreground">CR: {offer.cr}%</span>
                    </div>
                    <Badge variant={offer.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {offer.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications List Card */}
          <Card data-testid="card-notifications-list">
            <CardHeader>
              <CardTitle>Последние уведомления</CardTitle>
              <CardDescription>Сообщения системы</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification: any) => (
                  <div key={notification.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{notification.title}</div>
                      <div className="text-xs text-muted-foreground">{notification.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="chart-traffic">
            <CardHeader>
              <CardTitle>Трафик по времени</CardTitle>
              <CardDescription>Клики и уникальные посетители</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData?.traffic || []}>
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

          <Card data-testid="chart-conversions">
            <CardHeader>
              <CardTitle>Конверсии</CardTitle>
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