import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
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
  Users,
  TrendingUp,
  UserPlus,
  Shield,
  Activity,
  AlertTriangle,
  Download,
  Calendar,
  Globe,
  Network
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function UserAnalytics() {
  const { t, language } = useLanguage();
  const { isCollapsed } = useSidebar();
  const [period, setPeriod] = useState('30d');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Get analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics/users', period, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (period) {params.append('period', period);}
      if (roleFilter !== 'all') {params.append('role', roleFilter);}
      
      const response = await fetch(`/api/admin/analytics/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) {throw new Error('Failed to fetch analytics');}
      return response.json();
    }
  });

  // Get fraud analytics
  const { data: fraudAnalytics } = useQuery({
    queryKey: ['/api/admin/analytics/fraud', period],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/fraud?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) {throw new Error('Failed to fetch fraud analytics');}
      return response.json();
    }
  });

  const exportData = (format: 'csv' | 'excel' | 'json') => {
    const link = document.createElement('a');
    link.href = `/api/admin/analytics/export?format=${format}&period=${period}&role=${roleFilter}`;
    link.download = `user_analytics_${period}.${format}`;
    link.click();
  };

  const mainMetrics = [
    {
      title: 'Всего пользователей',
      value: analytics?.totalUsers || 0,
      change: analytics?.totalUsersChange || '+0%',
      changeType: 'increase',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Активные за 24ч',
      value: analytics?.active24h || 0,
      change: analytics?.active24hChange || '+0%',
      changeType: 'increase',
      icon: Activity,
      color: 'green'
    },
    {
      title: 'Новые пользователи',
      value: analytics?.newUsers || 0,
      change: analytics?.newUsersChange || '+0%',
      changeType: 'increase',
      icon: UserPlus,
      color: 'purple'
    },
    {
      title: 'Фрод-алерты',
      value: fraudAnalytics?.totalAlerts || 0,
      change: fraudAnalytics?.alertsChange || '-0%',
      changeType: 'decrease',
      icon: Shield,
      color: 'red'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64'
      }`}>
        <Header title="Аналитика пользователей" />
        <main className="flex-1 overflow-auto">
          <div className="space-y-6 p-4 sm:p-6 max-w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Аналитика пользователей
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Детальная аналитика пользователей, активности и безопасности
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 часа</SelectItem>
                    <SelectItem value="7d">7 дней</SelectItem>
                    <SelectItem value="30d">30 дней</SelectItem>
                    <SelectItem value="90d">90 дней</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все роли</SelectItem>
                    <SelectItem value="affiliate">Партнеры</SelectItem>
                    <SelectItem value="advertiser">Рекламодатели</SelectItem>
                    <SelectItem value="staff">Сотрудники</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => exportData('excel')}>
                  <Download className="mr-2 h-4 w-4" />
                  Экспорт
                </Button>
              </div>
            </div>

            {/* Main Metrics */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {mainMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card key={metric.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {metric.title}
                      </CardTitle>
                      <Icon className={`h-4 w-4 text-${metric.color}-600`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <p className={`text-xs ${
                        metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change} за период
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* User Distribution by Role */}
              <Card>
                <CardHeader>
                  <CardTitle>Распределение по ролям</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.roleDistribution || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(analytics?.roleDistribution || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Activity Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Активность пользователей</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics?.activityTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="active24h" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Активные за 24ч"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="active7d" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        name="Активные за 7д"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* New Users Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Новые регистрации</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.registrationTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="registrations" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Fraud Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Показатели безопасности</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Фрод-алерты</span>
                      <span className="text-lg font-bold text-red-600">
                        {fraudAnalytics?.totalAlerts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Заблокированные пользователи</span>
                      <span className="text-lg font-bold text-orange-600">
                        {fraudAnalytics?.blockedUsers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Подозрительные IP</span>
                      <span className="text-lg font-bold text-yellow-600">
                        {fraudAnalytics?.suspiciousIPs || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Процент фрода</span>
                      <span className="text-lg font-bold text-purple-600">
                        {fraudAnalytics?.fraudRate || 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>География пользователей</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics?.geoDistribution || []} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="country" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity & Security Events */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Последняя активность</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(analytics?.recentActivity || []).map((activity: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium">{activity.user}</div>
                            <div className="text-sm text-muted-foreground">{activity.action}</div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>События безопасности</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(fraudAnalytics?.securityEvents || []).map((event: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <div>
                            <div className="font-medium">{event.type}</div>
                            <div className="text-sm text-muted-foreground">{event.description}</div>
                          </div>
                        </div>
                        <div className="text-sm text-red-600 font-medium">
                          {event.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}