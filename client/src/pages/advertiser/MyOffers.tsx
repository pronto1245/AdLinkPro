import React, { useState, useEffect } from 'react';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
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
  Ban,
  HelpCircle
} from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface Offer {
  id: string;
  name: string;
  logo?: string;
  status: string;
  payoutType: string;
  category: string | { ru?: string; en?: string };
  description?: { ru?: string; en?: string };
  payout: string;
  currency: string;
  countries?: string[];
  geoPricing?: Record<string, { payout?: string; amount?: string; currency?: string }>;
  createdAt?: string;
  partnersCount?: number;
  clicks?: number;
  leads?: number;
  conversionRate?: number;
  revenue?: number;
  landingPages?: Array<{
    id: string;
    name: string;
    url: string;
    geo?: string;
    payout?: string | number;
    hasCustomGeo?: boolean;
    hasCustomPayout?: boolean;
    isDefault?: boolean;
  }>;
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

  // Мутация для изменения статуса оффера
  const updateOfferStatusMutation = useMutation({
    mutationFn: async ({ offerId, status }: { offerId: string; status: string }) => {
      const response = await fetch(`/api/advertiser/offers/${offerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Не удалось изменить статус оффера');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Обновляем кеш после успешного изменения
      queryClient.setQueryData(['/api/advertiser/offers'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((offer: Offer) => 
          offer.id === variables.offerId 
            ? { ...offer, status: variables.status }
            : offer
        );
      });
      
      // Показываем уведомление об успехе
      console.log('Статус оффера успешно изменен:', variables.status);
    },
    onError: (error) => {
      console.error('Ошибка при изменении статуса:', error);
      // Здесь можно добавить toast уведомление об ошибке
    }
  });

  // Обработчик изменения статуса
  const handleStatusChange = (offerId: string, newStatus: string) => {
    updateOfferStatusMutation.mutate({ offerId, status: newStatus });
  };
  
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

  // Сортируем офферы по дате создания (новые наверху) и обрабатываем geoPricing из landingPages
  const sortedOffers = [...offers].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA; // Сортировка в убывающем порядке (новые наверху)
  });

  // Обрабатываем офферы для извлечения geoPricing из landingPages
  const processedOffers = sortedOffers.map(offer => {
    let geoPricing: Record<string, { payout: string; currency: string }> | undefined;
    let countries: string[] | undefined;

    // Извлекаем гео и суммы из landingPages если они есть
    if (offer.landingPages && Array.isArray(offer.landingPages)) {
      const uniqueGeos = new Set<string>();
      const geoPayouts: Record<string, { payout: string; currency: string }> = {};
      
      offer.landingPages.forEach((page: any) => {
        if (page.geo && (page.payout || page.payout === 0)) {
          uniqueGeos.add(page.geo);
          geoPayouts[page.geo] = {
            payout: page.payout.toString(),
            currency: offer.currency || 'USD'
          };
        }
      });

      if (uniqueGeos.size > 0) {
        countries = Array.from(uniqueGeos);
        geoPricing = geoPayouts;
      }
    }

    // Fallback к оригинальным данным если нет landingPages
    if (!countries && offer.countries) {
      countries = offer.countries;
    }

    return {
      ...offer,
      countries: countries,
      geoPricing: geoPricing
    };
  });

  // Clean up blob URLs and filter valid logos
  React.useEffect(() => {
    if (offers && offers.length > 0) {
      console.log('Offers data with logos:', offers.map(offer => ({ 
        id: offer.id, 
        name: offer.name, 
        logo: offer.logo,
        logoType: typeof offer.logo,
        isValidLogo: offer.logo && (offer.logo.startsWith('/') || offer.logo.startsWith('data:')),
        isBlob: offer.logo && offer.logo.startsWith('blob:')
      })));
      
      // Clean up invalid blob URLs from database
      offers.forEach(async (offer) => {
        if (offer.logo && offer.logo.startsWith('blob:')) {
          console.log('Found invalid blob URL for offer:', offer.id, offer.logo);
          // Auto-clean blob URLs by setting them to empty
          try {
            const response = await fetch(`/api/advertiser/offers/${offer.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ logo: '' })
            });
            if (response.ok) {
              console.log('Cleaned blob URL for offer:', offer.id);
            }
          } catch (error) {
            console.error('Failed to clean blob URL:', error);
          }
        }
      });
    }
  }, [offers]);

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

  // Функция получения флага страны по коду
  const getCountryFlag = (countryCode: string): string => {
    const countryFlags: Record<string, string> = {
      'afghanistan': '🇦🇫', 'albania': '🇦🇱', 'algeria': '🇩🇿', 'andorra': '🇦🇩', 'angola': '🇦🇴',
      'argentina': '🇦🇷', 'armenia': '🇦🇲', 'australia': '🇦🇺', 'austria': '🇦🇹', 'azerbaijan': '🇦🇿',
      'bahrain': '🇧🇭', 'bangladesh': '🇧🇩', 'belarus': '🇧🇾', 'belgium': '🇧🇪', 'bosnia': '🇧🇦',
      'brazil': '🇧🇷', 'bulgaria': '🇧🇬', 'cambodia': '🇰🇭', 'canada': '🇨🇦', 'chile': '🇨🇱',
      'china': '🇨🇳', 'colombia': '🇨🇴', 'croatia': '🇭🇷', 'cyprus': '🇨🇾', 'czech': '🇨🇿',
      'denmark': '🇩🇰', 'egypt': '🇪🇬', 'estonia': '🇪🇪', 'finland': '🇫🇮', 'france': '🇫🇷',
      'georgia': '🇬🇪', 'germany': '🇩🇪', 'ghana': '🇬🇭', 'greece': '🇬🇷', 'hungary': '🇭🇺',
      'iceland': '🇮🇸', 'india': '🇮🇳', 'indonesia': '🇮🇩', 'iran': '🇮🇷', 'iraq': '🇮🇶',
      'ireland': '🇮🇪', 'israel': '🇮🇱', 'italy': '🇮🇹', 'japan': '🇯🇵', 'jordan': '🇯🇴',
      'kazakhstan': '🇰🇿', 'kenya': '🇰🇪', 'kuwait': '🇰🇼', 'kyrgyzstan': '🇰🇬', 'latvia': '🇱🇻',
      'lebanon': '🇱🇧', 'lithuania': '🇱🇹', 'luxembourg': '🇱🇺', 'malaysia': '🇲🇾', 'malta': '🇲🇹',
      'mexico': '🇲🇽', 'moldova': '🇲🇩', 'mongolia': '🇲🇳', 'morocco': '🇲🇦', 'netherlands': '🇳🇱',
      'norway': '🇳🇴', 'pakistan': '🇵🇰', 'peru': '🇵🇪', 'philippines': '🇵🇭', 'poland': '🇵🇱',
      'portugal': '🇵🇹', 'qatar': '🇶🇦', 'romania': '🇷🇴', 'russia': '🇷🇺', 'saudi': '🇸🇦',
      'serbia': '🇷🇸', 'singapore': '🇸🇬', 'slovakia': '🇸🇰', 'slovenia': '🇸🇮', 'south_africa': '🇿🇦',
      'south_korea': '🇰🇷', 'spain': '🇪🇸', 'sri_lanka': '🇱🇰', 'sweden': '🇸🇪', 'switzerland': '🇨🇭',
      'thailand': '🇹🇭', 'turkey': '🇹🇷', 'uae': '🇦🇪', 'ukraine': '🇺🇦', 'united_kingdom': '🇬🇧',
      'usa': '🇺🇸', 'uzbekistan': '🇺🇿', 'vietnam': '🇻🇳'
    };
    return countryFlags[countryCode.toLowerCase()] || '🌍';
  };

  // Функция получения двухбуквенного кода страны
  const getCountryCode = (countryName: string): string => {
    const countryCodes: Record<string, string> = {
      'afghanistan': 'AF', 'albania': 'AL', 'algeria': 'DZ', 'andorra': 'AD', 'angola': 'AO',
      'argentina': 'AR', 'armenia': 'AM', 'australia': 'AU', 'austria': 'AT', 'azerbaijan': 'AZ',
      'bahrain': 'BH', 'bangladesh': 'BD', 'belarus': 'BY', 'belgium': 'BE', 'bosnia': 'BA',
      'brazil': 'BR', 'bulgaria': 'BG', 'cambodia': 'KH', 'canada': 'CA', 'chile': 'CL',
      'china': 'CN', 'colombia': 'CO', 'croatia': 'HR', 'cyprus': 'CY', 'czech': 'CZ',
      'denmark': 'DK', 'egypt': 'EG', 'estonia': 'EE', 'finland': 'FI', 'france': 'FR',
      'georgia': 'GE', 'germany': 'DE', 'ghana': 'GH', 'greece': 'GR', 'hungary': 'HU',
      'iceland': 'IS', 'india': 'IN', 'indonesia': 'ID', 'iran': 'IR', 'iraq': 'IQ',
      'ireland': 'IE', 'israel': 'IL', 'italy': 'IT', 'japan': 'JP', 'jordan': 'JO',
      'kazakhstan': 'KZ', 'kenya': 'KE', 'kuwait': 'KW', 'kyrgyzstan': 'KG', 'latvia': 'LV',
      'lebanon': 'LB', 'lithuania': 'LT', 'luxembourg': 'LU', 'malaysia': 'MY', 'malta': 'MT',
      'mexico': 'MX', 'moldova': 'MD', 'mongolia': 'MN', 'morocco': 'MA', 'netherlands': 'NL',
      'norway': 'NO', 'pakistan': 'PK', 'peru': 'PE', 'philippines': 'PH', 'poland': 'PL',
      'portugal': 'PT', 'qatar': 'QA', 'romania': 'RO', 'russia': 'RU', 'saudi': 'SA',
      'serbia': 'RS', 'singapore': 'SG', 'slovakia': 'SK', 'slovenia': 'SI', 'south_africa': 'ZA',
      'south_korea': 'KR', 'spain': 'ES', 'sri_lanka': 'LK', 'sweden': 'SE', 'switzerland': 'CH',
      'thailand': 'TH', 'turkey': 'TR', 'uae': 'AE', 'ukraine': 'UA', 'united_kingdom': 'GB',
      'usa': 'US', 'uzbekistan': 'UZ', 'vietnam': 'VN'
    };
    return countryCodes[countryName.toLowerCase()] || 'XX';
  };

  // Функция получения цвета для типа выплаты
  const getPayoutTypeColor = (payoutType: string): string => {
    const colors: Record<string, string> = {
      'cpa': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'cpl': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'cpc': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'cpm': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'revshare': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'hybrid': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
    };
    return colors[payoutType.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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
    <TooltipProvider>
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
                  <TableRow className="bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-600">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-semibold text-blue-600 dark:text-blue-400 px-4 py-3">
                      <div className="flex items-center gap-2">
                        Название оффера
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Название и логотип рекламного оффера</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-green-600 dark:text-green-400 px-4 py-3">
                      <div className="flex items-center gap-2">
                        Статус
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Текущий статус оффера (активен, на паузе, черновик)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-purple-600 dark:text-purple-400 px-4 py-3">
                      <div className="flex items-center gap-2">
                        Тип
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Модель оплаты (CPA, CPL, CPC, CPM, RevShare)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-orange-600 dark:text-orange-400 px-4 py-3">
                      <div className="flex items-center gap-2">
                        Категория
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Тематическая категория оффера (игры, финансы, здоровье и др.)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-indigo-600 dark:text-indigo-400 px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        Клики
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Общее количество кликов по оферу</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-emerald-600 dark:text-emerald-400 px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        Лиды
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Количество конверсий (успешных действий пользователей)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-yellow-600 dark:text-yellow-400 px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        CR
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Конверсия (процент кликов, приведших к целевому действию)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-red-600 dark:text-red-400 px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        Доход
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Общий доход, полученный с оффера</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-semibold text-teal-600 dark:text-teal-400 px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        Партнеры
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Количество партнеров, работающих с оффером</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-semibold text-gray-600 dark:text-gray-400 px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        Действия
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Доступные действия с оффером (редактировать, копировать, удалить)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedOffers.map((offer: Offer, index: number) => (
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
                            <div className="flex-shrink-0 relative">
                              {offer.logo && (offer.logo.startsWith('/') || offer.logo.startsWith('data:')) ? (
                                <div className="relative">
                                  <img
                                    src={offer.logo}
                                    alt={`${offer.name} logo`}
                                    className="w-10 h-10 rounded-lg object-cover border border-border"
                                    onError={(e) => {
                                      console.log('Failed to load image:', offer.logo);
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      if (target.nextElementSibling) {
                                        (target.nextElementSibling as HTMLElement).classList.remove('hidden');
                                      }
                                    }}
                                    onLoad={() => {
                                      console.log('Image loaded successfully:', offer.logo);
                                    }}
                                  />
                                  {/* Заглушка для случая ошибки загрузки */}
                                  <div className="hidden w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 border border-border flex items-center justify-center">
                                    <span className="text-xs font-semibold text-primary">
                                      {offer.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                /* Заглушка если нет логотипа или blob URL */
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 border border-border flex items-center justify-center">
                                  <span className="text-xs font-semibold text-primary">
                                    {offer.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Информация об оффере */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate" title={offer.name}>
                                {offer.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {offer.category && (
                                  <span className="capitalize">
                                    {typeof offer.category === 'string' ? offer.category : 
                                     typeof offer.category === 'object' ? (offer.category.ru || offer.category.en || 'Категория') : 
                                     'Категория'}
                                  </span>
                                )}
                                {offer.description && (() => {
                                  const desc = typeof offer.description === 'string' ? offer.description : 
                                              typeof offer.description === 'object' ? (offer.description.ru || offer.description.en || '') : '';
                                  const shouldTruncate = desc.length > 10;
                                  const displayText = shouldTruncate ? desc.substring(0, 10) + '...' : desc;
                                  
                                  return shouldTruncate ? (
                                    <span 
                                      className="ml-2 text-xs opacity-70 cursor-help" 
                                      title={desc}
                                    >
                                      • {displayText}
                                    </span>
                                  ) : (
                                    <span className="ml-2 text-xs opacity-70">
                                      • {displayText}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Select 
                            value={offer.status} 
                            onValueChange={(newStatus) => handleStatusChange(offer.id, newStatus)}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <Badge variant={getStatusBadge(offer.status).variant} className="text-xs">
                                {getStatusBadge(offer.status).label}
                              </Badge>
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  Активен
                                </div>
                              </SelectItem>
                              <SelectItem value="paused">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  Приостановлен
                                </div>
                              </SelectItem>
                              <SelectItem value="stopped">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  Остановлен
                                </div>
                              </SelectItem>
                              <SelectItem value="archived">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                  Архивирован
                                </div>
                              </SelectItem>
                              <SelectItem value="draft">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                  Черновик
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-2">
                            {/* Первая строка: Тип выплаты с цветом */}
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPayoutTypeColor(offer.payoutType || 'cpa')}`}>
                              {offer.payoutType?.toUpperCase() || 'CPA'}
                            </div>
                            
                            {/* Вторая строка: Гео с Tooltip */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-sm cursor-pointer">
                                  {offer.countries && offer.countries.length > 0 ? (
                                    <>
                                      <span className="text-lg">{getCountryFlag(offer.countries[0])}</span>
                                      <span className="font-mono text-xs text-muted-foreground">
                                        {getCountryCode(offer.countries[0])}
                                      </span>
                                      {offer.countries.length > 1 && (
                                        <span className="text-xs text-muted-foreground">
                                          +{offer.countries.length - 1}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-lg">🌍</span>
                                      <span className="font-mono text-xs text-muted-foreground">GL</span>
                                    </>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-1">
                                  <div className="font-semibold text-xs mb-2">Все гео:</div>
                                  <div className="grid grid-cols-3 gap-2">
                                    {(offer.countries || ['global']).map((country, index) => (
                                      <div key={index} className="flex items-center gap-1 text-xs">
                                        <span className="text-sm">{getCountryFlag(country)}</span>
                                        <span className="font-mono">{getCountryCode(country)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-2">
                            {/* Первая строка: Категория */}
                            <Badge variant="outline" className="capitalize">
                              {typeof offer.category === 'string' ? offer.category : 
                               typeof offer.category === 'object' ? (offer.category.ru || offer.category.en || 'Категория') : 
                               'Категория'}
                            </Badge>
                            
                            {/* Вторая строка: Сумма выплаты с Tooltip */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="font-semibold text-green-600 dark:text-green-400 cursor-pointer">
                                  {formatCurrency(parseFloat(offer.payout || '0'), offer.currency)}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <div className="space-y-2">
                                  <div className="font-semibold text-xs mb-2">Суммы по гео:</div>
                                  {offer.geoPricing && typeof offer.geoPricing === 'object' ? (
                                    <div className="space-y-1">
                                      {Object.entries(offer.geoPricing).map(([country, pricing]: [string, any]) => (
                                        <div key={country} className="flex items-center justify-between gap-2 text-xs">
                                          <div className="flex items-center gap-1">
                                            <span className="text-sm">{getCountryFlag(country)}</span>
                                            <span className="font-mono">{getCountryCode(country)}</span>
                                          </div>
                                          <div className="font-semibold text-green-600">
                                            {formatCurrency(parseFloat(pricing.payout || pricing.amount || '0'), pricing.currency || offer.currency)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : offer.countries && offer.countries.length > 1 ? (
                                    <div className="space-y-1">
                                      {offer.countries.map((country, index) => (
                                        <div key={index} className="flex items-center justify-between gap-2 text-xs">
                                          <div className="flex items-center gap-1">
                                            <span className="text-sm">{getCountryFlag(country)}</span>
                                            <span className="font-mono">{getCountryCode(country)}</span>
                                          </div>
                                          <div className="font-semibold text-green-600">
                                            {formatCurrency(parseFloat(offer.payout || '0'), offer.currency)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-muted-foreground">
                                      Базовая ставка: {formatCurrency(parseFloat(offer.payout || '0'), offer.currency)}
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
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
    </TooltipProvider>
  );
}