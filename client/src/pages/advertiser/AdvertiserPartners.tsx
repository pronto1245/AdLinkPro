import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/auth-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Copy,
  BarChart3,
  Globe,
  Users,
  Settings,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Link as LinkIcon,
  Share2,
  Shield,
  Zap,
  UserPlus,
  UserCheck,
  UserX,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Building,
  Award,
  Activity,
  AlertCircle,
  Target
} from 'lucide-react';

// Типы данных для партнеров
interface Partner {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  country: string;
  language: string;
  timezone: string;
  status: 'active' | 'pending' | 'suspended' | 'blocked';
  kycStatus: 'pending' | 'approved' | 'rejected';
  balance: number;
  holdAmount: number;
  rating: number;
  trafficSources: string[];
  verticals: string[];
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  registrationDate: string;
  lastActivity: string;
  statistics: {
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    averageCR: number;
    averageEPC: number;
    activeOffers: number;
    completedOffers: number;
  };
  permissions: {
    api: boolean;
    statistics: boolean;
    offers: boolean;
    finances: boolean;
  };
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  notes: string;
  tags: string[];
  referralCode: string;
  commissionRate: number;
  paymentMethod: string;
  paymentDetails: any;
  documentsVerified: boolean;
  lastPayment?: {
    amount: number;
    date: string;
    status: string;
  };
}

// Компонент для создания/редактирования партнера
const PartnerForm: React.FC<{
  partner?: Partner;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ partner, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    username: partner?.username || '',
    email: partner?.email || '',
    firstName: partner?.firstName || '',
    lastName: partner?.lastName || '',
    company: partner?.company || '',
    phone: partner?.phone || '',
    country: partner?.country || 'US',
    language: partner?.language || 'en',
    timezone: partner?.timezone || 'UTC',
    trafficSources: partner?.trafficSources || [],
    verticals: partner?.verticals || [],
    tier: partner?.tier || 'bronze',
    commissionRate: partner?.commissionRate || 0,
    permissions: partner?.permissions || {
      api: false,
      statistics: true,
      offers: true,
      finances: false
    },
    notes: partner?.notes || '',
    tags: partner?.tags || []
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const url = partner ? `/api/advertiser/partners/${partner.id}` : '/api/advertiser/partners';
      const method = partner ? 'PUT' : 'POST';
      return apiRequest(url, { method, body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/partners'] });
      toast({
        title: partner ? 'Партнер обновлен' : 'Партнер создан',
        description: partner ? 'Данные партнера успешно обновлены' : 'Новый партнер добавлен в систему'
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить данные партнера',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Основное</TabsTrigger>
            <TabsTrigger value="business">Бизнес</TabsTrigger>
            <TabsTrigger value="permissions">Права</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Имя пользователя *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="partner123"
                    required
                    disabled={!!partner}
                    data-testid="input-partner-username"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="partner@example.com"
                    required
                    data-testid="input-partner-email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Имя *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Иван"
                    required
                    data-testid="input-partner-first-name"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Иванов"
                    required
                    data-testid="input-partner-last-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Компания</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="ООО Рога и Копыта"
                    data-testid="input-partner-company"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                    data-testid="input-partner-phone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="country">Страна</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                    <SelectTrigger data-testid="select-partner-country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">США</SelectItem>
                      <SelectItem value="RU">Россия</SelectItem>
                      <SelectItem value="UA">Украина</SelectItem>
                      <SelectItem value="BY">Беларусь</SelectItem>
                      <SelectItem value="KZ">Казахстан</SelectItem>
                      <SelectItem value="DE">Германия</SelectItem>
                      <SelectItem value="GB">Великобритания</SelectItem>
                      <SelectItem value="CA">Канада</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Язык</Label>
                  <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                    <SelectTrigger data-testid="select-partner-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Часовой пояс</Label>
                  <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                    <SelectTrigger data-testid="select-partner-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">EST</SelectItem>
                      <SelectItem value="Europe/London">GMT</SelectItem>
                      <SelectItem value="Europe/Moscow">MSK</SelectItem>
                      <SelectItem value="Asia/Shanghai">CST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label>Источники трафика</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {['SEO', 'PPC', 'Social Media', 'Email', 'Display', 'Native', 'Push', 'Pop', 'SMS', 'Influencer', 'Affiliate', 'Direct'].map(source => (
                    <label key={source} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.trafficSources.includes(source)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, trafficSources: [...formData.trafficSources, source] });
                          } else {
                            setFormData({ ...formData, trafficSources: formData.trafficSources.filter(s => s !== source) });
                          }
                        }}
                        data-testid={`checkbox-traffic-${source.toLowerCase().replace(' ', '-')}`}
                      />
                      <span className="text-sm">{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Вертикали</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {['Gambling', 'Dating', 'Finance', 'Crypto', 'E-commerce', 'Mobile Apps', 'Games', 'Health', 'Education', 'Travel', 'Sports', 'Tech'].map(vertical => (
                    <label key={vertical} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.verticals.includes(vertical)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, verticals: [...formData.verticals, vertical] });
                          } else {
                            setFormData({ ...formData, verticals: formData.verticals.filter(v => v !== vertical) });
                          }
                        }}
                        data-testid={`checkbox-vertical-${vertical.toLowerCase().replace(' ', '-')}`}
                      />
                      <span className="text-sm">{vertical}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tier">Уровень партнера</Label>
                  <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value as any })}>
                    <SelectTrigger data-testid="select-partner-tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">🥉 Bronze</SelectItem>
                      <SelectItem value="silver">🥈 Silver</SelectItem>
                      <SelectItem value="gold">🥇 Gold</SelectItem>
                      <SelectItem value="platinum">💎 Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="commissionRate">Комиссия (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
                    placeholder="0.0"
                    data-testid="input-commission-rate"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Заметки</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Дополнительная информация о партнере"
                  rows={3}
                  data-testid="textarea-partner-notes"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="permApi">API доступ</Label>
                  <p className="text-sm text-gray-500">Разрешить использование API</p>
                </div>
                <Switch
                  id="permApi"
                  checked={formData.permissions.api}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, api: checked }
                  })}
                  data-testid="switch-permission-api"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="permStats">Статистика</Label>
                  <p className="text-sm text-gray-500">Доступ к подробной статистике</p>
                </div>
                <Switch
                  id="permStats"
                  checked={formData.permissions.statistics}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, statistics: checked }
                  })}
                  data-testid="switch-permission-stats"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="permOffers">Офферы</Label>
                  <p className="text-sm text-gray-500">Просмотр и подача заявок на офферы</p>
                </div>
                <Switch
                  id="permOffers"
                  checked={formData.permissions.offers}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, offers: checked }
                  })}
                  data-testid="switch-permission-offers"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="permFinances">Финансы</Label>
                  <p className="text-sm text-gray-500">Доступ к финансовой информации</p>
                </div>
                <Switch
                  id="permFinances"
                  checked={formData.permissions.finances}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, finances: checked }
                  })}
                  data-testid="switch-permission-finances"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="tags">Теги (через запятую)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                  })}
                  placeholder="VIP, высокий объем, проверенный"
                  data-testid="input-partner-tags"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            data-testid="button-cancel"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
            data-testid="button-save-partner"
          >
            {mutation.isPending ? 'Сохранение...' : (partner ? 'Сохранить' : 'Создать')}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Основной компонент управления партнерами
export default function AdvertiserPartners() {
  const { user } = useAuth();
  const { collapsed } = useSidebar();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Состояние фильтров и поиска
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    tier: 'all',
    kycStatus: 'all',
    country: 'all'
  });
  const [sortBy, setSortBy] = useState('registrationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Загрузка данных партнеров
  const { data: partners, isLoading, refetch } = useQuery({
    queryKey: ['/api/advertiser/partners', searchTerm, filters, sortBy, sortOrder],
    enabled: !!user
  }) as { data: Partner[] | undefined; isLoading: boolean; refetch: () => void };

  // Мутации для действий с партнерами
  const statusMutation = useMutation({
    mutationFn: ({ partnerId, status }: { partnerId: string; status: string }) => apiRequest(`/api/advertiser/partners/${partnerId}/status`, {
      method: 'PATCH',
      body: { status }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/partners'] });
      toast({ title: 'Статус изменен', description: 'Статус партнера успешно обновлен' });
    }
  });

  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; message?: string }) => apiRequest('/api/advertiser/partners/invite', {
      method: 'POST',
      body: data
    }),
    onSuccess: () => {
      toast({ title: 'Приглашение отправлено', description: 'Приглашение успешно отправлено на email' });
      setShowInviteDialog(false);
    }
  });

  const bulkMutation = useMutation({
    mutationFn: ({ action, partnerIds }: { action: string; partnerIds: string[] }) => apiRequest('/api/advertiser/partners/bulk', {
      method: 'POST',
      body: { action, partnerIds }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/partners'] });
      setSelectedPartners([]);
      toast({ title: 'Операция выполнена', description: 'Массовая операция успешно выполнена' });
    }
  });

  // Функции для действий
  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setShowForm(true);
  };

  const handleStatusChange = (partnerId: string, status: string) => {
    statusMutation.mutate({ partnerId, status });
  };

  const handleBulkAction = (action: string) => {
    if (selectedPartners.length === 0) {return;}
    bulkMutation.mutate({ action, partnerIds: selectedPartners });
  };

  const copyReferralLink = (partner: Partner) => {
    const url = `${window.location.origin}/register?ref=${partner.referralCode}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Скопировано', description: 'Реферальная ссылка скопирована в буфер обмена' });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Активен', variant: 'default' as const, color: 'bg-green-500' },
      pending: { label: 'На модерации', variant: 'outline' as const, color: 'bg-yellow-500' },
      suspended: { label: 'Приостановлен', variant: 'secondary' as const, color: 'bg-orange-500' },
      blocked: { label: 'Заблокирован', variant: 'destructive' as const, color: 'bg-red-500' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const getKycBadge = (kycStatus: string) => {
    const statusConfig = {
      pending: { label: 'На проверке', variant: 'outline' as const, icon: Clock },
      approved: { label: 'Верифицирован', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Отклонен', variant: 'destructive' as const, icon: XCircle }
    };
    
    const config = statusConfig[kycStatus as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTierIcon = (tier: string) => {
    const tierConfig = {
      bronze: '🥉',
      silver: '🥈', 
      gold: '🥇',
      platinum: '💎'
    };
    return tierConfig[tier as keyof typeof tierConfig] || '🥉';
  };

  const filteredPartners = partners?.filter(partner => {
    if (searchTerm && !(
      partner.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${partner.firstName} ${partner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )) {return false;}
    if (filters.status !== 'all' && partner.status !== filters.status) {return false;}
    if (filters.tier !== 'all' && partner.tier !== filters.tier) {return false;}
    if (filters.kycStatus !== 'all' && partner.kycStatus !== filters.kycStatus) {return false;}
    if (filters.country !== 'all' && partner.country !== filters.country) {return false;}
    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Управление партнерами</h1>
          <p className="text-gray-600">Управляйте вашими партнерами и их правами доступа</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowInviteDialog(true)}
            data-testid="button-invite-partner"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Пригласить
          </Button>
          <Button
            onClick={() => {
              setEditingPartner(null);
              setShowForm(true);
            }}
            data-testid="button-create-partner"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить партнера
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего партнеров</p>
                <p className="text-2xl font-bold text-blue-600">{partners?.length || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные</p>
                <p className="text-2xl font-bold text-green-600">
                  {partners?.filter(p => p.status === 'active').length || 0}
                </p>
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
                <p className="text-2xl font-bold text-purple-600">
                  $0
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Средний рейтинг</p>
                <p className="text-2xl font-bold text-orange-600">
                  {partners && partners.length > 0 ? (partners.reduce((acc, p) => acc + (p.rating || 0), 0) / partners.length).toFixed(1) : '0.0'}
                </p>
              </div>
              <Star className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск по имени, email или логину..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-partners"
                />
              </div>
            </div>

            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="w-40" data-testid="select-filter-status">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="pending">На модерации</SelectItem>
                <SelectItem value="suspended">Приостановленные</SelectItem>
                <SelectItem value="blocked">Заблокированные</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.tier} onValueChange={(value) => setFilters({ ...filters, tier: value })}>
              <SelectTrigger className="w-40" data-testid="select-filter-tier">
                <SelectValue placeholder="Уровень" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все уровни</SelectItem>
                <SelectItem value="bronze">🥉 Bronze</SelectItem>
                <SelectItem value="silver">🥈 Silver</SelectItem>
                <SelectItem value="gold">🥇 Gold</SelectItem>
                <SelectItem value="platinum">💎 Platinum</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.kycStatus} onValueChange={(value) => setFilters({ ...filters, kycStatus: value })}>
              <SelectTrigger className="w-40" data-testid="select-filter-kyc">
                <SelectValue placeholder="KYC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все KYC</SelectItem>
                <SelectItem value="pending">На проверке</SelectItem>
                <SelectItem value="approved">Верифицированы</SelectItem>
                <SelectItem value="rejected">Отклонены</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Массовые действия */}
          {selectedPartners.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-600">
                Выбрано: {selectedPartners.length} партнеров
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('activate')}
                  data-testid="button-bulk-activate"
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Активировать
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('suspend')}
                  data-testid="button-bulk-suspend"
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Приостановить
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('block')}
                  data-testid="button-bulk-block"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Заблокировать
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Таблица партнеров */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedPartners.length === filteredPartners.length && filteredPartners.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPartners(filteredPartners.map(p => p.id));
                      } else {
                        setSelectedPartners([]);
                      }
                    }}
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
                <TableHead>Партнер</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Уровень</TableHead>
                <TableHead>Статистика</TableHead>
                <TableHead>Баланс</TableHead>
                <TableHead>Регистрация</TableHead>
                <TableHead className="w-32">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((partner) => (
                <TableRow key={partner.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedPartners.includes(partner.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPartners([...selectedPartners, partner.id]);
                        } else {
                          setSelectedPartners(selectedPartners.filter(id => id !== partner.id));
                        }
                      }}
                      data-testid={`checkbox-partner-${partner.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {partner.firstName.charAt(0)}{partner.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{partner.firstName} {partner.lastName}</p>
                        <p className="text-sm text-gray-500">@{partner.username}</p>
                        <p className="text-sm text-gray-500">{partner.email}</p>
                        {partner.company && (
                          <p className="text-xs text-gray-400">{partner.company}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(partner.status)}
                      {getKycBadge(partner.kycStatus)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTierIcon(partner.tier)}</span>
                      <div>
                        <p className="font-medium capitalize">{partner.tier}</p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-600">{partner.rating}/5</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Клики:</span>
                        <span className="font-medium">{partner.statistics?.totalClicks?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">CR:</span>
                        <span className="font-medium text-purple-600">{partner.statistics?.averageCR || '0'}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">EPC:</span>
                        <span className="font-medium text-blue-600">${partner.statistics?.averageEPC || '0'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Баланс:</span>
                        <span className="font-medium text-green-600">${(partner.balance || 0).toFixed(2)}</span>
                      </div>
                      {(partner.holdAmount || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Удержано:</span>
                          <span className="font-medium text-orange-600">${(partner.holdAmount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Доход:</span>
                        <span className="font-medium">${partner.statistics?.totalRevenue?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(partner.registrationDate).toLocaleDateString('ru-RU')}</p>
                      <p className="text-gray-500">{partner.country}</p>
                      <p className="text-xs text-gray-400">
                        Активность: {new Date(partner.lastActivity).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(partner)}
                        title="Редактировать партнера"
                        data-testid={`button-edit-${partner.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyReferralLink(partner)}
                        title="Скопировать реферальную ссылку"
                        data-testid={`button-copy-ref-${partner.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/partner/${partner.id}/stats`, '_blank')}
                        title="Статистика партнера"
                        data-testid={`button-stats-${partner.id}`}
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`mailto:${partner.email}`, '_blank')}
                        title="Написать письмо"
                        data-testid={`button-email-${partner.id}`}
                      >
                        <Mail className="w-4 h-4" />
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
              <p className="text-gray-500 mb-4">
                {searchTerm || Object.values(filters).some(f => f !== 'all')
                  ? 'По вашему запросу ничего не найдено'
                  : 'Пригласите ваших первых партнеров'
                }
              </p>
              <Button
                onClick={() => setShowInviteDialog(true)}
                data-testid="button-invite-first-partner"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Пригласить партнера
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно для создания/редактирования */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPartner ? 'Редактирование партнера' : 'Добавление нового партнера'}
            </DialogTitle>
          </DialogHeader>
          <PartnerForm
            partner={editingPartner || undefined}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Модальное окно для приглашения */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Пригласить партнера</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              inviteMutation.mutate({
                email: formData.get('email') as string,
                message: formData.get('message') as string
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="inviteEmail">Email партнера *</Label>
              <Input
                id="inviteEmail"
                name="email"
                type="email"
                placeholder="partner@example.com"
                required
                data-testid="input-invite-email"
              />
            </div>
            <div>
              <Label htmlFor="inviteMessage">Сообщение (необязательно)</Label>
              <Textarea
                id="inviteMessage"
                name="message"
                placeholder="Персональное сообщение для партнера"
                rows={3}
                data-testid="textarea-invite-message"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
                data-testid="button-cancel-invite"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={inviteMutation.isPending}
                data-testid="button-send-invite"
              >
                {inviteMutation.isPending ? 'Отправка...' : 'Отправить приглашение'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}