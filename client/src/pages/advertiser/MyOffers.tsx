import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Archive, 
  MoreHorizontal,
  Users,
  TrendingUp,
  DollarSign,
  MousePointer,
  Target,
  ChevronDown,
  ChevronRight,
  Calendar,
  Download,
  Settings,
  Ban
} from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface Offer {
  id: string;
  name: string;
  logo?: string;
  status: string;
  payoutType: string;
  category: string;
  payout: string;
  currency: string;
  partnersCount?: number;
  clicks?: number;
  leads?: number;
  conversionRate?: number;
  revenue?: number;
  createdAt: string;
}

interface Partner {
  id: string;
  username: string;
  clicks: number;
  uniques: number;
  leads: number;
  conversionRate: number;
  epc: number;
  revenue: number;
  status: string;
  customPayout?: string;
}

interface PartnerStats {
  date: string;
  subId: string;
  geo: string;
  device: string;
  ip: string;
  clicks: number;
  uniques: number;
  leads: number;
  revenue: number;
  isBot: boolean;
  isFraud: boolean;
}

export default function MyOffers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State для фильтров и поиска
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedOffers, setExpandedOffers] = useState<Set<string>>(new Set());
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  // Загрузка офферов
  const { data: offers = [], isLoading, refetch } = useQuery<Offer[]>({
    queryKey: ['/api/advertiser/offers', { 
      search: searchTerm, 
      category: categoryFilter,
      status: statusFilter,
      dateFrom,
      dateTo
    }],
    enabled: !!user?.id
  });

  // Мутация для обновления оффера
  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/advertiser/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update offer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
    }
  });

  // Загрузка партнеров для конкретного оффера
  const { data: offerPartners = [] } = useQuery<Partner[]>({
    queryKey: ['/api/advertiser/offers', expandedOffers.size > 0 ? Array.from(expandedOffers)[0] : null, 'partners'],
    enabled: expandedOffers.size > 0,
    queryFn: async () => {
      const offerId = Array.from(expandedOffers)[0];
      const response = await fetch(`/api/advertiser/offers/${offerId}/partners`);
      if (!response.ok) throw new Error('Failed to load partners');
      return response.json();
    }
  });

  // Загрузка детальной статистики партнера
  const { data: partnerStats = [] } = useQuery({
    queryKey: ['/api/advertiser/partner', selectedPartner, 'stats'],
    enabled: !!selectedPartner,
    queryFn: async () => {
      const response = await fetch(`/api/advertiser/partner/${selectedPartner}/stats`);
      if (!response.ok) throw new Error('Failed to load partner stats');
      return response.json();
    }
  });

  // Функция переключения развернутого оффера
  const toggleOfferExpansion = (offerId: string) => {
    const newExpanded = new Set(expandedOffers);
    if (newExpanded.has(offerId)) {
      newExpanded.delete(offerId);
    } else {
      newExpanded.clear(); // Только один оффер может быть развернут
      newExpanded.add(offerId);
    }
    setExpandedOffers(newExpanded);
  };

  // Функция получения badge цвета для статуса
  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { label: 'Активен', variant: 'default' as const },
      'paused': { label: 'Приостановлен', variant: 'secondary' as const },
      'draft': { label: 'Черновик', variant: 'outline' as const },
      'archived': { label: 'Архив', variant: 'destructive' as const }
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  // Функция форматирования числа
  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  // Функция форматирования валюты
  const formatCurrency = (amount: number | string | undefined, currency = 'USD') => {
    if (!amount) return '$0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(num);
  };

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        {/* Заголовок и основные действия */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Мои офферы</h1>
            <p className="text-muted-foreground">
              Управляйте своими офферами и отслеживайте партнеров
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Обновить
            </Button>
            
            <Link href="/advertiser/offers/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Создать оффер
              </Button>
            </Link>
          </div>
        </div>

        {/* Панель фильтров */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Фильтры и поиск</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Поиск */}
              <div className="col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию оффера..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Фильтр по категории */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="gambling">Gambling</SelectItem>
                  <SelectItem value="dating">Dating</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>

              {/* Фильтр по статусу */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="paused">Приостановленные</SelectItem>
                  <SelectItem value="draft">Черновики</SelectItem>
                  <SelectItem value="archived">Архив</SelectItem>
                </SelectContent>
              </Select>

              {/* Даты */}
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Дата от"
              />
              
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Дата до"
              />
            </div>
          </CardContent>
        </Card>

        {/* Основная таблица офферов */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Список офферов ({offers.length})</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Название оффера</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead className="text-right">Клики</TableHead>
                    <TableHead className="text-right">Лиды</TableHead>
                    <TableHead className="text-right">CR</TableHead>
                    <TableHead className="text-right">Доход</TableHead>
                    <TableHead className="text-center">Партнеры</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer: Offer, index: number) => (
                    <>
                      <TableRow key={`offer-${offer.id}-${index}`} className="hover:bg-muted/50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOfferExpansion(offer.id)}
                          >
                            {expandedOffers.has(offer.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {/* Логотип оффера */}
                            <div className="flex-shrink-0">
                              {offer.logo ? (
                                <img
                                  src={offer.logo}
                                  alt={`${offer.name} logo`}
                                  className="w-10 h-10 rounded-lg object-cover border border-border"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              {/* Заглушка если нет логотипа или ошибка загрузки */}
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 border border-border flex items-center justify-center ${offer.logo ? 'hidden' : ''}`}>
                                <span className="text-xs font-semibold text-primary">
                                  {offer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            {/* Информация об оффере */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate" title={offer.name}>
                                {offer.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {offer.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={getStatusBadge(offer.status).variant}>
                            {getStatusBadge(offer.status).label}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline">
                            {offer.payoutType?.toUpperCase()}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <span className="capitalize">{offer.category}</span>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          {formatNumber(offer.clicks)}
                        </TableCell>
                        
                        <TableCell className="text-right">
                          {formatNumber(offer.leads)}
                        </TableCell>
                        
                        <TableCell className="text-right">
                          {offer.conversionRate ? `${offer.conversionRate.toFixed(1)}%` : '0%'}
                        </TableCell>
                        
                        <TableCell className="text-right font-medium">
                          {formatCurrency(offer.revenue, offer.currency)}
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{offer.partnersCount || 0}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Статистика
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Настройки
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Archive className="h-4 w-4 mr-2" />
                                Архивировать
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      
                      {/* Развернутая таблица партнеров */}
                      {expandedOffers.has(offer.id) && (
                        <TableRow>
                          <TableCell colSpan={11} className="p-0">
                            <div className="bg-muted/30 p-4 border-t">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium">
                                  Партнеры по офферу "{offer.name}"
                                </h4>
                                <Badge variant="secondary">
                                  {offerPartners.length} партнеров
                                </Badge>
                              </div>
                              
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Партнер</TableHead>
                                    <TableHead className="text-right">Клики</TableHead>
                                    <TableHead className="text-right">Уники</TableHead>
                                    <TableHead className="text-right">Лиды</TableHead>
                                    <TableHead className="text-right">CR</TableHead>
                                    <TableHead className="text-right">EPC</TableHead>
                                    <TableHead className="text-right">Доход</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead className="text-right">Действия</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {offerPartners.map((partner: Partner) => (
                                    <TableRow key={partner.id}>
                                      <TableCell>
                                        <div className="font-medium">{partner.username}</div>
                                        <div className="text-sm text-muted-foreground">
                                          ID: {partner.id.slice(0, 8)}...
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatNumber(partner.clicks)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatNumber(partner.uniques)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatNumber(partner.leads)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {partner.conversionRate.toFixed(1)}%
                                      </TableCell>
                                      <TableCell className="text-right">
                                        ${partner.epc.toFixed(2)}
                                      </TableCell>
                                      <TableCell className="text-right font-medium">
                                        ${partner.revenue.toFixed(2)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                                          {partner.status === 'active' ? 'Активен' : 'Неактивен'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex gap-1 justify-end">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            title="Подробная статистика"
                                            onClick={() => setSelectedPartner(partner.id)}
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            title="Изменить payout"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            title="Отключить партнера"
                                          >
                                            <Ban className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Модальное окно детальной статистики партнера */}
        <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>Детальная статистика партнера</DialogTitle>
              <DialogDescription>
                Подробная статистика по дням и действиям
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Сводная информация */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <MousePointer className="h-4 w-4 text-blue-500 mr-2" />
                      <div>
                        <p className="text-sm text-muted-foreground">Клики</p>
                        <p className="text-lg font-semibold">
                          {formatNumber(partnerStats.reduce((sum: number, stat: PartnerStats) => sum + stat.clicks, 0))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-green-500 mr-2" />
                      <div>
                        <p className="text-sm text-muted-foreground">Уники</p>
                        <p className="text-lg font-semibold">
                          {formatNumber(partnerStats.reduce((sum: number, stat: PartnerStats) => sum + stat.uniques, 0))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 text-orange-500 mr-2" />
                      <div>
                        <p className="text-sm text-muted-foreground">Лиды</p>
                        <p className="text-lg font-semibold">
                          {formatNumber(partnerStats.reduce((sum: number, stat: PartnerStats) => sum + stat.leads, 0))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-purple-500 mr-2" />
                      <div>
                        <p className="text-sm text-muted-foreground">Доход</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(partnerStats.reduce((sum: number, stat: PartnerStats) => sum + stat.revenue, 0))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Детальная таблица */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>SubID</TableHead>
                      <TableHead>GEO</TableHead>
                      <TableHead>Устройство</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead className="text-right">Клики</TableHead>
                      <TableHead className="text-right">Уники</TableHead>
                      <TableHead className="text-right">Лиды</TableHead>
                      <TableHead className="text-right">Доход</TableHead>
                      <TableHead className="text-center">Бот</TableHead>
                      <TableHead className="text-center">Фрод</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partnerStats.map((stat: PartnerStats, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(stat.date).toLocaleDateString('ru-RU')}</TableCell>
                        <TableCell>{stat.subId}</TableCell>
                        <TableCell>{stat.geo}</TableCell>
                        <TableCell>{stat.device}</TableCell>
                        <TableCell className="font-mono text-sm">{stat.ip}</TableCell>
                        <TableCell className="text-right">{formatNumber(stat.clicks)}</TableCell>
                        <TableCell className="text-right">{formatNumber(stat.uniques)}</TableCell>
                        <TableCell className="text-right">{formatNumber(stat.leads)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(stat.revenue)}</TableCell>
                        <TableCell className="text-center">
                          {stat.isBot ? '🤖' : '❌'}
                        </TableCell>
                        <TableCell className="text-center">
                          {stat.isFraud ? '🚨' : '❌'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Кнопки действий */}
              <div className="flex justify-between pt-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Выгрузить данные
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Изменить payout
                  </Button>
                  <Button variant="destructive">
                    <Ban className="h-4 w-4 mr-2" />
                    Отключить партнера
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleBasedLayout>
  );
}