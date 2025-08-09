import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MousePointer, 
  Globe, 
  Smartphone, 
  Eye,
  Shield,
  Clock,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { ResponsiveCard } from '@/components/layout/ResponsiveCard';

interface LiveStatistics {
  id: string;
  date: string;
  country: string;
  device: string;
  trafficSource: string;
  offerId: string;
  offerName: string;
  partnerId: string;
  partnerName: string;
  sub1: string;
  sub2: string;
  sub3: string;
  sub4: string;
  sub5: string;
  clicks: number;
  uniqueClicks: number;
  conversions: number;
  revenue: number;
  leads: number;
  regs: number;
  deposits: number;
  cr: number;
  epc: number;
  fraudClicks: number;
  fraudRate: number;
  avgTimeOnPage: number;
}

interface LiveSummary {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalLeads: number;
  totalRegs: number;
  totalDeposits: number;
  totalFraudClicks: number;
  avgCR: number;
  avgEPC: number;
  fraudRate: number;
  totalOffers: number;
  totalPartners: number;
}

export default function LiveAnalytics() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const [filters, setFilters] = useState({
    offerId: '',
    partnerId: '',
    country: '',
    device: '',
    trafficSource: '',
    sub1: '',
    sub2: '',
    eventType: '',
    search: ''
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch live statistics data
  const { data: liveData, isLoading: isLoadingLive, refetch } = useQuery({
    queryKey: ['/api/live-analytics/advertiser/live-statistics', dateRange, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value && value.toString().trim()
          )
        )
      });
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/live-analytics/advertiser/live-statistics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch live statistics');
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30 seconds
  });

  // Fetch dashboard metrics
  const { data: dashboardMetrics } = useQuery({
    queryKey: ['/api/live-analytics/advertiser/dashboard-metrics'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/live-analytics/advertiser/dashboard-metrics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard metrics');
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const summary: LiveSummary = liveData?.summary || {
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    totalLeads: 0,
    totalRegs: 0,
    totalDeposits: 0,
    totalFraudClicks: 0,
    avgCR: 0,
    avgEPC: 0,
    fraudRate: 0,
    totalOffers: 0,
    totalPartners: 0
  };

  const data: LiveStatistics[] = liveData?.data || [];

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? '' : value }));
  };

  const resetFilters = () => {
    setFilters({
      offerId: '',
      partnerId: '',
      country: '',
      device: '',
      trafficSource: '',
      sub1: '',
      sub2: '',
      eventType: '',
      search: ''
    });
  };

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
        format,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value && value.toString().trim()
          )
        )
      });
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/live-analytics/advertiser/live-statistics/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to export data');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `live_analytics_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Eye className="h-8 w-8 text-green-600" />
            Живая Аналитика
          </h1>
          <p className="text-muted-foreground">
            Статистика в реальном времени с полным трекингом событий
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-700 border-green-200' : ''}
            data-testid="toggle-auto-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Авто-обновление ВКЛ' : 'Авто-обновление ВЫКЛ'}
          </Button>
          <Button onClick={() => refetch()} variant="outline" data-testid="manual-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button onClick={() => exportData('csv')} variant="outline" data-testid="export-csv">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={() => exportData('json')} variant="outline" data-testid="export-json">
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      {/* Real-time Dashboard Metrics */}
      {dashboardMetrics && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Последние 24 часа (Live)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid cols={{ sm: 2, lg: 6 }}>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{dashboardMetrics.totalClicks?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Клики</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{dashboardMetrics.uniqueVisitors?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Уникальные</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{dashboardMetrics.totalConversions?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Конверсии</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">${dashboardMetrics.totalRevenue?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Доход</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{dashboardMetrics.topCountry || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Топ страна</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{dashboardMetrics.topDevice || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Топ устройство</div>
              </div>
            </ResponsiveGrid>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <ResponsiveGrid cols={{ sm: 2, lg: 4 }}>
        <ResponsiveCard 
          title="Клики" 
          value={summary.totalClicks.toLocaleString()}
          icon={<MousePointer className="h-5 w-5 text-blue-600" />}
          trend={{ value: 0, direction: 'up' }}
        />
        <ResponsiveCard 
          title="Конверсии" 
          value={summary.totalConversions.toLocaleString()}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          trend={{ value: 0, direction: 'up' }}
        />
        <ResponsiveCard 
          title="Доход" 
          value={`$${summary.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5 text-purple-600" />}
          trend={{ value: 0, direction: 'up' }}
        />
        <ResponsiveCard 
          title="Средний CR" 
          value={`${summary.avgCR.toFixed(2)}%`}
          icon={<Activity className="h-5 w-5 text-orange-600" />}
          trend={{ value: 0, direction: 'up' }}
        />
      </ResponsiveGrid>

      {/* Event Type Breakdown */}
      <ResponsiveGrid cols={{ sm: 2, lg: 4 }}>
        <ResponsiveCard 
          title="Лиды" 
          value={summary.totalLeads.toLocaleString()}
          icon={<Users className="h-5 w-5 text-cyan-600" />}
        />
        <ResponsiveCard 
          title="Регистрации" 
          value={summary.totalRegs.toLocaleString()}
          icon={<Users className="h-5 w-5 text-indigo-600" />}
        />
        <ResponsiveCard 
          title="Депозиты" 
          value={summary.totalDeposits.toLocaleString()}
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
        />
        <ResponsiveCard 
          title="Фрод" 
          value={`${summary.fraudRate.toFixed(2)}%`}
          icon={<Shield className="h-5 w-5 text-red-600" />}
        />
      </ResponsiveGrid>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Период</label>
              <DatePickerWithRange 
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Тип события</label>
              <Select value={filters.eventType} onValueChange={(value) => handleFilterChange('eventType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Все события" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все события</SelectItem>
                  <SelectItem value="click">Клики</SelectItem>
                  <SelectItem value="lp_click">LP клики</SelectItem>
                  <SelectItem value="lead">Лиды</SelectItem>
                  <SelectItem value="reg">Регистрации</SelectItem>
                  <SelectItem value="deposit">Депозиты</SelectItem>
                  <SelectItem value="sale">Продажи</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Страна</label>
              <Input 
                placeholder="Код страны (RU, US, etc.)"
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Устройство</label>
              <Select value={filters.device} onValueChange={(value) => handleFilterChange('device', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Все устройства" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все устройства</SelectItem>
                  <SelectItem value="mobile">Мобильные</SelectItem>
                  <SelectItem value="desktop">Десктоп</SelectItem>
                  <SelectItem value="tablet">Планшеты</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Источник трафика</label>
              <Input 
                placeholder="facebook, google, etc."
                value={filters.trafficSource}
                onChange={(e) => handleFilterChange('trafficSource', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sub1</label>
              <Input 
                placeholder="Значение Sub1"
                value={filters.sub1}
                onChange={(e) => handleFilterChange('sub1', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sub2 (Своими значениями)</label>
              <Input 
                placeholder="geo-TR|dev-mobile|src-fb"
                value={filters.sub2}
                onChange={(e) => handleFilterChange('sub2', e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="w-full"
                data-testid="reset-filters"
              >
                Сбросить фильтры
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="events">События</TabsTrigger>
          <TabsTrigger value="geography">География</TabsTrigger>
          <TabsTrigger value="devices">Устройства</TabsTrigger>
          <TabsTrigger value="subids">SubID</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Детальная статистика</CardTitle>
              <CardDescription>
                Живые данные с трекинга событий
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLive ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Загрузка данных...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Дата</th>
                        <th className="text-left p-2">Оффер</th>
                        <th className="text-left p-2">Партнер</th>
                        <th className="text-left p-2">Страна</th>
                        <th className="text-left p-2">Устройство</th>
                        <th className="text-right p-2">Клики</th>
                        <th className="text-right p-2">Конв.</th>
                        <th className="text-right p-2">Лиды</th>
                        <th className="text-right p-2">Рег.</th>
                        <th className="text-right p-2">Деп.</th>
                        <th className="text-right p-2">CR, %</th>
                        <th className="text-right p-2">EPC, $</th>
                        <th className="text-right p-2">Доход, $</th>
                        <th className="text-right p-2">Фрод, %</th>
                        <th className="text-right p-2">Время на LP, с</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">{new Date(row.date).toLocaleDateString('ru-RU')}</td>
                          <td className="p-2">
                            <div className="max-w-[100px] truncate" title={row.offerName}>
                              {row.offerName}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="max-w-[80px] truncate" title={row.partnerName}>
                              {row.partnerName}
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant="outline">{row.country}</Badge>
                          </td>
                          <td className="p-2">
                            <Badge variant="secondary">{row.device}</Badge>
                          </td>
                          <td className="text-right p-2">{row.clicks.toLocaleString()}</td>
                          <td className="text-right p-2">{row.conversions.toLocaleString()}</td>
                          <td className="text-right p-2">{row.leads.toLocaleString()}</td>
                          <td className="text-right p-2">{row.regs.toLocaleString()}</td>
                          <td className="text-right p-2">{row.deposits.toLocaleString()}</td>
                          <td className="text-right p-2">{row.cr.toFixed(2)}%</td>
                          <td className="text-right p-2">${row.epc.toFixed(2)}</td>
                          <td className="text-right p-2">${row.revenue.toFixed(2)}</td>
                          <td className="text-right p-2">
                            <span className={row.fraudRate > 5 ? 'text-red-600' : 'text-green-600'}>
                              {row.fraudRate.toFixed(2)}%
                            </span>
                          </td>
                          <td className="text-right p-2">{row.avgTimeOnPage}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                События и конверсии
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Детальная разбивка по типам событий</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                География трафика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Статистика по странам и регионам</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Устройства и браузеры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Статистика по устройствам и браузерам</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subids">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                SubID и параметры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Анализ Sub-параметров и кастомных значений</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}