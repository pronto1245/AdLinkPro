import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/components/NotificationToast';
import { offersApi } from '@/lib/api-services';
import { 
  Search, 
  Filter, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  ExternalLink,
  Grid,
  List,
  RefreshCw
} from 'lucide-react';

interface Offer {
  id: string;
  name: string;
  description: string;
  payout: number;
  conversionRate: number;
  status: 'active' | 'paused' | 'completed';
  category: string;
  countries: string[];
  trafficTypes: string[];
  createdAt: string;
}

export default function PartnerOffers() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { showNotification } = useNotifications();

  // Fetch offers
  const { 
    data: offersData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['offers', 'partner', { search, status, page }],
    queryFn: () => offersApi.getOffers({
      page,
      limit: 12,
      status: status === 'all' ? undefined : status,
      search: search || undefined,
    }),
    keepPreviousData: true,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleRequestAccess = async (offerId: string, offerName: string) => {
    try {
      await offersApi.requestAccess(offerId, `Запрос доступа к офферу: ${offerName}`);
      showNotification({
        type: 'success',
        title: 'Запрос отправлен',
        message: `Запрос доступа к офферу "${offerName}" отправлен`,
      });
    } catch (_error) {
      showNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось отправить запрос доступа',
      });
    }
  };

  const offers = offersData?.data || [];
  const totalPages = Math.ceil((offersData?.total || 0) / 12);

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Ошибка загрузки офферов</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Попробовать снова
            </Button>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Офферы</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Найдите и подключите офферы для продвижения
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск по названию офферов..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status filter */}
            <div className="w-full md:w-48">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="paused">Приостановленные</SelectItem>
                  <SelectItem value="completed">Завершенные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Всего офферов</p>
                <p className="text-2xl font-bold">{offersData?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Активные</p>
                <p className="text-2xl font-bold">
                  {offers.filter((o: Offer) => o.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Ср. выплата</p>
                <p className="text-2xl font-bold">
                  ${offers.length ? (offers.reduce((sum: number, o: Offer) => sum + o.payout, 0) / offers.length).toFixed(0) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Ср. CR</p>
                <p className="text-2xl font-bold">
                  {offers.length ? (offers.reduce((sum: number, o: Offer) => sum + o.conversionRate, 0) / offers.length).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offers Grid/List */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : offers.length > 0 ? (
        <>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {offers.map((offer: Offer) => (
              <Card key={offer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{offer.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {offer.description}
                      </p>
                    </div>
                    <Badge variant={
                      offer.status === 'active' ? 'default' : 
                      offer.status === 'paused' ? 'secondary' : 'outline'
                    }>
                      {offer.status === 'active' ? 'Активный' : 
                       offer.status === 'paused' ? 'Пауза' : 'Завершен'}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Выплата:</span>
                      <span className="font-semibold">${offer.payout}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CR:</span>
                      <span className="font-semibold">{offer.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Категория:</span>
                      <span className="font-semibold">{offer.category}</span>
                    </div>
                  </div>

                  {/* Countries and traffic types */}
                  {offer.countries && offer.countries.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Страны:</p>
                      <div className="flex flex-wrap gap-1">
                        {offer.countries.slice(0, 3).map((country, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                        {offer.countries.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{offer.countries.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Подробнее
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleRequestAccess(offer.id, offer.name)}
                      disabled={offer.status !== 'active'}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Подключить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Назад
                </Button>
                <span className="text-sm text-gray-600">
                  Страница {page} из {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Далее
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Офферы не найдены</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Попробуйте изменить параметры поиска
            </p>
            <Button variant="outline" onClick={() => {
              setSearch('');
              setStatus('all');
              setPage(1);
            }}>
              Сбросить фильтры
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}