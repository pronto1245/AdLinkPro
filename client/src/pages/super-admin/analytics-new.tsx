import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Search, Download, Settings, Filter, RefreshCw, Eye, EyeOff, RotateCcw, Check, X, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import OsLogo from '@/components/ui/os-logo';

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
  { key: 'country', label: 'Страна', visible: true, sortable: true, type: 'text', width: 100 },
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
  const queryClient = useQueryClient();

  // State management
  const [selectedTab, setSelectedTab] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [quickFilter, setQuickFilter] = useState('all');
  const [columns, setColumns] = useState<ColumnConfig[]>(allColumns);
  const [sortConfig, setSortConfig] = useState<{ key: keyof AnalyticsData; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Drag and drop state for column reordering
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const dragCounterRef = useRef(0);

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
  const { data: analyticsResponse, isLoading } = useQuery<{data: AnalyticsData[], total: number, totalPages: number}>({
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
      const result = await response.json();
      
      // Handle both array response (current) and paginated response (future)
      if (Array.isArray(result)) {
        const total = result.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = result.slice(startIndex, endIndex);
        
        return {
          data: paginatedData,
          total: total,
          totalPages: totalPages
        };
      }
      
      return result;
    }
  });

  const analyticsData = analyticsResponse?.data || [];
  
  // Update pagination info when data changes
  useEffect(() => {
    if (analyticsResponse) {
      setTotalRecords(analyticsResponse.total);
      setTotalPages(analyticsResponse.totalPages);
    }
  }, [analyticsResponse]);

  // Column visibility toggle
  const toggleColumnVisibility = (key: keyof AnalyticsData) => {
    setColumns(prev => prev.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  // Country flag component
  const CountryFlag = ({ countryCode }: { countryCode: string }) => {
    if (!countryCode || countryCode === '-') return <span>-</span>;
    
    const getFlag = (code: string) => {
      const flags: { [key: string]: string } = {
        'RU': '🇷🇺', 'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
        'IT': '🇮🇹', 'ES': '🇪🇸', 'PL': '🇵🇱', 'UA': '🇺🇦', 'BY': '🇧🇾',
        'KZ': '🇰🇿', 'UZ': '🇺🇿', 'KG': '🇰🇬', 'TJ': '🇹🇯', 'TM': '🇹🇲',
        'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'IN': '🇮🇳', 'TH': '🇹🇭',
        'VN': '🇻🇳', 'PH': '🇵🇭', 'ID': '🇮🇩', 'MY': '🇲🇾', 'SG': '🇸🇬',
        'AU': '🇦🇺', 'NZ': '🇳🇿', 'CA': '🇨🇦', 'MX': '🇲🇽', 'BR': '🇧🇷',
        'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪', 'VE': '🇻🇪',
        'TR': '🇹🇷', 'AE': '🇦🇪', 'SA': '🇸🇦', 'IL': '🇮🇱', 'EG': '🇪🇬',
        'ZA': '🇿🇦', 'NG': '🇳🇬', 'KE': '🇰🇪', 'GH': '🇬🇭', 'MA': '🇲🇦',
        'NO': '🇳🇴', 'SE': '🇸🇪', 'DK': '🇩🇰', 'FI': '🇫🇮', 'NL': '🇳🇱',
        'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹', 'CZ': '🇨🇿', 'HU': '🇭🇺',
        'RO': '🇷🇴', 'BG': '🇧🇬', 'HR': '🇭🇷', 'RS': '🇷🇸', 'SI': '🇸🇮',
        'SK': '🇸🇰', 'LT': '🇱🇹', 'LV': '🇱🇻', 'EE': '🇪🇪', 'IE': '🇮🇪',
        'PT': '🇵🇹', 'GR': '🇬🇷', 'CY': '🇨🇾', 'MT': '🇲🇹', 'IS': '🇮🇸'
      };
      return flags[code.toUpperCase()] || `🏳️ ${code}`;
    };

    return (
      <span className="inline-flex items-center gap-1 text-base" title={countryCode}>
        {getFlag(countryCode)}
      </span>
    );
  };

  // Format cell value based on type
  // Enhanced OS Logo component with SVG icons
  const OsLogoLocal = ({ os }: { os: string }) => {
    const getOsInfo = (osName: string) => {
      const osLower = osName?.toLowerCase() || '';
      
      if (osLower.includes('windows')) {
        return { 
          icon: (
            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 3.4L10.1 2V11.6H0V3.4ZM11.3 1.9L24 0V11.6H11.3V1.9ZM24 12.4V24L11.3 22.1V12.4H24ZM10.1 22.2L0 20.6V12.4H10.1V22.2Z"/>
            </svg>
          ), 
          name: 'Windows', 
          color: 'text-blue-600' 
        };
      } else if (osLower.includes('mac') || osLower.includes('darwin')) {
        return { 
          icon: (
            <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.19 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
            </svg>
          ), 
          name: 'macOS', 
          color: 'text-gray-600' 
        };
      } else if (osLower.includes('linux') || osLower.includes('ubuntu')) {
        return { 
          icon: (
            <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 2C12.3 2 12.15 2.03 12 2.06C11.85 2.03 11.7 2 11.5 2C10.26 2 9.27 3 9.27 4.22C9.27 4.31 9.28 4.4 9.29 4.5C9.1 4.77 8.95 5.08 8.84 5.42C8.46 6.55 8.46 7.77 8.84 8.9C9.05 9.5 9.37 10.04 9.78 10.5C9.83 10.56 9.88 10.61 9.94 10.66C10.28 11.05 10.69 11.38 11.16 11.63C11.41 11.77 11.69 11.87 11.97 11.95C12.03 11.97 12.1 11.98 12.16 12C12.22 11.98 12.29 11.97 12.35 11.95C12.63 11.87 12.91 11.77 13.16 11.63C13.63 11.38 14.04 11.05 14.38 10.66C14.44 10.61 14.49 10.56 14.54 10.5C14.95 10.04 15.27 9.5 15.48 8.9C15.86 7.77 15.86 6.55 15.48 5.42C15.37 5.08 15.22 4.77 15.03 4.5C15.04 4.4 15.05 4.31 15.05 4.22C15.05 3 14.06 2 12.82 2H12.5Z"/>
            </svg>
          ), 
          name: 'Linux', 
          color: 'text-orange-600' 
        };
      } else if (osLower.includes('android')) {
        return { 
          icon: (
            <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.6 9.48L16.38 8.26C16.18 8.06 15.86 8.06 15.66 8.26C15.46 8.46 15.46 8.78 15.66 8.98L16.88 10.2C15.93 10.8 14.8 11.15 13.6 11.15C12.4 11.15 11.27 10.8 10.32 10.2L11.54 8.98C11.74 8.78 11.74 8.46 11.54 8.26C11.34 8.06 11.02 8.06 10.82 8.26L9.6 9.48C8.75 10.33 8.25 11.48 8.25 12.75V17.25C8.25 18.77 9.48 20 11 20H16C17.52 20 18.75 18.77 18.75 17.25V12.75C18.75 11.48 18.25 10.33 17.6 9.48Z"/>
            </svg>
          ), 
          name: 'Android', 
          color: 'text-green-600' 
        };
      } else if (osLower.includes('ios') || osLower.includes('iphone')) {
        return { 
          icon: (
            <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.19 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
            </svg>
          ), 
          name: 'iOS', 
          color: 'text-gray-600' 
        };
      } else {
        return { 
          icon: (
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6H20V18H4V6ZM20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4Z"/>
            </svg>
          ), 
          name: osName || 'Unknown', 
          color: 'text-gray-400' 
        };
      }
    };

    const osInfo = getOsInfo(os);
    
    return (
      <div className="flex items-center gap-1.5" title={`OS: ${osInfo.name}`}>
        {osInfo.icon}
        <span className={`text-xs font-medium ${osInfo.color}`}>{osInfo.name}</span>
      </div>
    );
  };

  const formatCellValue = (value: any, type: ColumnConfig['type'], columnKey?: string) => {
    if (value === null || value === undefined) return '-';
    
    // Special handling for country flag - only show flag in countryFlag column
    if (columnKey === 'countryFlag') {
      return <CountryFlag countryCode={value} />;
    }
    
    // Special handling for country name - show full country name in country column
    if (columnKey === 'country') {
      const countryNames: { [key: string]: string } = {
        'RU': 'Россия', 'US': 'США', 'DE': 'Германия', 'UA': 'Украина', 
        'BY': 'Беларусь', 'KZ': 'Казахстан', 'GB': 'Великобритания', 
        'FR': 'Франция', 'IT': 'Италия', 'ES': 'Испания'
      };
      return <span className="text-sm font-medium">{countryNames[value] || value}</span>;
    }
    
    // Special handling for OS logo
    if (columnKey === 'osLogo' || columnKey === 'os') {
      return <OsLogoLocal os={value} />;
    }
    
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

  // Drag and drop handlers for column reordering
  const handleColumnDragStart = (e: React.DragEvent, columnIndex: number) => {
    setDraggedColumn(columnIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    dragCounterRef.current = 0;
  };

  const handleColumnDragOver = (e: React.DragEvent, columnIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedColumn !== null && draggedColumn !== columnIndex) {
      setDragOverColumn(columnIndex);
    }
  };

  const handleColumnDragEnter = (e: React.DragEvent, columnIndex: number) => {
    e.preventDefault();
    dragCounterRef.current++;
    if (draggedColumn !== null && draggedColumn !== columnIndex) {
      setDragOverColumn(columnIndex);
    }
  };

  const handleColumnDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setDragOverColumn(null);
    }
  };

  const handleColumnDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedColumn === null || draggedColumn === dropIndex) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      dragCounterRef.current = 0;
      return;
    }

    // Reorder visible columns
    const newVisibleColumns = [...visibleColumns];
    const draggedItem = newVisibleColumns[draggedColumn];
    newVisibleColumns.splice(draggedColumn, 1);
    newVisibleColumns.splice(dropIndex, 0, draggedItem);

    // Update all columns maintaining visibility state
    const newAllColumns = [...columns];
    const visibleKeys = newVisibleColumns.map(col => col.key);
    
    // Reorder all columns based on new visible order
    const reorderedColumns: ColumnConfig[] = [];
    
    // First add visible columns in their new order
    visibleKeys.forEach(key => {
      const column = newAllColumns.find(col => col.key === key);
      if (column) reorderedColumns.push(column);
    });
    
    // Then add hidden columns at the end
    newAllColumns.forEach(col => {
      if (!col.visible && !reorderedColumns.find(rc => rc.key === col.key)) {
        reorderedColumns.push(col);
      }
    });

    setColumns(reorderedColumns);
    setDraggedColumn(null);
    setDragOverColumn(null);
    dragCounterRef.current = 0;

    toast({
      title: 'Колонки переупорядочены',
      description: `Колонка "${draggedItem.label}" перемещена`,
    });
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
    dragCounterRef.current = 0;
  };

  // Pagination helpers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Export data to CSV
  const handleExport = () => {
    try {
      const visibleData = analyticsData.map(row => {
        const exportRow: any = {};
        visibleColumns.forEach(column => {
          const value = row[column.key];
          // Handle special cases for export
          if (column.key === 'countryFlag' || column.key === 'country') {
            exportRow[column.label] = value; // Keep country code for CSV
          } else if (column.type === 'boolean') {
            exportRow[column.label] = value ? 'Да' : 'Нет';
          } else if (column.type === 'currency') {
            exportRow[column.label] = `$${Number(value || 0).toFixed(2)}`;
          } else if (column.type === 'percentage') {
            exportRow[column.label] = `${Number(value || 0).toFixed(1)}%`;
          } else {
            exportRow[column.label] = value || '-';
          }
        });
        return exportRow;
      });

      // Create CSV content
      const headers = visibleColumns.map(col => col.label);
      const csvContent = [
        headers.join(','),
        ...visibleData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape quotes and commas
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Экспорт завершен',
        description: `Данные экспортированы в CSV файл (${visibleData.length} записей)`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось экспортировать данные',
        variant: 'destructive',
      });
    }
  };

  // Refresh data
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics'] });
    toast({
      title: 'Данные обновлены',
      description: 'Аналитические данные успешно обновлены',
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    console.log('Reset filters clicked');
    setSearchTerm('');
    setDateFrom(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
    setDateTo(format(new Date(), 'yyyy-MM-dd'));
    setQuickFilter('all');
    setCurrentPage(1);
    
    // Also invalidate query to refresh data
    queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics'] });
    
    toast({
      title: 'Фильтры сброшены',
      description: 'Все фильтры возвращены к значениям по умолчанию',
    });
  };

  return (
    <div className="h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className={`h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header title="Аналитика" />
        <main className="flex-1 overflow-auto p-4">
          <div className="space-y-4 max-w-full">
            {/* Header with title and controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold">Аналитика (Полная версия)</h1>
                  <p className="text-muted-foreground text-sm">
                    Комплексная аналитика с 100+ полями данных
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button onClick={() => setShowColumnSettings(!showColumnSettings)} variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    Столбцы ({visibleColumns.length})
                  </Button>
                  <Button onClick={handleExport} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Экспорт
                  </Button>
                  <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    Обновить
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistics blocks */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="pt-3 pb-3 px-4">
                  <div className="text-lg font-bold">{analyticsData.length}</div>
                  <p className="text-blue-100 text-xs">Всего записей</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="pt-3 pb-3 px-4">
                  <div className="text-lg font-bold">{visibleColumns.length}</div>
                  <p className="text-green-100 text-xs">Видимых столбцов</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="pt-3 pb-3 px-4">
                  <div className="text-lg font-bold">{allColumns.length}</div>
                  <p className="text-purple-100 text-xs">Всего полей</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardContent className="pt-3 pb-3 px-4">
                  <div className="text-lg font-bold">
                    {analyticsData.filter(item => item.isBot).length}
                  </div>
                  <p className="text-red-100 text-xs">Ботов обнаружено</p>
                </CardContent>
              </Card>
            </div>

            {/* Column Settings Panel */}
            {showColumnSettings && (
              <Card className="bg-white dark:bg-gray-800 border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Настройка столбцов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto">
                    {columns.map((column) => (
                      <div key={column.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={column.key}
                          checked={column.visible}
                          onCheckedChange={() => toggleColumnVisibility(column.key)}
                        />
                        <label htmlFor={column.key} className="text-xs cursor-pointer">
                          {column.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <Card className="bg-white dark:bg-gray-800 border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Filter className="w-4 h-4" />
                  Фильтрация данных
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-8 text-sm"
                      title="От даты"
                    />
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-8 text-sm"
                      title="До даты"
                    />
                  </div>
                  <div>
                    <Select value={quickFilter} onValueChange={setQuickFilter}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Быстрые фильтры" />
                      </SelectTrigger>
                      <SelectContent>
                        {quickFilters.map((filter: any) => (
                          <SelectItem key={filter.value} value={filter.value}>
                            {filter.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button onClick={handleResetFilters} variant="outline" className="h-8 w-full text-sm" size="sm">
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Сбросить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Table - with proper container */}
            <Card className="bg-white dark:bg-gray-800 border shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <CardTitle className="text-xl">
                    Данные аналитики
                  </CardTitle>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                          <Button
                            key={index}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => typeof page === 'number' && goToPage(page)}
                            disabled={page === '...'}
                            className="h-8 w-8 p-0 text-sm"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1 h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      <span className="text-sm text-muted-foreground ml-2">
                        Стр. {currentPage} из {totalPages}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-max">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            {visibleColumns.map((column, columnIndex) => (
                              <th
                                key={column.key}
                                draggable
                                onDragStart={(e) => handleColumnDragStart(e, columnIndex)}
                                onDragOver={(e) => handleColumnDragOver(e, columnIndex)}
                                onDragEnter={(e) => handleColumnDragEnter(e, columnIndex)}
                                onDragLeave={handleColumnDragLeave}
                                onDrop={(e) => handleColumnDrop(e, columnIndex)}
                                onDragEnd={handleColumnDragEnd}
                                className={`text-left p-2 font-medium text-sm whitespace-nowrap cursor-grab active:cursor-grabbing transition-colors duration-200 ${
                                  draggedColumn === columnIndex 
                                    ? 'opacity-50 bg-blue-50 dark:bg-blue-900/20' 
                                    : dragOverColumn === columnIndex 
                                      ? 'bg-blue-100 dark:bg-blue-800/30 border-l-2 border-blue-500' 
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                                style={{ width: column.width }}
                                title="Перетащите колонку для изменения порядка"
                              >
                                <div className="flex items-center gap-2">
                                  <GripVertical className="w-3 h-3 text-gray-400 opacity-60" />
                                  <span>{column.label}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.map((row: any, index: number) => (
                            <tr key={row.id || index} className="border-b hover:bg-muted/50">
                              {visibleColumns.map((column) => (
                                <td key={column.key} className="p-2 text-sm whitespace-nowrap">
                                  {formatCellValue(row[column.key], column.type, column.key)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
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