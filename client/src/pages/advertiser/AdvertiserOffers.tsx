import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Edit, 
  Flag, 
  Plus, 
  Trash2, 
  Eye, 
  Search,
  Target,
  MoreVertical,
  Copy,
  Archive,
  Play,
  Pause,
  Settings,
  Users,
  TrendingUp,
  DollarSign,
  MousePointer,
  Calendar,
  ExternalLink,
  Filter,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface Offer {
  id: string;
  name: string;
  description: { ru: string; en: string };
  category: string;
  logo: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  payout: string;
  currency: string;
  payoutType: string;
  countries: string[];
  trafficSources: string[];
  allowedApplications: string[];
  antifraudEnabled: boolean;
  antifraudMethods: string[];
  partnerApprovalType: string;
  kycRequired: boolean;
  isPrivate: boolean;
  dailyLimit?: number;
  monthlyLimit?: number;
  landingPages: Array<{
    id: string;
    name: string;
    url: string;
    geo?: string;
    payout?: string;
    isDefault: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
  // Статистика
  clicks?: number;
  conversions?: number;
  cr?: number;
  revenue?: number;
  partnersCount?: number;
}

const AdvertiserOffers = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Состояние фильтров
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [previewOffer, setPreviewOffer] = useState<Offer | null>(null);

  // Загрузка офферов
  const { data: offers = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/advertiser/offers'],
    queryFn: () => apiRequest('/api/advertiser/offers')
  });

  // Мутация для обновления статуса оффера
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/advertiser/offers/${id}`, { method: 'PATCH', body: { status } });
    },
    onSuccess: () => {
      toast({
        title: 'Статус обновлен',
        description: 'Статус оффера успешно изменен',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
    },
    onError: () => {
      toast({
        title: 'Ошибка обновления',
        description: 'Не удалось изменить статус оффера',
        variant: 'destructive'
      });
    }
  });

  // Мутация для удаления офферов
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return Promise.all(
        ids.map(id => apiRequest(`/api/advertiser/offers/${id}`, { method: 'DELETE' }))
      );
    },
    onSuccess: () => {
      toast({
        title: 'Офферы удалены',
        description: `Удалено ${selectedOffers.length} оффер(ов)`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      setSelectedOffers([]);
    },
    onError: () => {
      toast({
        title: 'Ошибка удаления',
        description: 'Не удалось удалить офферы',
        variant: 'destructive'
      });
    }
  });

  // Мутация для дублирования оффера
  const duplicateMutation = useMutation({
    mutationFn: async (offerId: string) => {
      return apiRequest(`/api/advertiser/offers/${offerId}/duplicate`, { method: 'POST' });
    },
    onSuccess: () => {
      toast({
        title: 'Оффер скопирован',
        description: 'Оффер успешно скопирован',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
    },
    onError: () => {
      toast({
        title: 'Ошибка копирования',
        description: 'Не удалось скопировать оффер',
        variant: 'destructive'
      });
    }
  });

  // Фильтрация офферов
  const filteredOffers = offers.filter((offer: Offer) => {
    const matchesSearch = offer.name.toLowerCase().includes(search.toLowerCase()) ||
                         offer.description.ru.toLowerCase().includes(search.toLowerCase()) ||
                         offer.description.en.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || offer.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || offer.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Экспорт в CSV
  const handleExport = () => {
    const headers = [
      'ID', 'Название', 'Категория', 'Статус', 'Payout', 'Валюта', 
      'GEO', 'Источники трафика', 'Клики', 'Конверсии', 'CR%', 'Доход', 'Создан'
    ];
    
    const csvData = filteredOffers.map((offer: Offer) => [
      offer.id,
      offer.name,
      offer.category,
      offer.status,
      offer.payout,
      offer.currency,
      offer.countries.join(';'),
      offer.trafficSources.join(';'),
      offer.clicks || 0,
      offer.conversions || 0,
      offer.cr || 0,
      offer.revenue || 0,
      new Date(offer.createdAt).toLocaleDateString('ru-RU')
    ]);

    const csv = [headers, ...csvData]
      .map(row => row.map((cell: any) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `offers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Экспорт завершен',
      description: `Экспортировано ${filteredOffers.length} офферов`,
    });
  };

  // Управление выбором офферов
  const toggleSelectOffer = (id: string) => {
    setSelectedOffers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const allSelected = filteredOffers.length > 0 && filteredOffers.every((o: Offer) => selectedOffers.includes(o.id));

  const toggleSelectAll = () => {
    setSelectedOffers(allSelected ? [] : filteredOffers.map((o: Offer) => o.id));
  };

  // Форматирование данных
  const formatCurrency = (amount: string | number, currency: string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(num || 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'paused': return 'Приостановлен';
      case 'draft': return 'Черновик';
      case 'archived': return 'Архивирован';
      default: return status;
    }
  };

  const categories = ['gambling', 'dating', 'crypto', 'betting', 'e-commerce', 'gaming', 'finance', 'health', 'vpn', 'antivirus'];

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Мои офферы</h1>
          <p className="text-muted-foreground">
            Управление офферами и отслеживание статистики
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Обновить
          </Button>
          <Button onClick={() => navigate('/advertiser/offers/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Создать оффер
          </Button>
        </div>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Всего офферов</p>
                <p className="text-2xl font-bold text-blue-600">{offers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Активных</p>
                <p className="text-2xl font-bold text-green-600">
                  {offers.filter((o: Offer) => o.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Всего кликов</p>
                <p className="text-2xl font-bold text-purple-600">
                  {offers.reduce((sum: number, o: Offer) => sum + (o.clicks || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Общий доход</p>
                <p className="text-2xl font-bold text-red-600">
                  ${offers.reduce((sum: number, o: Offer) => sum + (o.revenue || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры и действия */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию или описанию..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-80"
                  data-testid="input-search"
                />
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40" data-testid="select-status">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="paused">Приостановлены</SelectItem>
                  <SelectItem value="draft">Черновики</SelectItem>
                  <SelectItem value="archived">Архивированные</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40" data-testid="select-category">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {selectedOffers.length > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={() => deleteMutation.mutate(selectedOffers)}
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete-selected"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить ({selectedOffers.length})
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleExport}
                data-testid="button-export"
              >
                <Download className="h-4 w-4 mr-2" />
                Экспорт CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredOffers.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {search || selectedStatus !== 'all' || selectedCategory !== 'all'
                  ? 'Нет офферов, соответствующих фильтрам'
                  : 'У вас пока нет офферов'
                }
              </p>
              <Button onClick={() => navigate('/advertiser/offers/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Создать первый оффер
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={allSelected} 
                        onCheckedChange={toggleSelectAll}
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    <TableHead>Оффер</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead>GEO</TableHead>
                    <TableHead>Статистика</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Создан</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOffers.map((offer: Offer) => (
                    <TableRow key={offer.id} data-testid={`row-offer-${offer.id}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedOffers.includes(offer.id)}
                          onCheckedChange={() => toggleSelectOffer(offer.id)}
                          data-testid={`checkbox-offer-${offer.id}`}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {offer.logo ? (
                            <img
                              src={offer.logo}
                              alt={offer.name}
                              className="w-10 h-10 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                              <Target className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{offer.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {offer.description.ru || offer.description.en}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="secondary">{offer.category}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(offer.payout, offer.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {offer.payoutType?.toUpperCase()}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-32">
                          {offer.countries.slice(0, 3).map((country: string) => (
                            <Badge key={country} variant="outline" className="text-xs">
                              {country.toUpperCase()}
                            </Badge>
                          ))}
                          {offer.countries.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{offer.countries.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <MousePointer className="h-3 w-3 text-purple-600" />
                            <span>{(offer.clicks || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span>{offer.conversions || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-red-600" />
                            <span>${(offer.revenue || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getStatusColor(offer.status)}>
                          {getStatusLabel(offer.status)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {new Date(offer.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`menu-offer-${offer.id}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/advertiser/offers/${offer.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Просмотр
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/advertiser/offers/${offer.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateMutation.mutate(offer.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Дублировать
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {offer.status === 'active' ? (
                              <DropdownMenuItem 
                                onClick={() => updateStatusMutation.mutate({ id: offer.id, status: 'paused' })}
                              >
                                <Pause className="h-4 w-4 mr-2" />
                                Приостановить
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => updateStatusMutation.mutate({ id: offer.id, status: 'active' })}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Активировать
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => updateStatusMutation.mutate({ id: offer.id, status: 'archived' })}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Архивировать
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setPreviewOffer(offer)}
                              className="text-blue-600"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Превью лендингов
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteMutation.mutate([offer.id])}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Превью лендингов */}
      <Dialog open={!!previewOffer} onOpenChange={() => setPreviewOffer(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Превью лендингов - {previewOffer?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewOffer?.landingPages.map((landing) => (
              <Card key={landing.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{landing.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">URL:</p>
                      <p className="font-mono text-sm break-all">{landing.url}</p>
                      {landing.geo && (
                        <p className="text-sm mt-2">
                          <span className="text-muted-foreground">GEO:</span> {landing.geo}
                        </p>
                      )}
                      {landing.payout && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Payout:</span> {landing.payout}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.open(landing.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Открыть
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvertiserOffers;