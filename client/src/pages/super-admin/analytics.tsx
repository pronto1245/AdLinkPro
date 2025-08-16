import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/auth-context';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { format, subDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '../../components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useToast } from '../../hooks/use-toast';
import { queryClient } from '../../lib/queryClient';
import { 
  Search, Download, Settings, 
  TrendingUp, TrendingDown, BarChart3,
  FileSpreadsheet, FileJson,
  ChevronLeft, ChevronRight, RotateCcw, Save
} from 'lucide-react';
import { startOfDay, endOfDay } from 'date-fns';

interface AnalyticsData {
  id: string;
  timestamp: string;
  ip: string;
  geo: string;
  browser: string;
  device: string;
  os: string;
  offerId: string;
  offerName: string;
  partnerId: string;
  partnerName: string;
  subId1?: string;
  subId2?: string;
  subId3?: string;
  subId4?: string;
  subId5?: string;
  clickId: string;
  visitorCode: string;
  traffic_source: string;
  campaign: string;
  clicks: number;
  uniqueClicks: number;
  leads: number;
  conversions: number;
  revenue: number;
  payout: number;
  profit: number;
  roi: number;
  cr: number;
  epc: number;
  isBot: boolean;
  isFraud: boolean;
  isUnique: boolean;
  vpnDetected: boolean;
  riskScore: number;
  postbackReceived: boolean;
  integrationSource: string;
}

interface ColumnConfig {
  key: keyof AnalyticsData;
  label: string;
  visible: boolean;
  sortable: boolean;
  width?: number;
  type: 'text' | 'number' | 'boolean' | 'date' | 'currency' | 'percentage';
}

const defaultColumns: ColumnConfig[] = [
  { key: 'timestamp', label: 'Время', visible: true, sortable: true, type: 'date', width: 140 },
  { key: 'ip', label: 'IP', visible: true, sortable: true, type: 'text', width: 120 },
  { key: 'geo', label: 'GEO', visible: true, sortable: true, type: 'text', width: 80 },
  { key: 'offerName', label: 'Оффер', visible: true, sortable: true, type: 'text', width: 150 },
  { key: 'partnerName', label: 'Партнер', visible: true, sortable: true, type: 'text', width: 120 },
  { key: 'subId1', label: 'Sub ID 1', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId2', label: 'Sub ID 2', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'subId3', label: 'Sub ID 3', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'clickId', label: 'Click ID', visible: true, sortable: true, type: 'text', width: 120 },
  { key: 'traffic_source', label: 'Источник', visible: true, sortable: true, type: 'text', width: 120 },
  { key: 'campaign', label: 'Кампания', visible: true, sortable: true, type: 'text', width: 120 },
  { key: 'browser', label: 'Браузер', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'device', label: 'Устройство', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'os', label: 'ОС', visible: false, sortable: true, type: 'text', width: 80 },
  { key: 'clicks', label: 'Клики', visible: true, sortable: true, type: 'number', width: 80 },
  { key: 'uniqueClicks', label: 'Уники', visible: true, sortable: true, type: 'number', width: 80 },
  { key: 'leads', label: 'Лиды', visible: true, sortable: true, type: 'number', width: 80 },
  { key: 'conversions', label: 'Конверсии', visible: true, sortable: true, type: 'number', width: 100 },
  { key: 'revenue', label: 'Доход', visible: true, sortable: true, type: 'currency', width: 100 },
  { key: 'payout', label: 'Выплата', visible: true, sortable: true, type: 'currency', width: 100 },
  { key: 'profit', label: 'Прибыль', visible: true, sortable: true, type: 'currency', width: 100 },
  { key: 'roi', label: 'ROI %', visible: true, sortable: true, type: 'percentage', width: 80 },
  { key: 'cr', label: 'CR %', visible: true, sortable: true, type: 'percentage', width: 80 },
  { key: 'epc', label: 'EPC $', visible: true, sortable: true, type: 'currency', width: 80 },
  { key: 'isBot', label: 'Бот', visible: true, sortable: true, type: 'boolean', width: 60 },
  { key: 'isFraud', label: 'Фрод', visible: true, sortable: true, type: 'boolean', width: 60 },
  { key: 'vpnDetected', label: 'VPN', visible: false, sortable: true, type: 'boolean', width: 60 },
  { key: 'riskScore', label: 'Риск', visible: true, sortable: true, type: 'number', width: 80 },
  { key: 'postbackReceived', label: 'Постбек', visible: false, sortable: true, type: 'boolean', width: 80 },
  { key: 'integrationSource', label: 'Интеграция', visible: false, sortable: true, type: 'text', width: 100 },
];

export default function Analytics() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();

  // State management
  const [selectedTab, setSelectedTab] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [quickFilter, setQuickFilter] = useState('all');
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [sortConfig, setSortConfig] = useState<{ key: keyof AnalyticsData; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Quick filters
  const quickFilters = [
    { value: 'all', label: 'Все данные' },
    { value: 'today', label: 'Сегодня' },
    { value: 'yesterday', label: 'Вчера' },
    { value: '7days', label: '7 дней' },
    { value: '30days', label: '30 дней' },
    { value: 'bots', label: 'Только боты' },
    { value: 'fraud', label: 'Только фрод' },
    { value: 'conversions', label: 'С конверсиями' },
    { value: 'highRoi', label: 'Высокий ROI' },
    { value: 'lowRoi', label: 'Низкий ROI' }
  ];

  // Real-time analytics data from PostgreSQL database
  const { data: analyticsData = [], isLoading } = useQuery<AnalyticsData[]>({
    queryKey: ['/api/admin/analytics', { 
      search: searchTerm,
      dateFrom,
      dateTo,
      quickFilter,
      filters,
      page: currentPage,
      limit: pageSize,
      sort: sortConfig
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (quickFilter && quickFilter !== 'all') params.append('quickFilter', quickFilter);
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(`filter_${key}`, value);
      });
      
      if (sortConfig) {
        params.append('sortBy', sortConfig.key);
        params.append('sortOrder', sortConfig.direction);
      }

      const response = await fetch(`/api/admin/analytics?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Ошибка загрузки аналитики');
      return response.json();
    },
    refetchInterval: 30000, // Real-time updates every 30 seconds
  });

  // Column visibility toggle
  const toggleColumnVisibility = useCallback((columnKey: keyof AnalyticsData) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  }, []);

  // Sorting
  const handleSort = useCallback((columnKey: keyof AnalyticsData) => {
    setSortConfig(prev => {
      if (prev?.key === columnKey) {
        return prev.direction === 'asc' 
          ? { key: columnKey, direction: 'desc' }
          : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  }, []);

  // Quick filter handling
  const handleQuickFilter = useCallback((value: string) => {
    setQuickFilter(value);
    const now = new Date();
    
    switch (value) {
      case 'today':
        setDateFrom(format(now, 'yyyy-MM-dd'));
        setDateTo(format(now, 'yyyy-MM-dd'));
        break;
      case 'yesterday':
        const yesterday = subDays(now, 1);
        setDateFrom(format(yesterday, 'yyyy-MM-dd'));
        setDateTo(format(yesterday, 'yyyy-MM-dd'));
        break;
      case '7days':
        setDateFrom(format(subDays(now, 7), 'yyyy-MM-dd'));
        setDateTo(format(now, 'yyyy-MM-dd'));
        break;
      case '30days':
        setDateFrom(format(subDays(now, 30), 'yyyy-MM-dd'));
        setDateTo(format(now, 'yyyy-MM-dd'));
        break;
      case 'bots':
        setFilters(prev => ({ ...prev, isBot: 'true' }));
        break;
      case 'fraud':
        setFilters(prev => ({ ...prev, isFraud: 'true' }));
        break;
      case 'conversions':
        setFilters(prev => ({ ...prev, hasConversions: 'true' }));
        break;
      case 'highRoi':
        setFilters(prev => ({ ...prev, minRoi: '100' }));
        break;
      case 'lowRoi':
        setFilters(prev => ({ ...prev, maxRoi: '0' }));
        break;
      default:
        setFilters({});
    }
    setCurrentPage(1);
  }, []);

  // Export functionality
  const exportData = useCallback(async (format: 'csv' | 'xlsx' | 'json') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      params.append('search', searchTerm);
      params.append('dateFrom', dateFrom);
      params.append('dateTo', dateTo);
      params.append('quickFilter', quickFilter);
      
      const response = await fetch(`/api/admin/analytics/export?${params}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          columns: columns.filter(col => col.visible).map(col => col.key)
        })
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${format}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Экспорт завершен",
        description: `Данные экспортированы в формате ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        variant: "destructive"
      });
    }
  }, [searchTerm, dateFrom, dateTo, quickFilter, columns, token, toast]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({});
    setQuickFilter('all');
    setSortConfig(null);
    setCurrentPage(1);
    setDateFrom(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
    setDateTo(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  // Format cell value based on type
  const formatCellValue = useCallback((value: any, type: ColumnConfig['type']) => {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('ru-RU', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 2 
        }).format(Number(value));
      case 'percentage':
        return `${Number(value).toFixed(2)}%`;
      case 'number':
        return Number(value).toLocaleString('ru-RU');
      case 'boolean':
        return value ? '✓' : '✗';
      case 'date':
        return format(new Date(value), 'dd.MM.yyyy HH:mm');
      default:
        return String(value);
    }
  }, []);

  // Visible columns
  const visibleColumns = useMemo(() => 
    columns.filter(col => col.visible), [columns]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Аналитика и Статистика
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Полный анализ эффективности офферов, источников и партнеров
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Таблица
            </TabsTrigger>
            <TabsTrigger value="charts">Графики</TabsTrigger>
            <TabsTrigger value="reports">Отчеты</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <CardTitle className="text-xl">Детальная Аналитика</CardTitle>
                  
                  {/* Controls Row 1: Search, Date, Quick Filters */}
                  <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                    <div className="relative min-w-[300px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Поиск по IP, SubID, ClickID, GEO..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-analytics-search"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-[140px]"
                        data-testid="input-date-from"
                      />
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-[140px]"
                        data-testid="input-date-to"
                      />
                    </div>
                    
                    <Select value={quickFilter} onValueChange={handleQuickFilter}>
                      <SelectTrigger className="w-[160px]" data-testid="select-quick-filter">
                        <SelectValue placeholder="Быстрые фильтры" />
                      </SelectTrigger>
                      <SelectContent>
                        {quickFilters.map(filter => (
                          <SelectItem key={filter.value} value={filter.value}>
                            {filter.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Controls Row 2: Column Config, Export, Reset */}
                <div className="flex flex-wrap gap-3 items-center justify-between pt-4 border-t">
                  <div className="flex gap-3 items-center">
                    {/* Column Visibility */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" data-testid="button-columns">
                          <Settings className="h-4 w-4 mr-2" />
                          Столбцы ({visibleColumns.length})
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 max-h-[400px] overflow-y-auto">
                        {columns.map(column => (
                          <DropdownMenuCheckboxItem
                            key={column.key}
                            checked={column.visible}
                            onCheckedChange={() => toggleColumnVisibility(column.key)}
                          >
                            {column.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Export */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" data-testid="button-export">
                          <Download className="h-4 w-4 mr-2" />
                          Экспорт
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => exportData('csv')}>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportData('xlsx')}>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Excel (XLSX)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportData('json')}>
                          <FileJson className="h-4 w-4 mr-2" />
                          JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetFilters}
                      data-testid="button-reset"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Сброс
                    </Button>
                  </div>

                  <div className="text-sm text-gray-500">
                    Всего записей: {analyticsData.length}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Table Container with Horizontal Scroll */}
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800">
                        {visibleColumns.map(column => (
                          <TableHead 
                            key={column.key}
                            className={`text-left font-medium text-gray-900 dark:text-gray-100 ${
                              column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                            }`}
                            style={{ width: column.width }}
                            onClick={() => column.sortable && handleSort(column.key)}
                            data-testid={`header-${column.key}`}
                          >
                            <div className="flex items-center gap-2">
                              {column.label}
                              {sortConfig?.key === column.key && (
                                sortConfig.direction === 'asc' 
                                  ? <TrendingUp className="h-4 w-4" />
                                  : <TrendingDown className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell 
                            colSpan={visibleColumns.length} 
                            className="text-center py-8 text-gray-500"
                          >
                            Загрузка данных...
                          </TableCell>
                        </TableRow>
                      ) : analyticsData.length === 0 ? (
                        <TableRow>
                          <TableCell 
                            colSpan={visibleColumns.length} 
                            className="text-center py-8 text-gray-500"
                          >
                            Нет данных для отображения
                          </TableCell>
                        </TableRow>
                      ) : (
                        analyticsData.map(row => (
                          <TableRow 
                            key={row.id} 
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            data-testid={`row-analytics-${row.id}`}
                          >
                            {visibleColumns.map(column => (
                              <TableCell 
                                key={`${row.id}-${column.key}`}
                                className="py-2 px-4 text-sm"
                                data-testid={`cell-${column.key}-${row.id}`}
                              >
                                {column.key === 'geo' && (
                                  <Badge variant="outline" className="font-mono">
                                    {row[column.key]}
                                  </Badge>
                                )}
                                {column.key === 'isBot' && row.isBot && (
                                  <Badge variant="destructive">БОТ</Badge>
                                )}
                                {column.key === 'isFraud' && row.isFraud && (
                                  <Badge variant="destructive">ФРОД</Badge>
                                )}
                                {column.key === 'riskScore' && (
                                  <Badge 
                                    variant={
                                      row.riskScore > 70 ? 'destructive' :
                                      row.riskScore > 40 ? 'secondary' : 'default'
                                    }
                                  >
                                    {row.riskScore}
                                  </Badge>
                                )}
                                {!['geo', 'isBot', 'isFraud', 'riskScore'].includes(column.key) && 
                                  formatCellValue(row[column.key], column.type)
                                }
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Показано:</span>
                    <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500">записей</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <span className="text-sm">
                      Страница {currentPage}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={analyticsData.length < pageSize}
                      data-testid="button-next-page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Графики и Визуализации</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Раздел графиков в разработке
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Отчеты и Аналитика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Раздел отчетов в разработке
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}