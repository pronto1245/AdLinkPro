import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Users, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  MousePointer,
  Target,
  Eye,
  Bot,
  Shield,
  Edit,
  UserX,
  Bell,
  ExternalLink,
  Star,
  Activity,
  Mail,
  MessageCircle,
  Globe
} from 'lucide-react';

// Интерфейсы для данных партнёров
interface Partner {
  id: string;
  partnerId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  telegram?: string;
  status: 'active' | 'inactive' | 'pending' | 'blocked';
  offersCount: number;
  clicks: number;
  uniqueClicks: number;
  leads: number;
  conversions: number;
  revenue: number;
  payout: number;
  profit: number;
  cr: number;
  epc: number;
  roi: number;
  fraudClicks: number;
  botClicks: number;
  fraudScore: number;
  lastActivity: string;
  registrationDate: string;
  country: string;
  timezone: string;
  isTopPerformer: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  payoutSettings: {
    [offerId: string]: {
      offerId: string;
      offerName: string;
      defaultPayout: number;
      customPayout: number;
      isActive: boolean;
    };
  };
}

interface PartnerFilters {
  search: string;
  status: string;
  offerId: string;
  minRevenue: string;
  minCr: string;
  minEpc: string;
  activityDays: string;
  riskLevel: string;
  topPerformersOnly: boolean;
}

// Компонент карточки партнёра
interface PartnerCardProps {
  partner: Partner;
  onEditPayout: (partnerId: string, offerId: string) => void;
  onToggleStatus: (partnerId: string, status: string) => void;
  onViewStatistics: (partnerId: string) => void;
  onNotifyPartner: (partnerId: string, message: string) => void;
  onRemoveFromOffer: (partnerId: string, offerId: string) => void;
}

const PartnerCard = ({ 
  partner, 
  onEditPayout, 
  onToggleStatus, 
  onViewStatistics, 
  onNotifyPartner, 
  onRemoveFromOffer 
}: PartnerCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [editingPayout, setEditingPayout] = useState<string | null>(null);
  const [newPayout, setNewPayout] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className={`relative ${partner.isTopPerformer ? 'ring-2 ring-yellow-400' : ''}`}>
      {partner.isTopPerformer && (
        <div className="absolute top-2 right-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{partner.username}</h3>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(partner.status)}>
                  {partner.status === 'active' && 'Активен'}
                  {partner.status === 'inactive' && 'Неактивен'}
                  {partner.status === 'pending' && 'На модерации'}
                  {partner.status === 'blocked' && 'Заблокирован'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {partner.partnerId}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              data-testid={`button-details-${partner.id}`}
              title="Подробнее о партнёре"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewStatistics(partner.id)}
              data-testid={`button-statistics-${partner.id}`}
              title="Статистика партнёра"
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Основные метрики */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold">{partner.offersCount}</div>
            <div className="text-xs text-muted-foreground">Офферы</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{partner.clicks.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Клики</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{partner.leads.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Лиды</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${partner.cr < 1 ? 'text-red-600' : 'text-green-600'}`}>
              {partner.cr.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">CR</div>
          </div>
        </div>

        {/* Финансовые метрики */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              ${partner.revenue.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Доход</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              ${partner.payout.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Выплата</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${partner.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${partner.profit.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Прибыль</div>
          </div>
        </div>

        {/* Алерты и предупреждения */}
        {(partner.cr < 1 || partner.fraudScore > 50 || partner.botClicks > 10) && (
          <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <div className="text-sm text-red-800">
              {partner.cr < 1 && 'Низкая конверсия • '}
              {partner.fraudScore > 50 && 'Высокий риск фрода • '}
              {partner.botClicks > 10 && 'Много ботов'}
            </div>
          </div>
        )}

        {/* Развёрнутая информация */}
        {showDetails && (
          <div className="space-y-4 pt-4 border-t">
            {/* Контактная информация */}
            <div>
              <h4 className="font-medium mb-2">Контактная информация</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{partner.email}</span>
                </div>
                {partner.telegram && (
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span>@{partner.telegram}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{partner.country}</span>
                </div>
              </div>
            </div>

            {/* Настройки выплат по офферам */}
            <div>
              <h4 className="font-medium mb-2">Настройки выплат по офферам</h4>
              <div className="space-y-2">
                {Object.values(partner.payoutSettings).map((setting) => (
                  <div key={setting.offerId} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="text-sm font-medium">{setting.offerName}</span>
                      <div className="text-xs text-muted-foreground">
                        Базовая выплата: ${setting.defaultPayout}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {editingPayout === setting.offerId ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={newPayout}
                            onChange={(e) => setNewPayout(e.target.value)}
                            className="w-20 h-8"
                            step="0.01"
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              onEditPayout(partner.id, setting.offerId);
                              setEditingPayout(null);
                              setNewPayout('');
                            }}
                            data-testid={`button-save-payout-${partner.id}-${setting.offerId}`}
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingPayout(null);
                              setNewPayout('');
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-green-600">
                            ${setting.customPayout || setting.defaultPayout}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPayout(setting.offerId);
                              setNewPayout((setting.customPayout || setting.defaultPayout).toString());
                            }}
                            data-testid={`button-edit-payout-${partner.id}-${setting.offerId}`}
                            title="Изменить выплату"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveFromOffer(partner.id, setting.offerId)}
                            data-testid={`button-remove-offer-${partner.id}-${setting.offerId}`}
                            title="Отключить от оффера"
                          >
                            <UserX className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Действия с партнёром */}
            <div className="flex items-center space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNotifyPartner(partner.id, 'quality_alert')}
                data-testid={`button-notify-${partner.id}`}
                title="Уведомить партнёра"
              >
                <Bell className="h-4 w-4 mr-1" />
                Уведомить
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewStatistics(partner.id)}
                data-testid={`button-full-stats-${partner.id}`}
                title="Полная статистика"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Статистика
              </Button>

              <Select onValueChange={(value) => onToggleStatus(partner.id, value)}>
                <SelectTrigger className="w-32 h-8" data-testid={`select-status-${partner.id}`}>
                  <SelectValue placeholder="Действие" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активировать</SelectItem>
                  <SelectItem value="inactive">Деактивировать</SelectItem>
                  <SelectItem value="blocked">Заблокировать</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Дополнительная статистика */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
              <div>
                <div className="flex justify-between">
                  <span>EPC:</span>
                  <span className="font-medium">${partner.epc.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ROI:</span>
                  <span className={`font-medium ${partner.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {partner.roi.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Уники:</span>
                  <span className="font-medium">{partner.uniqueClicks.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span>Фрод:</span>
                  <span className={`font-medium ${partner.fraudClicks > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {partner.fraudClicks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Боты:</span>
                  <span className={`font-medium ${partner.botClicks > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {partner.botClicks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Риск:</span>
                  <span className={`font-medium ${getRiskColor(partner.riskLevel)}`}>
                    {partner.riskLevel === 'low' && 'Низкий'}
                    {partner.riskLevel === 'medium' && 'Средний'}
                    {partner.riskLevel === 'high' && 'Высокий'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function AdvertiserPartners() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Состояния для фильтров
  const [filters, setFilters] = useState<PartnerFilters>({
    search: '',
    status: 'all',
    offerId: 'all',
    minRevenue: '',
    minCr: '',
    minEpc: '',
    activityDays: 'all',
    riskLevel: 'all',
    topPerformersOnly: false
  });

  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Получение данных партнёров
  const { data: partners = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/advertiser/partners', user?.id, filters],
    queryFn: async (): Promise<Partner[]> => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value.toString());
      });
      params.set('advertiserId', user?.id || '');
      
      const response = await fetch(`/api/advertiser/partners?${params}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные партнёров');
      }
      return response.json();
    },
    enabled: !!user?.id
  });

  // Получение списка офферов для фильтра
  const { data: offers = [] } = useQuery({
    queryKey: ['/api/advertiser/offers', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/advertiser/offers`);
      if (!response.ok) throw new Error('Ошибка загрузки офферов');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Мутации для действий с партнёрами
  const editPayoutMutation = useMutation({
    mutationFn: async ({ partnerId, offerId, newPayout }: { partnerId: string; offerId: string; newPayout: number }) => {
      const response = await fetch(`/api/advertiser/partner/${partnerId}/payout`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, payout: newPayout })
      });
      if (!response.ok) throw new Error('Failed to update payout');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/partners'] });
      toast({
        title: "Выплата обновлена",
        description: "Новая выплата для партнёра сохранена"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить выплату",
        variant: "destructive"
      });
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ partnerId, status }: { partnerId: string; status: string }) => {
      const response = await fetch(`/api/advertiser/partner/${partnerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/partners'] });
      toast({
        title: "Статус обновлён",
        description: "Статус партнёра изменён"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус",
        variant: "destructive"
      });
    }
  });

  const removeFromOfferMutation = useMutation({
    mutationFn: async ({ partnerId, offerId }: { partnerId: string; offerId: string }) => {
      const response = await fetch(`/api/advertiser/partner/${partnerId}/offers/${offerId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to remove partner from offer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/partners'] });
      toast({
        title: "Партнёр отключён",
        description: "Партнёр отключён от оффера"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отключить партнёра",
        variant: "destructive"
      });
    }
  });

  const notifyMutation = useMutation({
    mutationFn: async ({ partnerId, message }: { partnerId: string; message: string }) => {
      const response = await fetch(`/api/advertiser/partner/${partnerId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (!response.ok) throw new Error('Failed to send notification');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Уведомление отправлено",
        description: "Партнёр получит уведомление"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить уведомление",
        variant: "destructive"
      });
    }
  });

  // Фильтрация данных
  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      if (filters.search && !partner.username.toLowerCase().includes(filters.search.toLowerCase()) &&
          !partner.email.toLowerCase().includes(filters.search.toLowerCase()) &&
          !partner.partnerId.includes(filters.search)) {
        return false;
      }
      if (filters.status && filters.status !== 'all' && partner.status !== filters.status) return false;
      if (filters.minRevenue && partner.revenue < parseFloat(filters.minRevenue)) return false;
      if (filters.minCr && partner.cr < parseFloat(filters.minCr)) return false;
      if (filters.minEpc && partner.epc < parseFloat(filters.minEpc)) return false;
      if (filters.riskLevel && filters.riskLevel !== 'all' && partner.riskLevel !== filters.riskLevel) return false;
      if (filters.topPerformersOnly && !partner.isTopPerformer) return false;
      if (filters.activityDays && filters.activityDays !== 'all') {
        const daysSinceActivity = (Date.now() - new Date(partner.lastActivity).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceActivity > parseInt(filters.activityDays)) return false;
      }
      
      return true;
    });
  }, [partners, filters]);

  // Обработчики
  const handleEditPayout = (partnerId: string, offerId: string) => {
    // Логика будет реализована в компоненте карточки
    console.log('Edit payout for partner:', partnerId, 'offer:', offerId);
  };

  const handleToggleStatus = (partnerId: string, status: string) => {
    statusMutation.mutate({ partnerId, status });
  };

  const handleViewStatistics = (partnerId: string) => {
    // Открыть статистику в новом окне или перейти на страницу
    window.open(`/advertiser/partner-statistics?partnerId=${partnerId}`, '_blank');
  };

  const handleNotifyPartner = (partnerId: string, message: string) => {
    notifyMutation.mutate({ partnerId, message });
  };

  const handleRemoveFromOffer = (partnerId: string, offerId: string) => {
    removeFromOfferMutation.mutate({ partnerId, offerId });
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value.toString());
      });
      params.set('advertiserId', user?.id || '');
      params.set('format', format);
      
      const response = await fetch(`/api/advertiser/partners/export?${params}`);
      if (!response.ok) throw new Error('Ошибка экспорта');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `partners_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Экспорт выполнен",
        description: `Файл ${format.toUpperCase()} успешно скачан`
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось выполнить экспорт данных",
        variant: "destructive"
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      offerId: 'all',
      minRevenue: '',
      minCr: '',
      minEpc: '',
      activityDays: 'all',
      riskLevel: 'all',
      topPerformersOnly: false
    });
  };

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6" data-testid="partners-page">
        {/* Заголовок */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Партнёры</h1>
            <p className="text-muted-foreground">
              Управление партнёрами, настройка выплат и анализ эффективности
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
            
            <Select onValueChange={(format) => handleExport(format as 'csv' | 'xlsx')}>
              <SelectTrigger className="w-[140px]" data-testid="select-export">
                <SelectValue placeholder="Экспорт" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Панель фильтров */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Фильтры и поиск
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Сбросить
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Основная строка фильтров */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Поиск */}
              <div className="space-y-2">
                <Label>Поиск</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="По имени, email, ID..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>

              {/* Статус */}
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="active">Активные</SelectItem>
                    <SelectItem value="inactive">Неактивные</SelectItem>
                    <SelectItem value="pending">На модерации</SelectItem>
                    <SelectItem value="blocked">Заблокированные</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Оффер */}
              <div className="space-y-2">
                <Label>Оффер</Label>
                <Select value={filters.offerId} onValueChange={(value) => setFilters({...filters, offerId: value})}>
                  <SelectTrigger data-testid="select-offer">
                    <SelectValue placeholder="Все офферы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все офферы</SelectItem>
                    {offers.map((offer: any) => (
                      <SelectItem key={offer.id} value={offer.id}>
                        {offer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Уровень риска */}
              <div className="space-y-2">
                <Label>Уровень риска</Label>
                <Select value={filters.riskLevel} onValueChange={(value) => setFilters({...filters, riskLevel: value})}>
                  <SelectTrigger data-testid="select-risk">
                    <SelectValue placeholder="Все уровни" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все уровни</SelectItem>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Дополнительные фильтры */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Минимальный доход */}
              <div className="space-y-2">
                <Label>Мин. доход ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minRevenue}
                  onChange={(e) => setFilters({...filters, minRevenue: e.target.value})}
                  data-testid="input-min-revenue"
                />
              </div>

              {/* Минимальный CR */}
              <div className="space-y-2">
                <Label>Мин. CR (%)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  step="0.01"
                  value={filters.minCr}
                  onChange={(e) => setFilters({...filters, minCr: e.target.value})}
                  data-testid="input-min-cr"
                />
              </div>

              {/* Минимальный EPC */}
              <div className="space-y-2">
                <Label>Мин. EPC ($)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  step="0.01"
                  value={filters.minEpc}
                  onChange={(e) => setFilters({...filters, minEpc: e.target.value})}
                  data-testid="input-min-epc"
                />
              </div>

              {/* Активность */}
              <div className="space-y-2">
                <Label>Активность (дни)</Label>
                <Select value={filters.activityDays} onValueChange={(value) => setFilters({...filters, activityDays: value})}>
                  <SelectTrigger data-testid="select-activity">
                    <SelectValue placeholder="Все" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="1">За день</SelectItem>
                    <SelectItem value="7">За неделю</SelectItem>
                    <SelectItem value="30">За месяц</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Топ-партнёры */}
              <div className="space-y-2">
                <Label>Фильтры</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="topPerformers"
                    checked={filters.topPerformersOnly}
                    onCheckedChange={(checked) => setFilters({...filters, topPerformersOnly: checked as boolean})}
                    data-testid="checkbox-top-performers"
                  />
                  <Label htmlFor="topPerformers" className="text-sm">
                    Только топ-партнёры
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Счётчики и режимы просмотра */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Найдено партнёров: <span className="font-medium">{filteredPartners.length}</span>
            {filteredPartners.filter(p => p.isTopPerformer).length > 0 && (
              <span className="ml-4">
                Топ-партнёров: <span className="font-medium text-yellow-600">
                  {filteredPartners.filter(p => p.isTopPerformer).length}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
              data-testid="button-view-cards"
            >
              Карточки
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              data-testid="button-view-table"
            >
              Таблица
            </Button>
          </div>
        </div>

        {/* Список партнёров */}
        {filteredPartners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Партнёры не найдены</p>
            <p className="text-sm mt-2">Попробуйте изменить фильтры поиска</p>
          </div>
        ) : (
          <div className={viewMode === 'cards' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
            {filteredPartners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                onEditPayout={handleEditPayout}
                onToggleStatus={handleToggleStatus}
                onViewStatistics={handleViewStatistics}
                onNotifyPartner={handleNotifyPartner}
                onRemoveFromOffer={handleRemoveFromOffer}
              />
            ))}
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}