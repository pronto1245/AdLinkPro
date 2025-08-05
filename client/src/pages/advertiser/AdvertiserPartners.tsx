import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Search, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  MessageCircle, 
  BarChart3, 
  Settings, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Link as LinkIcon,
  Copy,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface Partner {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  country: string;
  status: 'active' | 'pending' | 'blocked' | 'suspended';
  registrationDate: string;
  lastActivity: string;
  trafficSources: string[];
  stats: {
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    avgCR: number;
    avgEPC: number;
  };
  assignedOffers: number;
  customPayout?: {
    offerId: string;
    amount: string;
    type: 'fixed' | 'percent';
  }[];
}

interface PartnerApplication {
  id: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  country: string;
  trafficSources: string[];
  experience: string;
  requestedOffers: string[];
  applicationDate: string;
  message: string;
}

export default function AdvertiserPartners() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');

  // Получаем партнёров рекламодателя
  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ['/api/advertiser/partners'],
    enabled: !!user
  });

  // Получаем заявки на подключение
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/advertiser/partner-applications'],
    enabled: !!user
  });

  // Получаем ссылку для регистрации партнёров
  const { data: registrationLink } = useQuery({
    queryKey: ['/api/advertiser/registration-link'],
    enabled: !!user
  });

  // Мутация для одобрения/отклонения заявки
  const handleApplicationMutation = useMutation({
    mutationFn: ({ applicationId, action, note }: { applicationId: string; action: 'approve' | 'reject'; note?: string }) =>
      apiRequest(`/api/advertiser/partner-applications/${applicationId}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ note })
      }),
    onSuccess: (_, { action }) => {
      toast({
        title: action === 'approve' ? "Заявка одобрена" : "Заявка отклонена",
        description: "Партнёр получит уведомление о решении."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/partner-applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/partners'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обработать заявку.",
        variant: "destructive"
      });
    }
  });

  // Мутация для изменения статуса партнёра
  const updatePartnerStatusMutation = useMutation({
    mutationFn: ({ partnerId, status }: { partnerId: string; status: string }) =>
      apiRequest(`/api/advertiser/partners/${partnerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    onSuccess: () => {
      toast({
        title: "Статус партнёра обновлен",
        description: "Изменения сохранены успешно."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/partners'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус партнёра.",
        variant: "destructive"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'blocked': return <XCircle className="h-4 w-4" />;
      case 'suspended': return <UserX className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const copyRegistrationLink = () => {
    if (registrationLink?.url) {
      navigator.clipboard.writeText(registrationLink.url);
      toast({
        title: "Ссылка скопирована",
        description: "Ссылка для регистрации партнёров скопирована в буфер обмена."
      });
    }
  };

  const filteredPartners = partners?.filter((partner: Partner) => {
    const matchesSearch = partner.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || partner.status === selectedStatus;
    const matchesCountry = selectedCountry === 'all' || partner.country === selectedCountry;
    
    return matchesSearch && matchesStatus && matchesCountry;
  }) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Управление партнёрами</h1>
          <p className="text-muted-foreground">
            Партнёры, заявки и настройки сотрудничества
          </p>
        </div>
        <div className="flex space-x-2">
          {registrationLink && (
            <Button 
              variant="outline" 
              onClick={copyRegistrationLink}
              data-testid="button-copy-link"
            >
              <Copy className="h-4 w-4 mr-2" />
              Скопировать ссылку регистрации
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="partners" className="space-y-6">
        <TabsList>
          <TabsTrigger value="partners" data-testid="tab-partners">
            Партнёры
            {partners && <Badge className="ml-2" variant="secondary">{partners.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="applications" data-testid="tab-applications">
            Заявки
            {applications && <Badge className="ml-2" variant="destructive">{applications.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="registration" data-testid="tab-registration">Регистрация</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Настройки</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-6">
          {/* Фильтры */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по имени, email или компании..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="input-search"
                    />
                  </div>
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]" data-testid="select-status">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="active">Активные</SelectItem>
                    <SelectItem value="pending">Ожидают</SelectItem>
                    <SelectItem value="blocked">Заблокированные</SelectItem>
                    <SelectItem value="suspended">Приостановленные</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-[180px]" data-testid="select-country">
                    <SelectValue placeholder="Страна" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все страны</SelectItem>
                    <SelectItem value="US">США</SelectItem>
                    <SelectItem value="RU">Россия</SelectItem>
                    <SelectItem value="GB">Великобритания</SelectItem>
                    <SelectItem value="DE">Германия</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Список партнёров */}
          {partnersLoading ? (
            <div className="text-center py-8">Загрузка партнёров...</div>
          ) : filteredPartners.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm || selectedStatus !== 'all' || selectedCountry !== 'all' 
                      ? 'Партнёры не найдены' 
                      : 'У вас пока нет партнёров'
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedStatus !== 'all' || selectedCountry !== 'all'
                      ? 'Попробуйте изменить фильтры поиска'
                      : 'Поделитесь ссылкой для регистрации партнёров'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPartners.map((partner: Partner) => (
                <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge 
                            className={`${getStatusColor(partner.status)} text-xs`}
                            data-testid={`status-${partner.status}`}
                          >
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(partner.status)}
                              <span>{partner.status}</span>
                            </div>
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {partner.country}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg" data-testid="partner-name">
                          {partner.firstName} {partner.lastName}
                        </CardTitle>
                        <CardDescription>
                          @{partner.username} • {partner.email}
                        </CardDescription>
                        {partner.company && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {partner.company}
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Действия с партнёром"
                            data-testid="button-partner-actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem data-testid="action-view-profile">
                            <Eye className="h-4 w-4 mr-2" />
                            Профиль
                          </DropdownMenuItem>
                          <DropdownMenuItem data-testid="action-view-stats">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Статистика
                          </DropdownMenuItem>
                          <DropdownMenuItem data-testid="action-message">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Написать
                          </DropdownMenuItem>
                          <DropdownMenuItem data-testid="action-settings">
                            <Settings className="h-4 w-4 mr-2" />
                            Настройки
                          </DropdownMenuItem>
                          {partner.status === 'active' ? (
                            <DropdownMenuItem 
                              onClick={() => updatePartnerStatusMutation.mutate({ partnerId: partner.id, status: 'suspended' })}
                              data-testid="action-suspend"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Приостановить
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => updatePartnerStatusMutation.mutate({ partnerId: partner.id, status: 'active' })}
                              data-testid="action-activate"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Активировать
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => updatePartnerStatusMutation.mutate({ partnerId: partner.id, status: 'blocked' })}
                            className="text-red-600"
                            data-testid="action-block"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Заблокировать
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Источники трафика */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Источники трафика</div>
                      <div className="flex flex-wrap gap-1">
                        {partner.trafficSources?.slice(0, 3).map((source, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                        {partner.trafficSources?.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{partner.trafficSources.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Статистика */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Клики</span>
                        </div>
                        <div className="font-semibold" data-testid="partner-clicks">
                          {partner.stats?.totalClicks?.toLocaleString() || 0}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Конверсии</span>
                        </div>
                        <div className="font-semibold" data-testid="partner-conversions">
                          {partner.stats?.totalConversions?.toLocaleString() || 0}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Доход</span>
                        </div>
                        <div className="font-semibold" data-testid="partner-revenue">
                          ${partner.stats?.totalRevenue?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">CR</span>
                        </div>
                        <div className="font-semibold" data-testid="partner-cr">
                          {partner.stats?.avgCR?.toFixed(2) || '0.00'}%
                        </div>
                      </div>
                    </div>

                    {/* Дополнительная информация */}
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      <div>Офферов назначено: {partner.assignedOffers}</div>
                      <div>Последняя активность: {new Date(partner.lastActivity).toLocaleDateString()}</div>
                      <div>Дата регистрации: {new Date(partner.registrationDate).toLocaleDateString()}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          {applicationsLoading ? (
            <div className="text-center py-8">Загрузка заявок...</div>
          ) : applications?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Новых заявок нет</h3>
                  <p className="text-muted-foreground">
                    Заявки на подключение партнёров будут отображаться здесь
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application: PartnerApplication) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {application.firstName} {application.lastName}
                        </CardTitle>
                        <CardDescription>
                          @{application.username} • {application.email}
                        </CardDescription>
                        {application.company && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {application.company}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline">
                        {new Date(application.applicationDate).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {application.message && (
                      <div>
                        <div className="text-sm font-medium mb-1">Сообщение</div>
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded p-3">
                          {application.message}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Источники трафика</div>
                        <div className="text-muted-foreground">
                          {application.trafficSources?.join(', ') || 'Не указано'}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Опыт работы</div>
                        <div className="text-muted-foreground">
                          {application.experience || 'Не указано'}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button 
                        onClick={() => handleApplicationMutation.mutate({ 
                          applicationId: application.id, 
                          action: 'approve' 
                        })}
                        disabled={handleApplicationMutation.isPending}
                        data-testid="button-approve"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Одобрить
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleApplicationMutation.mutate({ 
                          applicationId: application.id, 
                          action: 'reject' 
                        })}
                        disabled={handleApplicationMutation.isPending}
                        data-testid="button-reject"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Отклонить
                      </Button>
                      <Button variant="outline" data-testid="button-message">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Написать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="registration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ссылка для регистрации партнёров</CardTitle>
              <CardDescription>
                Поделитесь этой ссылкой с потенциальными партнёрами
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {registrationLink ? (
                <div className="flex space-x-2">
                  <Input
                    value={registrationLink.url}
                    readOnly
                    className="font-mono text-sm"
                    data-testid="input-registration-link"
                  />
                  <Button 
                    onClick={copyRegistrationLink}
                    data-testid="button-copy-registration-link"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Скопировать
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Генерация ссылки...</h3>
                  <p className="text-muted-foreground">
                    Создаём персональную ссылку для регистрации партнёров
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки работы с партнёрами</CardTitle>
              <CardDescription>
                Параметры модерации и управления партнёрами
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Настройки в разработке</h3>
                <p className="text-muted-foreground">
                  Здесь будут настройки автоодобрения, условий сотрудничества и уведомлений
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}