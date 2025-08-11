import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Globe, 
  Smartphone, 
  MousePointer, 
  DollarSign, 
  Users, 
  Activity,
  Download,
  Filter,
  Search,
  RefreshCw,
  PieChart,
  Monitor,
  Link,
  Hash,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { ResponsiveCard } from '@/components/layout/ResponsiveCard';

interface StatisticsSummary {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  avgCR: number;
  avgEPC: number;
  totalOffers: number;
  totalPartners: number;
}

interface StatisticsData {
  id: string;
  date: string;
  clickId?: string;  // Добавляем clickId
  country?: string;
  device?: string;
  trafficSource?: string;
  offerId?: string;
  offerName?: string;
  partnerId?: string;
  partnerName?: string;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  sub4?: string;
  sub5?: string;
  sub6?: string;
  sub7?: string;
  sub8?: string;
  sub9?: string;
  sub10?: string;
  sub11?: string;
  sub12?: string;
  sub13?: string;
  sub14?: string;
  sub15?: string;
  sub16?: string;
  clicks: number;
  uniqueClicks: number;
  conversions: number;
  revenue: number;
  payout: number;
  profit: number;
  cr: number;
  epc: number;
  ctr: number;
  roi: number;
  fraudClicks: number;
  fraudRate: number;
  clickIds?: string[];  // Для случаев группировки
}

export function AdvertiserAnalytics() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
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
    sub3: '',
    sub4: '',
    sub5: '',
    groupBy: ['date'],
    search: ''
  });
  
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageDetailed, setCurrentPageDetailed] = useState(1);
  const [currentPageGeography, setCurrentPageGeography] = useState(1);
  const [currentPageDevices, setCurrentPageDevices] = useState(1);
  const [currentPageSources, setCurrentPageSources] = useState(1);
  const [currentPageSubids, setCurrentPageSubids] = useState(1);
  const itemsPerPage = 50;

  // Fetch statistics data
  const { data: statisticsData, isLoading: isLoadingStats, refetch } = useQuery({
    queryKey: ['/api/analytics/advertiser/statistics', dateRange, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value && (Array.isArray(value) ? value.length > 0 : value.toString().trim())
          )
        )
      });
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/analytics/advertiser/statistics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    }
  });

  // Fetch offers list for filter
  const { data: offers } = useQuery({
    queryKey: ['/api/analytics/advertiser/offers'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/analytics/advertiser/offers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json();
    }
  });

  // Fetch partners list for filter
  const { data: partners } = useQuery({
    queryKey: ['/api/analytics/advertiser/partners'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/analytics/advertiser/partners', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch partners');
      return response.json();
    }
  });

  const summary: StatisticsSummary = statisticsData?.summary || {
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    avgCR: 0,
    avgEPC: 0,
    totalOffers: 0,
    totalPartners: 0
  };

  const data: StatisticsData[] = statisticsData?.data || [];

  // Helper function to create pagination component
  const PaginationComponent = ({ 
    currentPage, 
    setCurrentPage, 
    totalItems, 
    itemsPerPage = 50 
  }: { 
    currentPage: number; 
    setCurrentPage: (page: number) => void; 
    totalItems: number; 
    itemsPerPage?: number;
  }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Всегда показывать пагинацию для демонстрации
    // if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Показано {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} из {totalItems} записей
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            data-testid="pagination-prev"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Button>
          
          <div className="flex items-center space-x-1">
            {(() => {
              const pages = [];
              const showPages = 5;
              
              let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
              let endPage = Math.min(totalPages, startPage + showPages - 1);
              
              if (endPage - startPage < showPages - 1) {
                startPage = Math.max(1, endPage - showPages + 1);
              }
              
              if (startPage > 1) {
                pages.push(
                  <Button
                    key={1}
                    variant={1 === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    data-testid="pagination-page-1"
                  >
                    1
                  </Button>
                );
                if (startPage > 2) {
                  pages.push(<span key="dots1" className="px-2">...</span>);
                }
              }
              
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <Button
                    key={i}
                    variant={i === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i)}
                    data-testid={`pagination-page-${i}`}
                  >
                    {i}
                  </Button>
                );
              }
              
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(<span key="dots2" className="px-2">...</span>);
                }
                pages.push(
                  <Button
                    key={totalPages}
                    variant={totalPages === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    data-testid={`pagination-page-${totalPages}`}
                  >
                    {totalPages}
                  </Button>
                );
              }
              
              return pages;
            })()}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            data-testid="pagination-next"
          >
            Вперёд
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

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
      sub3: '',
      sub4: '',
      sub5: '',
      groupBy: ['date'],
      search: ''
    });
  };

  const exportData = async (format: 'csv' | 'xlsx' | 'json') => {
    try {
      const params = new URLSearchParams({
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
        format,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value && (Array.isArray(value) ? value.length > 0 : value.toString().trim())
          )
        )
      });
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/analytics/advertiser/statistics/export?${params}`, {
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
      a.download = `statistics_${Date.now()}.${format}`;
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
          <h1 className="text-3xl font-bold tracking-tight">Аналитика</h1>
          <p className="text-muted-foreground">
            Детальная статистика по кликам, конверсиям и доходам
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoadingStats}
            data-testid="refresh-stats"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => exportData('xlsx')}
            data-testid="export-stats"
          >
            <Download className="h-4 w-4 mr-2" />
            Экспорт
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
              <label className="text-sm font-medium mb-2 block">Оффер</label>
              <Select value={filters.offerId} onValueChange={(value) => handleFilterChange('offerId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Все офферы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все офферы</SelectItem>
                  {offers?.map((offer: any) => (
                    <SelectItem key={offer.id} value={offer.id}>
                      {offer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Партнер</label>
              <Select value={filters.partnerId} onValueChange={(value) => handleFilterChange('partnerId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Все партнеры" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все партнеры</SelectItem>
                  {partners?.map((partner: any) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.username}
                    </SelectItem>
                  ))}
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-blue-300">
            <PieChart className="h-4 w-4 mr-2 text-blue-600" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="geography" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:border-green-300">
            <Globe className="h-4 w-4 mr-2 text-green-600" />
            География
          </TabsTrigger>
          <TabsTrigger value="devices" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:border-purple-300">
            <Monitor className="h-4 w-4 mr-2 text-purple-600" />
            Устройства
          </TabsTrigger>
          <TabsTrigger value="sources" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 data-[state=active]:border-orange-300">
            <Link className="h-4 w-4 mr-2 text-orange-600" />
            Источники
          </TabsTrigger>
          <TabsTrigger value="subids" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-300">
            <Hash className="h-4 w-4 mr-2 text-indigo-600" />
            SubID
          </TabsTrigger>
          <TabsTrigger value="detailed" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-700 data-[state=active]:border-gray-300">
            <FileText className="h-4 w-4 mr-2 text-gray-600" />
            Детали
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Статистика по дням</CardTitle>
              <CardDescription>
                Показатели за выбранный период с разбивкой по дням
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Загрузка данных...</span>
                </div>
              ) : (
                <>
                  {/* Пагинация сверху */}
                  <PaginationComponent 
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalItems={data.length}
                    itemsPerPage={itemsPerPage}
                  />
                  
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Дата и время</th>
                        <th className="text-left p-2">Partner ID</th>
                        <th className="text-left p-2">Партнер</th>
                        <th className="text-left p-2">Оффер</th>
                        <th className="text-left p-2">Click ID</th>
                        <th className="text-right p-2">Клики</th>
                        <th className="text-right p-2">Конверсии</th>
                        <th className="text-right p-2">CR, %</th>
                        <th className="text-right p-2">EPC, $</th>
                        <th className="text-right p-2">Доход, $</th>
                        <th className="text-right p-2">Прибыль, $</th>
                        <th className="text-right p-2">ROI, %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedData = data.slice(startIndex, endIndex);
                        
                        return paginatedData.map((row, index) => (
                          <tr key={startIndex + index} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              {new Date(row.date).toLocaleDateString('ru-RU')} {new Date(row.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-2 text-blue-600 font-mono text-xs">
                              {row.partnerId ? row.partnerId.substring(0, 8) + '...' : 'N/A'}
                            </td>
                            <td className="p-2 font-medium">
                              {row.partnerName || 'Unknown Partner'}
                            </td>
                            <td className="p-2">
                              {row.offerName || 'Unknown Offer'}
                            </td>
                            <td className="p-2 text-green-600 font-mono text-xs">
                              {row.clickId || (row.clickIds && row.clickIds.length > 0 ? `${row.clickIds.length} кликов` : 'N/A')}
                            </td>
                            <td className="text-right p-2">{row.clicks.toLocaleString()}</td>
                            <td className="text-right p-2">{row.conversions.toLocaleString()}</td>
                            <td className="text-right p-2">{row.cr.toFixed(2)}%</td>
                            <td className="text-right p-2">${row.epc.toFixed(2)}</td>
                            <td className="text-right p-2">${row.revenue.toFixed(2)}</td>
                            <td className="text-right p-2">${row.profit.toFixed(2)}</td>
                            <td className="text-right p-2">{row.roi.toFixed(2)}%</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                
                {/* Пагинация снизу */}
                <PaginationComponent 
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={data.length}
                  itemsPerPage={itemsPerPage}
                />
                </>
              )}
              
              {/* Legacy pagination - remove later */}
              {false && data && data.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Показано {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, data.length)} из {data.length} записей
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      data-testid="pagination-prev"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Назад
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const totalPages = Math.ceil(data.length / itemsPerPage);
                        const pages = [];
                        const showPages = 5;
                        
                        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                        let endPage = Math.min(totalPages, startPage + showPages - 1);
                        
                        if (endPage - startPage < showPages - 1) {
                          startPage = Math.max(1, endPage - showPages + 1);
                        }
                        
                        if (startPage > 1) {
                          pages.push(
                            <Button
                              key={1}
                              variant={1 === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(1)}
                              data-testid="pagination-page-1"
                            >
                              1
                            </Button>
                          );
                          if (startPage > 2) {
                            pages.push(<span key="dots1" className="px-2">...</span>);
                          }
                        }
                        
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={i === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(i)}
                              data-testid={`pagination-page-${i}`}
                            >
                              {i}
                            </Button>
                          );
                        }
                        
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(<span key="dots2" className="px-2">...</span>);
                          }
                          pages.push(
                            <Button
                              key={totalPages}
                              variant={totalPages === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              data-testid={`pagination-page-${totalPages}`}
                            >
                              {totalPages}
                            </Button>
                          );
                        }
                        
                        return pages;
                      })()}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(data.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
                      data-testid="pagination-next"
                    >
                      Вперёд
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
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
              {/* Pagination Top */}
              <PaginationComponent 
                currentPage={currentPageGeography} 
                setCurrentPage={setCurrentPageGeography} 
                totalItems={data.length} 
                itemsPerPage={itemsPerPage} 
              />
              
              {isLoadingStats ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Загрузка данных по географии...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Страна</th>
                        <th className="text-left p-2">Partner ID</th>
                        <th className="text-left p-2">Click ID</th>
                        <th className="text-right p-2">Клики</th>
                        <th className="text-right p-2">Конверсии</th>
                        <th className="text-right p-2">CR, %</th>
                        <th className="text-right p-2">Доход, $</th>
                        <th className="text-right p-2">ROI, %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const startIndex = (currentPageGeography - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedData = data.slice(startIndex, endIndex);
                        
                        return paginatedData.map((row, index) => (
                          <tr key={startIndex + index} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">
                              {row.country || 'Unknown'}
                            </td>
                            <td className="p-2 text-blue-600 font-mono text-xs">
                              {row.partnerId ? row.partnerId.substring(0, 8) + '...' : 'N/A'}
                            </td>
                            <td className="p-2 text-green-600 font-mono text-xs">
                              {row.clickId || 'N/A'}
                            </td>
                            <td className="text-right p-2">{row.clicks.toLocaleString()}</td>
                            <td className="text-right p-2">{row.conversions.toLocaleString()}</td>
                            <td className="text-right p-2">{row.cr.toFixed(2)}%</td>
                            <td className="text-right p-2">${row.revenue.toFixed(2)}</td>
                            <td className="text-right p-2">{row.roi.toFixed(2)}%</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination Bottom */}
              <PaginationComponent 
                currentPage={currentPageGeography} 
                setCurrentPage={setCurrentPageGeography} 
                totalItems={data.length} 
                itemsPerPage={itemsPerPage} 
              />
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
              {/* Pagination Top */}
              <PaginationComponent 
                currentPage={currentPageDevices} 
                setCurrentPage={setCurrentPageDevices} 
                totalItems={data.length} 
                itemsPerPage={itemsPerPage} 
              />
              
              {isLoadingStats ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Загрузка данных по устройствам...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Устройство</th>
                        <th className="text-left p-2">Partner ID</th>
                        <th className="text-left p-2">Click ID</th>
                        <th className="text-left p-2">Страна</th>
                        <th className="text-right p-2">Клики</th>
                        <th className="text-right p-2">Конверсии</th>
                        <th className="text-right p-2">CR, %</th>
                        <th className="text-right p-2">Доход, $</th>
                        <th className="text-right p-2">ROI, %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const startIndex = (currentPageDevices - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedData = data.slice(startIndex, endIndex);
                        
                        return paginatedData.map((row, index) => (
                          <tr key={startIndex + index} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">
                              <div className="flex items-center gap-2">
                                {row.device === 'mobile' && <Smartphone className="h-4 w-4 text-blue-600" />}
                                {row.device === 'desktop' && <Monitor className="h-4 w-4 text-green-600" />}
                                {row.device === 'tablet' && <Monitor className="h-4 w-4 text-purple-600" />}
                                {row.device || 'Unknown'}
                              </div>
                            </td>
                            <td className="p-2 text-blue-600 font-mono text-xs">
                              {row.partnerId ? row.partnerId.substring(0, 8) + '...' : 'N/A'}
                            </td>
                            <td className="p-2 text-green-600 font-mono text-xs">
                              {row.clickId || 'N/A'}
                            </td>
                            <td className="p-2">{row.country || 'Unknown'}</td>
                            <td className="text-right p-2">{row.clicks.toLocaleString()}</td>
                            <td className="text-right p-2">{row.conversions.toLocaleString()}</td>
                            <td className="text-right p-2">{row.cr.toFixed(2)}%</td>
                            <td className="text-right p-2">${row.revenue.toFixed(2)}</td>
                            <td className="text-right p-2">{row.roi.toFixed(2)}%</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination Bottom */}
              <PaginationComponent 
                currentPage={currentPageDevices} 
                setCurrentPage={setCurrentPageDevices} 
                totalItems={data.length} 
                itemsPerPage={itemsPerPage} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Источники трафика
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Pagination Top */}
              <PaginationComponent 
                currentPage={currentPageSources} 
                setCurrentPage={setCurrentPageSources} 
                totalItems={data.length} 
                itemsPerPage={itemsPerPage} 
              />
              
              {isLoadingStats ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Загрузка данных по источникам...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Источник</th>
                        <th className="text-left p-2">Partner ID</th>
                        <th className="text-left p-2">Click ID</th>
                        <th className="text-left p-2">Устройство</th>
                        <th className="text-left p-2">Страна</th>
                        <th className="text-right p-2">Клики</th>
                        <th className="text-right p-2">Конверсии</th>
                        <th className="text-right p-2">CR, %</th>
                        <th className="text-right p-2">Доход, $</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const startIndex = (currentPageSources - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedData = data.slice(startIndex, endIndex);
                        
                        return paginatedData.map((row, index) => (
                          <tr key={startIndex + index} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">
                              {row.trafficSource || 'Direct'}
                            </td>
                            <td className="p-2 text-blue-600 font-mono text-xs">
                              {row.partnerId ? row.partnerId.substring(0, 8) + '...' : 'N/A'}
                            </td>
                            <td className="p-2 text-green-600 font-mono text-xs">
                              {row.clickId || 'N/A'}
                            </td>
                            <td className="p-2">{row.device || 'Unknown'}</td>
                            <td className="p-2">{row.country || 'Unknown'}</td>
                            <td className="text-right p-2">{row.clicks.toLocaleString()}</td>
                            <td className="text-right p-2">{row.conversions.toLocaleString()}</td>
                            <td className="text-right p-2">{row.cr.toFixed(2)}%</td>
                            <td className="text-right p-2">${row.revenue.toFixed(2)}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination Bottom */}
              <PaginationComponent 
                currentPage={currentPageSources} 
                setCurrentPage={setCurrentPageSources} 
                totalItems={data.length} 
                itemsPerPage={itemsPerPage} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subids">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                SubID анализ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Pagination Top */}
              <PaginationComponent 
                currentPage={currentPageSubids} 
                setCurrentPage={setCurrentPageSubids} 
                totalItems={data.length} 
                itemsPerPage={itemsPerPage} 
              />
              
              {isLoadingStats ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Загрузка SubID данных...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Partner ID</th>
                        <th className="text-left p-2">Click ID</th>
                        <th className="text-left p-2">Sub1</th>
                        <th className="text-left p-2">Sub2</th>
                        <th className="text-left p-2">Sub3</th>
                        <th className="text-left p-2">Sub4</th>
                        <th className="text-left p-2">Sub5</th>
                        <th className="text-left p-2">Sub6</th>
                        <th className="text-left p-2">Sub7</th>
                        <th className="text-left p-2">Sub8</th>
                        <th className="text-left p-2">Sub9</th>
                        <th className="text-left p-2">Sub10</th>
                        <th className="text-left p-2">Sub11</th>
                        <th className="text-left p-2">Sub12</th>
                        <th className="text-left p-2">Sub13</th>
                        <th className="text-left p-2">Sub14</th>
                        <th className="text-left p-2">Sub15</th>
                        <th className="text-left p-2">Sub16</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const startIndex = (currentPageSubids - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedData = data.slice(startIndex, endIndex);
                        
                        return paginatedData.map((row, index) => (
                          <tr key={startIndex + index} className="border-b hover:bg-gray-50">
                            <td className="p-2 text-blue-600 font-mono text-xs">
                              {row.partnerId ? row.partnerId.substring(0, 8) + '...' : 'N/A'}
                            </td>
                            <td className="p-2 text-green-600 font-mono text-xs">
                              {row.clickId || 'N/A'}
                            </td>
                            <td className="p-2 font-mono text-xs">{row.sub1 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub2 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub3 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub4 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub5 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub6 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub7 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub8 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub9 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub10 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub11 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub12 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub13 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub14 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub15 || '-'}</td>
                            <td className="p-2 font-mono text-xs">{row.sub16 || '-'}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination Bottom */}
              <PaginationComponent 
                currentPage={currentPageSubids} 
                setCurrentPage={setCurrentPageSubids} 
                totalItems={data.length} 
                itemsPerPage={itemsPerPage} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Детальные клики</CardTitle>
              <CardDescription>
                Полная информация по каждому отдельному клику с clickId и partnerId
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Pagination Top */}
              <PaginationComponent 
                currentPage={currentPageDetailed} 
                setCurrentPage={setCurrentPageDetailed} 
                totalItems={data.length} 
                itemsPerPage={itemsPerPage} 
              />
              
              {isLoadingStats ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Загрузка детальных данных...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Click ID</th>
                        <th className="text-left p-2">Partner ID</th>
                        <th className="text-left p-2">Партнер</th>
                        <th className="text-left p-2">Оффер</th>
                        <th className="text-left p-2">Дата/время</th>
                        <th className="text-left p-2">Страна</th>
                        <th className="text-left p-2">Устройство</th>
                        <th className="text-left p-2">Статус</th>
                        <th className="text-right p-2">Доход, $</th>
                        <th className="text-right p-2">CR, %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const startIndex = (currentPageDetailed - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedData = data.slice(startIndex, endIndex);
                        
                        return paginatedData.map((row, index) => (
                          <tr key={startIndex + index} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-mono text-xs text-green-600">
                              {row.clickId || 'N/A'}
                            </td>
                            <td className="p-2 font-mono text-xs text-blue-600">
                              {row.partnerId ? row.partnerId.substring(0, 8) + '...' : 'N/A'}
                            </td>
                            <td className="p-2 font-medium">
                              {row.partnerName || 'Unknown Partner'}
                            </td>
                            <td className="p-2">
                              {row.offerName || 'Unknown Offer'}
                            </td>
                            <td className="p-2">
                              {new Date(row.date).toLocaleDateString('ru-RU')} {new Date(row.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-2">
                              {row.country || 'Unknown'}
                            </td>
                            <td className="p-2">
                              {row.device || 'Unknown'}
                            </td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                row.conversions > 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {row.conversions > 0 ? 'Конверсия' : 'Клик'}
                              </span>
                            </td>
                            <td className="text-right p-2 font-medium">
                              ${row.revenue.toFixed(2)}
                            </td>
                            <td className="text-right p-2">
                              {row.cr.toFixed(2)}%
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination Bottom */}
              <PaginationComponent 
                currentPage={currentPageDetailed} 
                setCurrentPage={setCurrentPageDetailed} 
                totalItems={data.length} 
                itemsPerPage={itemsPerPage} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}