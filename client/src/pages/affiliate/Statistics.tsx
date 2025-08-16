import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  Globe,
  Monitor,
  Search,
  Target,
  Eye,
  TrendingUp,
  MousePointer,
  DollarSign,
  X,
  Copy,
  ExternalLink,
  Smartphone,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatCurrency, formatCR } from "@/utils/formatting";
import { useToast } from "@/hooks/use-toast";

export default function Statistics() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    offerId: 'all',
    geo: 'all',
    device: 'all'
  });

  const [showSubParams, setShowSubParams] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Получаем реальные данные с сервера
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['/api/partner/analytics', activeTab, currentPage, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        tab: activeTab,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.offerId !== 'all' && { offer: filters.offerId }),
        ...(filters.dateFrom && { startDate: filters.dateFrom }),
        ...(filters.dateTo && { endDate: filters.dateTo })
      });
      
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      console.log('Making request with token:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = '/login';
        return;
      }
      
      const response = await fetch(`/api/partner/analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response:', errorData);
        
        if (response.status === 401 || response.status === 403) {
          // Auth error - redirect to login
          console.log('Auth error, redirecting to login');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        
        throw new Error(errorData.error || 'Failed to fetch analytics data');
      }
      
      return response.json();
    }
  });

  // Получаем список доступных офферов для фильтра
  const { data: offers } = useQuery({
    queryKey: ['/api/partner/offers'],
    queryFn: async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) {
        window.location.href = '/login';
        return [];
      }

      const response = await fetch('/api/partner/offers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return [];
        }
        throw new Error('Failed to fetch offers');
      }

      return response.json();
    }
  });

  // Функции для работы с фильтрами
  const applyFilters = () => {
    setCurrentPage(1); // Сбрасываем на первую страницу при применении фильтров
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      offerId: 'all',
      geo: 'all',
      device: 'all'
    });
    setCurrentPage(1);
  };

  const copyToClipboard = async (text: string, label: string = '') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t('statistics.messages.copied'),
        description: t('statistics.messages.copiedDesc', { type: label }),
        duration: 2000
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('statistics.messages.copyError'),
        variant: "destructive",
        duration: 2000
      });
    }
  };

  const getOfferName = (offerId: string) => {
    if (!offers) return offerId;
    const offer = offers.find((o: any) => o.id === offerId);
    return offer ? offer.name : offerId;
  };

  // Получаем данные клика для отображения SubID
  const getClickDetails = (clickId: string) => {
    if (!analyticsData?.data) return null;
    return analyticsData.data.find((item: any) => item.clickId === clickId);
  };

  // Статистика для отображения
  const stats = analyticsData?.summary || {
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    conversionRate: 0,
    epc: 0
  };

  // Данные для таблицы и пагинация
  const tableData = analyticsData?.data || [];
  const totalItems = analyticsData?.pagination?.totalItems || 0;
  const totalPages = analyticsData?.pagination?.totalPages || 1;
  const pagination = analyticsData?.pagination || {
    currentPage: 1,
    itemsPerPage: 50,
    totalItems: 0,
    totalPages: 0
  };

  // Функции пагинации
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Генерация номеров страниц для отображения
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Компонент пагинации
  const PaginationControls = () => (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        {t('statistics.pagination.showing')} {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} {t('statistics.pagination.of')} {totalItems} {t('statistics.pagination.records')}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          {t('statistics.pagination.previous')}
        </Button>
        
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageClick(page)}
              className="w-8 h-8 p-0"
            >
              {page}
            </Button>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          {t('statistics.pagination.next')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-background dark:bg-background min-h-screen">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-background dark:bg-background min-h-screen">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">{t('statistics.messages.loadingError')}</h3>
              <p className="text-red-600">{t('statistics.messages.loadingErrorDesc')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-background dark:bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            {t('statistics.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('statistics.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            {t('statistics.export')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('statistics.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('statistics.dateFrom')}</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                data-testid="input-date-from"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('statistics.dateTo')}</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                data-testid="input-date-to"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('statistics.offer')}</label>
              <Select
                value={filters.offerId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, offerId: value }))}
              >
                <SelectTrigger data-testid="select-offer">
                  <SelectValue placeholder={t('statistics.allOffers')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('statistics.allOffers')}</SelectItem>
                  {offers?.map((offer: any) => (
                    <SelectItem key={offer.id} value={offer.id}>
                      {offer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('statistics.geo')}</label>
              <Select
                value={filters.geo}
                onValueChange={(value) => setFilters(prev => ({ ...prev, geo: value }))}
              >
                <SelectTrigger data-testid="select-geo">
                  <SelectValue placeholder={t('statistics.allCountries')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('statistics.allCountries')}</SelectItem>
                  <SelectItem value="IN">{t('statistics.countries.IN')}</SelectItem>
                  <SelectItem value="US">{t('statistics.countries.US')}</SelectItem>
                  <SelectItem value="DE">{t('statistics.countries.DE')}</SelectItem>
                  <SelectItem value="UK">{t('statistics.countries.UK')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={applyFilters} className="flex-1">
                {t('statistics.applyFilters')}
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                {t('statistics.resetFilters')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('statistics.columns.clicks')}</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalClicks.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('statistics.columns.conversions')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalConversions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('statistics.columns.revenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('statistics.columns.cr')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCR(stats.conversionRate / 100)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('statistics.columns.epc')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {formatCurrency(stats.epc)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
{t('statistics.tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="geography" className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-green-600" />
{t('statistics.tabs.geography')}
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-purple-600 dark:text-purple-400" />
{t('statistics.tabs.devices')}
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Search className="h-4 w-4 text-orange-600 dark:text-orange-400" />
{t('statistics.tabs.sources')}
          </TabsTrigger>
          <TabsTrigger value="subid" className="flex items-center gap-2">
            <Target className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            SubID
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-indigo-600" />
{t('statistics.tabs.details')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
{t('statistics.tabs.overview')} - {t('statistics.columns.clicks')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('statistics.columns.date')}</TableHead>
                    <TableHead>{t('statistics.columns.offer')}</TableHead>
                    <TableHead>{t('statistics.columns.country')}</TableHead>
                    <TableHead>{t('statistics.columns.clickId')}</TableHead>
                    <TableHead>{t('statistics.columns.status')}</TableHead>
                    <TableHead>{t('statistics.columns.revenue')}</TableHead>
                    <TableHead>{t('statistics.columns.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((item: any) => (
                    <TableRow key={item.id} className="bg-background dark:bg-card hover:bg-muted/50 dark:hover:bg-muted/50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {(item.timestamp || item.createdAt) && !isNaN(new Date(item.timestamp || item.createdAt).getTime()) 
                              ? new Date(item.timestamp || item.createdAt).toLocaleDateString()
                              : t('statistics.dateNotAvailable', 'Дата неизвестна')
                            }
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(item.timestamp || item.createdAt) && !isNaN(new Date(item.timestamp || item.createdAt).getTime()) 
                              ? new Date(item.timestamp || item.createdAt).toLocaleTimeString()
                              : ''
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{getOfferName(item.offerId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.country}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 dark:text-blue-400 dark:text-blue-400">{item.clickId}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(item.clickId, 'ClickID')}
                            title={t('statistics.actions.copyClickId')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.status === 'conversion' ? 'default' : 'secondary'}
                          className={item.status === 'conversion' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {item.status === 'conversion' ? t('statistics.status.conversion') : t('statistics.status.click')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-purple-600 dark:text-purple-400">
                        {formatCurrency(item.revenue)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRowId(item.clickId);
                            setShowSubParams(true);
                          }}
                          title={t('statistics.actions.viewSubId')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          SubID
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
{t('statistics.tabs.geography')} - {t('statistics.columns.clicks')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('statistics.columns.country')}</TableHead>
                    <TableHead>{t('statistics.columns.clicks')}</TableHead>
                    <TableHead>{t('statistics.columns.conversions')}</TableHead>
                    <TableHead>{t('statistics.columns.revenue')}</TableHead>
                    <TableHead>CR</TableHead>
                    <TableHead>EPC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((item: any) => (
                    <TableRow key={item.country} className="bg-background dark:bg-card hover:bg-muted/50 dark:hover:bg-muted/50">
                      <TableCell>
                        <Badge variant="outline">{item.country}</Badge>
                      </TableCell>
                      <TableCell>{item.clicks}</TableCell>
                      <TableCell>{item.conversions}</TableCell>
                      <TableCell className="font-medium text-purple-600 dark:text-purple-400">
                        {formatCurrency(item.revenue)}
                      </TableCell>
                      <TableCell className="font-medium text-orange-600 dark:text-orange-400">
                        {item.cr}
                      </TableCell>
                      <TableCell className="font-medium text-teal-600 dark:text-teal-400">
                        {item.epc}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-purple-600 dark:text-purple-400" />
{t('statistics.tabs.devices')} - {t('statistics.columns.clicks')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('statistics.columns.device')}</TableHead>
                    <TableHead>{t('statistics.columns.clicks')}</TableHead>
                    <TableHead>{t('statistics.columns.conversions')}</TableHead>
                    <TableHead>{t('statistics.columns.revenue')}</TableHead>
                    <TableHead>CR</TableHead>
                    <TableHead>EPC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((item: any) => (
                    <TableRow key={item.device} className="bg-background dark:bg-card hover:bg-muted/50 dark:hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.device === 'Desktop' && <Monitor className="h-4 w-4" />}
                          {item.device === 'Mobile' && <Smartphone className="h-4 w-4" />}
                          {item.device === 'Tablet' && <Smartphone className="h-4 w-4" />}
                          {item.device}
                        </div>
                      </TableCell>
                      <TableCell>{item.clicks}</TableCell>
                      <TableCell>{item.conversions}</TableCell>
                      <TableCell className="font-medium text-purple-600 dark:text-purple-400">
                        {formatCurrency(item.revenue)}
                      </TableCell>
                      <TableCell className="font-medium text-orange-600 dark:text-orange-400">
                        {item.cr}
                      </TableCell>
                      <TableCell className="font-medium text-teal-600 dark:text-teal-400">
                        {item.epc}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-orange-600 dark:text-orange-400" />
{t('statistics.tabs.sources')} - {t('statistics.columns.clicks')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('statistics.columns.source')}</TableHead>
                    <TableHead>{t('statistics.columns.clicks')}</TableHead>
                    <TableHead>{t('statistics.columns.conversions')}</TableHead>
                    <TableHead>{t('statistics.columns.revenue')}</TableHead>
                    <TableHead>CR</TableHead>
                    <TableHead>EPC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((item: any) => (
                    <TableRow key={item.source} className="bg-background dark:bg-card hover:bg-muted/50 dark:hover:bg-muted/50">
                      <TableCell>
                        <Badge variant="outline">{item.source}</Badge>
                      </TableCell>
                      <TableCell>{item.clicks}</TableCell>
                      <TableCell>{item.conversions}</TableCell>
                      <TableCell className="font-medium text-purple-600 dark:text-purple-400">
                        {formatCurrency(item.revenue)}
                      </TableCell>
                      <TableCell className="font-medium text-orange-600 dark:text-orange-400">
                        {item.cr}
                      </TableCell>
                      <TableCell className="font-medium text-teal-600 dark:text-teal-400">
                        {item.epc}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-teal-600 dark:text-teal-400" />
{t('statistics.subid.title')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
{t('statistics.subid.description')}
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('statistics.columns.clickId')}</TableHead>
                    <TableHead>Sub1</TableHead>
                    <TableHead>Sub2</TableHead>
                    <TableHead>Sub3</TableHead>
                    <TableHead>Sub4</TableHead>
                    <TableHead>Sub5</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.slice(0, 10).map((item: any) => (
                    <TableRow key={item.id || item.clickId} className="bg-background dark:bg-card hover:bg-muted/50 dark:hover:bg-muted/50">
                      <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400 dark:text-blue-400">
                        {item.clickId}
                      </TableCell>
                      <TableCell className="text-xs text-foreground">{item.sub_1 || '-'}</TableCell>
                      <TableCell className="text-xs text-foreground">{item.sub_2 || '-'}</TableCell>
                      <TableCell className="text-xs text-foreground">{item.sub_3 || '-'}</TableCell>
                      <TableCell className="text-xs text-foreground">{item.sub_4 || '-'}</TableCell>
                      <TableCell className="text-xs text-foreground">{item.sub_5 || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRowId(item.clickId);
                            setShowSubParams(true);
                          }}
                          title={t('statistics.actions.viewAllSub')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
{t('statistics.actions.viewAllSub')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-600" />
{t('statistics.subid.detailsTitle')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('statistics.pagination.showing')} {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} {t('statistics.pagination.of')} {pagination.totalItems} {t('statistics.pagination.records')}
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('statistics.columns.date')}</TableHead>
                    <TableHead>{t('statistics.columns.offer')}</TableHead>
                    <TableHead>{t('statistics.columns.clickId')}</TableHead>
                    <TableHead>{t('statistics.columns.ip')}</TableHead>
                    <TableHead>{t('statistics.columns.country')}</TableHead>
                    <TableHead>{t('statistics.columns.device')}</TableHead>
                    <TableHead>{t('statistics.columns.status')}</TableHead>
                    <TableHead>{t('statistics.columns.revenue')}</TableHead>
                    <TableHead>SubID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((item: any) => (
                    <TableRow key={item.id} className="bg-background dark:bg-card hover:bg-muted/50 dark:hover:bg-muted/50">
                      <TableCell className="text-xs">
                        <div className="flex flex-col">
                          <span className="text-foreground">
                            {(item.timestamp || item.createdAt) && !isNaN(new Date(item.timestamp || item.createdAt).getTime()) 
                              ? new Date(item.timestamp || item.createdAt).toLocaleDateString()
                              : t('statistics.dateNotAvailable', 'Дата неизвестна')
                            }
                          </span>
                          <span className="text-muted-foreground">
                            {(item.timestamp || item.createdAt) && !isNaN(new Date(item.timestamp || item.createdAt).getTime()) 
                              ? new Date(item.timestamp || item.createdAt).toLocaleTimeString()
                              : ''
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{getOfferName(item.offerId)}</TableCell>
                      <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400">
                        {item.clickId}
                      </TableCell>
                      <TableCell className="text-xs">{item.ip}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.country}</Badge>
                      </TableCell>
                      <TableCell>{item.device}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.status === 'conversion' ? 'default' : 'secondary'}
                          className={item.status === 'conversion' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {item.status === 'conversion' ? t('statistics.status.conversion') : t('statistics.status.click')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-purple-600 dark:text-purple-400">
                        {formatCurrency(item.revenue)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRowId(item.clickId);
                            setShowSubParams(true);
                          }}
                          title={t('statistics.actions.viewAllSub')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <PaginationControls />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SubID Dialog */}
      <Dialog open={showSubParams} onOpenChange={setShowSubParams}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('statistics.subid.parametersFor')} {selectedRowId}</DialogTitle>
            <DialogDescription>
              {t('statistics.subid.fullList')}
            </DialogDescription>
          </DialogHeader>
          {selectedRowId && (
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {Array.from({ length: 16 }, (_, i) => {
                const subKey = `sub_${i + 1}`;
                const clickDetails = getClickDetails(selectedRowId);
                const subValue = clickDetails?.[subKey as keyof typeof clickDetails] || '-';
                
                return (
                  <div key={subKey} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium text-sm">Sub{i + 1}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground truncate max-w-48" title={subValue}>
                        {subValue}
                      </span>
                      {subValue !== '-' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(subValue, `Sub${i + 1}`)}
                          title={t('statistics.actions.copyClickId')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}