import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Search, Download, Settings, Filter, RefreshCw, Eye, EyeOff, RotateCcw, Check, X } from 'lucide-react';

// Comprehensive analytics data interface with 100+ fields
interface AnalyticsData {
  // Core tracking
  id: string;
  timestamp: string;
  date: string;
  time: string;
  
  // Campaign data
  campaign: string;
  campaignId: string;
  campaignGroupId: string;
  campaignGroup: string;
  
  // SubIDs (1-30)
  subid: string;
  subId1?: string;
  subId2?: string;
  subId3?: string;
  subId4?: string;
  subId5?: string;
  subId6?: string;
  subId7?: string;
  subId8?: string;
  subId9?: string;
  subId10?: string;
  subId11?: string;
  subId12?: string;
  subId13?: string;
  subId14?: string;
  subId15?: string;
  subId16?: string;
  subId17?: string;
  subId18?: string;
  subId19?: string;
  subId20?: string;
  subId21?: string;
  subId22?: string;
  subId23?: string;
  subId24?: string;
  subId25?: string;
  subId26?: string;
  subId27?: string;
  subId28?: string;
  subId29?: string;
  subId30?: string;
  
  // Geographic data
  ip: string;
  ipMasked12: string;
  ipMasked123: string;
  country: string;
  countryFlag: string;
  region: string;
  city: string;
  language: string;
  
  // Device & Browser
  os: string;
  osLogo: string;
  osVersion: string;
  browser: string;
  browserLogo: string;
  browserVersion: string;
  device: string;
  deviceType: string;
  deviceModel: string;
  userAgent: string;
  
  // Network
  connectionType: string;
  operator: string;
  provider: string;
  usingProxy: boolean;
  
  // Offers & Landing
  offer: string;
  offerId: string;
  offerGroupId: string;
  offerGroup: string;
  landing: string;
  landingId: string;
  landingGroupId: string;
  landingGroup: string;
  
  // Traffic & Sources
  partnerNetwork: string;
  networkId: string;
  source: string;
  sourceId: string;
  stream: string;
  streamId: string;
  site: string;
  direction: string;
  
  // Tracking IDs
  clickId: string;
  visitorCode: string;
  externalId: string;
  creativeId: string;
  adCampaignId: string;
  
  // Request data
  xRequestedWith?: string;
  referrer?: string;
  emptyReferrer: boolean;
  searchEngine?: string;
  keyword?: string;
  
  // Conversion data
  isBot: boolean;
  uniqueForCampaign: boolean;
  uniqueForStream: boolean;
  uniqueGlobally: boolean;
  lead: boolean;
  sale: boolean;
  deposit: boolean;
  registration: boolean;
  clickOnLanding: boolean;
  rejected: boolean;
  
  // Financial data
  revenue: number;
  revenueExpected: number;
  revenueConfirmed: number;
  revenueRejected: number;
  revenueDeposit: number;
  revenueRegistration: number;
  cost: number;
  profit: number;
  profitability: number;
  upsells: number;
  
  // Time data
  year: number;
  month: number;
  week: number;
  dayOfWeek: number;
  day: number;
  hour: number;
  dayAndHour: string;
  timeOnLanding: number;
  timeLeftLanding: string;
  
  // Previous campaign data
  previousCampaignId?: string;
  previousCampaign?: string;
  parentClickSubid?: string;
}

interface ColumnConfig {
  key: keyof AnalyticsData;
  label: string;
  visible: boolean;
  sortable: boolean;
  width?: number;
  type: 'text' | 'number' | 'boolean' | 'date' | 'currency' | 'percentage' | 'datetime';
}

// Comprehensive column configuration with all 100+ analytics fields
const allColumns: ColumnConfig[] = [
  // Core tracking
  { key: 'timestamp', label: 'Дата и время', visible: true, sortable: true, type: 'datetime', width: 180 },
  { key: 'campaign', label: 'Кампания', visible: true, sortable: true, type: 'text', width: 120 },
  { key: 'subid', label: 'Subid', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'ip', label: 'IP', visible: true, sortable: true, type: 'text', width: 120 },
  { key: 'offer', label: 'Оффер', visible: true, sortable: true, type: 'text', width: 150 },
  { key: 'countryFlag', label: 'Флаг страны', visible: true, sortable: true, type: 'text', width: 80 },
  { key: 'region', label: 'Регион', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'city', label: 'Город', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'osLogo', label: 'Логотип ОС', visible: false, sortable: true, type: 'text', width: 80 },
  { key: 'connectionType', label: 'Тип соединения', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'deviceType', label: 'Тип устройства', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'isBot', label: 'Бот', visible: true, sortable: true, type: 'boolean', width: 60 },
  { key: 'uniqueForCampaign', label: 'Уникальный для кампании', visible: true, sortable: true, type: 'boolean', width: 150 },
  { key: 'lead', label: 'Лид', visible: true, sortable: true, type: 'boolean', width: 60 },
  { key: 'sale', label: 'Продажа', visible: true, sortable: true, type: 'boolean', width: 80 },
  { key: 'revenue', label: 'Доход', visible: true, sortable: true, type: 'currency', width: 100 },
  
  // SubIDs 1-20 (все видимы по умолчанию)
  { key: 'subId1', label: 'Sub ID 1', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId2', label: 'Sub ID 2', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId3', label: 'Sub ID 3', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId4', label: 'Sub ID 4', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId5', label: 'Sub ID 5', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId6', label: 'Sub ID 6', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId7', label: 'Sub ID 7', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId8', label: 'Sub ID 8', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId9', label: 'Sub ID 9', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId10', label: 'Sub ID 10', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId11', label: 'Sub ID 11', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId12', label: 'Sub ID 12', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId13', label: 'Sub ID 13', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId14', label: 'Sub ID 14', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId15', label: 'Sub ID 15', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId16', label: 'Sub ID 16', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId17', label: 'Sub ID 17', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId18', label: 'Sub ID 18', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId19', label: 'Sub ID 19', visible: true, sortable: true, type: 'text', width: 100 },
  { key: 'subId20', label: 'Sub ID 20', visible: true, sortable: true, type: 'text', width: 100 },
  
  // SubIDs 21-30 (скрыты по умолчанию)
  { key: 'subId21', label: 'Sub ID 21', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'subId22', label: 'Sub ID 22', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'subId23', label: 'Sub ID 23', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'subId24', label: 'Sub ID 24', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'subId25', label: 'Sub ID 25', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'subId26', label: 'Sub ID 26', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'subId27', label: 'Sub ID 27', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'subId28', label: 'Sub ID 28', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'subId29', label: 'Sub ID 29', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'subId30', label: 'Sub ID 30', visible: false, sortable: true, type: 'text', width: 100 },
  
  // Groups and IDs
  { key: 'campaignGroup', label: 'Группа кампании', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'landingGroup', label: 'Группа лендинга', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'offerGroup', label: 'Группа оффера', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'landing', label: 'Лендинг', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'partnerNetwork', label: 'Партнерская сеть', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'source', label: 'Источник', visible: true, sortable: true, type: 'text', width: 120 },
  { key: 'stream', label: 'Поток', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'site', label: 'Сайт', visible: false, sortable: true, type: 'text', width: 120 },
  
  // Request data
  { key: 'xRequestedWith', label: 'X-Requested-With', visible: false, sortable: true, type: 'text', width: 150 },
  { key: 'referrer', label: 'Реферер', visible: false, sortable: true, type: 'text', width: 150 },
  { key: 'searchEngine', label: 'Поисковик', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'keyword', label: 'Ключевик', visible: false, sortable: true, type: 'text', width: 120 },
  
  // Tracking IDs
  { key: 'clickId', label: 'Click ID', visible: true, sortable: true, type: 'text', width: 120 },
  { key: 'visitorCode', label: 'Visitor code', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'campaignId', label: 'ID кампании', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'campaignGroupId', label: 'ID группы кампании', visible: false, sortable: true, type: 'text', width: 150 },
  { key: 'offerGroupId', label: 'ID группы оффера', visible: false, sortable: true, type: 'text', width: 140 },
  { key: 'landingGroupId', label: 'ID группы лендинга', visible: false, sortable: true, type: 'text', width: 150 },
  { key: 'landingId', label: 'ID лендинга', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'offerId', label: 'ID оффера', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'networkId', label: 'ID рекламной сети', visible: false, sortable: true, type: 'text', width: 140 },
  { key: 'sourceId', label: 'ID источника', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'streamId', label: 'ID потока', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'adCampaignId', label: 'Ad Campaign ID', visible: false, sortable: true, type: 'text', width: 140 },
  { key: 'externalId', label: 'External ID', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'creativeId', label: 'Creative ID', visible: false, sortable: true, type: 'text', width: 120 },
  

  
  // Network and device
  { key: 'operator', label: 'Оператор', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'provider', label: 'Провайдер', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'country', label: 'Страна', visible: true, sortable: true, type: 'text', width: 80 },
  { key: 'language', label: 'Язык', visible: false, sortable: true, type: 'text', width: 80 },
  { key: 'userAgent', label: 'User Agent', visible: false, sortable: true, type: 'text', width: 200 },
  { key: 'os', label: 'Операционная система', visible: false, sortable: true, type: 'text', width: 150 },
  { key: 'osVersion', label: 'Версия ОС', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'browser', label: 'Браузер', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'browserVersion', label: 'Версия браузера', visible: false, sortable: true, type: 'text', width: 120 },
  { key: 'deviceModel', label: 'Модель устройства', visible: false, sortable: true, type: 'text', width: 150 },
  { key: 'browserLogo', label: 'Логотип браузера', visible: false, sortable: true, type: 'text', width: 120 },
  
  // IP variants
  { key: 'ipMasked12', label: 'IP 1.2..', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'ipMasked123', label: 'IP 1.2.3.*', visible: false, sortable: true, type: 'text', width: 120 },
  
  // Financial
  { key: 'cost', label: 'Расход', visible: false, sortable: true, type: 'currency', width: 100 },
  
  // Time data
  { key: 'year', label: 'Год', visible: false, sortable: true, type: 'number', width: 80 },
  { key: 'month', label: 'Месяц', visible: false, sortable: true, type: 'number', width: 80 },
  { key: 'week', label: 'Неделя', visible: false, sortable: true, type: 'number', width: 80 },
  { key: 'dayOfWeek', label: 'День недели', visible: false, sortable: true, type: 'number', width: 100 },
  { key: 'day', label: 'День', visible: false, sortable: true, type: 'number', width: 80 },
  { key: 'hour', label: 'Час', visible: false, sortable: true, type: 'number', width: 80 },
  { key: 'dayAndHour', label: 'День и час', visible: false, sortable: true, type: 'text', width: 100 },
  { key: 'timeLeftLanding', label: 'Время ухода с лендинга', visible: false, sortable: true, type: 'datetime', width: 180 },
  { key: 'direction', label: 'Направление', visible: false, sortable: true, type: 'text', width: 100 },
  
  // Conversion data
  { key: 'uniqueForStream', label: 'Уникальный для потока', visible: false, sortable: true, type: 'boolean', width: 150 },
  { key: 'uniqueGlobally', label: 'Уникальный глобально', visible: false, sortable: true, type: 'boolean', width: 150 },
  { key: 'emptyReferrer', label: 'Пустой реферер', visible: false, sortable: true, type: 'boolean', width: 120 },
  { key: 'usingProxy', label: 'Используя прокси', visible: false, sortable: true, type: 'boolean', width: 120 },
  { key: 'clickOnLanding', label: 'Клик на лендинге', visible: false, sortable: true, type: 'boolean', width: 130 },
  { key: 'deposit', label: 'Депозиты', visible: true, sortable: true, type: 'boolean', width: 80 },
  { key: 'registration', label: 'Регистрация', visible: true, sortable: true, type: 'boolean', width: 100 },
  { key: 'revenueDeposit', label: 'Доход (депозит)', visible: false, sortable: true, type: 'currency', width: 120 },
  { key: 'revenueRegistration', label: 'Доход (регистрация)', visible: false, sortable: true, type: 'currency', width: 140 },
  { key: 'rejected', label: 'Отклонен', visible: false, sortable: true, type: 'boolean', width: 80 },
  
  // Previous campaign
  { key: 'previousCampaignId', label: 'ID предыдущей кампании', visible: false, sortable: true, type: 'text', width: 160 },
  { key: 'parentClickSubid', label: 'Subid родит. кликов', visible: false, sortable: true, type: 'text', width: 140 },
  { key: 'previousCampaign', label: 'Предыдущая кампания', visible: false, sortable: true, type: 'text', width: 140 },
  
  // Financial extended
  { key: 'profitability', label: 'Прибыльность', visible: true, sortable: true, type: 'percentage', width: 100 },
  { key: 'profit', label: 'Прибыль', visible: true, sortable: true, type: 'currency', width: 100 },
  { key: 'revenueExpected', label: 'Доход (ожидаемый)', visible: false, sortable: true, type: 'currency', width: 140 },
  { key: 'revenueConfirmed', label: 'Доход (подтвержденный)', visible: false, sortable: true, type: 'currency', width: 160 },
  { key: 'revenueRejected', label: 'Доход (отклоненный)', visible: false, sortable: true, type: 'currency', width: 150 },
  { key: 'upsells', label: 'Допродажи', visible: false, sortable: true, type: 'number', width: 100 },
  { key: 'timeOnLanding', label: 'Время, проведенное на лендинге', visible: false, sortable: true, type: 'number', width: 200 },
];

export default function AnalyticsNew() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { isCollapsed } = useSidebar();

  // State management
  const [selectedTab, setSelectedTab] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [quickFilter, setQuickFilter] = useState('all');
  const [columns, setColumns] = useState<ColumnConfig[]>(allColumns);
  const [sortConfig, setSortConfig] = useState<{ key: keyof AnalyticsData; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showColumnSettings, setShowColumnSettings] = useState(false);

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

  // Fetch analytics data
  const { data: analyticsData = [], isLoading } = useQuery<AnalyticsData[]>({
    queryKey: ['/api/admin/analytics', { 
      search: searchTerm,
      dateFrom,
      dateTo,
      quickFilter,
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
      
      if (sortConfig) {
        params.append('sortBy', sortConfig.key);
        params.append('sortOrder', sortConfig.direction);
      }

      const response = await fetch(`/api/admin/analytics?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      return response.json();
    },
  });

  // Column visibility toggle
  const toggleColumnVisibility = (key: keyof AnalyticsData) => {
    setColumns(prev => prev.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  // Format cell value based on type
  const formatCellValue = (value: any, type: ColumnConfig['type']) => {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      case 'currency':
        return `$${Number(value).toFixed(2)}`;
      case 'percentage':
        return `${Number(value).toFixed(1)}%`;
      case 'boolean':
        return value ? (
          <div className="flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <X className="w-4 h-4 text-red-600" />
          </div>
        );
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'date':
        return new Date(value).toLocaleDateString();
      default:
        return String(value);
    }
  };

  const visibleColumns = columns.filter(col => col.visible);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header title="Аналитика" />
        <main className="flex-1 overflow-auto p-4">
          <div className="space-y-4 w-full">
            {/* Header with title and controls - responsive to sidebar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold truncate">Аналитика (Полная версия)</h1>
                  <p className="text-muted-foreground text-xs">
                    Комплексная аналитика с 100+ полями данных
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  <Button onClick={() => setShowColumnSettings(!showColumnSettings)} variant="outline" size="sm" className="text-xs px-2 py-1 h-7">
                    <Settings className="w-3 h-3 mr-1" />
                    Столбцы ({visibleColumns.length})
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">
                    <Download className="w-3 h-3 mr-1" />
                    Экспорт
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Обновить
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistics blocks - responsive to available width */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="pt-2 pb-2 px-3">
                  <div className="text-sm font-bold">{analyticsData.length}</div>
                  <p className="text-blue-100 text-xs">Всего записей</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="pt-2 pb-2 px-3">
                  <div className="text-sm font-bold">{visibleColumns.length}</div>
                  <p className="text-green-100 text-xs">Видимых столбцов</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="pt-2 pb-2 px-3">
                  <div className="text-sm font-bold">{allColumns.length}</div>
                  <p className="text-purple-100 text-xs">Всего полей</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardContent className="pt-2 pb-2 px-3">
                  <div className="text-sm font-bold">
                    {analyticsData.filter(item => item.isBot).length}
                  </div>
                  <p className="text-red-100 text-xs">Ботов обнаружено</p>
                </CardContent>
              </Card>
            </div>

            {/* Column Settings Panel - Responsive to sidebar */}
            {showColumnSettings && (
              <Card className="bg-white dark:bg-gray-800 border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Настройка столбцов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 max-h-72 overflow-y-auto">
                    {columns.map((column) => (
                      <div key={column.key} className="flex items-center space-x-1.5">
                        <Checkbox
                          id={column.key}
                          checked={column.visible}
                          onCheckedChange={() => toggleColumnVisibility(column.key)}
                        />
                        <label htmlFor={column.key} className="text-xs cursor-pointer truncate">
                          {column.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters - Responsive to sidebar and screen size */}
            <Card className="bg-white dark:bg-gray-800 border shadow-sm">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Filter className="w-3 h-3" />
                  Фильтрация данных
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1.5 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="Поиск..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-7 h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-7 text-xs"
                      title="От даты"
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-7 text-xs"
                      title="До даты"
                    />
                  </div>
                  <div>
                    <Select value={quickFilter} onValueChange={setQuickFilter}>
                      <SelectTrigger className="h-7 text-xs">
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
                  <div>
                    <Button variant="outline" className="h-7 w-full text-xs" size="sm">
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Сбросить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card className="bg-white dark:bg-gray-800 border shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <CardTitle className="text-xl">Данные аналитики ({analyticsData.length} записей)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          {visibleColumns.map((column) => (
                            <th
                              key={column.key}
                              className="text-left p-2 font-medium text-sm"
                              style={{ width: column.width }}
                            >
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.map((row, index) => (
                          <tr key={row.id || index} className="border-b hover:bg-muted/50">
                            {visibleColumns.map((column) => (
                              <td key={column.key} className="p-2 text-sm">
                                {formatCellValue(row[column.key], column.type)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {analyticsData.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Нет данных для отображения
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}