import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSidebar } from "@/contexts/sidebar-context";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  MousePointer,
  Target,
  AlertTriangle,
  Download,
  RefreshCw
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function SuperAdminAnalytics() {
  const { isCollapsed } = useSidebar();
  const [period, setPeriod] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Get analytics data
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/analytics', period],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch analytics`);
      }
      return response.json();
    },
    retry: 2,
    retryDelay: 1000,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const exportData = (format: 'csv' | 'excel' | 'json') => {
    const link = document.createElement('a');
    link.href = `/api/admin/analytics/export?format=${format}&period=${period}`;
    link.download = `analytics_${period}.${format}`;
    link.click();
  };

  // Compute metrics from analytics data
  const metrics = analytics ? {
    totalClicks: analytics.reduce((sum: number, item: any) => sum + (item.clicks || 0), 0),
    totalConversions: analytics.reduce((sum: number, item: any) => sum + (item.conversions || 0), 0),
    totalRevenue: analytics.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0),
    uniqueUsers: analytics.filter((item: any, index: number, arr: any[]) => 
      arr.findIndex(i => i.ip === item.ip) === index
    ).length,
    fraudClicks: analytics.filter((item: any) => item.isFraud).length,
    botClicks: analytics.filter((item: any) => item.isBot).length,
  } : {
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    uniqueUsers: 0,
    fraudClicks: 0,
    botClicks: 0,
  };

  const conversionRate = metrics.totalClicks > 0 ? 
    (metrics.totalConversions / metrics.totalClicks * 100).toFixed(2) : '0.00';

  const mainMetrics = [
    {
      title: 'Всего кликов',
      value: metrics.totalClicks.toLocaleString(),
      change: '+8.2%',
      changeType: 'increase',
      icon: MousePointer,
      color: 'blue'
    },
    {
      title: 'Конверсии',
      value: metrics.totalConversions.toLocaleString(),
      change: '+15.3%',
      changeType: 'increase',
      icon: Target,
      color: 'green'
    },
    {
      title: 'Доход',
      value: `$${metrics.totalRevenue.toFixed(2)}`,
      change: '+12.1%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'purple'
    },
    {
      title: 'Конверсия',
      value: `${conversionRate}%`,
      change: '+2.3%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Уникальные пользователи',
      value: metrics.uniqueUsers.toLocaleString(),
      change: '+5.7%',
      changeType: 'increase',
      icon: Users,
      color: 'indigo'
    },
    {
      title: 'Фрод/Бот трафик',
      value: `${metrics.fraudClicks + metrics.botClicks}`,
      change: '-3.2%',
      changeType: 'decrease',
      icon: AlertTriangle,
      color: 'red'
    }
  ];

  // Group analytics by date for charts
  const chartData = analytics ? analytics.reduce((acc: any[], item: any) => {
    const date = new Date(item.timestamp).toLocaleDateString();
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.clicks += item.clicks || 0;
      existing.conversions += item.conversions || 0;
      existing.revenue += item.revenue || 0;
    } else {
      acc.push({
        date,
        clicks: item.clicks || 0,
        conversions: item.conversions || 0,
        revenue: item.revenue || 0,
      });
    }
    return acc;
  }, []).slice(-7) : []; // Last 7 days

  // Country distribution
  const countryData = analytics ? analytics.reduce((acc: any[], item: any) => {
    const country = item.geo || item.country || 'Unknown';
    const existing = acc.find(d => d.name === country);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: country, value: 1 });
    }
    return acc;
  }, []).slice(0, 5) : []; // Top 5 countries

  return (
    <div className="h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className={`h-full flex flex-col transition-all duration-300 ${
        isCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <Header title="Аналитика системы" />
        <main className="flex-1 overflow-auto p-4">
          <div className="space-y-4 max-w-full">
            {/* Header with title and controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Аналитика системы
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Общая аналитика кликов, конверсий и доходов
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">За 7 дней</SelectItem>
                      <SelectItem value="30d">За 30 дней</SelectItem>
                      <SelectItem value="90d">За 90 дней</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportData('csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт CSV
                  </Button>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">Ошибка загрузки данных</p>
                      <p className="text-sm">{error.message}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => refetch()} 
                        className="mt-2"
                      >
                        Попробовать снова
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Загрузка аналитики...</span>
              </div>
            )}

            {/* Analytics Content */}
            {!isLoading && !error && (
              <>
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mainMetrics.map((metric) => (
                    <Card key={metric.title}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {metric.title}
                        </CardTitle>
                        <metric.icon className={`h-4 w-4 text-${metric.color}-600`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <p className={`text-xs ${
                          metric.changeType === 'increase' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {metric.change} за период
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Clicks and Conversions Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Тренд кликов и конверсий</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        {chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="clicks" stroke="#8884d8" />
                              <Line type="monotone" dataKey="conversions" stroke="#82ca9d" />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            Нет данных для отображения
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Country Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Распределение по странам</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        {countryData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={countryData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {countryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            Нет данных для отображения
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Доходы по дням</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          Нет данных для отображения
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Data Source Info */}
                {analytics && analytics.length > 0 && analytics[0]?.integrationSource === 'MOCK_DATA' && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <AlertTriangle className="h-5 w-5" />
                        <div>
                          <p className="font-semibold">Используются тестовые данные</p>
                          <p className="text-sm">
                            Отображаются демонстрационные данные. Для получения реальной аналитики 
                            необходимо настроить интеграцию с базой данных отслеживания.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
