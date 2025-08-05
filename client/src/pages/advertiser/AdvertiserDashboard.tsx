import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  MousePointer,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Plus,
  Calendar,
  Download,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';

interface DashboardStats {
  totalRevenue: number;
  totalPartners: number;
  totalClicks: number;
  totalConversions: number;
  activeOffers: number;
  pendingOffers: number;
  conversionRate: number;
  avgPayout: number;
  revenueChange: number;
  partnersChange: number;
  clicksChange: number;
  conversionsChange: number;
}

interface OfferPerformance {
  id: string;
  name: string;
  clicks: number;
  conversions: number;
  revenue: number;
  partners: number;
  conversionRate: number;
  avgPayout: number;
  status: string;
}

interface PartnerPerformance {
  id: string;
  username: string;
  email: string;
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  rating: number;
  joinedAt: string;
  status: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AdvertiserDashboard() {
  const [dateRange, setDateRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/advertiser/dashboard/stats', dateRange],
  });

  // Fetch offer performance
  const { data: offerPerformance = [], isLoading: offersLoading } = useQuery<OfferPerformance[]>({
    queryKey: ['/api/advertiser/dashboard/offers', dateRange],
  });

  // Fetch partner performance
  const { data: partnerPerformance = [], isLoading: partnersLoading } = useQuery<PartnerPerformance[]>({
    queryKey: ['/api/advertiser/dashboard/partners', dateRange],
  });

  // Fetch revenue chart data
  const { data: revenueData = [] } = useQuery({
    queryKey: ['/api/advertiser/dashboard/revenue-chart', dateRange],
  });

  // Fetch traffic sources data
  const { data: trafficSources = [] } = useQuery({
    queryKey: ['/api/advertiser/dashboard/traffic-sources', dateRange],
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (statsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Кабинет рекламодателя</h1>
          <p className="text-muted-foreground mt-2">
            Управление офферами, партнёрами и аналитика
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]" data-testid="select-date-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Сегодня</SelectItem>
              <SelectItem value="7d">Последние 7 дней</SelectItem>
              <SelectItem value="30d">Последние 30 дней</SelectItem>
              <SelectItem value="90d">Последние 90 дней</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            data-testid="button-refresh-dashboard"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Выручка</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
                <div className={`flex items-center gap-1 text-sm ${getChangeColor(stats?.revenueChange || 0)}`}>
                  {getChangeIcon(stats?.revenueChange || 0)}
                  <span>{Math.abs(stats?.revenueChange || 0)}%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Партнёры</p>
                <p className="text-2xl font-bold">
                  {formatNumber(stats?.totalPartners || 0)}
                </p>
                <div className={`flex items-center gap-1 text-sm ${getChangeColor(stats?.partnersChange || 0)}`}>
                  {getChangeIcon(stats?.partnersChange || 0)}
                  <span>{Math.abs(stats?.partnersChange || 0)}%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Клики</p>
                <p className="text-2xl font-bold">
                  {formatNumber(stats?.totalClicks || 0)}
                </p>
                <div className={`flex items-center gap-1 text-sm ${getChangeColor(stats?.clicksChange || 0)}`}>
                  {getChangeIcon(stats?.clicksChange || 0)}
                  <span>{Math.abs(stats?.clicksChange || 0)}%</span>
                </div>
              </div>
              <MousePointer className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Конверсии</p>
                <p className="text-2xl font-bold">
                  {formatNumber(stats?.totalConversions || 0)}
                </p>
                <div className={`flex items-center gap-1 text-sm ${getChangeColor(stats?.conversionsChange || 0)}`}>
                  {getChangeIcon(stats?.conversionsChange || 0)}
                  <span>{Math.abs(stats?.conversionsChange || 0)}%</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Активные офферы</p>
                <p className="text-lg font-bold">{stats?.activeOffers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">На модерации</p>
                <p className="text-lg font-bold">{stats?.pendingOffers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">CR</p>
                <p className="text-lg font-bold">{(stats?.conversionRate || 0).toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Средняя выплата</p>
                <p className="text-lg font-bold">{formatCurrency(stats?.avgPayout || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Динамика выручки</CardTitle>
            <CardDescription>
              Изменение выручки за выбранный период
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={Array.isArray(revenueData) ? revenueData : []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Выручка']} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Источники трафика</CardTitle>
            <CardDescription>
              Распределение трафика по источникам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Array.isArray(trafficSources) ? trafficSources : []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Array.isArray(trafficSources) ? trafficSources.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  )) : []}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="offers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="offers" data-testid="tab-offers">
            Топ офферы ({offerPerformance.length})
          </TabsTrigger>
          <TabsTrigger value="partners" data-testid="tab-partners">
            Топ партнёры ({partnerPerformance.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Производительность офферов
                <Link href="/advertiser/offers">
                  <Button variant="outline" size="sm" data-testid="button-view-all-offers">
                    <Eye className="h-4 w-4 mr-2" />
                    Все офферы
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                Статистика по вашим офферам за выбранный период
              </CardDescription>
            </CardHeader>
            <CardContent>
              {offersLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : offerPerformance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Нет данных по офферам</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Оффер</TableHead>
                        <TableHead>Клики</TableHead>
                        <TableHead>Конверсии</TableHead>
                        <TableHead>CR</TableHead>
                        <TableHead>Выручка</TableHead>
                        <TableHead>Партнёры</TableHead>
                        <TableHead>Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offerPerformance.slice(0, 10).map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{offer.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Средняя выплата: {formatCurrency(offer.avgPayout)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{formatNumber(offer.clicks)}</TableCell>
                          <TableCell>{formatNumber(offer.conversions)}</TableCell>
                          <TableCell>{offer.conversionRate.toFixed(2)}%</TableCell>
                          <TableCell>{formatCurrency(offer.revenue)}</TableCell>
                          <TableCell>{offer.partners}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={offer.status === 'active' ? 'default' : 'secondary'}
                            >
                              {offer.status === 'active' ? 'Активен' : 'Неактивен'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Производительность партнёров
                <Link href="/advertiser/partners">
                  <Button variant="outline" size="sm" data-testid="button-view-all-partners">
                    <Eye className="h-4 w-4 mr-2" />
                    Все партнёры
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                Статистика по партнёрам за выбранный период
              </CardDescription>
            </CardHeader>
            <CardContent>
              {partnersLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : partnerPerformance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Нет данных по партнёрам</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Партнёр</TableHead>
                        <TableHead>Клики</TableHead>
                        <TableHead>Конверсии</TableHead>
                        <TableHead>CR</TableHead>
                        <TableHead>Выручка</TableHead>
                        <TableHead>Рейтинг</TableHead>
                        <TableHead>Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partnerPerformance.slice(0, 10).map((partner) => (
                        <TableRow key={partner.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{partner.username}</p>
                              <p className="text-sm text-muted-foreground">{partner.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatNumber(partner.clicks)}</TableCell>
                          <TableCell>{formatNumber(partner.conversions)}</TableCell>
                          <TableCell>{partner.conversionRate.toFixed(2)}%</TableCell>
                          <TableCell>{formatCurrency(partner.revenue)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="text-yellow-400">★</span>
                              <span className="ml-1">{partner.rating.toFixed(1)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={partner.status === 'active' ? 'default' : 'secondary'}
                            >
                              {partner.status === 'active' ? 'Активен' : 'Неактивен'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>
            Часто используемые функции
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/advertiser/offers/create">
              <Button className="w-full justify-start" data-testid="button-create-offer">
                <Plus className="h-4 w-4 mr-2" />
                Создать оффер
              </Button>
            </Link>
            
            <Link href="/advertiser/partners">
              <Button variant="outline" className="w-full justify-start" data-testid="button-manage-partners">
                <Users className="h-4 w-4 mr-2" />
                Управление партнёрами
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-export-report"
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт отчёта
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </RoleBasedLayout>
  );
}