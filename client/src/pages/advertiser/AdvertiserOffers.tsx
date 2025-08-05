import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2, 
  BarChart3, 
  Settings, 
  Globe, 
  Smartphone, 
  Monitor,
  Eye,
  PlayCircle,
  PauseCircle,
  Target
} from 'lucide-react';

interface Offer {
  id: string;
  number: string;
  name: string;
  description: string;
  category: string;
  vertical: string;
  status: 'active' | 'paused' | 'draft' | 'pending' | 'archived';
  payout: string;
  payoutType: 'fixed' | 'percent';
  currency: string;
  goals: any[];
  geoTargeting: string[];
  devices: string[];
  trafficTypes: string[];
  restrictions: string[];
  cookieLifetime: number;
  createdAt: string;
  updatedAt: string;
  stats: {
    clicks: number;
    conversions: number;
    cr: number;
    epc: number;
    revenue: number;
  };
}

const OFFER_CATEGORIES = [
  'Finance',
  'Gaming', 
  'Dating',
  'E-commerce',
  'Health',
  'Education',
  'Travel',
  'Technology',
  'Entertainment'
];

const TRAFFIC_TYPES = [
  'SEO',
  'PPC',
  'Social Media',
  'Push Notifications',
  'Email',
  'Native',
  'Display',
  'YouTube',
  'TikTok',
  'Facebook',
  'Google Ads'
];

export default function AdvertiserOffers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Получаем офферы рекламодателя
  const { data: offers, isLoading } = useQuery({
    queryKey: ['/api/advertiser/offers'],
    enabled: !!user
  });

  // Мутация для изменения статуса оффера
  const updateOfferStatusMutation = useMutation({
    mutationFn: ({ offerId, status }: { offerId: string; status: string }) =>
      apiRequest(`/api/admin/offers/${offerId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    onSuccess: () => {
      toast({
        title: "Статус оффера обновлен",
        description: "Изменения сохранены успешно."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус оффера.",
        variant: "destructive"
      });
    }
  });

  // Мутация для клонирования оффера
  const cloneOfferMutation = useMutation({
    mutationFn: (offerId: string) =>
      apiRequest(`/api/admin/offers/${offerId}/clone`, {
        method: 'POST'
      }),
    onSuccess: () => {
      toast({
        title: "Оффер клонирован",
        description: "Создана копия оффера."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось клонировать оффер.",
        variant: "destructive"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayCircle className="h-4 w-4" />;
      case 'paused': return <PauseCircle className="h-4 w-4" />;
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'pending': return <Eye className="h-4 w-4" />;
      case 'archived': return <Trash2 className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const filteredOffers = offers?.filter((offer: Offer) => {
    const matchesSearch = offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || offer.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || offer.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Загрузка офферов...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Мои офферы</h1>
          <p className="text-muted-foreground">
            Управление офферами и условиями для партнёров
          </p>
        </div>
        <Link href="/advertiser/offers/new">
          <Button data-testid="button-create-offer">
            <Plus className="h-4 w-4 mr-2" />
            Создать оффер
          </Button>
        </Link>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию или номеру оффера..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]" data-testid="select-category">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {OFFER_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]" data-testid="select-status">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="paused">Приостановленные</SelectItem>
                <SelectItem value="draft">Черновики</SelectItem>
                <SelectItem value="pending">На модерации</SelectItem>
                <SelectItem value="archived">Архивированные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Список офферов */}
      {filteredOffers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                  ? 'Офферы не найдены' 
                  : 'У вас пока нет офферов'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Попробуйте изменить фильтры поиска'
                  : 'Создайте первый оффер для привлечения партнёров'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedStatus === 'all' && (
                <Link href="/advertiser/offers/new">
                  <Button data-testid="button-create-first-offer">
                    <Plus className="h-4 w-4 mr-2" />
                    Создать первый оффер
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOffers.map((offer: Offer) => (
            <Card key={offer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        #{offer.number}
                      </Badge>
                      <Badge 
                        className={`${getStatusColor(offer.status)} text-xs`}
                        data-testid={`status-${offer.status}`}
                      >
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(offer.status)}
                          <span>{offer.status}</span>
                        </div>
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2" data-testid="offer-name">
                      {offer.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {offer.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Действия с оффером"
                        data-testid="button-offer-actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/advertiser/offers/${offer.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => cloneOfferMutation.mutate(offer.id)}
                        data-testid="action-clone"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Клонировать
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/advertiser/analytics?offer=${offer.id}`}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Статистика
                        </Link>
                      </DropdownMenuItem>
                      {offer.status === 'active' ? (
                        <DropdownMenuItem 
                          onClick={() => updateOfferStatusMutation.mutate({ offerId: offer.id, status: 'paused' })}
                          data-testid="action-pause"
                        >
                          <PauseCircle className="h-4 w-4 mr-2" />
                          Приостановить
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => updateOfferStatusMutation.mutate({ offerId: offer.id, status: 'active' })}
                          data-testid="action-activate"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Активировать
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => updateOfferStatusMutation.mutate({ offerId: offer.id, status: 'archived' })}
                        className="text-red-600"
                        data-testid="action-archive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Архивировать
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Основная информация */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Категория</div>
                    <div className="font-medium">{offer.category}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Вертикаль</div>
                    <div className="font-medium">{offer.vertical}</div>
                  </div>
                </div>

                {/* Выплата */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Выплата</div>
                    <div className="font-semibold text-lg" data-testid="offer-payout">
                      {offer.payoutType === 'percent' ? `${offer.payout}%` : `${offer.payout} ${offer.currency}`}
                    </div>
                  </div>
                </div>

                {/* Таргетинг */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">GEO:</span>
                    <span className="font-medium">
                      {offer.geoTargeting?.length > 0 
                        ? offer.geoTargeting.slice(0, 3).join(', ') + (offer.geoTargeting.length > 3 ? '...' : '')
                        : 'Все страны'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Устройства:</span>
                    <span className="font-medium">
                      {offer.devices?.length > 0 
                        ? offer.devices.join(', ')
                        : 'Все'
                      }
                    </span>
                  </div>
                </div>

                {/* Статистика */}
                {offer.stats && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
                    <div className="text-center">
                      <div className="font-semibold" data-testid="offer-clicks">{offer.stats.clicks || 0}</div>
                      <div className="text-muted-foreground">Клики</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold" data-testid="offer-conversions">{offer.stats.conversions || 0}</div>
                      <div className="text-muted-foreground">Конверсии</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold" data-testid="offer-cr">{(offer.stats.cr || 0).toFixed(2)}%</div>
                      <div className="text-muted-foreground">CR</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold" data-testid="offer-epc">${(offer.stats.epc || 0).toFixed(2)}</div>
                      <div className="text-muted-foreground">EPC</div>
                    </div>
                  </div>
                )}

                {/* Действия */}
                <div className="flex space-x-2 pt-2">
                  <Link href={`/advertiser/offers/${offer.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" data-testid="button-edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                  </Link>
                  <Link href={`/advertiser/analytics?offer=${offer.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" data-testid="button-stats">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Статистика
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}