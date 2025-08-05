import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Target,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  MousePointer,
  DollarSign,
  TrendingUp,
  Copy,
  Settings,
  Filter,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Globe,
  Image as ImageIcon,
  FileText,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface Offer {
  id: string;
  name: string;
  category: string;
  description: string;
  logo?: string;
  status: 'active' | 'paused' | 'pending' | 'rejected';
  payoutType: 'cpa' | 'cpl' | 'cps' | 'revenue_share';
  payoutAmount: number;
  currency: string;
  countries: string[];
  trafficSources: string[];
  dailyLimit?: number;
  monthlyLimit?: number;
  antifraudEnabled: boolean;
  autoApprovePartners: boolean;
  partnersCount: number;
  clicksCount: number;
  conversionsCount: number;
  conversionRate: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateOfferData {
  name: string;
  category: string;
  description: string;
  logo?: string;
  payoutType: 'cpa' | 'cpl' | 'cps' | 'revenue_share';
  payoutAmount: number;
  currency: string;
  countries: string[];
  trafficSources: string[];
  dailyLimit?: number;
  monthlyLimit?: number;
  antifraudEnabled: boolean;
  autoApprovePartners: boolean;
}

const OFFER_CATEGORIES = [
  'Gaming',
  'Finance',
  'Crypto',
  'Dating',
  'Nutra',
  'Casino',
  'Betting',
  'Education',
  'Software',
  'E-commerce'
];

const TRAFFIC_SOURCES = [
  'Push',
  'Pop',
  'Native',
  'Social',
  'Search',
  'Email',
  'Display',
  'Mobile',
  'Adult',
  'Incent'
];

const COUNTRIES = [
  'US', 'UK', 'DE', 'FR', 'ES', 'IT', 'CA', 'AU', 'BR', 'RU', 
  'IN', 'CN', 'JP', 'KR', 'MX', 'AR', 'TR', 'PL', 'NL', 'SE'
];

export default function OfferManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch offers
  const { data: offers = [], isLoading } = useQuery<Offer[]>({
    queryKey: ['/api/advertiser/offers'],
  });

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || offer.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Create/Update offer mutation
  const saveOfferMutation = useMutation({
    mutationFn: (data: Partial<Offer>) => {
      const url = data.id ? `/api/advertiser/offers/${data.id}` : '/api/advertiser/offers';
      const method = data.id ? 'PATCH' : 'POST';
      return apiRequest(url, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      setIsCreateDialogOpen(false);
      setEditingOffer(null);
      toast({
        title: "Оффер сохранён",
        description: "Оффер успешно сохранён и отправлен на модерацию",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить оффер",
        variant: "destructive",
      });
    }
  });

  // Toggle offer status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiRequest(`/api/advertiser/offers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      toast({
        title: "Статус изменён",
        description: "Статус оффера успешно изменён",
      });
    }
  });

  // Delete offer mutation
  const deleteOfferMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/advertiser/offers/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      toast({
        title: "Оффер удалён",
        description: "Оффер удалён из системы",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Активен</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Приостановлен</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />На модерации</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Отклонён</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPayoutTypeLabel = (type: string) => {
    switch (type) {
      case 'cpa': return 'CPA';
      case 'cpl': return 'CPL';
      case 'cps': return 'CPS';
      case 'revenue_share': return 'RevShare';
      default: return type;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const handleDeleteOffer = (offer: Offer) => {
    if (confirm(`Вы уверены, что хотите удалить оффер "${offer.name}"?`)) {
      deleteOfferMutation.mutate(offer.id);
    }
  };

  const handleToggleStatus = (offer: Offer) => {
    const newStatus = offer.status === 'active' ? 'paused' : 'active';
    toggleStatusMutation.mutate({ id: offer.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Управление офферами</h1>
          <p className="text-muted-foreground mt-2">
            Создавайте и управляйте вашими офферами
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-offer">
              <Plus className="h-4 w-4 mr-2" />
              Создать оффер
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? 'Редактировать оффер' : 'Создать оффер'}
              </DialogTitle>
            </DialogHeader>
            <OfferForm
              offer={editingOffer}
              onSave={(data) => saveOfferMutation.mutate(data)}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                setEditingOffer(null);
              }}
              isLoading={saveOfferMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск офферов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-offers"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="paused">Приостановленные</SelectItem>
                <SelectItem value="pending">На модерации</SelectItem>
                <SelectItem value="rejected">Отклонённые</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {OFFER_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего офферов</p>
                <p className="text-2xl font-bold">{offers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Активных</p>
                <p className="text-2xl font-bold">
                  {offers.filter(o => o.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">На модерации</p>
                <p className="text-2xl font-bold">
                  {offers.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Общая выручка</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(offers.reduce((sum, o) => sum + o.revenue, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Офферы ({filteredOffers.length})</CardTitle>
          <CardDescription>
            Управление вашими офферами и их производительностью
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOffers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Офферы не найдены</p>
              {searchTerm || statusFilter !== "all" || categoryFilter !== "all" ? (
                <p className="text-sm">Попробуйте изменить фильтры поиска</p>
              ) : (
                <p className="text-sm">Создайте свой первый оффер</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Оффер</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Выплата</TableHead>
                    <TableHead>Партнёры</TableHead>
                    <TableHead>Статистика</TableHead>
                    <TableHead>CR</TableHead>
                    <TableHead>Выручка</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {offer.logo ? (
                            <img 
                              src={offer.logo} 
                              alt={offer.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <Target className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{offer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {offer.countries.slice(0, 3).join(', ')}
                              {offer.countries.length > 3 && ` +${offer.countries.length - 3}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{offer.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatCurrency(offer.payoutAmount, offer.currency)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getPayoutTypeLabel(offer.payoutType)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{offer.partnersCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <MousePointer className="h-3 w-3" />
                            <span>{offer.clicksCount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Target className="h-3 w-3" />
                            <span>{offer.conversionsCount.toLocaleString()}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={offer.conversionRate > 5 ? 'text-green-600' : 'text-gray-600'}>
                          {offer.conversionRate.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(offer.revenue, offer.currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(offer.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/advertiser/offers/${offer.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Просмотр"
                              data-testid={`button-view-${offer.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingOffer(offer);
                              setIsCreateDialogOpen(true);
                            }}
                            title="Редактировать"
                            data-testid={`button-edit-${offer.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {offer.status === 'active' || offer.status === 'paused' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(offer)}
                              title={offer.status === 'active' ? 'Приостановить' : 'Активировать'}
                              data-testid={`button-toggle-${offer.id}`}
                            >
                              {offer.status === 'active' ? (
                                <Clock className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          ) : null}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOffer(offer)}
                            title="Удалить"
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-${offer.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Separate component for the offer form
function OfferForm({ 
  offer, 
  onSave, 
  onCancel, 
  isLoading 
}: { 
  offer: Offer | null;
  onSave: (data: Partial<Offer>) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Offer>>({
    name: offer?.name || '',
    category: offer?.category || '',
    description: offer?.description || '',
    logo: offer?.logo || '',
    payoutType: offer?.payoutType || 'cpa',
    payoutAmount: offer?.payoutAmount || 0,
    currency: offer?.currency || 'USD',
    countries: offer?.countries || [],
    trafficSources: offer?.trafficSources || [],
    dailyLimit: offer?.dailyLimit || undefined,
    monthlyLimit: offer?.monthlyLimit || undefined,
    antifraudEnabled: offer?.antifraudEnabled ?? true,
    autoApprovePartners: offer?.autoApprovePartners ?? false
  });

  const handleCountryChange = (country: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      countries: checked
        ? [...(prev.countries || []), country]
        : (prev.countries || []).filter(c => c !== country)
    }));
  };

  const handleTrafficSourceChange = (source: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      trafficSources: checked
        ? [...(prev.trafficSources || []), source]
        : (prev.trafficSources || []).filter(s => s !== source)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(offer?.id ? { ...formData, id: offer.id } : formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Название оффера</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Название оффера"
            required
            data-testid="input-offer-name"
          />
        </div>

        <div>
          <Label htmlFor="category">Категория</Label>
          <Select value={formData.category} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, category: value }))
          }>
            <SelectTrigger data-testid="select-offer-category">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {OFFER_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Описание оффера..."
          rows={3}
          data-testid="input-offer-description"
        />
      </div>

      <div>
        <Label htmlFor="logo">URL логотипа</Label>
        <Input
          id="logo"
          value={formData.logo}
          onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
          placeholder="https://example.com/logo.png"
          data-testid="input-offer-logo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="payoutType">Тип выплаты</Label>
          <Select value={formData.payoutType} onValueChange={(value: any) => 
            setFormData(prev => ({ ...prev, payoutType: value }))
          }>
            <SelectTrigger data-testid="select-payout-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpa">CPA</SelectItem>
              <SelectItem value="cpl">CPL</SelectItem>
              <SelectItem value="cps">CPS</SelectItem>
              <SelectItem value="revenue_share">Revenue Share</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="payoutAmount">Размер выплаты</Label>
          <Input
            id="payoutAmount"
            type="number"
            step="0.01"
            value={formData.payoutAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, payoutAmount: parseFloat(e.target.value) }))}
            placeholder="0.00"
            required
            data-testid="input-payout-amount"
          />
        </div>

        <div>
          <Label htmlFor="currency">Валюта</Label>
          <Select value={formData.currency} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, currency: value }))
          }>
            <SelectTrigger data-testid="select-currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="RUB">RUB</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dailyLimit">Дневной лимит (опционально)</Label>
          <Input
            id="dailyLimit"
            type="number"
            value={formData.dailyLimit || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              dailyLimit: e.target.value ? parseInt(e.target.value) : undefined 
            }))}
            placeholder="Без лимита"
            data-testid="input-daily-limit"
          />
        </div>

        <div>
          <Label htmlFor="monthlyLimit">Месячный лимит (опционально)</Label>
          <Input
            id="monthlyLimit"
            type="number"
            value={formData.monthlyLimit || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              monthlyLimit: e.target.value ? parseInt(e.target.value) : undefined 
            }))}
            placeholder="Без лимита"
            data-testid="input-monthly-limit"
          />
        </div>
      </div>

      <div>
        <Label>Страны</Label>
        <div className="grid grid-cols-4 gap-2 mt-2 max-h-48 overflow-y-auto border rounded p-3">
          {COUNTRIES.map(country => (
            <div key={country} className="flex items-center space-x-2">
              <Checkbox
                id={country}
                checked={formData.countries?.includes(country)}
                onCheckedChange={(checked) => 
                  handleCountryChange(country, checked as boolean)
                }
                data-testid={`checkbox-country-${country}`}
              />
              <label htmlFor={country} className="text-sm">
                {country}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Источники трафика</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {TRAFFIC_SOURCES.map(source => (
            <div key={source} className="flex items-center space-x-2">
              <Checkbox
                id={source}
                checked={formData.trafficSources?.includes(source)}
                onCheckedChange={(checked) => 
                  handleTrafficSourceChange(source, checked as boolean)
                }
                data-testid={`checkbox-traffic-${source}`}
              />
              <label htmlFor={source} className="text-sm">
                {source}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="antifraudEnabled"
            checked={formData.antifraudEnabled}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, antifraudEnabled: checked as boolean }))
            }
            data-testid="checkbox-antifraud"
          />
          <label htmlFor="antifraudEnabled" className="text-sm">
            Защита от фрода
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="autoApprovePartners"
            checked={formData.autoApprovePartners}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, autoApprovePartners: checked as boolean }))
            }
            data-testid="checkbox-auto-approve"
          />
          <label htmlFor="autoApprovePartners" className="text-sm">
            Автоодобрение партнёров
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel-offer"
        >
          Отмена
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          data-testid="button-save-offer"
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </form>
  );
}