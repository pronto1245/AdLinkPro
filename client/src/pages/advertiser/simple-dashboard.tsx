import { useAuth } from "../../contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
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
  Filter
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdvertiserDashboard() {
  const { user } = useAuth();
  
  console.log('AdvertiserDashboard: Starting render with user:', user);
  
  if (!user) {
    console.log('AdvertiserDashboard: No user, showing loading...');
    return <div>Загрузка...</div>;
  }

  // Получаем данные дашборда
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['/api/advertiser/dashboard'],
    enabled: !!user
  });

  console.log('AdvertiserDashboard: Rendering main content');
  
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

  if (!dashboard) {
    return (
      <div className="w-full">
        <div className="text-center">
          <p>Не удалось загрузить данные дашборда</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
        {/* Заголовок и фильтры */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="page-title">
              Дашборд рекламодателя
            </h1>
            <p className="text-muted-foreground">
              Добро пожаловать, {user?.firstName} {user?.lastName}! 
              Обзор эффективности ваших офферов
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="7d">
              <SelectTrigger className="w-[140px]" data-testid="select-period">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Сегодня</SelectItem>
                <SelectItem value="7d">7 дней</SelectItem>
                <SelectItem value="30d">30 дней</SelectItem>
                <SelectItem value="90d">3 месяца</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" title="Обновить данные">
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" title="Экспорт статистики">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </div>

        {/* Основные KPI метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Офферы</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="offers-count">
                {dashboard.metrics.offersCount}
              </div>
              <p className="text-xs text-green-600 flex items-center">
                <span className="font-medium">{dashboard.metrics.activeOffers} активных</span>
              </p>
              <div className="text-xs text-muted-foreground mt-1">
                {dashboard.metrics.pendingOffers} на модерации
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Бюджет / Расход</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="budget-amount">
                ${dashboard.metrics.totalBudget.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Потрачено: ${dashboard.metrics.totalSpent.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Доход</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600" data-testid="revenue-amount">
                ${dashboard.metrics.revenue.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{((dashboard.metrics.revenue / Math.max(dashboard.metrics.totalSpent, 1)) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Постбеки</CardTitle>
              <Send className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="postbacks-sent">
                {dashboard.metrics.postbacksSent}
              </div>
              <p className="text-xs text-green-600">
                {dashboard.metrics.postbacksReceived} получено
              </p>
              <div className="text-xs text-red-500">
                {dashboard.metrics.postbackErrors} ошибок
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Партнёры</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="partners-count">
                {dashboard.metrics.partnersCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Работают с офферами
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Дополнительные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CR (%)</CardTitle>
              <BarChart3 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600" data-testid="cr-rate">
                {dashboard.metrics.avgCR}%
              </div>
              <p className="text-xs text-muted-foreground">
                Средний по всем офферам
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">EPC ($)</CardTitle>
              <Activity className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600" data-testid="epc-amount">
                ${dashboard.metrics.epc}
              </div>
              <p className="text-xs text-muted-foreground">
                Доход на клик
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ошибки постбеков</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="postback-errors">
                {dashboard.metrics.postbackErrors}
              </div>
              <p className="text-xs text-muted-foreground">
                {((dashboard.metrics.postbackErrors / Math.max(dashboard.metrics.postbacksSent, 1)) * 100).toFixed(1)}% от отправленных
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Фрод активность</CardTitle>
              <Shield className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="fraud-activity">
                {dashboard.metrics.fraudActivity}
              </div>
              <p className="text-xs text-muted-foreground">
                Подозрительных событий
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Графики и аналитика */}
        <Tabs defaultValue="traffic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="traffic" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Трафик
            </TabsTrigger>
            <TabsTrigger value="conversions" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Конверсии
            </TabsTrigger>
            <TabsTrigger value="spending" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Расходы
            </TabsTrigger>
            <TabsTrigger value="postbacks" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Постбеки
            </TabsTrigger>
            <TabsTrigger value="fraud" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Фрод
            </TabsTrigger>
          </TabsList>

          <TabsContent value="traffic">
            <Card>
              <CardHeader>
                <CardTitle>График трафика по времени</CardTitle>
                <CardDescription>Клики и уникальные посетители за период</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboard.chartData.traffic}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="clicks" stroke="#8884d8" name="Клики" />
                    <Line type="monotone" dataKey="uniques" stroke="#82ca9d" name="Уники" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversions">
            <Card>
              <CardHeader>
                <CardTitle>График конверсий</CardTitle>
                <CardDescription>Лиды, регистрации и депозиты</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboard.chartData.conversions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="deposits" stackId="1" stroke="#8884d8" fill="#8884d8" name="Депозиты" />
                    <Area type="monotone" dataKey="registrations" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Регистрации" />
                    <Area type="monotone" dataKey="leads" stackId="1" stroke="#ffc658" fill="#ffc658" name="Лиды" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spending">
            <Card>
              <CardHeader>
                <CardTitle>График расходов / выплат</CardTitle>
                <CardDescription>Потраченные средства и выплаты партнёрам</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboard.chartData.spending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="spent" fill="#8884d8" name="Потрачено" />
                    <Bar dataKey="payouts" fill="#82ca9d" name="Выплаты" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="postbacks">
            <Card>
              <CardHeader>
                <CardTitle>График активности постбеков</CardTitle>
                <CardDescription>Отправленные, полученные постбеки и ошибки</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboard.chartData.postbacks}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Отправлено" />
                    <Line type="monotone" dataKey="received" stroke="#82ca9d" name="Получено" />
                    <Line type="monotone" dataKey="errors" stroke="#ff7300" name="Ошибки" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fraud">
            <Card>
              <CardHeader>
                <CardTitle>Фрод-индикаторы</CardTitle>
                <CardDescription>Заблокированные и подозрительные события</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboard.chartData.fraud}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="blocked" stackId="1" stroke="#ff4444" fill="#ff4444" name="Заблокировано" />
                    <Area type="monotone" dataKey="suspicious" stackId="1" stroke="#ffaa44" fill="#ffaa44" name="Подозрительно" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Основной контент с таблицами и статусами */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Топ-офферы */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Топ-офферы рекламодателя
                </CardTitle>
                <CardDescription>Основные метрики по вашим офферам</CardDescription>
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
                      <TableHead>Постбеки</TableHead>
                      <TableHead>Фрод %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.topOffers.map((offer: any) => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-medium">{offer.name}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={offer.status === 'active' ? 'default' : offer.status === 'pending' ? 'secondary' : 'destructive'}
                          >
                            {offer.status === 'active' ? 'Активен' : 
                             offer.status === 'pending' ? 'На модерации' : 
                             offer.status === 'rejected' ? 'Отклонён' : offer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{offer.clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 font-medium">{offer.cr}%</TableCell>
                        <TableCell>{offer.conversions}</TableCell>
                        <TableCell>${offer.spent}</TableCell>
                        <TableCell>{offer.postbacks}</TableCell>
                        <TableCell className="text-orange-600">{offer.fraudRate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Статус по офферам и уведомления */}
          <div className="space-y-6">
            {/* Статус офферов */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Статус по офферам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">На модерации:</span>
                    <Badge variant="secondary">{dashboard.offerStatus.pending}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Активные:</span>
                    <Badge variant="default">{dashboard.offerStatus.active}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Скрытые:</span>
                    <Badge variant="outline">{dashboard.offerStatus.hidden}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Архив:</span>
                    <Badge variant="secondary">{dashboard.offerStatus.archived}</Badge>
                  </div>
                </div>
                
                {/* Круговая диаграмма статусов */}
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={dashboard.offerStatusDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Уведомления / задачи */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Уведомления
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboard.notifications.map((notification: any) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.priority === 'high' ? 'bg-red-500' :
                      notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Быстрые действия */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Быстрые действия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Link href="/advertiser/offers/new">
                <Button className="w-full" variant="default">
                  <Plus className="h-4 w-4 mr-2" />
                  Новый оффер
                </Button>
              </Link>
              
              <Link href="/advertiser/financial">
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  История расходов
                </Button>
              </Link>
              
              <Link href="/advertiser/postbacks">
                <Button className="w-full" variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Добавить постбек
                </Button>
              </Link>
              
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
              
              <Button className="w-full" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Импорт
              </Button>
              
              <Link href="/advertiser/offers">
                <Button className="w-full" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  К офферам
                </Button>
              </Link>
              
              <Button className="w-full" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Аналитика
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
  );
}