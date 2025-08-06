import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
// import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar,
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  MousePointer, 
  Users, 
  Target,
  Activity,
  Globe,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Bell,
  Lightbulb,
  Flag
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5A2B'];
const DEVICE_COLORS = { mobile: '#8B5CF6', desktop: '#06B6D4', tablet: '#10B981' };

interface DashboardMetrics {
  totalRevenue: number;
  totalConversions: number;
  totalClicks: number;
  uniqueClicks: number;
  epc: number;
  avgCR: number;
  activeOffers: number;
  postbacksSent: number;
  postbacksReceived: number;
  pendingRevenue: number;
  confirmedRevenue: number;
  rejectedRevenue: number;
  avgSessionDuration: number;
}

interface ChartData {
  revenue: any[];
  crEpc: any[];
  conversions: any[];
  geoTraffic: any[];
  postbackActivity: any[];
}

interface TopOffer {
  id: string;
  name: string;
  status: string;
  clicks: number;
  conversions: number;
  revenue: number;
  cr: number;
  epc: number;
  fraudRate: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  read: boolean;
}

interface SmartAlert {
  id: string;
  type: 'optimization' | 'anomaly' | 'recommendation';
  title: string;
  message: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
}

interface DashboardData {
  metrics: DashboardMetrics;
  chartData: ChartData;
  topOffers: TopOffer[];
  notifications: Notification[];
  smartAlerts: SmartAlert[];
}

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  description,
  className = "",
  valueColor = "text-foreground"
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
  className?: string;
  valueColor?: string;
}) => (
  <Card className={cn("hover:shadow-md transition-shadow", className)} data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className={cn("text-2xl font-bold", valueColor)}>{value}</div>
      {(trend || description) && (
        <div className="flex items-center gap-2 mt-1">
          {trend && trendValue && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              trend === 'up' ? "text-green-600" : trend === 'down' ? "text-red-600" : "text-gray-600"
            )}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : 
               trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
              {trendValue}
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

const SmartAlertCard = ({ alert }: { alert: SmartAlert }) => {
  const { t } = useLanguage();
  
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Lightbulb className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      default: return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
    }
  };

  return (
    <Card className={cn("p-4", getAlertColor(alert.priority))} data-testid={`alert-${alert.id}`}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-1 rounded-full",
          alert.priority === 'high' ? 'text-red-600' : 
          alert.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
        )}>
          {getAlertIcon(alert.type)}
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-medium">{alert.title}</h4>
          <p className="text-sm text-muted-foreground">{alert.message}</p>
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" variant="outline" className="h-7 text-xs">
              {alert.action}
            </Button>
            <Badge variant="outline" className="text-xs">
              {alert.type === 'optimization' ? t('Оптимизация') : 
               alert.type === 'anomaly' ? t('Аномалия') : t('Рекомендация')}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function PartnerDashboard() {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState<any>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [filters, setFilters] = useState({
    geo: '',
    device: '',
    offerId: '',
    actionType: ''
  });

  const { data: dashboardData, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['/api/partner/dashboard', dateRange, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange?.from) params.append('dateFrom', dateRange.from.toISOString());
      if (dateRange?.to) params.append('dateTo', dateRange.to.toISOString());
      if (filters.geo) params.append('geo', filters.geo);
      if (filters.device) params.append('device', filters.device);
      if (filters.offerId) params.append('offerId', filters.offerId);
      if (filters.actionType) params.append('actionType', filters.actionType);

      const response = await fetch(`/api/partner/dashboard?${params}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold">{t('Ошибка загрузки данных')}</h3>
          <p className="text-muted-foreground">{t('Не удалось загрузить данные дашборда')}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('Повторить')}
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { metrics, chartData, topOffers, notifications, smartAlerts } = dashboardData;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('Партнерский дашборд')}</h1>
          <p className="text-muted-foreground">{t('Мониторинг производительности и аналитика')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateRange.from?.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange((prev: any) => ({ ...prev, from: new Date(e.target.value) }))}
              className="w-auto"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="date"
              value={dateRange.to?.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange((prev: any) => ({ ...prev, to: new Date(e.target.value) }))}
              className="w-auto"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('Фильтры')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>{t('География')}</Label>
              <Select value={filters.geo} onValueChange={(value) => setFilters(prev => ({ ...prev, geo: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Все страны')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('Все страны')}</SelectItem>
                  <SelectItem value="US">США</SelectItem>
                  <SelectItem value="DE">Германия</SelectItem>
                  <SelectItem value="GB">Великобритания</SelectItem>
                  <SelectItem value="CA">Канада</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('Устройство')}</Label>
              <Select value={filters.device} onValueChange={(value) => setFilters(prev => ({ ...prev, device: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Все устройства')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('Все устройства')}</SelectItem>
                  <SelectItem value="mobile">Мобильные</SelectItem>
                  <SelectItem value="desktop">Десктоп</SelectItem>
                  <SelectItem value="tablet">Планшеты</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('Оффер ID')}</Label>
              <Input 
                placeholder={t('Введите ID оффера')}
                value={filters.offerId}
                onChange={(e) => setFilters(prev => ({ ...prev, offerId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Тип действия')}</Label>
              <Select value={filters.actionType} onValueChange={(value) => setFilters(prev => ({ ...prev, actionType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Все действия')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('Все действия')}</SelectItem>
                  <SelectItem value="lead">Лиды</SelectItem>
                  <SelectItem value="sale">Продажи</SelectItem>
                  <SelectItem value="registration">Регистрации</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('Общий доход')}
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
          valueColor="text-green-600"
        />
        <MetricCard
          title={t('Общие клики')}
          value={metrics.totalClicks.toLocaleString()}
          icon={MousePointer}
          trend="up"
          trendValue="+8.3%"
        />
        <MetricCard
          title={t('Конверсии')}
          value={metrics.totalConversions.toLocaleString()}
          icon={Target}
          trend="up"
          trendValue="+15.2%"
          valueColor="text-blue-600"
        />
        <MetricCard
          title={t('EPC')}
          value={`$${metrics.epc}`}
          icon={TrendingUp}
          trend="up"
          trendValue="+5.7%"
          valueColor="text-purple-600"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('Средний CR')}
          value={`${metrics.avgCR}%`}
          icon={BarChart3}
          trend="up"
          trendValue="+2.1%"
        />
        <MetricCard
          title={t('Активные офферы')}
          value={metrics.activeOffers}
          icon={Activity}
          description={t('доступно к работе')}
        />
        <MetricCard
          title={t('Уникальные клики')}
          value={metrics.uniqueClicks.toLocaleString()}
          icon={Users}
          trend="up"
          trendValue="+6.8%"
        />
        <MetricCard
          title={t('Средняя сессия')}
          value={`${Math.floor(metrics.avgSessionDuration / 60)}м ${metrics.avgSessionDuration % 60}с`}
          icon={Clock}
          trend="down"
          trendValue="-0.5%"
        />
      </div>

      {/* Revenue Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title={t('Ожидающий доход')}
          value={`$${metrics.pendingRevenue.toLocaleString()}`}
          icon={Clock}
          description={t('ожидает подтверждения')}
          className="border-yellow-200"
          valueColor="text-yellow-600"
        />
        <MetricCard
          title={t('Подтвержденный доход')}
          value={`$${metrics.confirmedRevenue.toLocaleString()}`}
          icon={CheckCircle}
          description={t('готов к выплате')}
          className="border-green-200"
          valueColor="text-green-600"
        />
        <MetricCard
          title={t('Отклоненный доход')}
          value={`$${metrics.rejectedRevenue.toLocaleString()}`}
          icon={XCircle}
          description={t('отклонен рекламодателем')}
          className="border-red-200"
          valueColor="text-red-600"
        />
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">{t('Доходы')}</TabsTrigger>
          <TabsTrigger value="performance">{t('Производительность')}</TabsTrigger>
          <TabsTrigger value="conversions">{t('Конверсии')}</TabsTrigger>
          <TabsTrigger value="geo">{t('География')}</TabsTrigger>
          <TabsTrigger value="postbacks">{t('Постбеки')}</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('Динамика доходов и кликов')}</CardTitle>
              <CardDescription>{t('Доходы и клики за последние 7 дней')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="clicks" stackId="2" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('CR и EPC')}</CardTitle>
              <CardDescription>{t('Конверсионная воронка и доходность за период')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.crEpc}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cr" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="epc" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('Типы конверсий')}</CardTitle>
              <CardDescription>{t('Распределение конверсий по типам')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.conversions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#8B5CF6" />
                  <Bar dataKey="registrations" fill="#06B6D4" />
                  <Bar dataKey="deposits" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('География трафика')}</CardTitle>
              <CardDescription>{t('Распределение трафика по странам')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.geoTraffic.map((item, index) => (
                  <div key={item.country} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{item.country}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{item.clicks} {t('кликов')}</span>
                      <span>${item.revenue}</span>
                      <span>{item.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="postbacks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('Активность постбеков')}</CardTitle>
              <CardDescription>{t('Статистика отправки и получения постбеков')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.postbackActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sent" fill="#10B981" />
                  <Bar dataKey="received" fill="#06B6D4" />
                  <Bar dataKey="failed" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Offers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('Топ офферы')}
            </CardTitle>
            <CardDescription>{t('Лучшие офферы по доходности')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOffers.slice(0, 5).map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors" data-testid={`offer-${offer.id}`}>
                  <div className="space-y-1">
                    <div className="font-medium">{offer.name}</div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{offer.clicks} {t('кликов')}</span>
                      <span>{offer.conversions} {t('конверсий')}</span>
                      <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                        {offer.status === 'active' ? t('Активен') : t('Приостановлен')}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-semibold text-green-600">${offer.revenue}</div>
                    <div className="text-sm text-muted-foreground">
                      CR: {offer.cr}% | EPC: ${offer.epc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications & Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('Уведомления и алерты')}
            </CardTitle>
            <CardDescription>{t('Важные события и рекомендации')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Smart Alerts */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                {t('Умные алерты')}
              </h4>
              {smartAlerts.map((alert) => (
                <SmartAlertCard key={alert.id} alert={alert} />
              ))}
            </div>

            <Separator />

            {/* Regular Notifications */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {t('Уведомления')}
              </h4>
              {notifications.map((notification) => (
                <div key={notification.id} className={cn(
                  "p-3 rounded-lg border transition-colors",
                  !notification.read ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800" : "hover:bg-muted/50"
                )} data-testid={`notification-${notification.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="font-medium text-sm">{notification.title}</div>
                      <div className="text-sm text-muted-foreground">{notification.message}</div>
                    </div>
                    <Badge variant={
                      notification.priority === 'high' ? 'destructive' :
                      notification.priority === 'medium' ? 'default' : 'secondary'
                    } className="text-xs">
                      {notification.priority}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Postback Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('Статус постбеков')}
          </CardTitle>
          <CardDescription>{t('Мониторинг отправки и получения постбеков')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              title={t('Отправлено постбеков')}
              value={metrics.postbacksSent}
              icon={ArrowUpRight}
              trend="up"
              trendValue="+5.2%"
              valueColor="text-blue-600"
            />
            <MetricCard
              title={t('Получено постбеков')}
              value={metrics.postbacksReceived}
              icon={ArrowDownRight}
              trend="up"
              trendValue="+4.8%"
              valueColor="text-green-600"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}