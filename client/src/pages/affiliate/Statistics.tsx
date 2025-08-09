import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  TrendingUp,
  MousePointer,
  Target,
  DollarSign,
  Eye,
  X,
  Copy,
  ExternalLink,
  Globe,
  Monitor,
  Smartphone,
  Search
} from "lucide-react";
import { formatCurrency, formatCR } from "@/utils/formatting";
import { useToast } from "@/hooks/use-toast";

export default function Statistics() {
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
      
      const token = localStorage.getItem('token');
      console.log('Making request with token:', token ? token.substring(0, 20) + '...' : 'null');
      
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
        
        if (response.status === 401 && errorData.code === 'TOKEN_MISSING') {
          // Токен отсутствует или недействителен - перенаправляем на логин
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
      const response = await fetch('/api/partner/offers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
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
        title: "Скопировано!",
        description: `${label} скопировано в буфер обмена`,
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать в буфер обмена",
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
  const pagination = analyticsData?.pagination || {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
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
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Ошибка загрузки данных</h3>
              <p className="text-red-600">Не удалось загрузить статистику партнера</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Статистика Партнера
          </h1>
          <p className="text-muted-foreground">
            Детальная аналитика по кликам и конверсиям с реальными данными
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Дата от</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                data-testid="input-date-from"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Дата до</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                data-testid="input-date-to"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Оффер</label>
              <Select
                value={filters.offerId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, offerId: value }))}
              >
                <SelectTrigger data-testid="select-offer">
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
              <label className="text-sm font-medium mb-2 block">География</label>
              <Select
                value={filters.geo}
                onValueChange={(value) => setFilters(prev => ({ ...prev, geo: value }))}
              >
                <SelectTrigger data-testid="select-geo">
                  <SelectValue placeholder="Все страны" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все страны</SelectItem>
                  <SelectItem value="IN">Индия</SelectItem>
                  <SelectItem value="US">США</SelectItem>
                  <SelectItem value="DE">Германия</SelectItem>
                  <SelectItem value="UK">Великобритания</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={applyFilters} className="flex-1">
                Применить
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Сброс
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего кликов</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalClicks.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конверсии</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalConversions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Доход</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCR(stats.conversionRate / 100)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EPC</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {formatCurrency(stats.epc)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="geography">География</TabsTrigger>
          <TabsTrigger value="devices">Устройства</TabsTrigger>
          <TabsTrigger value="sources">Источники</TabsTrigger>
          <TabsTrigger value="subid">SubID</TabsTrigger>
          <TabsTrigger value="details">Детали</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Общая статистика кликов</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата/Время</TableHead>
                    <TableHead>Оффер</TableHead>
                    <TableHead>Гео</TableHead>
                    <TableHead>ClickID</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Доход</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.date}</span>
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.offer}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.geo}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600">{item.clickId}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(item.clickId, 'ClickID')}
                            title="Копировать ClickID"
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
                          {item.status === 'conversion' ? 'Конверсия' : 'Клик'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-purple-600">
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
                          title="Просмотр SubID параметров"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          SubID
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Статистика по географии
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.geoStats ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Страна</TableHead>
                      <TableHead>Клики</TableHead>
                      <TableHead>Конверсии</TableHead>
                      <TableHead>Доход</TableHead>
                      <TableHead>CR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.geoStats.map((stat: any) => (
                      <TableRow key={stat.geo}>
                        <TableCell>
                          <Badge variant="outline">{stat.geo}</Badge>
                        </TableCell>
                        <TableCell>{stat.clicks}</TableCell>
                        <TableCell>{stat.conversions}</TableCell>
                        <TableCell className="font-medium text-purple-600">
                          {formatCurrency(stat.revenue)}
                        </TableCell>
                        <TableCell className="font-medium text-orange-600">
                          {formatCR(stat.cr / 100)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Переключитесь на вкладку "География" для получения данных</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Статистика по устройствам
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.deviceStats ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Устройство</TableHead>
                      <TableHead>Клики</TableHead>
                      <TableHead>Конверсии</TableHead>
                      <TableHead>Доход</TableHead>
                      <TableHead>CR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.deviceStats.map((stat: any) => (
                      <TableRow key={stat.device}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {stat.device === 'mobile' ? (
                              <Smartphone className="h-4 w-4" />
                            ) : (
                              <Monitor className="h-4 w-4" />
                            )}
                            {stat.device}
                          </div>
                        </TableCell>
                        <TableCell>{stat.clicks}</TableCell>
                        <TableCell>{stat.conversions}</TableCell>
                        <TableCell className="font-medium text-purple-600">
                          {formatCurrency(stat.revenue)}
                        </TableCell>
                        <TableCell className="font-medium text-orange-600">
                          {formatCR(stat.cr / 100)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Переключитесь на вкладку "Устройства" для получения данных</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Анализ SubID параметров</CardTitle>
              <p className="text-sm text-muted-foreground">
                Детальный анализ всех Sub1-Sub16 параметров с сохранением исходных данных
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ClickID</TableHead>
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
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs text-blue-600">
                        {item.clickId}
                      </TableCell>
                      <TableCell className="text-xs">{item.sub1 || '-'}</TableCell>
                      <TableCell className="text-xs">{item.sub2 || '-'}</TableCell>
                      <TableCell className="text-xs">{item.sub3 || '-'}</TableCell>
                      <TableCell className="text-xs">{item.sub4 || '-'}</TableCell>
                      <TableCell className="text-xs">{item.sub5 || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRowId(item.clickId);
                            setShowSubParams(true);
                          }}
                          title="Посмотреть все Sub1-Sub16"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Все
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Детальная статистика (50 записей на страницу)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Показано {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total} записей
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Оффер</TableHead>
                    <TableHead>ClickID</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Гео</TableHead>
                    <TableHead>Устройство</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Доход</TableHead>
                    <TableHead>SubID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs">
                        <div className="flex flex-col">
                          <span>{item.date}</span>
                          <span className="text-muted-foreground">{item.time}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.offer}</TableCell>
                      <TableCell className="font-mono text-xs text-blue-600">
                        {item.clickId}
                      </TableCell>
                      <TableCell className="text-xs">{item.ip}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.geo}</Badge>
                      </TableCell>
                      <TableCell>{item.device}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.status === 'conversion' ? 'default' : 'secondary'}
                          className={item.status === 'conversion' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {item.status === 'conversion' ? 'Конверсия' : 'Клик'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-purple-600">
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
                          title="Просмотр всех SubID"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Страница {pagination.page} из {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={pagination.page === 1}
                  >
                    Назад
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Вперед
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SubID Dialog */}
      <Dialog open={showSubParams} onOpenChange={setShowSubParams}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>SubID Параметры для {selectedRowId}</DialogTitle>
            <DialogDescription>
              Полный список всех Sub1-Sub16 параметров с точным сохранением данных
            </DialogDescription>
          </DialogHeader>
          {selectedRowId && (
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {Array.from({ length: 16 }, (_, i) => {
                const subKey = `sub${i + 1}`;
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
                          title={`Копировать Sub${i + 1}`}
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