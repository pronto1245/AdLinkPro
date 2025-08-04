import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  BarChart3, Users, Target, MousePointer, TrendingUp, 
  AlertTriangle, DollarSign, Plus, Settings,
  Eye, ArrowUpRight, ArrowDownRight, Activity, 
  UserPlus, FileText, Shield, Bell, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface DashboardMetrics {
  activePartners: number;
  activeOffers: number;
  todayClicks: number;
  yesterdayClicks: number;
  monthClicks: number;
  leads: number;
  conversions: number;
  platformRevenue: number;
  fraudRate: number;
  cr: number;
  epc: number;
  roi: number;
}

interface ChartData {
  date: string;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
  fraud: number;
}

interface RecentActivity {
  id: string;
  type: 'registration' | 'offer' | 'fraud' | 'ticket';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [dateFilter, setDateFilter] = useState<string>('7d');
  const [geoFilter, setGeoFilter] = useState<string>('all');

  // Fetch dashboard metrics
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ['/api/admin/dashboard-metrics', dateFilter],
    queryFn: async () => {
      const response = await fetch(`/api/admin/dashboard-metrics/${dateFilter}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
  });

  // Fetch chart data
  const { data: chartData = [] } = useQuery<ChartData[]>({
    queryKey: ['/api/admin/dashboard-chart', dateFilter],
    queryFn: async () => {
      const response = await fetch(`/api/admin/dashboard-chart/${dateFilter}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch chart data');
      return response.json();
    },
  });

  // Fetch recent activities
  const { data: recentActivities = [] } = useQuery<RecentActivity[]>({
    queryKey: ['/api/admin/recent-activities'],
    queryFn: async () => {
      const response = await fetch('/api/admin/recent-activities', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
  });

  // Fetch geo distribution
  const { data: geoData = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/geo-distribution', dateFilter],
    queryFn: async () => {
      const response = await fetch(`/api/admin/geo-distribution/${dateFilter}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch geo data');
      return response.json();
    },
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration': return <UserPlus className="w-4 h-4" />;
      case 'offer': return <Target className="w-4 h-4" />;
      case 'fraud': return <Shield className="w-4 h-4" />;
      case 'ticket': return <FileText className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'registration': return 'text-green-600';
      case 'offer': return 'text-blue-600';
      case 'fraud': return 'text-red-600';
      case 'ticket': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-100 text-red-800">Высокий</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800">Средний</Badge>;
      case 'low': return <Badge className="bg-green-100 text-green-800">Низкий</Badge>;
      default: return <Badge>Обычный</Badge>;
    }
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-chart'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/recent-activities'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/geo-distribution'] });
    toast({
      title: 'Данные обновлены',
      description: 'Информация дашборда успешно обновлена',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🧭 Дашборд владельца платформы
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Центральная панель управления с ключевыми метриками и аналитикой
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={refreshData}
                data-testid="button-refresh"
                title="Обновить данные"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Обновить
              </Button>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40" title="Период">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Сегодня</SelectItem>
                  <SelectItem value="7d">7 дней</SelectItem>
                  <SelectItem value="30d">30 дней</SelectItem>
                  <SelectItem value="90d">90 дней</SelectItem>
                </SelectContent>
              </Select>

              <Select value={geoFilter} onValueChange={setGeoFilter}>
                <SelectTrigger className="w-32" title="География">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все ГЕО</SelectItem>
                  <SelectItem value="RU">Россия</SelectItem>
                  <SelectItem value="US">США</SelectItem>
                  <SelectItem value="EU">Европа</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Real-time Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          
          {/* Active Partners */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Активные партнёры</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics?.activePartners?.toLocaleString() || '1,247'}
                  </p>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">+12%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Offers */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Активные офферы</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics?.activeOffers?.toLocaleString() || '89'}
                  </p>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">+5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today Clicks */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <MousePointer className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Клики сегодня</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics?.todayClicks?.toLocaleString() || '15,420'}
                  </p>
                  <div className="flex items-center mt-1">
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">-3%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversions */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Конверсии</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics?.conversions?.toLocaleString() || '1,205'}
                  </p>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">+8%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Revenue */}
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Доход платформы</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${metrics?.platformRevenue?.toLocaleString() || '45,789'}
                  </p>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">+15%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fraud Rate */}
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Фрод-показатель</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metrics?.fraudRate?.toFixed(1) || '2.3'}%
                  </p>
                  <div className="flex items-center mt-1">
                    <ArrowDownRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">-2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CR (Conversion Rate)</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.cr?.toFixed(2) || '3.13'}%
                  </p>
                </div>
                <div className="text-right">
                  <Progress value={metrics?.cr || 31.3} className="w-16" />
                  <p className="text-sm text-gray-500 mt-1">Целевой: 3.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">EPC (Earnings Per Click)</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${metrics?.epc?.toFixed(2) || '2.97'}
                  </p>
                </div>
                <div className="text-right">
                  <Progress value={((metrics?.epc || 2.97) / 5) * 100} className="w-16" />
                  <p className="text-sm text-gray-500 mt-1">Целевой: $2.5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ROI (Return on Investment)</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metrics?.roi?.toFixed(0) || '167'}%
                  </p>
                </div>
                <div className="text-right">
                  <Progress value={Math.min((metrics?.roi || 167) / 2, 100)} className="w-16" />
                  <p className="text-sm text-gray-500 mt-1">Целевой: 150%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Traffic & Conversions Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Динамика трафика и конверсий
              </CardTitle>
              <CardDescription>
                Клики, лиды и конверсии за выбранный период
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="clicks" stroke="#8884d8" strokeWidth={2} name="Клики" />
                    <Line type="monotone" dataKey="leads" stroke="#82ca9d" strokeWidth={2} name="Лиды" />
                    <Line type="monotone" dataKey="conversions" stroke="#ffc658" strokeWidth={2} name="Конверсии" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Доходы платформы
              </CardTitle>
              <CardDescription>
                Динамика доходов по дням
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Geo Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Распределение по ГЕО
              </CardTitle>
              <CardDescription>
                Топ стран по трафику
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={geoData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {geoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Activities */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Последние события
              </CardTitle>
              <CardDescription>
                Активность на платформе в режиме реального времени
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className={`p-1 rounded ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                        {getPriorityBadge(activity.priority)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(activity.timestamp).toLocaleString('ru-RU')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Быстрые действия
              </CardTitle>
              <CardDescription>
                Основные операции управления
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/admin/OffersManagement'}
                  data-testid="quick-action-add-offer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить оффер
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/admin/users'}
                  data-testid="quick-action-add-user"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Добавить пользователя
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/admin/postbacks'}
                  data-testid="quick-action-postback"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Настроить постбек
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/admin/analytics'}
                  data-testid="quick-action-analytics"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Расширенная аналитика
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/admin/fraud'}
                  data-testid="quick-action-fraud"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Детекция фрода
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/admin/finances'}
                  data-testid="quick-action-finances"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Финансовые отчёты
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}