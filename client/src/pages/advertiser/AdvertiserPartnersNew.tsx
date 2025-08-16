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
  Activity,
  Send
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
const getApprovalStatusBadge = (approvalStatus: string, isActive: boolean) => {
  // Определяем финальный статус на основе статуса одобрения и активности
  let finalStatus: string;
  let statusText: string;
  let colorClass: string;
  let icon: React.ComponentType<any>;
  
  if (approvalStatus === 'pending') {
    finalStatus = 'pending';
    statusText = 'Ожидает одобрения';
    colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
    icon = Clock;
  } else if (approvalStatus === 'approved') {
    if (isActive) {
      finalStatus = 'approved';
      statusText = 'Одобрен';
      colorClass = 'bg-green-50 text-green-700 border-green-200';
      icon = UserCheck;
    } else {
      finalStatus = 'approved_blocked';
      statusText = 'Заблокирован';
      colorClass = 'bg-orange-50 text-orange-700 border-orange-200';
      icon = Shield;
    }
  } else if (approvalStatus === 'rejected') {
    finalStatus = 'rejected';
    statusText = 'Отклонен';
    colorClass = 'bg-red-50 text-red-700 border-red-200';
    icon = UserX;
  } else if (approvalStatus === 'blocked') {
    finalStatus = 'blocked';
    statusText = 'Заблокирован';
    colorClass = 'bg-red-50 text-red-700 border-red-200';
    icon = Shield;
  } else {
    // Fallback
    finalStatus = 'pending';
    statusText = 'Неизвестно';
    colorClass = 'bg-gray-50 text-gray-700 border-gray-200';
    icon = Clock;
  }
  
  const Icon = icon;
  
  return (
    <div className="flex items-center gap-1.5">
      <Badge className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border ${colorClass} shadow-sm`}>
        <Icon className="w-3.5 h-3.5" />
        {statusText}
      </Badge>
    </div>
  );
};

// Риск badge компонент
const getRiskBadge = (risk: string) => {
  const variants = {
    low: { 
      text: 'Низкий риск', 
      colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    },
    medium: { 
      text: 'Средний риск', 
      colorClass: 'bg-yellow-50 text-yellow-700 border-yellow-200' 
    },
    high: { 
      text: 'Высокий риск', 
      colorClass: 'bg-red-50 text-red-700 border-red-200' 
    }
  };
  
  const config = variants[risk as keyof typeof variants] || variants.low;
  
  return (
    <Badge className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${config.colorClass}`}>
      {config.text}
    </Badge>
  );
};

// Функция для определения новых партнеров (зарегистрированных за последние 7 дней)
const isNewPartner = (registeredAt: string): boolean => {
  const registrationDate = new Date(registeredAt);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff <= 7;
};

// Компонент индикатора нового партнера
const NewPartnerBadge = () => (
  <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5 text-xs font-medium rounded-full">
    НОВЫЙ
  </Badge>
);

export function AdvertiserPartnersNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Состояние фильтров
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  
  // Состояние модальных окон
  const [selectedPartnerForStats, setSelectedPartnerForStats] = useState<Partner | null>(null);
  const [selectedPartnerForDetails, setSelectedPartnerForDetails] = useState<Partner | null>(null);

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
      totalClicks: Math.floor(Math.random() * 2000) + 500,
      uniqueClicks: Math.floor(Math.random() * 1500) + 300,
      totalLeads: Math.floor(Math.random() * 100) + 20,
      totalRevenue: (Math.random() * 8000 + 1000).toFixed(2),
      totalPayout: (Math.random() * 5000 + 700).toFixed(2),
      totalProfit: (Math.random() * 3000 + 300).toFixed(2),
      conversionRate: (Math.random() * 15 + 3).toFixed(2),
      epc: (Math.random() * 8 + 2).toFixed(2),
      roi: (Math.random() * 300 + 80).toFixed(2),
      offersCount: Math.floor(Math.random() * 15) + 5,
      activeOffersCount: Math.floor(Math.random() * 12) + 3,
      riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
      lastActivityDays: Math.floor(Math.random() * 7),
      avgDailyClicks: Math.floor(Math.random() * 150) + 50,
      avgDailyRevenue: (Math.random() * 300 + 100).toFixed(2)
    },
    payoutSettings: {
      hasCustomPayouts: false,
      customOffers: 0
    }
  }));
  
  // Создаём summary на основе данных партнёров
  const summary = {
    totalPartners: partners.length,
    activePartners: partners.filter((p: Partner) => p.isActive).length,
    pendingPartners: partners.filter((p: Partner) => p.approvalStatus === 'pending').length,
    approvedPartners: partners.filter((p: Partner) => p.approvalStatus === 'approved').length,
    blockedPartners: partners.filter((p: Partner) => p.approvalStatus === 'blocked').length,
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
        <div className="flex gap-2">
          <Button 
            onClick={() => window.location.href = '/advertiser/partner-invite-links'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-partner-invites"
          >
            <Send className="w-4 h-4 mr-2" />
            Пригласить партнеров
          </Button>
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
              {filteredPartners.map((partner: Partner) => (
                <TableRow key={partner.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {partner.firstName?.charAt(0) || ''}{partner.lastName?.charAt(0) || ''}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{partner.displayName}</p>
                          {isNewPartner(partner.registeredAt) && <NewPartnerBadge />}
                        </div>
                        <p className="text-sm text-gray-500">#{partner.partnerNumber}</p>
                        <p className="text-sm text-gray-500">{partner.email}</p>
                        {partner.company && (
                          <p className="text-xs text-gray-400">{partner.company}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-2">
                      {getApprovalStatusBadge(partner.approvalStatus, partner.isActive)}
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
                    <div className="flex flex-col gap-2">
                      {/* Основные действия */}
                      <div className="flex items-center gap-1">
                        {/* Кнопки одобрения/отклонения только для pending */}
                        {partner.approvalStatus === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(partner.id)}
                              disabled={approveMutation.isPending}
                              className="text-green-600 border-green-200 hover:bg-green-50 text-xs px-2 py-1"
                              data-testid={`button-approve-${partner.id}`}
                            >
                              <UserCheck className="w-3 h-3 mr-1" />
                              Одобрить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(partner.id)}
                              disabled={rejectMutation.isPending}
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2 py-1"
                              data-testid={`button-reject-${partner.id}`}
                            >
                              <UserX className="w-3 h-3 mr-1" />
                              Отклонить
                            </Button>
                          </>
                        )}
                        
                        {/* Кнопка блокировки/разблокировки для одобренных партнеров */}
                        {partner.approvalStatus === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleBlock(partner.id)}
                            disabled={toggleBlockMutation.isPending}
                            className={partner.isActive 
                              ? "text-orange-600 border-orange-200 hover:bg-orange-50 text-xs px-2 py-1"
                              : "text-green-600 border-green-200 hover:bg-green-50 text-xs px-2 py-1"
                            }
                            data-testid={`button-toggle-block-${partner.id}`}
                          >
                            {partner.isActive ? (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Заблокировать
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Разблокировать
                              </>
                            )}
                          </Button>
                        )}
                        
                        {/* Для отклоненных партнеров - только возможность одобрить */}
                        {partner.approvalStatus === 'rejected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(partner.id)}
                            disabled={approveMutation.isPending}
                            className="text-green-600 border-green-200 hover:bg-green-50 text-xs px-2 py-1"
                            data-testid={`button-reapprove-${partner.id}`}
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Одобрить
                          </Button>
                        )}
                      </div>

                      {/* Вторичные действия */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPartnerForStats(partner)}
                          className="text-blue-600 hover:bg-blue-50 text-xs px-2 py-1"
                          data-testid={`button-stats-${partner.id}`}
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Статистика
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`mailto:${partner.email}`, '_blank')}
                          className="text-gray-600 hover:bg-gray-50 text-xs px-2 py-1"
                          data-testid={`button-email-${partner.id}`}
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPartnerForDetails(partner)}
                          className="text-gray-600 hover:bg-gray-50 text-xs px-2 py-1"
                          data-testid={`button-view-${partner.id}`}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Детали
                        </Button>
                      </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Статистика партнёра
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedPartnerForStats.displayName} • #{selectedPartnerForStats.partnerNumber}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPartnerForStats(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Закрыть</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            
            {/* Основные метрики */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Общий доход</p>
                      <p className="text-2xl font-bold text-green-600">${selectedPartnerForStats.stats.totalRevenue}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Всего кликов</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedPartnerForStats.stats.totalClicks.toLocaleString()}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Конверсий</p>
                      <p className="text-2xl font-bold text-purple-600">{selectedPartnerForStats.stats.totalLeads}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">CR</p>
                      <p className="text-2xl font-bold text-orange-600">{selectedPartnerForStats.stats.conversionRate}%</p>
                    </div>
                    <Eye className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Детальная статистика */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Показатели эффективности
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Уникальные клики:</span>
                      <span className="font-medium">{selectedPartnerForStats.stats.uniqueClicks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">EPC:</span>
                      <span className="font-medium">${selectedPartnerForStats.stats.epc}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROI:</span>
                      <span className="font-medium">{selectedPartnerForStats.stats.roi}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Средний дневной доход:</span>
                      <span className="font-medium">${selectedPartnerForStats.stats.avgDailyRevenue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    Информация о риске
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Уровень риска:</span>
                      {getRiskBadge(selectedPartnerForStats.stats.riskLevel)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Последняя активность:</span>
                      <span className="font-medium">{selectedPartnerForStats.stats.lastActivityDays} дн. назад</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Активных офферов:</span>
                      <span className="font-medium">{selectedPartnerForStats.stats.activeOffersCount} из {selectedPartnerForStats.stats.offersCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => window.open(`mailto:${selectedPartnerForStats.email}`, '_blank')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Написать письмо
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedPartnerForStats(null)}
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно деталей партнёра */}
      {selectedPartnerForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Детали партнёра
                </h2>
                <p className="text-gray-600 mt-1">
                  Подробная информация об аккаунте и активности
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPartnerForDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Закрыть</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            
            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Личная информация
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {selectedPartnerForDetails.firstName?.charAt(0) || ''}{selectedPartnerForDetails.lastName?.charAt(0) || ''}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{selectedPartnerForDetails.displayName}</p>
                        <p className="text-gray-600">#{selectedPartnerForDetails.partnerNumber}</p>
                        {isNewPartner(selectedPartnerForDetails.registeredAt) && <NewPartnerBadge />}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedPartnerForDetails.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Телефон:</span>
                        <span className="font-medium">{selectedPartnerForDetails.phone || 'Не указан'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Компания:</span>
                        <span className="font-medium">{selectedPartnerForDetails.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Страна:</span>
                        <span className="font-medium flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {selectedPartnerForDetails.country}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Баланс:</span>
                        <span className="font-medium text-green-600">${selectedPartnerForDetails.balance}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Статус и активность
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Статус одобрения:</span>
                      {getApprovalStatusBadge(selectedPartnerForDetails.approvalStatus, selectedPartnerForDetails.isActive)}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Уровень риска:</span>
                      {getRiskBadge(selectedPartnerForDetails.stats.riskLevel)}
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Дата регистрации:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(selectedPartnerForDetails.registeredAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    
                    {selectedPartnerForDetails.approvedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Дата одобрения:</span>
                        <span className="font-medium">
                          {new Date(selectedPartnerForDetails.approvedAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    )}
                    
                    {selectedPartnerForDetails.lastActiveAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Последняя активность:</span>
                        <span className="font-medium">
                          {new Date(selectedPartnerForDetails.lastActiveAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Дней с последней активности:</span>
                      <span className="font-medium">{selectedPartnerForDetails.stats.lastActivityDays}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Краткая статистика */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Краткая статистика
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedPartnerForDetails.stats.totalClicks.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Всего кликов</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedPartnerForDetails.stats.totalLeads}</p>
                    <p className="text-sm text-gray-600">Конверсий</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{selectedPartnerForDetails.stats.conversionRate}%</p>
                    <p className="text-sm text-gray-600">CR</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">${selectedPartnerForDetails.stats.epc}</p>
                    <p className="text-sm text-gray-600">EPC</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Настройки и дополнительная информация */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-500" />
                  Настройки и дополнительно
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Настройки выплат</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Кастомные выплаты:</span>
                        <span className="font-medium">
                          {selectedPartnerForDetails.payoutSettings.hasCustomPayouts ? 'Да' : 'Нет'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Кастомных офферов:</span>
                        <span className="font-medium">{selectedPartnerForDetails.payoutSettings.customOffers}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Активность</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Всего офферов:</span>
                        <span className="font-medium">{selectedPartnerForDetails.stats.offersCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Активных офферов:</span>
                        <span className="font-medium">{selectedPartnerForDetails.stats.activeOffersCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Средне кликов в день:</span>
                        <span className="font-medium">{selectedPartnerForDetails.stats.avgDailyClicks}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Кнопки действий */}
            <div className="flex justify-between gap-3 pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${selectedPartnerForDetails.email}`, '_blank')}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Написать письмо
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPartnerForDetails(null);
                    setSelectedPartnerForStats(selectedPartnerForDetails);
                  }}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Полная статистика
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedPartnerForDetails(null)}
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvertiserPartnersNew;