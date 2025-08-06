import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import RoleBasedLayout from "@/components/layout/RoleBasedLayout";
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
    geo: '',
    device: '',
    offerId: ''
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Дашборд рекламодателя</h1>
            <p className="text-muted-foreground">Обзор эффективности ваших офферов и партнёров</p>
          </div>
          
          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center gap-2">
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

        {/* Quick Actions - Moved under filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Link to="/analytics/traffic">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700" data-testid="button-quick-traffic">
              <Activity className="h-5 w-5" />
              <span className="text-sm font-medium">Трафик</span>
            </Button>
          </Link>
          
          <Link to="/analytics/conversions">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-700" data-testid="button-quick-conversions">
              <Target className="h-5 w-5" />
              <span className="text-sm font-medium">Конверсии</span>
            </Button>
          </Link>
          
          <Link to="/advertiser/finances">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700" data-testid="button-quick-spending">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">Расходы</span>
            </Button>
          </Link>
          
          <Link to="/advertiser/postbacks">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700" data-testid="button-quick-postbacks">
              <Send className="h-5 w-5" />
              <span className="text-sm font-medium">Постбеки</span>
            </Button>
          </Link>
          
          <Link to="/fraud-detection">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-1 bg-red-50 hover:bg-red-100 border-red-200 text-red-700" data-testid="button-quick-fraud">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Фрод</span>
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Card data-testid="card-offers" className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Офферы</CardTitle>
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{overview?.totalOffers || 0}</div>
              <div className="flex gap-2 text-xs mt-2">
                <span className="text-green-600 dark:text-green-400">Активных: {overview?.activeOffers || 0}</span>
                <span className="text-yellow-600 dark:text-yellow-400">На модерации: {overview?.pendingOffers || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-budget" className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Бюджет / Расход</CardTitle>
              <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">${overview?.totalSpent || 0}</div>
              <p className="text-xs text-green-700 dark:text-green-400">из ${overview?.totalBudget || 0}</p>
            </CardContent>
          </Card>

          <Card data-testid="card-revenue" className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Доход платформы</CardTitle>
              <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">${overview?.totalRevenue || 0}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% за период
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-partners" className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Партнёры</CardTitle>
              <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{overview?.partnersCount || 0}</div>
              <p className="text-xs text-orange-700 dark:text-orange-400">работают с офферами</p>
            </CardContent>
          </Card>

          <Card data-testid="card-cr" className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">CR / EPC</CardTitle>
              <div className="p-3 bg-indigo-500 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{overview?.avgCR?.toFixed(2) || 0}%</div>
              <p className="text-xs text-indigo-700 dark:text-indigo-400">EPC: ${overview?.epc?.toFixed(2) || 0}</p>
            </CardContent>
          </Card>

          <Card data-testid="card-postbacks" className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-300">Постбеки</CardTitle>
              <div className="p-3 bg-teal-500 rounded-xl shadow-lg">
                <Send className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">{overview?.postbacksSent || 0}</div>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600 dark:text-green-400">Получено: {overview?.postbacksReceived || 0}</span>
                <span className="text-red-600 dark:text-red-400">Ошибок: {overview?.postbackErrors || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-fraud" className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Фрод-активность</CardTitle>
              <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{overview?.fraudActivity || 0}</div>
              <p className="text-xs text-red-700 dark:text-red-400">случаев за период</p>
            </CardContent>
          </Card>

          <Card data-testid="card-analytics" className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 border-violet-200 dark:border-violet-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-violet-700 dark:text-violet-300">Аналитика</CardTitle>
              <div className="p-3 bg-violet-500 rounded-xl shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-900 dark:text-violet-100">{((overview?.activeOffers || 0) * 100).toLocaleString()}</div>
              <p className="text-xs text-violet-700 dark:text-violet-400">событий отслежено</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-testid="chart-traffic">
            <CardHeader>
              <CardTitle>Трафик по времени</CardTitle>
              <CardDescription>Клики и уникальные посетители</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
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
              <ResponsiveContainer width="100%" height={300}>
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

          <Card data-testid="chart-spending">
            <CardHeader>
              <CardTitle>Расходы / Выплаты</CardTitle>
              <CardDescription>Финансовая динамика</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData?.spending || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="spent" fill="#ef4444" name="Расходы" />
                  <Bar dataKey="revenue" fill="#10b981" name="Доходы" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card data-testid="chart-postbacks">
            <CardHeader>
              <CardTitle>Активность постбеков</CardTitle>
              <CardDescription>Отправленные и обработанные</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData?.postbacks || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sent" stroke="#3b82f6" name="Отправлено" />
                  <Line type="monotone" dataKey="successful" stroke="#10b981" name="Успешно" />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Ошибки" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables and Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Offers Table */}
          <Card className="lg:col-span-2" data-testid="table-top-offers">
            <CardHeader>
              <CardTitle>Топ-офферы</CardTitle>
              <CardDescription>Лучшие офферы по эффективности</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Оффер</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Клики</TableHead>
                    <TableHead>CR</TableHead>
                    <TableHead>Конверсии</TableHead>
                    <TableHead>Расход</TableHead>
                    <TableHead>Фрод %</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topOffers.map((offer: any) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.name}</TableCell>
                      <TableCell>
                        <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                          {offer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{offer.clicks}</TableCell>
                      <TableCell>{offer.cr}%</TableCell>
                      <TableCell>{offer.conversions}</TableCell>
                      <TableCell>${offer.spent}</TableCell>
                      <TableCell className={cn(
                        offer.fraudRate > 5 ? 'text-red-600' : 'text-green-600'
                      )}>
                        {offer.fraudRate}%
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" data-testid={`button-view-${offer.id}`} title="Просмотр">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`button-edit-${offer.id}`} title="Редактировать">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Offer Status and Notifications */}
          <div className="space-y-6">
            {/* Offer Status */}
            <Card data-testid="card-offer-status">
              <CardHeader>
                <CardTitle>Статус офферов</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">На модерации</span>
                  <Badge variant="secondary">{dashboard?.offerStatus.pending || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Активные</span>
                  <Badge variant="default">{dashboard?.offerStatus.active || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Скрытые</span>
                  <Badge variant="outline">{dashboard?.offerStatus.hidden || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Архив</span>
                  <Badge variant="secondary">{dashboard?.offerStatus.archived || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card data-testid="card-notifications">
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.slice(0, 5).map((notification: any) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="mt-1">
                      {notification.type === 'partner_request' && <Users className="h-4 w-4 text-blue-600" />}
                      {notification.type === 'postback_error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      {notification.type === 'offer_pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                      {notification.type === 'fraud_alert' && <Shield className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions moved and removed from end */}
      </div>
    </RoleBasedLayout>
  );
}