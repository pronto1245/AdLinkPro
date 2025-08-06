import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Shield,
  AlertTriangle,
  Bot,
  Globe,
  Zap,
  Eye,
  Settings,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  MapPin,
  Clock,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Bell,
  Mail,
  MessageSquare,
  BarChart3,
  Activity,
  Filter,
  Search,
  RefreshCw,
  Ban,
  Unlock
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Типы данных для антифрод системы
interface FraudEvent {
  id: string;
  timestamp: string;
  partnerId: string;
  partnerName: string;
  offerId: string;
  offerName: string;
  subId: string;
  ip: string;
  country: string;
  fraudType: 'bot' | 'vpn' | 'proxy' | 'duplicate' | 'suspicious_cr' | 'click_spam' | 'tor';
  riskScore: number;
  action: 'blocked' | 'flagged' | 'ignored' | 'pending';
  status: 'confirmed' | 'false_positive' | 'pending';
  details: string;
  userAgent: string;
  fingerprint: string;
}

interface FraudSettings {
  enabled: boolean;
  sensitivity: number; // 1-10
  autoBlock: boolean;
  botDetection: {
    enabled: boolean;
    checkJs: boolean;
    checkHeadless: boolean;
    checkInteraction: boolean;
  };
  vpnProxyDetection: {
    enabled: boolean;
    blockVpn: boolean;
    blockProxy: boolean;
    blockTor: boolean;
  };
  clickSpamDetection: {
    enabled: boolean;
    maxClicksPerIp: number;
    timeWindow: number; // minutes
  };
  suspiciousActivity: {
    enabled: boolean;
    maxConversionRate: number; // percentage
    minTimeOnSite: number; // seconds
  };
  geoFiltering: {
    enabled: boolean;
    allowedCountries: string[];
    blockedCountries: string[];
  };
  notifications: {
    email: boolean;
    telegram: boolean;
    webhooks: boolean;
    threshold: number; // events per hour
  };
}

interface FraudDashboard {
  totalEvents: number;
  blockedEvents: number;
  fraudRate: number;
  topFraudTypes: Array<{ type: string; count: number; percentage: number }>;
  topFraudPartners: Array<{ partnerId: string; partnerName: string; events: number; fraudRate: number }>;
  hourlyStats: Array<{ hour: string; events: number; blocked: number }>;
  countryStats: Array<{ country: string; events: number; fraudRate: number }>;
  recentEvents: FraudEvent[];
}

const FRAUD_TYPE_LABELS = {
  bot: 'Бот-трафик',
  vpn: 'VPN',
  proxy: 'Прокси',
  duplicate: 'Дубликаты',
  suspicious_cr: 'Подозр. CR',
  click_spam: 'Клик-спам',
  tor: 'TOR-сеть'
};

const FRAUD_TYPE_COLORS = {
  bot: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  vpn: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  proxy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  duplicate: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  suspicious_cr: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  click_spam: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  tor: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

const ACTION_COLORS = {
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  flagged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ignored: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
};

const STATUS_COLORS = {
  confirmed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  false_positive: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
};

export default function AntiFraud() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Состояния
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('24h');
  const [selectedEvent, setSelectedEvent] = useState<FraudEvent | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    fraudType: 'all',
    action: 'all',
    status: 'all',
    partner: 'all',
    country: 'all'
  });

  // API запросы
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: ['/api/advertiser/antifraud/dashboard', dateRange],
    queryFn: async () => {
      const response = await apiRequest(`/api/advertiser/antifraud/dashboard?range=${dateRange}`);
      return response as FraudDashboard;
    }
  });

  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['/api/advertiser/antifraud/events', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value);
      });
      const response = await apiRequest(`/api/advertiser/antifraud/events?${params}`);
      return response as FraudEvent[];
    }
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/advertiser/antifraud/settings'],
    queryFn: async () => {
      const response = await apiRequest('/api/advertiser/antifraud/settings');
      return response as FraudSettings;
    }
  });

  // Мутации
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<FraudSettings>) => {
      return await apiRequest('/api/advertiser/antifraud/settings', {
        method: 'PATCH',
        body: JSON.stringify(newSettings)
      });
    },
    onSuccess: () => {
      toast({
        title: "Настройки сохранены",
        description: "Настройки антифрод системы успешно обновлены"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/antifraud/settings'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive"
      });
    }
  });

  const confirmEventMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'confirmed' | 'false_positive' }) => {
      return await apiRequest('/api/advertiser/antifraud/confirm-event', {
        method: 'POST',
        body: JSON.stringify({ eventId, status })
      });
    },
    onSuccess: () => {
      toast({
        title: "Событие обновлено",
        description: "Статус события успешно изменен"
      });
      refetchEvents();
      refetchDashboard();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить событие",
        variant: "destructive"
      });
    }
  });

  const blockPartnerMutation = useMutation({
    mutationFn: async ({ partnerId, reason }: { partnerId: string; reason: string }) => {
      return await apiRequest('/api/advertiser/antifraud/block-partner', {
        method: 'POST',
        body: JSON.stringify({ partnerId, reason })
      });
    },
    onSuccess: () => {
      toast({
        title: "Партнер заблокирован",
        description: "Партнер успешно заблокирован из-за фродовой активности"
      });
      refetchEvents();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось заблокировать партнера",
        variant: "destructive"
      });
    }
  });

  // Обработчики событий
  const handleSettingsUpdate = (field: string, value: any) => {
    if (!settings) return;
    
    const newSettings = { ...settings };
    const fields = field.split('.');
    let current = newSettings;
    
    for (let i = 0; i < fields.length - 1; i++) {
      current = current[fields[i]];
    }
    current[fields[fields.length - 1]] = value;
    
    updateSettingsMutation.mutate(newSettings);
  };

  const handleEventAction = (eventId: string, status: 'confirmed' | 'false_positive') => {
    confirmEventMutation.mutate({ eventId, status });
    setSelectedEvent(null);
  };

  const handleBlockPartner = (partnerId: string, partnerName: string) => {
    const reason = `Автоблокировка из-за высокой фродовой активности`;
    blockPartnerMutation.mutate({ partnerId, reason });
  };

  const exportData = (format: 'csv' | 'json' | 'pdf') => {
    // Логика экспорта данных
    if (format === 'csv') {
      const csvContent = [
        ['Дата', 'Партнер', 'Оффер', 'SubID', 'IP', 'Страна', 'Тип фрода', 'Действие', 'Статус'],
        ...(events || []).map(event => [
          event.timestamp,
          event.partnerName,
          event.offerName,
          event.subId,
          event.ip,
          event.country,
          FRAUD_TYPE_LABELS[event.fraudType],
          event.action,
          event.status
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `antifraud-events-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }

    toast({
      title: "Экспорт завершен",
      description: `Данные антифрод системы экспортированы в формате ${format.toUpperCase()}`
    });
  };

  // Фильтрация событий
  const filteredEvents = Array.isArray(events) ? events.filter(event => {
    const matchesSearch = 
      event.partnerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.offerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.subId.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.ip.includes(filters.search);
    
    const matchesFraudType = filters.fraudType === 'all' || event.fraudType === filters.fraudType;
    const matchesAction = filters.action === 'all' || event.action === filters.action;
    const matchesStatus = filters.status === 'all' || event.status === filters.status;
    const matchesCountry = filters.country === 'all' || event.country === filters.country;
    
    return matchesSearch && matchesFraudType && matchesAction && matchesStatus && matchesCountry;
  }) : [];

  if (!user) return <div>Загрузка...</div>;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-500" />
            Антифрод-система
          </h1>
          <p className="text-muted-foreground">
            Анализ, мониторинг и защита от фродового трафика
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32" data-testid="select-date-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 час</SelectItem>
              <SelectItem value="24h">24 часа</SelectItem>
              <SelectItem value="7d">7 дней</SelectItem>
              <SelectItem value="30d">30 дней</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline"
            onClick={() => {
              refetchDashboard();
              refetchEvents();
            }}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Основной контент */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
          <TabsTrigger value="events">События</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="reports">Отчеты</TabsTrigger>
        </TabsList>

        {/* Дашборд */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Общая статистика */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего событий</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading ? '...' : (dashboard?.totalEvents?.toLocaleString() || '0')}
                </div>
                <p className="text-xs text-muted-foreground">
                  За выбранный период
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Заблокировано</CardTitle>
                <Ban className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {dashboardLoading ? '...' : (dashboard?.blockedEvents?.toLocaleString() || '0')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Фродовых событий
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Уровень фрода</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardLoading ? '...' : `${dashboard?.fraudRate?.toFixed(2) || '0'}%`}
                </div>
                <p className="text-xs text-muted-foreground">
                  От общего трафика
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Защищено</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardLoading ? '...' : 
                    `${(100 - (dashboard?.fraudRate || 0)).toFixed(2)}%`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Чистого трафика
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Графики и детальная аналитика */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Топ типы фрода */}
            <Card>
              <CardHeader>
                <CardTitle>Топ типы фрода</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div>Загрузка...</div>
                ) : (
                  <div className="space-y-3">
                    {dashboard?.topFraudTypes?.map((type, index) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={FRAUD_TYPE_COLORS[type.type as keyof typeof FRAUD_TYPE_COLORS]}>
                            {FRAUD_TYPE_LABELS[type.type as keyof typeof FRAUD_TYPE_LABELS]}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Progress value={type.percentage} className="w-20" />
                          <span className="text-sm font-medium">{type.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Проблемные партнеры */}
            <Card>
              <CardHeader>
                <CardTitle>Проблемные партнеры</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div>Загрузка...</div>
                ) : (
                  <div className="space-y-3">
                    {dashboard?.topFraudPartners?.map((partner, index) => (
                      <div key={partner.partnerId} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{partner.partnerName}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {partner.partnerId}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="destructive">
                            {partner.fraudRate.toFixed(1)}% фрода
                          </Badge>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBlockPartner(partner.partnerId, partner.partnerName)}
                            data-testid={`button-block-partner-${partner.partnerId}`}
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Недавние события */}
          <Card>
            <CardHeader>
              <CardTitle>Недавние события</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div>Загрузка...</div>
              ) : (
                <div className="space-y-3">
                  {dashboard?.recentEvents?.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge className={FRAUD_TYPE_COLORS[event.fraudType]}>
                          {FRAUD_TYPE_LABELS[event.fraudType]}
                        </Badge>
                        <div>
                          <div className="font-medium">{event.partnerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {event.ip} • {event.country} • {new Date(event.timestamp).toLocaleString('ru-RU')}
                          </div>
                        </div>
                      </div>
                      <Badge className={ACTION_COLORS[event.action]}>
                        {event.action}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* События */}
        <TabsContent value="events" className="space-y-6">
          {/* Фильтры */}
          <Card>
            <CardHeader>
              <CardTitle>Фильтры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label>Поиск</Label>
                  <Input
                    placeholder="Партнер, IP, SubID..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    data-testid="input-search-events"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Тип фрода</Label>
                  <Select
                    value={filters.fraudType}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, fraudType: value }))}
                  >
                    <SelectTrigger data-testid="select-fraud-type-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="bot">Боты</SelectItem>
                      <SelectItem value="vpn">VPN</SelectItem>
                      <SelectItem value="proxy">Прокси</SelectItem>
                      <SelectItem value="duplicate">Дубликаты</SelectItem>
                      <SelectItem value="suspicious_cr">Подозр. CR</SelectItem>
                      <SelectItem value="click_spam">Клик-спам</SelectItem>
                      <SelectItem value="tor">TOR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Действие</Label>
                  <Select
                    value={filters.action}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
                  >
                    <SelectTrigger data-testid="select-action-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все действия</SelectItem>
                      <SelectItem value="blocked">Заблокировано</SelectItem>
                      <SelectItem value="flagged">Помечено</SelectItem>
                      <SelectItem value="ignored">Игнорировано</SelectItem>
                      <SelectItem value="pending">В ожидании</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="confirmed">Подтвержден</SelectItem>
                      <SelectItem value="false_positive">Ложноположительный</SelectItem>
                      <SelectItem value="pending">В ожидании</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Страна</Label>
                  <Select
                    value={filters.country}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger data-testid="select-country-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все страны</SelectItem>
                      <SelectItem value="RU">Россия</SelectItem>
                      <SelectItem value="US">США</SelectItem>
                      <SelectItem value="DE">Германия</SelectItem>
                      <SelectItem value="BR">Бразилия</SelectItem>
                      <SelectItem value="IN">Индия</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={() => exportData('csv')}
                    variant="outline"
                    data-testid="button-export-events"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Таблица событий */}
          <Card>
            <CardHeader>
              <CardTitle>События фрода ({filteredEvents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Время</TableHead>
                      <TableHead>Партнер</TableHead>
                      <TableHead>Оффер</TableHead>
                      <TableHead>SubID</TableHead>
                      <TableHead>IP / Страна</TableHead>
                      <TableHead>Тип фрода</TableHead>
                      <TableHead>Риск</TableHead>
                      <TableHead>Действие</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventsLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center">
                          Загрузка...
                        </TableCell>
                      </TableRow>
                    ) : filteredEvents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center">
                          События не найдены
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(event.timestamp).toLocaleString('ru-RU')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{event.partnerName}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {event.partnerId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{event.offerName}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {event.offerId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{event.subId}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-mono text-sm">{event.ip}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.country}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={FRAUD_TYPE_COLORS[event.fraudType]}>
                              {FRAUD_TYPE_LABELS[event.fraudType]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={event.riskScore} className="w-16" />
                              <span className="text-sm">{event.riskScore}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={ACTION_COLORS[event.action]}>
                              {event.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[event.status]}>
                              {event.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedEvent(event)}
                                data-testid={`button-view-event-${event.id}`}
                                title="Просмотреть детали"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {event.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEventAction(event.id, 'confirmed')}
                                    data-testid={`button-confirm-event-${event.id}`}
                                    title="Подтвердить фрод"
                                  >
                                    <CheckCircle className="h-3 w-3 text-red-500" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEventAction(event.id, 'false_positive')}
                                    data-testid={`button-false-positive-${event.id}`}
                                    title="Отметить как ложное срабатывание"
                                  >
                                    <XCircle className="h-3 w-3 text-green-500" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Настройки */}
        <TabsContent value="settings" className="space-y-6">
          {settingsLoading ? (
            <div>Загрузка настроек...</div>
          ) : (
            <>
              {/* Основные настройки */}
              <Card>
                <CardHeader>
                  <CardTitle>Основные настройки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Включить антифрод защиту</Label>
                      <p className="text-sm text-muted-foreground">
                        Основной переключатель антифрод системы
                      </p>
                    </div>
                    <Switch
                      checked={settings?.enabled || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('enabled', checked)}
                      data-testid="switch-antifraud-enabled"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">Уровень чувствительности: {settings?.sensitivity || 5}</Label>
                    <p className="text-sm text-muted-foreground">
                      1 - минимальный, 10 - максимальный
                    </p>
                    <Slider
                      value={[settings?.sensitivity || 5]}
                      onValueChange={(value) => handleSettingsUpdate('sensitivity', value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                      data-testid="slider-sensitivity"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Автоматическая блокировка</Label>
                      <p className="text-sm text-muted-foreground">
                        Блокировать подозрительный трафик автоматически
                      </p>
                    </div>
                    <Switch
                      checked={settings?.autoBlock || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('autoBlock', checked)}
                      data-testid="switch-auto-block"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Детекция ботов */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Детекция ботов
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Включить детекцию ботов</Label>
                    <Switch
                      checked={settings?.botDetection?.enabled || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('botDetection.enabled', checked)}
                      data-testid="switch-bot-detection"
                    />
                  </div>

                  {settings?.botDetection?.enabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <Label>Проверка JavaScript</Label>
                        <Switch
                          checked={settings?.botDetection?.checkJs || false}
                          onCheckedChange={(checked) => handleSettingsUpdate('botDetection.checkJs', checked)}
                          data-testid="switch-check-js"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Детекция headless браузеров</Label>
                        <Switch
                          checked={settings?.botDetection?.checkHeadless || false}
                          onCheckedChange={(checked) => handleSettingsUpdate('botDetection.checkHeadless', checked)}
                          data-testid="switch-check-headless"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Проверка взаимодействий</Label>
                        <Switch
                          checked={settings?.botDetection?.checkInteraction || false}
                          onCheckedChange={(checked) => handleSettingsUpdate('botDetection.checkInteraction', checked)}
                          data-testid="switch-check-interaction"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* VPN/Proxy детекция */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    VPN/Proxy детекция
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Включить детекцию VPN/Proxy</Label>
                    <Switch
                      checked={settings?.vpnProxyDetection?.enabled || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('vpnProxyDetection.enabled', checked)}
                      data-testid="switch-vpn-proxy-detection"
                    />
                  </div>

                  {settings?.vpnProxyDetection?.enabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <Label>Блокировать VPN</Label>
                        <Switch
                          checked={settings?.vpnProxyDetection?.blockVpn || false}
                          onCheckedChange={(checked) => handleSettingsUpdate('vpnProxyDetection.blockVpn', checked)}
                          data-testid="switch-block-vpn"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Блокировать Proxy</Label>
                        <Switch
                          checked={settings?.vpnProxyDetection?.blockProxy || false}
                          onCheckedChange={(checked) => handleSettingsUpdate('vpnProxyDetection.blockProxy', checked)}
                          data-testid="switch-block-proxy"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Блокировать TOR</Label>
                        <Switch
                          checked={settings?.vpnProxyDetection?.blockTor || false}
                          onCheckedChange={(checked) => handleSettingsUpdate('vpnProxyDetection.blockTor', checked)}
                          data-testid="switch-block-tor"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Клик-спам детекция */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Детекция клик-спама
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Включить детекцию клик-спама</Label>
                    <Switch
                      checked={settings?.clickSpamDetection.enabled || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('clickSpamDetection.enabled', checked)}
                      data-testid="switch-click-spam-detection"
                    />
                  </div>

                  {settings?.clickSpamDetection.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Макс. кликов с одного IP</Label>
                        <Input
                          type="number"
                          value={settings.clickSpamDetection.maxClicksPerIp}
                          onChange={(e) => handleSettingsUpdate('clickSpamDetection.maxClicksPerIp', parseInt(e.target.value))}
                          data-testid="input-max-clicks-per-ip"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Временное окно (минуты)</Label>
                        <Input
                          type="number"
                          value={settings.clickSpamDetection.timeWindow}
                          onChange={(e) => handleSettingsUpdate('clickSpamDetection.timeWindow', parseInt(e.target.value))}
                          data-testid="input-time-window"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Уведомления */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Уведомления
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Email уведомления</Label>
                    <Switch
                      checked={settings?.notifications.email || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('notifications.email', checked)}
                      data-testid="switch-email-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Telegram уведомления</Label>
                    <Switch
                      checked={settings?.notifications.telegram || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('notifications.telegram', checked)}
                      data-testid="switch-telegram-notifications"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Порог уведомлений (событий в час)</Label>
                    <Input
                      type="number"
                      value={settings?.notifications.threshold || 10}
                      onChange={(e) => handleSettingsUpdate('notifications.threshold', parseInt(e.target.value))}
                      data-testid="input-notification-threshold"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Отчеты */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Генерация отчетов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => exportData('pdf')}
                  className="h-24 flex-col gap-2"
                  variant="outline"
                  data-testid="button-export-pdf"
                >
                  <Download className="h-6 w-6" />
                  PDF Отчет
                </Button>

                <Button
                  onClick={() => exportData('csv')}
                  className="h-24 flex-col gap-2"
                  variant="outline"
                  data-testid="button-export-csv"
                >
                  <Upload className="h-6 w-6" />
                  CSV Экспорт
                </Button>

                <Button
                  onClick={() => exportData('json')}
                  className="h-24 flex-col gap-2"
                  variant="outline"
                  data-testid="button-export-json"
                >
                  <Download className="h-6 w-6" />
                  JSON Данные
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог детальной информации о событии */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Детали события фрода</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Время</Label>
                  <p>{new Date(selectedEvent.timestamp).toLocaleString('ru-RU')}</p>
                </div>
                <div>
                  <Label>Тип фрода</Label>
                  <Badge className={FRAUD_TYPE_COLORS[selectedEvent.fraudType]}>
                    {FRAUD_TYPE_LABELS[selectedEvent.fraudType]}
                  </Badge>
                </div>
                <div>
                  <Label>Партнер</Label>
                  <p>{selectedEvent.partnerName} (ID: {selectedEvent.partnerId})</p>
                </div>
                <div>
                  <Label>Оффер</Label>
                  <p>{selectedEvent.offerName} (ID: {selectedEvent.offerId})</p>
                </div>
                <div>
                  <Label>SubID</Label>
                  <p>{selectedEvent.subId}</p>
                </div>
                <div>
                  <Label>IP адрес</Label>
                  <p className="font-mono">{selectedEvent.ip}</p>
                </div>
                <div>
                  <Label>Страна</Label>
                  <p>{selectedEvent.country}</p>
                </div>
                <div>
                  <Label>Оценка риска</Label>
                  <div className="flex items-center space-x-2">
                    <Progress value={selectedEvent.riskScore} className="w-20" />
                    <span>{selectedEvent.riskScore}%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>User Agent</Label>
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {selectedEvent.userAgent}
                </p>
              </div>

              <div>
                <Label>Детали</Label>
                <p className="text-sm">{selectedEvent.details}</p>
              </div>

              <div>
                <Label>Отпечаток браузера</Label>
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {selectedEvent.fingerprint}
                </p>
              </div>

              {selectedEvent.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleEventAction(selectedEvent.id, 'confirmed')}
                    variant="destructive"
                    data-testid="button-confirm-fraud"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Подтвердить фрод
                  </Button>
                  <Button
                    onClick={() => handleEventAction(selectedEvent.id, 'false_positive')}
                    variant="outline"
                    data-testid="button-false-positive-fraud"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Ложное срабатывание
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}