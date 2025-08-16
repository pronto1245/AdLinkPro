import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  Clock,
  Shield,
  Eye,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  DollarSign,
  Activity
} from 'lucide-react';

// Типы данных для партнеров с новой системой одобрения
interface Partner {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  partnerNumber: string;
  company?: string;
  phone?: string;
  country: string;
  isActive: boolean;
  status: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'blocked';
  registrationLink?: string;
  registeredAt: string;
  lastActiveAt?: string;
  approvedAt?: string;
  balance: string;
  stats: {
    totalClicks: number;
    uniqueClicks: number;
    totalLeads: number;
    totalRevenue: string;
    totalPayout: string;
    totalProfit: string;
    conversionRate: string;
    epc: string;
    roi: string;
    offersCount: number;
    activeOffersCount: number;
    riskLevel: 'low' | 'medium' | 'high';
    lastActivityDays: number;
    avgDailyClicks: number;
    avgDailyRevenue: string;
  };
  payoutSettings: {
    hasCustomPayouts: boolean;
    customOffers: number;
  };
}

interface PartnerSummary {
  totalPartners: number;
  activePartners: number;
  pendingPartners: number;
  approvedPartners: number;
  blockedPartners: number;
  totalRevenue: string;
  totalPayout: string;
  totalProfit: string;
  totalClicks: number;
  totalLeads: number;
  avgConversionRate: string;
  avgEpc: string;
}

interface PartnersResponse {
  partners: Partner[];
  summary: PartnerSummary;
}

// Статус badge компонент
const getApprovalStatusBadge = (status: string) => {
  const variants = {
    pending: { variant: 'secondary' as const, icon: Clock, text: 'Ожидает одобрения' },
    approved: { variant: 'default' as const, icon: UserCheck, text: 'Одобрен' },
    rejected: { variant: 'destructive' as const, icon: UserX, text: 'Отклонен' },
    blocked: { variant: 'destructive' as const, icon: Shield, text: 'Заблокирован' }
  };
  
  const config = variants[status as keyof typeof variants] || variants.pending;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {config.text}
    </Badge>
  );
};

// Риск badge компонент
const getRiskBadge = (risk: string) => {
  const variants = {
    low: { variant: 'default' as const, text: 'Низкий' },
    medium: { variant: 'secondary' as const, text: 'Средний' },
    high: { variant: 'destructive' as const, text: 'Высокий' }
  };
  
  const config = variants[risk as keyof typeof variants] || variants.low;
  
  return (
    <Badge variant={config.variant}>
      {config.text}
    </Badge>
  );
};

export function AdvertiserPartnersNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Состояние фильтров
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  
  // Состояние модальных окон
  const [selectedPartnerForStats, setSelectedPartnerForStats] = useState<Partner | null>(null);

  // Загрузка партнеров - API теперь возвращает массив партнёров напрямую
  const { data: partnersArray, isLoading } = useQuery({
    queryKey: ['/api/advertiser/partners', { 
      search: searchTerm, 
      status: statusFilter === 'all' ? undefined : statusFilter,
      riskLevel: riskFilter === 'all' ? undefined : riskFilter
    }],
    queryFn: () => apiRequest('/api/advertiser/partners')
  });

  // Мутация для одобрения партнера
  const approveMutation = useMutation({
    mutationFn: (partnerId: string) => 
      apiRequest(`/api/advertiser/partners/${partnerId}/approve`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/partners'] });
      toast({
        title: "Успех!",
        description: "Партнер успешно одобрен",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось одобрить партнера",
        variant: "destructive",
      });
    }
  });

  // Мутация для отклонения партнера
  const rejectMutation = useMutation({
    mutationFn: (partnerId: string) => 
      apiRequest(`/api/advertiser/partners/${partnerId}/reject`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/partners'] });
      toast({
        title: "Успех!",
        description: "Партнер отклонен",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отклонить партнера",
        variant: "destructive",
      });
    }
  });

  // Мутация для блокировки/разблокировки партнера
  const toggleBlockMutation = useMutation({
    mutationFn: (partnerId: string) => 
      apiRequest(`/api/advertiser/partners/${partnerId}/toggle-block`, 'POST'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/partners'] });
      toast({
        title: "Успех!",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус партнера",
        variant: "destructive",
      });
    }
  });

  // Обработчики действий
  const handleApprove = (partnerId: string) => {
    approveMutation.mutate(partnerId);
  };

  const handleReject = (partnerId: string) => {
    rejectMutation.mutate(partnerId);
  };

  const handleToggleBlock = (partnerId: string) => {
    toggleBlockMutation.mutate(partnerId);
  };

  // Преобразуем простые данные партнёров в ожидаемый формат
  const partners = (partnersArray || []).map((partner: any) => ({
    ...partner,
    displayName: `${partner.firstName || ''} ${partner.lastName || ''}`.trim() || partner.username,
    partnerNumber: partner.partnerNumber || `P${partner.username}`,
    company: partner.company || 'Individual',
    country: partner.country || 'Unknown',
    registeredAt: partner.createdAt || new Date().toISOString(),
    balance: partner.balance || '0.00',
    stats: {
      totalClicks: 0,
      uniqueClicks: 0,
      totalLeads: 0,
      totalRevenue: '0.00',
      totalPayout: '0.00',
      totalProfit: '0.00',
      conversionRate: '0.00',
      epc: '0.00',
      roi: '0.00',
      offersCount: 0,
      activeOffersCount: 0,
      riskLevel: 'low' as const,
      lastActivityDays: 0,
      avgDailyClicks: 0,
      avgDailyRevenue: '0.00'
    },
    payoutSettings: {
      hasCustomPayouts: false,
      customOffers: 0
    }
  }));
  
  // Создаём summary на основе данных партнёров
  const summary = {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.isActive).length,
    pendingPartners: partners.filter(p => p.approvalStatus === 'pending').length,
    approvedPartners: partners.filter(p => p.approvalStatus === 'approved').length,
    blockedPartners: partners.filter(p => p.approvalStatus === 'blocked').length,
    totalRevenue: '0.00',
    totalPayout: '0.00',
    totalProfit: '0.00',
    totalClicks: 0,
    totalLeads: 0,
    avgConversionRate: '0.00',
    avgEpc: '0.00'
  };

  // Фильтрация партнеров
  const filteredPartners = partners.filter((partner: Partner) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!partner.displayName.toLowerCase().includes(searchLower) &&
          !partner.email.toLowerCase().includes(searchLower) &&
          !partner.username.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    if (statusFilter !== 'all' && partner.approvalStatus !== statusFilter) {
      return false;
    }
    
    if (riskFilter !== 'all' && partner.stats.riskLevel !== riskFilter) {
      return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка партнеров...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Управление партнерами</h1>
          <p className="text-gray-600 mt-1">
            Одобряйте новых партнеров и управляйте их доступом к офферам
          </p>
        </div>
      </div>

      {/* Статистика */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Всего партнеров</p>
                  <p className="text-2xl font-bold">{summary.totalPartners}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ожидают одобрения</p>
                  <p className="text-2xl font-bold text-orange-600">{summary.pendingPartners}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Одобрено</p>
                  <p className="text-2xl font-bold text-green-600">{summary.approvedPartners}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Общий доход</p>
                  <p className="text-2xl font-bold">${summary.totalRevenue}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Фильтры и поиск
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Поиск по имени, email или ID партнера..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-partners"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-status">
                <SelectValue placeholder="Статус одобрения" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидают одобрения</SelectItem>
                <SelectItem value="approved">Одобрены</SelectItem>
                <SelectItem value="rejected">Отклонены</SelectItem>
                <SelectItem value="blocked">Заблокированы</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-40" data-testid="select-filter-risk">
                <SelectValue placeholder="Уровень риска" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все уровни</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Таблица партнеров */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Партнер</TableHead>
                <TableHead>Статус одобрения</TableHead>
                <TableHead>Статистика</TableHead>
                <TableHead>Риск</TableHead>
                <TableHead>Регистрация</TableHead>
                <TableHead className="w-40">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((partner) => (
                <TableRow key={partner.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {partner.firstName?.charAt(0) || ''}{partner.lastName?.charAt(0) || ''}
                      </div>
                      <div>
                        <p className="font-medium">{partner.displayName}</p>
                        <p className="text-sm text-gray-500">#{partner.partnerNumber}</p>
                        <p className="text-sm text-gray-500">{partner.email}</p>
                        {partner.company && (
                          <p className="text-xs text-gray-400">{partner.company}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      {getApprovalStatusBadge(partner.approvalStatus)}
                      {partner.approvedAt && (
                        <p className="text-xs text-gray-500">
                          Одобрен: {new Date(partner.approvedAt).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>Доход: ${partner.stats.totalRevenue}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span>Клики: {partner.stats.totalClicks}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        CR: {partner.stats.conversionRate}% | EPC: ${partner.stats.epc}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getRiskBadge(partner.stats.riskLevel)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(partner.registeredAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{partner.country}</span>
                      </div>
                      {partner.lastActiveAt && (
                        <p className="text-xs text-gray-500">
                          Активность: {new Date(partner.lastActiveAt).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {/* Кнопки одобрения/отклонения только для pending */}
                      {partner.approvalStatus === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(partner.id)}
                            disabled={approveMutation.isPending}
                            title="Одобрить партнера"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            data-testid={`button-approve-${partner.id}`}
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(partner.id)}
                            disabled={rejectMutation.isPending}
                            title="Отклонить партнера"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`button-reject-${partner.id}`}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      
                      {/* Кнопка блокировки/разблокировки для одобренных и отклонённых */}
                      {(partner.approvalStatus === 'approved' || partner.approvalStatus === 'rejected') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBlock(partner.id)}
                          disabled={toggleBlockMutation.isPending}
                          title={partner.isActive ? "Заблокировать партнера" : "Разблокировать партнера"}
                          className={partner.isActive 
                            ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            : "text-green-600 hover:text-green-700 hover:bg-green-50"
                          }
                          data-testid={`button-toggle-block-${partner.id}`}
                        >
                          {partner.isActive ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                      )}
                      
                      {/* Кнопка статистики - всегда видна */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPartnerForStats(partner)}
                        title="Статистика партнера"
                        data-testid={`button-stats-${partner.id}`}
                      >
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                      
                      {/* Кнопка email - всегда видна */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`mailto:${partner.email}`, '_blank')}
                        title="Написать письмо"
                        data-testid={`button-email-${partner.id}`}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      
                      {/* Кнопка просмотра деталей - всегда видна */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Открыть детали партнера  
                          console.log('Открыть детали партнёра:', partner.id);
                        }}
                        title="Просмотр деталей"
                        data-testid={`button-view-${partner.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPartners.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет партнеров</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || riskFilter !== 'all'
                  ? 'По вашему запросу ничего не найдено'
                  : 'Пока нет зарегистрированных партнеров'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно статистики партнёра */}
      {selectedPartnerForStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Статистика партнёра: {selectedPartnerForStats.displayName}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPartnerForStats(null)}
                title="Закрыть"
              >
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedPartnerForStats.stats.totalClicks}
                    </div>
                    <div className="text-sm text-gray-600">Всего кликов</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${selectedPartnerForStats.stats.totalRevenue}
                    </div>
                    <div className="text-sm text-gray-600">Общий доход</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedPartnerForStats.stats.conversionRate}%
                    </div>
                    <div className="text-sm text-gray-600">Конверсия</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Детальная статистика</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Уникальные клики:</span>
                      <span className="font-medium">{selectedPartnerForStats.stats.uniqueClicks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Всего лидов:</span>
                      <span className="font-medium">{selectedPartnerForStats.stats.totalLeads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>EPC:</span>
                      <span className="font-medium">${selectedPartnerForStats.stats.epc}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI:</span>
                      <span className="font-medium">{selectedPartnerForStats.stats.roi}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Активных офферов:</span>
                      <span className="font-medium">{selectedPartnerForStats.stats.activeOffersCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Информация о партнёре</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-medium">{selectedPartnerForStats.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Статус:</span>
                      <span>{getApprovalStatusBadge(selectedPartnerForStats.approvalStatus)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Компания:</span>
                      <span className="font-medium">{selectedPartnerForStats.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Страна:</span>
                      <span className="font-medium">{selectedPartnerForStats.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Уровень риска:</span>
                      <span>{getRiskBadge(selectedPartnerForStats.stats.riskLevel)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvertiserPartnersNew;