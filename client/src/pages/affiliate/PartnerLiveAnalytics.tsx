import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MousePointer, 
  Globe, 
  Smartphone, 
  Eye,
  Clock,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { DatePickerWithRange } from '../components/ui/date-range-picker';
import { ResponsiveGrid } from '../../components/layout/ResponsiveGrid';
import { ResponsiveCard } from '../../components/layout/ResponsiveCard';

interface PartnerStatistics {
  id: string;
  date: string;
  country: string;
  device: string;
  trafficSource: string;
  offerId: string;
  sub1: string;
  sub2: string;
  clicks: number;
  uniqueClicks: number;
  conversions: number;
  revenue: number;
  payout: number;
  cr: number;
  epc: number;
}

interface PartnerSummary {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalPayout: number;
  avgCR: number;
  avgEPC: number;
  totalOffers: number;
}

export default function PartnerLiveAnalytics() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const [filters, setFilters] = useState({
    offerId: '',
    country: '',
    device: '',
    trafficSource: '',
    sub1: '',
    sub2: '',
    search: ''
  });

  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch partner live statistics data
  const { data: partnerData, isLoading: isLoadingPartner, refetch } = useQuery({
    queryKey: ['/api/live-analytics/partner/live-statistics', dateRange, filters],
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
      const response = await fetch(`/api/live-analytics/partner/live-statistics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch partner statistics');
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30 seconds
  });

  const summary: PartnerSummary = partnerData?.summary || {
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    totalPayout: 0,
    avgCR: 0,
    avgEPC: 0,
    totalOffers: 0
  };

  const data: PartnerStatistics[] = partnerData?.data || [];

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? '' : value }));
  };

  const resetFilters = () => {
    setFilters({
      offerId: '',
      country: '',
      device: '',
      trafficSource: '',
      sub1: '',
      sub2: '',
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
      const response = await fetch(`/api/live-analytics/partner/live-statistics/export?${params}`, {
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
      a.download = `partner_analytics_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Тихо обрабатываем ошибки экспорта
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Eye className="h-8 w-8 text-green-600" />
            Живая Статистика
          </h1>
          <p className="text-muted-foreground">
            Статистика вашего трафика в реальном времени
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
          title="Выплата" 
          value={`$${summary.totalPayout.toLocaleString()}`}
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

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Статистика трафика</CardTitle>
          <CardDescription>
            Подробные данные по вашему трафику
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPartner ? (
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
                    <th className="text-left p-2">Оффер ID</th>
                    <th className="text-left p-2">Страна</th>
                    <th className="text-left p-2">Устройство</th>
                    <th className="text-left p-2">Источник</th>
                    <th className="text-left p-2">Sub1</th>
                    <th className="text-left p-2">Sub2</th>
                    <th className="text-right p-2">Клики</th>
                    <th className="text-right p-2">Уникальные</th>
                    <th className="text-right p-2">Конверсии</th>
                    <th className="text-right p-2">CR, %</th>
                    <th className="text-right p-2">EPC, $</th>
                    <th className="text-right p-2">Выплата, $</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{new Date(row.date).toLocaleDateString('ru-RU')}</td>
                      <td className="p-2">
                        <Badge variant="outline">{row.offerId}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{row.country}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">{row.device}</Badge>
                      </td>
                      <td className="p-2">{row.trafficSource}</td>
                      <td className="p-2">{row.sub1}</td>
                      <td className="p-2">
                        <div className="max-w-[100px] truncate" title={row.sub2}>
                          {row.sub2}
                        </div>
                      </td>
                      <td className="text-right p-2">{row.clicks.toLocaleString()}</td>
                      <td className="text-right p-2">{row.uniqueClicks.toLocaleString()}</td>
                      <td className="text-right p-2">{row.conversions.toLocaleString()}</td>
                      <td className="text-right p-2">{row.cr.toFixed(2)}%</td>
                      <td className="text-right p-2">${row.epc.toFixed(2)}</td>
                      <td className="text-right p-2 font-semibold text-green-600">
                        ${row.payout.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}