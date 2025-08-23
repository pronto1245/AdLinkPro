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
  PlayCircle,
  PauseCircle,
  Archive,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Link as LinkIcon,
  Share2,
  Shield,
  Zap
} from 'lucide-react';

// Типы данных для офферов
interface Offer {
  id: string;
  name: string;
  description: string;
  url: string;
  previewUrl?: string;
  category: string;
  vertical: string;
  status: 'active' | 'paused' | 'pending' | 'archived' | 'rejected';
  payoutType: 'cpa' | 'cpl' | 'cpc' | 'cpm' | 'revshare';
  payoutAmount: number;
  currency: string;
  countries: string[];
  restrictions: string;
  caps: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    total?: number;
  };
  schedule: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    timezone: string;
  };
  tracking: {
    clickUrl: string;
    impressionUrl?: string;
    conversionUrl: string;
    postbackUrl?: string;
  };
  creatives: {
    banners: string[];
    videos: string[];
    texts: string[];
    emails: string[];
  };
  requirements: {
    traffic: string[];
    quality: number;
    approval: 'auto' | 'manual' | 'whitelist';
  };
  antifraud: {
    enabled: boolean;
    methods: string[];
    strictness: 'low' | 'medium' | 'high';
  };
  statistics: {
    clicks: number;
    conversions: number;
    cr: number;
    epc: number;
    revenue: number;
    activePartners: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isPrivate: boolean;
  priority: number;
  tags: string[];
}

// Компонент для создания/редактирования оффера
const OfferForm: React.FC<{
  offer?: Offer;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ offer, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: offer?.name || '',
    description: offer?.description || '',
    url: offer?.url || '',
    previewUrl: offer?.previewUrl || '',
    category: offer?.category || '',
    vertical: offer?.vertical || '',
    payoutType: offer?.payoutType || 'cpa',
    payoutAmount: offer?.payoutAmount || 0,
    currency: offer?.currency || 'USD',
    countries: offer?.countries || [],
    restrictions: offer?.restrictions || '',
    caps: offer?.caps || {},
    schedule: offer?.schedule || { enabled: false, timezone: 'UTC' },
    tracking: offer?.tracking || { clickUrl: '', conversionUrl: '', postbackUrl: '' },
    requirements: offer?.requirements || { traffic: [], quality: 80, approval: 'manual' },
    antifraud: offer?.antifraud || { enabled: true, methods: [], strictness: 'medium' },
    isPrivate: offer?.isPrivate || false,
    priority: offer?.priority || 1,
    tags: offer?.tags || []
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const url = offer ? `/api/advertiser/offers/${offer.id}` : '/api/advertiser/offers';
      const method = offer ? 'PUT' : 'POST';
      return apiRequest(url, { method, body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      toast({
        title: offer ? 'Оффер обновлен' : 'Оффер создан',
        description: offer ? 'Изменения успешно сохранены' : 'Новый оффер добавлен в систему'
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить оффер',
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Основное</TabsTrigger>
            <TabsTrigger value="payout">Выплаты</TabsTrigger>
            <TabsTrigger value="targeting">Таргетинг</TabsTrigger>
            <TabsTrigger value="tracking">Трекинг</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Название оффера *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Введите название оффера"
                  required
                  data-testid="input-offer-name"
                />
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Подробное описание оффера"
                  rows={3}
                  data-testid="textarea-offer-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Категория *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger data-testid="select-offer-category">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gambling">Гемблинг</SelectItem>
                      <SelectItem value="dating">Знакомства</SelectItem>
                      <SelectItem value="finance">Финансы</SelectItem>
                      <SelectItem value="crypto">Криптовалюты</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="mobile">Мобильные приложения</SelectItem>
                      <SelectItem value="games">Игры</SelectItem>
                      <SelectItem value="health">Здоровье</SelectItem>
                      <SelectItem value="education">Образование</SelectItem>
                      <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vertical">Вертикаль</Label>
                  <Input
                    id="vertical"
                    value={formData.vertical}
                    onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                    placeholder="Например: Casino, Forex"
                    data-testid="input-offer-vertical"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="url">URL лендинга *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/landing"
                  required
                  data-testid="input-offer-url"
                />
              </div>

              <div>
                <Label htmlFor="previewUrl">URL превью</Label>
                <Input
                  id="previewUrl"
                  type="url"
                  value={formData.previewUrl}
                  onChange={(e) => setFormData({ ...formData, previewUrl: e.target.value })}
                  placeholder="https://example.com/preview"
                  data-testid="input-offer-preview-url"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payout" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="payoutType">Тип выплаты *</Label>
                  <Select value={formData.payoutType} onValueChange={(value) => setFormData({ ...formData, payoutType: value as any })}>
                    <SelectTrigger data-testid="select-payout-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpa">CPA (за действие)</SelectItem>
                      <SelectItem value="cpl">CPL (за лид)</SelectItem>
                      <SelectItem value="cpc">CPC (за клик)</SelectItem>
                      <SelectItem value="cpm">CPM (за 1000 показов)</SelectItem>
                      <SelectItem value="revshare">RevShare (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="payoutAmount">Размер выплаты *</Label>
                  <Input
                    id="payoutAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.payoutAmount}
                    onChange={(e) => setFormData({ ...formData, payoutAmount: parseFloat(e.target.value) })}
                    required
                    data-testid="input-payout-amount"
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Валюта</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="RUB">RUB</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Капы (лимиты)</Label>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  <div>
                    <Label htmlFor="dailyCap">Дневной</Label>
                    <Input
                      id="dailyCap"
                      type="number"
                      min="0"
                      value={formData.caps.daily || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        caps: { ...formData.caps, daily: e.target.value ? parseInt(e.target.value) : undefined }
                      })}
                      placeholder="0"
                      data-testid="input-daily-cap"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weeklyCap">Недельный</Label>
                    <Input
                      id="weeklyCap"
                      type="number"
                      min="0"
                      value={formData.caps.weekly || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        caps: { ...formData.caps, weekly: e.target.value ? parseInt(e.target.value) : undefined }
                      })}
                      placeholder="0"
                      data-testid="input-weekly-cap"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyCap">Месячный</Label>
                    <Input
                      id="monthlyCap"
                      type="number"
                      min="0"
                      value={formData.caps.monthly || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        caps: { ...formData.caps, monthly: e.target.value ? parseInt(e.target.value) : undefined }
                      })}
                      placeholder="0"
                      data-testid="input-monthly-cap"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalCap">Общий</Label>
                    <Input
                      id="totalCap"
                      type="number"
                      min="0"
                      value={formData.caps.total || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        caps: { ...formData.caps, total: e.target.value ? parseInt(e.target.value) : undefined }
                      })}
                      placeholder="0"
                      data-testid="input-total-cap"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="targeting" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label>Страны (выберите одну или несколько)</Label>
                <div className="grid grid-cols-4 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
                  {['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'RU', 'UA', 'BY', 'KZ', 'BR', 'IN', 'CN', 'JP'].map(country => (
                    <label key={country} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.countries.includes(country)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, countries: [...formData.countries, country] });
                          } else {
                            setFormData({ ...formData, countries: formData.countries.filter(c => c !== country) });
                          }
                        }}
                        data-testid={`checkbox-country-${country}`}
                      />
                      <span className="text-sm">{country}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="restrictions">Ограничения и требования</Label>
                <Textarea
                  id="restrictions"
                  value={formData.restrictions}
                  onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                  placeholder="Описание ограничений, требований к трафику и партнерам"
                  rows={4}
                  data-testid="textarea-restrictions"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="approval">Тип одобрения</Label>
                  <Select value={formData.requirements.approval} onValueChange={(value) => setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, approval: value as any }
                  })}>
                    <SelectTrigger data-testid="select-approval-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Автоматическое</SelectItem>
                      <SelectItem value="manual">Ручное</SelectItem>
                      <SelectItem value="whitelist">Только белый список</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quality">Минимальное качество (%)</Label>
                  <Input
                    id="quality"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.requirements.quality}
                    onChange={(e) => setFormData({
                      ...formData,
                      requirements: { ...formData.requirements, quality: parseInt(e.target.value) }
                    })}
                    data-testid="input-quality-requirement"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="clickUrl">URL для кликов *</Label>
                <Input
                  id="clickUrl"
                  type="url"
                  value={formData.tracking?.clickUrl || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    tracking: { ...formData.tracking, clickUrl: e.target.value }
                  })}
                  placeholder="https://track.example.com/click?id={clickid}"
                  required
                  data-testid="input-click-url"
                />
              </div>

              <div>
                <Label htmlFor="conversionUrl">URL для конверсий *</Label>
                <Input
                  id="conversionUrl"
                  type="url"
                  value={formData.tracking?.conversionUrl || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    tracking: { ...formData.tracking, conversionUrl: e.target.value }
                  })}
                  placeholder="https://track.example.com/conversion?id={clickid}"
                  required
                  data-testid="input-conversion-url"
                />
              </div>

              <div>
                <Label htmlFor="postbackUrl">Postback URL</Label>
                <Input
                  id="postbackUrl"
                  type="url"
                  value={formData.tracking?.postbackUrl || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    tracking: { ...formData.tracking, postbackUrl: e.target.value }
                  })}
                  placeholder="https://partner.example.com/postback?id={clickid}&sum={sum}"
                  data-testid="input-postback-url"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
                  data-testid="switch-private-offer"
                />
                <Label htmlFor="isPrivate">Приватный оффер</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="antifraudEnabled"
                  checked={formData.antifraud.enabled}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    antifraud: { ...formData.antifraud, enabled: checked }
                  })}
                  data-testid="switch-antifraud-enabled"
                />
                <Label htmlFor="antifraudEnabled">Включить антифрод</Label>
              </div>

              <div>
                <Label htmlFor="priority">Приоритет (1-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  data-testid="input-priority"
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
            data-testid="button-save-offer"
          >
            {mutation.isPending ? 'Сохранение...' : (offer ? 'Сохранить' : 'Создать')}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Основной компонент управления офферами
export default function OfferManagement() {
  const { user } = useAuth();
  const { collapsed } = useSidebar();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Состояние фильтров и поиска
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    payoutType: 'all',
    country: 'all'
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Загрузка данных офферов
  const { data: offers, isLoading, refetch } = useQuery({
    queryKey: ['/api/advertiser/offers', searchTerm, filters, sortBy, sortOrder],
    enabled: !!user
  }) as { data: Offer[] | undefined; isLoading: boolean; refetch: () => void };

  // Мутации для действий с офферами
  const deleteMutation = useMutation({
    mutationFn: (offerId: string) => apiRequest(`/api/advertiser/offers/${offerId}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      toast({ title: 'Оффер удален', description: 'Оффер успешно удален из системы' });
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ offerId, status }: { offerId: string; status: string }) => apiRequest(`/api/advertiser/offers/${offerId}/status`, {
      method: 'PATCH',
      body: { status }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      toast({ title: 'Статус изменен', description: 'Статус оффера успешно обновлен' });
    }
  });

  const bulkMutation = useMutation({
    mutationFn: ({ action, offerIds }: { action: string; offerIds: string[] }) => apiRequest('/api/advertiser/offers/bulk', {
      method: 'POST',
      body: { action, offerIds }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      setSelectedOffers([]);
      toast({ title: 'Операция выполнена', description: 'Массовая операция успешно выполнена' });
    }
  });

  // Функции для действий
  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setShowForm(true);
  };

  const handleDelete = async (offerId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот оффер?')) {
      deleteMutation.mutate(offerId);
    }
  };

  const handleStatusChange = (offerId: string, status: string) => {
    statusMutation.mutate({ offerId, status });
  };

  const handleBulkAction = (action: string) => {
    if (selectedOffers.length === 0) {return;}
    bulkMutation.mutate({ action, offerIds: selectedOffers });
  };

  const copyTrackingUrl = (offer: Offer) => {
    const url = `${offer.tracking.clickUrl}?subid={subid}&clickid={clickid}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Скопировано', description: 'Трекинговая ссылка скопирована в буфер обмена' });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Активен', variant: 'default' as const, color: 'bg-green-500' },
      paused: { label: 'Приостановлен', variant: 'secondary' as const, color: 'bg-yellow-500' },
      pending: { label: 'На модерации', variant: 'outline' as const, color: 'bg-blue-500' },
      archived: { label: 'Архивирован', variant: 'secondary' as const, color: 'bg-gray-500' },
      rejected: { label: 'Отклонен', variant: 'destructive' as const, color: 'bg-red-500' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const filteredOffers = offers?.filter(offer => {
    if (searchTerm && !offer.name.toLowerCase().includes(searchTerm.toLowerCase())) {return false;}
    if (filters.status !== 'all' && offer.status !== filters.status) {return false;}
    if (filters.category !== 'all' && offer.category !== filters.category) {return false;}
    if (filters.payoutType !== 'all' && offer.payoutType !== filters.payoutType) {return false;}
    if (filters.country !== 'all' && !offer.countries.includes(filters.country)) {return false;}
    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Управление офферами</h1>
          <p className="text-gray-600">Создавайте и управляйте вашими офферами</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            data-testid="button-refresh"
          >
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
          <Button
            onClick={() => {
              setEditingOffer(null);
              setShowForm(true);
            }}
            data-testid="button-create-offer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать оффер
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего офферов</p>
                <p className="text-2xl font-bold text-blue-600">{offers?.length || 0}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные</p>
                <p className="text-2xl font-bold text-green-600">
                  {offers?.filter(o => o.status === 'active').length || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Общая конверсия</p>
                <p className="text-2xl font-bold text-purple-600">
                  {offers ? (offers.reduce((acc, o) => acc + o.statistics.cr, 0) / offers.length).toFixed(1) : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Общий доход</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${offers ? offers.reduce((acc, o) => acc + o.statistics.revenue, 0).toLocaleString() : 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры и поиск */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск по названию оффера..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-offers"
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
                <SelectItem value="paused">Приостановленные</SelectItem>
                <SelectItem value="pending">На модерации</SelectItem>
                <SelectItem value="archived">Архивированные</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger className="w-40" data-testid="select-filter-category">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                <SelectItem value="gambling">Гемблинг</SelectItem>
                <SelectItem value="dating">Знакомства</SelectItem>
                <SelectItem value="finance">Финансы</SelectItem>
                <SelectItem value="crypto">Криптовалюты</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.payoutType} onValueChange={(value) => setFilters({ ...filters, payoutType: value })}>
              <SelectTrigger className="w-40" data-testid="select-filter-payout">
                <SelectValue placeholder="Тип выплаты" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="cpa">CPA</SelectItem>
                <SelectItem value="cpl">CPL</SelectItem>
                <SelectItem value="cpc">CPC</SelectItem>
                <SelectItem value="revshare">RevShare</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Массовые действия */}
          {selectedOffers.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-600">
                Выбрано: {selectedOffers.length} офферов
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('activate')}
                  data-testid="button-bulk-activate"
                >
                  <PlayCircle className="w-4 h-4 mr-1" />
                  Активировать
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('pause')}
                  data-testid="button-bulk-pause"
                >
                  <PauseCircle className="w-4 h-4 mr-1" />
                  Приостановить
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('archive')}
                  data-testid="button-bulk-archive"
                >
                  <Archive className="w-4 h-4 mr-1" />
                  Архивировать
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Таблица офферов */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedOffers.length === filteredOffers.length && filteredOffers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOffers(filteredOffers.map(o => o.id));
                      } else {
                        setSelectedOffers([]);
                      }
                    }}
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
                <TableHead>Оффер</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Выплата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Статистика</TableHead>
                <TableHead>Партнеры</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead className="w-32">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOffers.map((offer) => (
                <TableRow key={offer.id} className="hover:bg-gray-50">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedOffers.includes(offer.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOffers([...selectedOffers, offer.id]);
                        } else {
                          setSelectedOffers(selectedOffers.filter(id => id !== offer.id));
                        }
                      }}
                      data-testid={`checkbox-offer-${offer.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{offer.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{offer.description}</p>
                        {offer.isPrivate && (
                          <Badge variant="outline" className="text-xs mt-1">
                            <Shield className="w-3 h-3 mr-1" />
                            Приватный
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{offer.category}</Badge>
                    {offer.vertical && (
                      <p className="text-xs text-gray-500 mt-1">{offer.vertical}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium text-green-600">
                        {offer.payoutAmount} {offer.currency}
                      </p>
                      <p className="text-gray-500 uppercase">{offer.payoutType}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(offer.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Клики:</span>
                        <span className="font-medium">{offer.statistics.clicks.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">CR:</span>
                        <span className="font-medium text-purple-600">{offer.statistics.cr}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">EPC:</span>
                        <span className="font-medium text-blue-600">${offer.statistics.epc}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{offer.statistics.activePartners}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(offer.createdAt).toLocaleDateString('ru-RU')}</p>
                      <p className="text-gray-500">{new Date(offer.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(offer)}
                        title="Редактировать оффер"
                        data-testid={`button-edit-${offer.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyTrackingUrl(offer)}
                        title="Скопировать трекинговую ссылку"
                        data-testid={`button-copy-${offer.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(offer.previewUrl || offer.url, '_blank')}
                        title="Предпросмотр оффера"
                        data-testid={`button-preview-${offer.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(offer.id)}
                        title="Удалить оффер"
                        data-testid={`button-delete-${offer.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOffers.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет офферов</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || Object.values(filters).some(f => f !== 'all')
                  ? 'По вашему запросу ничего не найдено'
                  : 'Создайте ваш первый оффер'
                }
              </p>
              <Button
                onClick={() => {
                  setEditingOffer(null);
                  setShowForm(true);
                }}
                data-testid="button-create-first-offer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать оффер
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
              {editingOffer ? 'Редактирование оффера' : 'Создание нового оффера'}
            </DialogTitle>
          </DialogHeader>
          <OfferForm
            offer={editingOffer || undefined}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}