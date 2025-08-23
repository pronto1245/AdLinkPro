import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Eye,
  Copy,
  ExternalLink,
  Lock,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  MoreVertical,
  BarChart3,
  MousePointer,
  Target,
  Info
} from 'lucide-react';
import { formatCountries } from '@/utils/countries';
import { formatCR } from '@/utils/formatting';
import { getCategoryBadgeProps } from '@/utils/categories';
import { RequestAccessModal } from '@/components/modals/RequestAccessModal';
import { useToast } from '@/hooks/use-toast';

interface PartnerOffer {
  id: string;
  name: string;
  description?: any;
  logo?: string;
  category: string;
  countries: string[];
  payout: string;
  currency: string;
  cr?: number;
  status: string;
  advertiserId: string;
  advertiser_name?: string;
  advertiser_company?: string;
  accessStatus: 'available' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'auto_approved';
  hasFullAccess: boolean;
  customPayout?: string;
  partnerLink?: string;
  trackingLink?: string; // НОВОЕ ПОЛЕ - готовая ссылка с clickid
  previewUrl?: string;
  partnerApprovalType?: string;
  accessRequestId?: string;
}

export default function PartnerOffers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all-categories');
  const [filterAccess, setFilterAccess] = useState('all');
  const [selectedOffer, setSelectedOffer] = useState<PartnerOffer | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: offers = [], isLoading } = useQuery<PartnerOffer[]>({
    queryKey: ['/api/partner/offers'],
  });

  const filteredOffers = offers.filter((offer) => {
    const searchMatch = !searchQuery ||
      offer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.advertiser_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const categoryMatch = filterCategory === 'all-categories' ||
      offer.category?.toLowerCase().includes(filterCategory.toLowerCase());

    const accessMatch = filterAccess === 'all' ||
      (filterAccess === 'approved' && offer.hasFullAccess) ||
      (filterAccess === 'pending' && offer.accessStatus === 'pending') ||
      (filterAccess === 'available' && offer.accessStatus === 'available') ||
      (filterAccess === 'rejected' && offer.accessStatus === 'rejected');

    return searchMatch && categoryMatch && accessMatch;
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('common.copied'),
      description: `${label} ${t('common.copiedToClipboard')}`,
    });
  };

  const handleRequestAccess = (offer: PartnerOffer) => {
    setSelectedOffer(offer);
    setIsRequestModalOpen(true);
  };

  const getAccessStatusBadge = (accessStatus: string, hasFullAccess: boolean) => {
    switch (accessStatus) {
      case 'approved':
      case 'auto_approved':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('common.accessGranted')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="w-3 h-3 mr-1" />
            {t('common.pending')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            <XCircle className="w-3 h-3 mr-1" />
            {t('common.rejected')}
          </Badge>
        );
      case 'available':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t('common.available')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {accessStatus}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка офферов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full" data-testid="page-partner-offers">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Доступные офферы</h1>
          <p className="text-muted-foreground mt-2">
            Просматривайте и запрашивайте доступ к офферам
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {offers.filter(o => o.hasFullAccess).length}
            </div>
            <p className="text-sm text-muted-foreground">Доступно</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {offers.filter(o => o.accessStatus === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">Ожидают ответа</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {offers.filter(o => o.accessStatus === 'rejected').length}
            </div>
            <p className="text-sm text-muted-foreground">Отклонено</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {offers.length}
            </div>
            <p className="text-sm text-muted-foreground">Всего офферов</p>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию оффера или рекламодателю..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              data-testid="input-search"
            />
          </div>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-category">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-categories">Все категории</SelectItem>
            <SelectItem value="gambling">Гемблинг</SelectItem>
            <SelectItem value="dating">Знакомства</SelectItem>
            <SelectItem value="finance">Финансы</SelectItem>
            <SelectItem value="crypto">Крипто</SelectItem>
            <SelectItem value="nutra">Нутра</SelectItem>
            <SelectItem value="software">ПО</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterAccess} onValueChange={setFilterAccess}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-access">
            <SelectValue placeholder="Статус доступа" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="approved">Доступны</SelectItem>
            <SelectItem value="pending">Ожидание</SelectItem>
            <SelectItem value="available">Можно запросить</SelectItem>
            <SelectItem value="rejected">Отклонено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Таблица офферов */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Оффер</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Гео</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>CR</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => {
                  const categoryProps = getCategoryBadgeProps(offer.category);
                  return (
                    <TableRow key={offer.id} data-testid={`row-offer-${offer.id}`}>
                      {/* Колонка Оффер - фото и название */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {offer.logo ? (
                            <img
                              src={offer.logo}
                              alt={offer.name}
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <Target className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium" data-testid={`text-offer-name-${offer.id}`}>
                              {offer.name}
                            </div>
                            {offer.advertiser_name && (
                              <div className="text-sm text-muted-foreground truncate">
                                {offer.advertiser_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Колонка Категория */}
                      <TableCell>
                        <Badge
                          className={categoryProps?.className || 'bg-gray-100 text-gray-800'}
                          data-testid={`badge-category-${offer.id}`}
                        >
                          {categoryProps?.icon && <categoryProps.icon className="w-3 h-3 mr-1 flex-shrink-0" />}
                          <span className="truncate">{categoryProps?.label || offer.category}</span>
                        </Badge>
                      </TableCell>

                      {/* Колонка Гео с флагами */}
                      <TableCell>
                        <div className="text-sm min-w-0">
                          <span className="truncate block">
                            {formatCountries(offer.countries)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Колонка Сумма */}
                      <TableCell>
                        <div className="font-mono font-medium whitespace-nowrap">
                          {offer.payout} {offer.currency}
                        </div>
                      </TableCell>

                      {/* Колонка CR */}
                      <TableCell>
                        <div className="font-mono text-green-600 font-medium whitespace-nowrap">
                          {formatCR(offer.cr || 0)}%
                        </div>
                      </TableCell>

                      {/* Колонка Действия */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Основная кнопка действия - ссылки показываем ТОЛЬКО после одобрения */}
                          {offer.accessStatus === 'approved' && offer.trackingLink ? (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => copyToClipboard(offer.trackingLink!, 'Готовая ссылка')}
                              title="Скопировать готовую ссылку с clickid"
                              data-testid={`button-copy-tracking-${offer.id}`}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Готовая ссылка
                            </Button>
                          ) : offer.accessStatus === 'approved' ? (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => copyToClipboard(offer.partnerLink || `${window.location.origin}/offers/${offer.id}`, 'Ссылка на оффер')}
                              title="Копировать ссылку"
                              data-testid={`button-copy-${offer.id}`}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Получить ссылку
                            </Button>
                          ) : offer.accessStatus === 'available' ? (
                            <Button
                              size="sm"
                              onClick={() => handleRequestAccess(offer)}
                              title="Запросить доступ"
                              data-testid={`button-request-${offer.id}`}
                            >
                              <Lock className="w-4 h-4 mr-2" />
                              Запросить
                            </Button>
                          ) : offer.accessStatus === 'pending' ? (
                            <Button size="sm" variant="outline" disabled>
                              <Clock className="w-4 h-4 mr-2" />
                              {t('common.pending')}
                            </Button>
                          ) : offer.accessStatus === 'rejected' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestAccess(offer)}
                              title={t('offers.retryRequest', 'Повторный запрос')}
                              data-testid={`button-retry-${offer.id}`}
                            >
                              {t('offers.retry', 'Повторить')}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleRequestAccess(offer)}
                              data-testid={`button-request-${offer.id}`}
                            >
                              {t('offers.requestAccess')}
                            </Button>
                          )}

                          {/* Меню с 3 точками */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Дополнительные действия"
                                data-testid={`button-menu-${offer.id}`}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  // Navigate to offer details page
                                  window.location.href = `/affiliate/offers/${offer.id}`;
                                }}
                                data-testid={`menu-details-${offer.id}`}
                              >
                                <Info className="w-4 h-4 mr-2" />
                                {t('offers.details', 'Детали')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  // Navigate to statistics page for this offer
                                  window.location.href = `/affiliate/statistics?offer=${offer.id}`;
                                }}
                                data-testid={`menu-statistics-${offer.id}`}
                              >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                {t('offers.statistics', 'Статистика')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredOffers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              {searchQuery || filterCategory !== 'all-categories' || filterAccess !== 'all'
                ? 'Офферы не найдены по заданным фильтрам'
                : 'Доступные офферы не найдены'
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Модальное окно запроса доступа */}
      {selectedOffer && (
        <RequestAccessModal
          isOpen={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false);
            setSelectedOffer(null);
          }}
          offer={selectedOffer}
        />
      )}
    </div>
  );
}
