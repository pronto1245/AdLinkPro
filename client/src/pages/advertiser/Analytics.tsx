import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Users,
  MousePointer,
  Target,
  Eye,
  Bot,
  Shield
} from 'lucide-react';

// Интерфейс для статистических данных
interface AnalyticsRecord {
  id: string;
  date: string;
  offerId: string;
  offerName: string;
  partnerId: string;
  partnerUsername: string;
  clicks: number;
  uniqueClicks: number;
  leads: number;
  conversions: number;
  revenue: number;
  payout: number;
  profit: number;
  cr: number;
  epc: number;
  roi: number;
  geo: string;
  device: string;
  trafficSource: string;
  subId: string;
  clickId: string;
  fraudClicks: number;
  botClicks: number;
  fraudScore: number;
  postbackStatus: string;
  ipAddress: string;
  referer: string;
}

interface AnalyticsFilters {
  dateFrom: string;
  dateTo: string;
  search: string;
  offerId: string;
  partnerId: string;
  geo: string;
  device: string;
  trafficSource: string;
  fraudFilter: string;
  subId: string;
  clickId: string;
}

// Компонент для отображения метрик
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  type?: 'currency' | 'percent' | 'number';
  alert?: boolean;
}

const MetricCard = ({ title, value, change, icon: Icon, type = 'number', alert = false }: MetricCardProps) => {
  const formatValue = (val: string | number) => {
    if (type === 'currency') {
      return typeof val === 'number' ? `$${val.toFixed(2)}` : val;
    }
    if (type === 'percent') {
      return typeof val === 'number' ? `${val.toFixed(2)}%` : val;
    }
    return typeof val === 'number' ? val.toLocaleString() : val;
  };

  return (
    <Card className={alert ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className={`h-5 w-5 ${alert ? 'text-red-500' : 'text-muted-foreground'}`} />
        </div>
        <div className="space-y-1">
          <p className={`text-2xl font-bold ${alert ? 'text-red-600' : ''}`}>
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              {change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(change).toFixed(1)}% vs прошлый период
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function Analytics() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Состояния для фильтров
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 дней назад
    dateTo: new Date().toISOString().split('T')[0], // сегодня
    search: '',
    offerId: '',
    partnerId: '',
    geo: '',
    device: '',
    trafficSource: '',
    fraudFilter: '',
    subId: '',
    clickId: ''
  });

  // Состояния для настройки отображения
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    offer: true,
    partner: true,
    clicks: true,
    uniqueClicks: true,
    leads: true,
    cr: true,
    revenue: true,
    payout: true,
    profit: true,
    roi: true,
    epc: true,
    fraud: true,
    bot: true,
    subId: true,
    geo: true,
    device: true
  });

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [detailViewId, setDetailViewId] = useState<string | null>(null);

  // Получение данных статистики
  const { data: analyticsData = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/advertiser/analytics', user?.id, filters],
    queryFn: async (): Promise<AnalyticsRecord[]> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      params.set('advertiserId', user?.id || '');
      
      const response = await fetch(`/api/advertiser/analytics?${params}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные статистики');
      }
      return response.json();
    },
    enabled: !!user?.id
  });

  // Получение списка офферов для фильтра
  const { data: offers = [] } = useQuery({
    queryKey: ['/api/advertiser/offers', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/advertiser/offers`);
      if (!response.ok) throw new Error('Ошибка загрузки офферов');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Получение списка партнёров для фильтра  
  const { data: partners = [] } = useQuery({
    queryKey: ['/api/advertiser/partners', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/advertiser/partners`);
      if (!response.ok) throw new Error('Ошибка загрузки партнёров');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Вычисление сводной статистики
  const summaryMetrics = useMemo(() => {
    if (!analyticsData.length) return {
      totalClicks: 0,
      totalUniqueClicks: 0,
      totalLeads: 0,
      totalRevenue: 0,
      totalPayout: 0,
      totalProfit: 0,
      avgCR: 0,
      avgEPC: 0,
      avgROI: 0,
      totalFraudClicks: 0,
      totalBotClicks: 0
    };

    const totals = analyticsData.reduce((acc, record) => ({
      totalClicks: acc.totalClicks + record.clicks,
      totalUniqueClicks: acc.totalUniqueClicks + record.uniqueClicks,
      totalLeads: acc.totalLeads + record.leads,
      totalRevenue: acc.totalRevenue + record.revenue,
      totalPayout: acc.totalPayout + record.payout,
      totalProfit: acc.totalProfit + record.profit,
      totalFraudClicks: acc.totalFraudClicks + record.fraudClicks,
      totalBotClicks: acc.totalBotClicks + record.botClicks
    }), {
      totalClicks: 0,
      totalUniqueClicks: 0,
      totalLeads: 0,
      totalRevenue: 0,
      totalPayout: 0,
      totalProfit: 0,
      totalFraudClicks: 0,
      totalBotClicks: 0
    });

    return {
      ...totals,
      avgCR: totals.totalClicks > 0 ? (totals.totalLeads / totals.totalClicks) * 100 : 0,
      avgEPC: totals.totalClicks > 0 ? totals.totalRevenue / totals.totalClicks : 0,
      avgROI: totals.totalPayout > 0 ? ((totals.totalRevenue - totals.totalPayout) / totals.totalPayout) * 100 : 0
    };
  }, [analyticsData]);

  // Фильтрация данных
  const filteredData = useMemo(() => {
    return analyticsData.filter(record => {
      if (filters.search && !record.offerName.toLowerCase().includes(filters.search.toLowerCase()) &&
          !record.partnerUsername.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.offerId && record.offerId !== filters.offerId) return false;
      if (filters.partnerId && record.partnerId !== filters.partnerId) return false;
      if (filters.geo && record.geo !== filters.geo) return false;
      if (filters.device && record.device !== filters.device) return false;
      if (filters.trafficSource && record.trafficSource !== filters.trafficSource) return false;
      if (filters.subId && !record.subId.includes(filters.subId)) return false;
      if (filters.clickId && !record.clickId.includes(filters.clickId)) return false;
      if (filters.fraudFilter === 'fraud' && record.fraudClicks === 0) return false;
      if (filters.fraudFilter === 'bot' && record.botClicks === 0) return false;
      
      return true;
    });
  }, [analyticsData, filters]);

  // Обработчики
  const handleExport = async (format: 'csv' | 'xlsx' | 'json') => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      params.set('advertiserId', user?.id || '');
      params.set('format', format);
      
      const response = await fetch(`/api/advertiser/analytics/export?${params}`);
      if (!response.ok) throw new Error('Ошибка экспорта');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Экспорт выполнен",
        description: `Файл ${format.toUpperCase()} успешно скачан`
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось выполнить экспорт данных",
        variant: "destructive"
      });
    }
  };

  const handleNotifyPartner = async (partnerId: string, reason: string) => {
    try {
      const response = await fetch(`/api/advertiser/partners/${partnerId}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) throw new Error('Ошибка уведомления');

      toast({
        title: "Уведомление отправлено",
        description: "Партнёр получит уведомление о проблеме с трафиком"
      });
    } catch (error) {
      toast({
        title: "Ошибка уведомления",
        description: "Не удалось отправить уведомление партнёру",
        variant: "destructive"
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      search: '',
      offerId: '',
      partnerId: '',
      geo: '',
      device: '',
      trafficSource: '',
      fraudFilter: '',
      subId: '',
      clickId: ''
    });
  };

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6" data-testid="analytics-page">
        {/* Заголовок */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Статистика</h1>
            <p className="text-muted-foreground">
              Анализ эффективности офферов, партнёров и источников трафика
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
            
            <Select onValueChange={(format) => handleExport(format as 'csv' | 'xlsx' | 'json')}>
              <SelectTrigger className="w-[140px]" data-testid="select-export">
                <SelectValue placeholder="Экспорт" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Сводные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Клики"
            value={summaryMetrics.totalClicks}
            icon={MousePointer}
            type="number"
          />
          <MetricCard
            title="Уникальные клики"
            value={summaryMetrics.totalUniqueClicks}
            icon={Eye}
            type="number"
          />
          <MetricCard
            title="Лиды"
            value={summaryMetrics.totalLeads}
            icon={Target}
            type="number"
          />
          <MetricCard
            title="CR"
            value={summaryMetrics.avgCR}
            icon={TrendingUp}
            type="percent"
            alert={summaryMetrics.avgCR < 1}
          />
          <MetricCard
            title="Доход"
            value={summaryMetrics.totalRevenue}
            icon={DollarSign}
            type="currency"
          />
          <MetricCard
            title="Прибыль"
            value={summaryMetrics.totalProfit}
            icon={TrendingUp}
            type="currency"
            alert={summaryMetrics.totalProfit < 0}
          />
        </div>

        {/* Панель фильтров */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Фильтры и поиск
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Сбросить
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Основная строка фильтров */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Период дат */}
              <div className="space-y-2">
                <Label>Дата от</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  data-testid="input-date-from"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Дата до</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  data-testid="input-date-to"
                />
              </div>

              {/* Поиск */}
              <div className="space-y-2 col-span-2">
                <Label>Поиск</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="По офферу, партнёру, SubID, ClickID..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>

              {/* Фильтр по офферу */}
              <Select value={filters.offerId} onValueChange={(value) => setFilters({...filters, offerId: value})}>
                <SelectTrigger data-testid="select-offer">
                  <SelectValue placeholder="Оффер" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все офферы</SelectItem>
                  {offers.map((offer: any) => (
                    <SelectItem key={offer.id} value={offer.id}>
                      {offer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Фильтр по партнёру */}
              <Select value={filters.partnerId} onValueChange={(value) => setFilters({...filters, partnerId: value})}>
                <SelectTrigger data-testid="select-partner">
                  <SelectValue placeholder="Партнёр" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все партнёры</SelectItem>
                  {partners.map((partner: any) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Дополнительные фильтры */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* GEO */}
              <Select value={filters.geo} onValueChange={(value) => setFilters({...filters, geo: value})}>
                <SelectTrigger data-testid="select-geo">
                  <SelectValue placeholder="GEO" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все страны</SelectItem>
                  <SelectItem value="US">США</SelectItem>
                  <SelectItem value="GB">Великобритания</SelectItem>
                  <SelectItem value="DE">Германия</SelectItem>
                  <SelectItem value="FR">Франция</SelectItem>
                  <SelectItem value="RU">Россия</SelectItem>
                  <SelectItem value="CA">Канада</SelectItem>
                </SelectContent>
              </Select>

              {/* Устройство */}
              <Select value={filters.device} onValueChange={(value) => setFilters({...filters, device: value})}>
                <SelectTrigger data-testid="select-device">
                  <SelectValue placeholder="Устройство" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все устройства</SelectItem>
                  <SelectItem value="Desktop">Desktop</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>

              {/* Источник трафика */}
              <Select value={filters.trafficSource} onValueChange={(value) => setFilters({...filters, trafficSource: value})}>
                <SelectTrigger data-testid="select-traffic-source">
                  <SelectValue placeholder="Источник" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все источники</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="pop">Pop</SelectItem>
                  <SelectItem value="native">Native</SelectItem>
                  <SelectItem value="seo">SEO</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>

              {/* Фрод фильтр */}
              <Select value={filters.fraudFilter} onValueChange={(value) => setFilters({...filters, fraudFilter: value})}>
                <SelectTrigger data-testid="select-fraud">
                  <SelectValue placeholder="Фрод/Боты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все данные</SelectItem>
                  <SelectItem value="fraud">Только фрод</SelectItem>
                  <SelectItem value="bot">Только боты</SelectItem>
                </SelectContent>
              </Select>

              {/* SubID */}
              <Input
                placeholder="SubID"
                value={filters.subId}
                onChange={(e) => setFilters({...filters, subId: e.target.value})}
                data-testid="input-subid"
              />
            </div>
          </CardContent>
        </Card>

        {/* Настройка видимых колонок */}
        <Card>
          <CardHeader>
            <CardTitle>Настройки отображения таблицы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(visibleColumns).map(([key, visible]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={visible}
                    onCheckedChange={(checked) => 
                      setVisibleColumns({...visibleColumns, [key]: checked as boolean})
                    }
                    data-testid={`checkbox-${key}`}
                  />
                  <Label htmlFor={key} className="text-sm">
                    {key === 'date' && 'Дата'}
                    {key === 'offer' && 'Оффер'}
                    {key === 'partner' && 'Партнёр'}
                    {key === 'clicks' && 'Клики'}
                    {key === 'uniqueClicks' && 'Уники'}
                    {key === 'leads' && 'Лиды'}
                    {key === 'cr' && 'CR %'}
                    {key === 'revenue' && 'Доход'}
                    {key === 'payout' && 'Выплата'}
                    {key === 'profit' && 'Прибыль'}
                    {key === 'roi' && 'ROI %'}
                    {key === 'epc' && 'EPC'}
                    {key === 'fraud' && 'Фрод'}
                    {key === 'bot' && 'Бот'}
                    {key === 'subId' && 'Sub ID'}
                    {key === 'geo' && 'GEO'}
                    {key === 'device' && 'Устройство'}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Таблица данных */}
        <Card>
          <CardHeader>
            <CardTitle>
              Данные статистики ({filteredData.length} записей)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Нет данных за выбранный период</p>
                <p className="text-sm mt-2">Попробуйте изменить фильтры или период дат</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">
                        <Checkbox
                          checked={selectedRows.length === filteredData.length}
                          onCheckedChange={(checked) => 
                            setSelectedRows(checked ? filteredData.map(r => r.id) : [])
                          }
                        />
                      </th>
                      {visibleColumns.date && <th className="text-left p-2">Дата</th>}
                      {visibleColumns.offer && <th className="text-left p-2">Оффер</th>}
                      {visibleColumns.partner && <th className="text-left p-2">Партнёр</th>}
                      {visibleColumns.clicks && <th className="text-right p-2">Клики</th>}
                      {visibleColumns.uniqueClicks && <th className="text-right p-2">Уники</th>}
                      {visibleColumns.leads && <th className="text-right p-2">Лиды</th>}
                      {visibleColumns.cr && <th className="text-right p-2">CR %</th>}
                      {visibleColumns.revenue && <th className="text-right p-2">Доход</th>}
                      {visibleColumns.payout && <th className="text-right p-2">Выплата</th>}
                      {visibleColumns.profit && <th className="text-right p-2">Прибыль</th>}
                      {visibleColumns.roi && <th className="text-right p-2">ROI %</th>}
                      {visibleColumns.epc && <th className="text-right p-2">EPC</th>}
                      {visibleColumns.fraud && <th className="text-right p-2">Фрод</th>}
                      {visibleColumns.bot && <th className="text-right p-2">Бот</th>}
                      {visibleColumns.subId && <th className="text-left p-2">Sub ID</th>}
                      {visibleColumns.geo && <th className="text-left p-2">GEO</th>}
                      {visibleColumns.device && <th className="text-left p-2">Устройство</th>}
                      <th className="text-center p-2">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((record) => (
                      <tr 
                        key={record.id} 
                        className={`border-b hover:bg-muted/50 cursor-pointer ${
                          record.cr < 1 || record.roi < 0 ? 'bg-red-50 dark:bg-red-950/20' : ''
                        }`}
                        onClick={() => setDetailViewId(record.id === detailViewId ? null : record.id)}
                        data-testid={`row-${record.id}`}
                      >
                        <td className="p-2">
                          <Checkbox
                            checked={selectedRows.includes(record.id)}
                            onCheckedChange={(checked) =>
                              setSelectedRows(prev =>
                                checked 
                                  ? [...prev, record.id]
                                  : prev.filter(id => id !== record.id)
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        {visibleColumns.date && (
                          <td className="p-2">{new Date(record.date).toLocaleDateString('ru-RU')}</td>
                        )}
                        {visibleColumns.offer && (
                          <td className="p-2 max-w-[150px] truncate" title={record.offerName}>
                            {record.offerName}
                          </td>
                        )}
                        {visibleColumns.partner && (
                          <td className="p-2">{record.partnerUsername}</td>
                        )}
                        {visibleColumns.clicks && (
                          <td className="p-2 text-right">{record.clicks.toLocaleString()}</td>
                        )}
                        {visibleColumns.uniqueClicks && (
                          <td className="p-2 text-right">{record.uniqueClicks.toLocaleString()}</td>
                        )}
                        {visibleColumns.leads && (
                          <td className="p-2 text-right">{record.leads.toLocaleString()}</td>
                        )}
                        {visibleColumns.cr && (
                          <td className={`p-2 text-right ${record.cr < 1 ? 'text-red-600 font-bold' : ''}`}>
                            {record.cr.toFixed(2)}%
                          </td>
                        )}
                        {visibleColumns.revenue && (
                          <td className="p-2 text-right text-green-600 font-medium">
                            ${record.revenue.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.payout && (
                          <td className="p-2 text-right text-red-600">
                            ${record.payout.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.profit && (
                          <td className={`p-2 text-right font-medium ${
                            record.profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${record.profit.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.roi && (
                          <td className={`p-2 text-right ${record.roi < 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                            {record.roi.toFixed(2)}%
                          </td>
                        )}
                        {visibleColumns.epc && (
                          <td className="p-2 text-right">${record.epc.toFixed(4)}</td>
                        )}
                        {visibleColumns.fraud && (
                          <td className="p-2 text-right">
                            {record.fraudClicks > 0 && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                {record.fraudClicks}
                              </Badge>
                            )}
                          </td>
                        )}
                        {visibleColumns.bot && (
                          <td className="p-2 text-right">
                            {record.botClicks > 0 && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Bot className="h-3 w-3" />
                                {record.botClicks}
                              </Badge>
                            )}
                          </td>
                        )}
                        {visibleColumns.subId && (
                          <td className="p-2 font-mono text-xs">{record.subId}</td>
                        )}
                        {visibleColumns.geo && (
                          <td className="p-2">{record.geo}</td>
                        )}
                        {visibleColumns.device && (
                          <td className="p-2">{record.device}</td>
                        )}
                        <td className="p-2">
                          <div className="flex items-center justify-center gap-1">
                            {(record.cr < 1 || record.roi < 0) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotifyPartner(record.partnerId, 'low_performance');
                                }}
                                title="Уведомить партнёра о низкой эффективности"
                                data-testid={`button-notify-${record.id}`}
                              >
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailViewId(record.id === detailViewId ? null : record.id);
                              }}
                              title="Детали записи"
                              data-testid={`button-details-${record.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Детальная информация по выбранной записи */}
        {detailViewId && (
          <Card>
            <CardHeader>
              <CardTitle>Детальная информация</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const record = filteredData.find(r => r.id === detailViewId);
                if (!record) return <p>Запись не найдена</p>;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Базовая информация</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Click ID:</span> <code>{record.clickId}</code></p>
                        <p><span className="font-medium">Sub ID:</span> <code>{record.subId}</code></p>
                        <p><span className="font-medium">IP адрес:</span> {record.ipAddress}</p>
                        <p><span className="font-medium">Referrer:</span> {record.referer || 'Нет'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Технические данные</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Устройство:</span> {record.device}</p>
                        <p><span className="font-medium">GEO:</span> {record.geo}</p>
                        <p><span className="font-medium">Источник:</span> {record.trafficSource}</p>
                        <p><span className="font-medium">Постбек:</span> 
                          <Badge variant={record.postbackStatus === 'sent' ? 'default' : 'secondary'}>
                            {record.postbackStatus}
                          </Badge>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Безопасность</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Фрод клики:</span> 
                          <span className={record.fraudClicks > 0 ? 'text-red-600 font-bold' : ''}>
                            {record.fraudClicks}
                          </span>
                        </p>
                        <p><span className="font-medium">Бот клики:</span> 
                          <span className={record.botClicks > 0 ? 'text-orange-600 font-bold' : ''}>
                            {record.botClicks}
                          </span>
                        </p>
                        <p><span className="font-medium">Скор фрода:</span> 
                          <span className={record.fraudScore > 50 ? 'text-red-600' : 'text-green-600'}>
                            {record.fraudScore}/100
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </RoleBasedLayout>
  );
}