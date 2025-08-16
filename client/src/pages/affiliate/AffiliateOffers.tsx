import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { RequestAccessModal } from '@/components/modals/RequestAccessModal';
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
  Target,
  Filter,
  Calendar,
  DollarSign,
  Users,
  ExternalLink,
  Send
} from 'lucide-react';


interface PartnerOffer {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'paused' | 'draft' | 'pending' | 'archived';
  payout: string;
  payoutType: 'cpa' | 'cps' | 'cpl' | 'cpm' | 'cpc' | 'revshare';
  currency: string;
  trafficSources: string[];
  allowedApplications: string[];
  createdAt: string;
  isApproved: boolean;
  partnerLink: string;
  logo?: string;
  partnerApprovalType?: 'auto' | 'manual';
  advertiserName?: string;
  hasAccessRequest?: boolean;
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
  'Entertainment',
  'Cryptocurrency',
  'Sports',
  'Fashion'
];

const OFFER_STATUSES = [
  { value: 'active', label: 'Активный', color: 'bg-green-100 text-green-800' },
  { value: 'paused', label: 'Приостановлен', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'draft', label: 'Черновик', color: 'bg-gray-100 text-gray-800' },
  { value: 'pending', label: 'На проверке', color: 'bg-blue-100 text-blue-800' },
  { value: 'archived', label: 'Архивирован', color: 'bg-red-100 text-red-800' }
];

export default function AffiliateOffers() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Фильтры
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Модальное окно запроса доступа
  const [requestAccessModal, setRequestAccessModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<PartnerOffer | null>(null);

  // Получаем доступные офферы партнера
  const { data: offers = [], isLoading } = useQuery<PartnerOffer[]>({
    queryKey: ['/api/partner/offers'],
    enabled: !!user
  });

  // Фильтрация офферов
  const filteredOffers = offers.filter((offer: PartnerOffer) => {
    const matchesSearch = offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (typeof offer.description === 'string' ? offer.description.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    const matchesStatus = selectedStatus === 'all' || offer.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || offer.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = OFFER_STATUSES.find(s => s.value === status);
    return statusConfig || { value: status, label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const getPayoutTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      cpa: "CPA",
      cps: "CPS", 
      cpl: "CPL",
      cpm: "CPM",
      cpc: "CPC",
      revshare: "RevShare",
    };
    return types[type] || type.toUpperCase();
  };

  const copyToClipboard = (text: string, label: string = 'Данные') => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: `${label} скопированы в буфер обмена`,
    });
  };

  const handleRequestAccess = (offer: PartnerOffer) => {
    setSelectedOffer(offer);
    setRequestAccessModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка офферов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header without Create Button (Partners can't create offers) */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Доступные офферы</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Готовые трек-ссылки под каждым лендингом оффера
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Фильтрация
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Free Form Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по названию или описанию..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-offers"
                  />
                </div>
              </div>

              {/* All Offers Filter - Shows total count */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Все офферы</label>
                <Select value="all">
                  <SelectTrigger data-testid="select-all-offers" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                    <SelectValue placeholder="Все офферы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">✅ Все офферы ({offers.length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Статус</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    {OFFER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Категория</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="select-category-filter">
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {OFFER_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Офферы ({filteredOffers.length})
            </CardTitle>
            <CardDescription>
              Доступные офферы с готовыми трек-ссылками
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOffers.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all'
                    ? 'Нет офферов, соответствующих фильтрам'
                    : 'У вас пока нет доступных офферов'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  Обратитесь к рекламодателю для получения доступа к офферам
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название оффера</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Выплата</TableHead>
                      <TableHead>Источники трафика</TableHead>
                      <TableHead>Разрешенные приложения</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOffers.map((offer: PartnerOffer) => (
                      <TableRow key={offer.id} data-testid={`row-offer-${offer.id}`}>
                        {/* Название оффера */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {offer.logo && (
                              <img 
                                src={offer.logo} 
                                alt={offer.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <Link href={`/affiliate/offers/${offer.id}`} className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                {offer.name}
                              </Link>
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {typeof offer.description === 'string' ? offer.description : 'Описание недоступно'}
                              </p>
                              {offer.isApproved && (
                                <Badge variant="default" className="mt-1 text-xs">
                                  Одобрен
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Категория */}
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {offer.category}
                          </Badge>
                        </TableCell>

                        {/* Выплата */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{offer.payout} {offer.currency}</span>
                          </div>
                          <p className="text-sm text-gray-500">{getPayoutTypeLabel(offer.payoutType)}</p>
                        </TableCell>

                        {/* Источники трафика */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-48">
                            {offer.trafficSources && offer.trafficSources.length > 0 ? (
                              <>
                                {offer.trafficSources.slice(0, 2).map((source, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {source}
                                  </Badge>
                                ))}
                                {offer.trafficSources.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{offer.trafficSources.length - 2}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">Любые источники</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Разрешенные приложения */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-48">
                            {offer.allowedApplications && offer.allowedApplications.length > 0 ? (
                              <>
                                {offer.allowedApplications.slice(0, 2).map((app, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {app}
                                  </Badge>
                                ))}
                                {offer.allowedApplications.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{offer.allowedApplications.length - 2}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">Все разрешены</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Статус */}
                        <TableCell>
                          <Badge className={getStatusBadge(offer.status).color}>
                            {getStatusBadge(offer.status).label}
                          </Badge>
                        </TableCell>

                        {/* Действия */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`button-actions-${offer.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link href={`/affiliate/offers/${offer.id}`} className="flex items-center w-full">
                                  <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                  {t('offers.viewDetails')}
                                </Link>
                              </DropdownMenuItem>
                              
                              {offer.partnerApprovalType === 'manual' && !offer.isApproved && !offer.hasAccessRequest && (
                                <DropdownMenuItem onClick={() => handleRequestAccess(offer)}>
                                  <Send className="h-4 w-4 mr-2 text-orange-600" />
                                  {t('offers.requestAccess')}
                                </DropdownMenuItem>
                              )}
                              
                              {offer.partnerLink && (
                                <DropdownMenuItem onClick={() => copyToClipboard(offer.partnerLink, 'Партнерская ссылка')}>
                                  <Copy className="h-4 w-4 mr-2 text-purple-600" />
                                  {t('offers.copyLink')}
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem onClick={() => copyToClipboard(offer.id, 'ID оффера')}>
                                <Copy className="h-4 w-4 mr-2 text-gray-600" />
                                {t('offers.copyId')}
                              </DropdownMenuItem>

                              <DropdownMenuItem asChild>
                                <Link href={`/affiliate/offers/${offer.id}/analytics`} className="flex items-center w-full">
                                  <BarChart3 className="h-4 w-4 mr-2 text-indigo-600" />
                                  {t('offers.statistics')}
                                </Link>
                              </DropdownMenuItem>

                              {offer.partnerLink && (
                                <DropdownMenuItem asChild>
                                  <a href={offer.partnerLink} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                                    <ExternalLink className="h-4 w-4 mr-2 text-green-600" />
                                    {t('offers.openLanding')}
                                  </a>
                                </DropdownMenuItem>
                              )}
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

        {/* Request Access Modal */}
        {selectedOffer && (
          <RequestAccessModal
            isOpen={requestAccessModal}
            onClose={() => {
              setRequestAccessModal(false);
              setSelectedOffer(null);
            }}
            offer={{
              id: selectedOffer.id,
              name: selectedOffer.name,
              advertiserId: selectedOffer.id,
              advertiser_name: selectedOffer.advertiserName,
              payout: selectedOffer.payout,
              currency: selectedOffer.currency,
              category: selectedOffer.category
            }}
          />
        )}
      </div>
  );
}