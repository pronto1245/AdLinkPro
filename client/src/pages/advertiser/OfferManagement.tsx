import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Target, 
  Plus,
  Settings,
  Eye,
  Edit,
  Copy,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Globe,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Form schema for offer creation/editing
const offerFormSchema = z.object({
  name: z.string().min(2, "Название должно содержать минимум 2 символа"),
  description: z.string().optional(),
  category: z.string().min(1, "Выберите категорию"),
  payoutType: z.enum(["CPA", "RevShare", "CPL", "CPC", "CPI"]),
  currency: z.enum(["USD", "EUR", "RUB", "GBP"]),
  payoutAmount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, "Введите корректную сумму"),
  trackingUrl: z.string().url("Введите корректный URL").optional(),
  geoTargeting: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  autoApproval: z.boolean().default(false),
  antifraudEnabled: z.boolean().default(true),
  trafficRequirements: z.string().optional(),
  restrictions: z.string().optional(),
  postbackUrl: z.string().url("Введите корректный URL").optional(),
  moderatorComment: z.string().optional()
});

type OfferFormData = z.infer<typeof offerFormSchema>;

interface Offer {
  id: string;
  name: string;
  category: string;
  payoutType: string;
  currency: string;
  payoutAmount: number;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  createdAt: string;
  partnersCount: number;
  leads: number;
  cr: number;
  epc: number;
  revenue: number;
  geoTargeting: string[];
  isActive: boolean;
  trackingUrl?: string;
  description?: string;
}

interface OfferPartner {
  id: string;
  name: string;
  traffic: number;
  leads: number;
  cr: number;
  revenue: number;
  status: string;
  connectedAt: string;
}

const CATEGORIES = [
  "Gaming", "Finance", "Dating", "E-commerce", "Health", 
  "Education", "Travel", "Technology", "Entertainment", "Other"
];

const PAYOUT_TYPES = [
  { value: "CPA", label: "CPA - Cost Per Action" },
  { value: "RevShare", label: "RevShare - Revenue Share" },
  { value: "CPL", label: "CPL - Cost Per Lead" },
  { value: "CPC", label: "CPC - Cost Per Click" },
  { value: "CPI", label: "CPI - Cost Per Install" }
];

const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "RUB", label: "RUB - Russian Ruble" },
  { value: "GBP", label: "GBP - British Pound" }
];

const GEO_COUNTRIES = [
  "US", "CA", "GB", "DE", "FR", "IT", "ES", "AU", "RU", "BR", "IN", "JP", "KR", "CN"
];

export default function OfferManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for filters and search
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [payoutTypeFilter, setPayoutTypeFilter] = useState("");
  const [geoFilter, setGeoFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // Form for offer creation/editing
  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      isActive: true,
      autoApproval: false,
      antifraudEnabled: true,
      currency: "USD",
      payoutType: "CPA"
    }
  });

  // Fetch offers data with filters
  const { data: offers, isLoading, refetch } = useQuery({
    queryKey: ['/api/advertiser/offers', search, categoryFilter, statusFilter, payoutTypeFilter, geoFilter, dateFrom, dateTo],
    enabled: !!user
  }) as { data: Offer[] | undefined; isLoading: boolean; refetch: () => void };

  // Fetch offer partners when viewing stats
  const { data: offerPartners } = useQuery({
    queryKey: ['/api/advertiser/offers', selectedOffer?.id, 'partners'],
    enabled: !!selectedOffer && showStatsDialog
  }) as { data: OfferPartner[] | undefined };

  // Create offer mutation
  const createOfferMutation = useMutation({
    mutationFn: (data: OfferFormData) => apiRequest('/api/advertiser/offers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({ title: "Оффер создан", description: "Оффер отправлен на модерацию" });
      setShowCreateDialog(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось создать оффер", variant: "destructive" });
    }
  });

  // Update offer mutation
  const updateOfferMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OfferFormData> }) => 
      apiRequest(`/api/advertiser/offers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Оффер обновлён", description: "Изменения сохранены успешно" });
      setShowEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить оффер", variant: "destructive" });
    }
  });

  // Toggle offer status mutation
  const toggleOfferMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest(`/api/advertiser/offers/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive })
      }),
    onSuccess: () => {
      toast({ title: "Статус изменён", description: "Статус оффера обновлён" });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
    }
  });

  // Export offers mutation
  const exportMutation = useMutation({
    mutationFn: () => apiRequest('/api/advertiser/offers/export'),
    onSuccess: () => {
      toast({ title: "Экспорт готов", description: "Файл с офферами загружен" });
    }
  });

  // Copy tracking link to clipboard
  const copyTrackingLink = (offer: Offer) => {
    const trackingLink = `https://track.platform.com/click/${offer.id}?partner_id={PARTNER_ID}&subid={SUBID}`;
    navigator.clipboard.writeText(trackingLink);
    toast({ title: "Ссылка скопирована", description: "Tracking-ссылка скопирована в буфер обмена" });
  };

  // Filtered and paginated offers
  const filteredOffers = useMemo(() => {
    if (!offers) return [];
    
    return offers.filter(offer => {
      const matchesSearch = offer.name.toLowerCase().includes(search.toLowerCase()) ||
                           offer.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || offer.category === categoryFilter;
      const matchesStatus = !statusFilter || offer.status === statusFilter;
      const matchesPayoutType = !payoutTypeFilter || offer.payoutType === payoutTypeFilter;
      const matchesGeo = !geoFilter || offer.geoTargeting.includes(geoFilter);
      
      return matchesSearch && matchesCategory && matchesStatus && matchesPayoutType && matchesGeo;
    });
  }, [offers, search, categoryFilter, statusFilter, payoutTypeFilter, geoFilter]);

  const paginatedOffers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOffers.slice(startIndex, startIndex + pageSize);
  }, [filteredOffers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredOffers.length / pageSize);

  // Form submission handlers
  const onCreateSubmit = (data: OfferFormData) => {
    createOfferMutation.mutate(data);
  };

  const onEditSubmit = (data: OfferFormData) => {
    if (!selectedOffer) return;
    updateOfferMutation.mutate({ id: selectedOffer.id, data });
  };

  // Edit offer handler
  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    form.reset({
      name: offer.name,
      description: offer.description,
      category: offer.category,
      payoutType: offer.payoutType as any,
      currency: offer.currency as any,
      payoutAmount: offer.payoutAmount.toString(),
      trackingUrl: offer.trackingUrl,
      geoTargeting: offer.geoTargeting,
      isActive: offer.isActive
    });
    setShowEditDialog(true);
  };

  // View stats handler
  const handleViewStats = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowStatsDialog(true);
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Мои офферы</h1>
            <p className="text-muted-foreground">Управление офферами и анализ эффективности</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => exportMutation.mutate()} data-testid="button-export-offers">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            
            <Button variant="outline" size="icon" onClick={() => refetch()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-offer">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать оффер
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Создать новый оффер</DialogTitle>
                  <DialogDescription>
                    Заполните информацию о новом оффере. После создания он будет отправлен на модерацию.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Основная информация</h3>
                        
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Название оффера *</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-offer-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Описание</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={3} data-testid="textarea-offer-description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Категория *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-offer-category">
                                    <SelectValue placeholder="Выберите категорию" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CATEGORIES.map(category => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Payout Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Выплаты</h3>
                        
                        <FormField
                          control={form.control}
                          name="payoutType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Тип выплаты *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-payout-type">
                                    <SelectValue placeholder="Выберите тип" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PAYOUT_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Валюта *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-currency">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {CURRENCIES.map(currency => (
                                      <SelectItem key={currency.value} value={currency.value}>{currency.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="payoutAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ставка *</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" step="0.01" data-testid="input-payout-amount" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Advanced Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Дополнительные настройки</h3>
                      
                      <FormField
                        control={form.control}
                        name="trackingUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Базовая ссылка</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com/landing" data-testid="input-tracking-url" />
                            </FormControl>
                            <FormDescription>URL лендинга для перенаправления трафика</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="postbackUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postback URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://your-tracking.com/postback" data-testid="input-postback-url" />
                            </FormControl>
                            <FormDescription>URL для получения конверсий (опционально)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Активный оффер</FormLabel>
                                <FormDescription>Оффер будет доступен партнёрам</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-active" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="autoApproval"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Автоапрув</FormLabel>
                                <FormDescription>Автоматическое одобрение партнёров</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-auto-approval" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="antifraudEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Антифрод</FormLabel>
                                <FormDescription>Включить защиту от фрода</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-antifraud" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="trafficRequirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Требования к трафику</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} placeholder="Опишите требования к качеству трафика..." data-testid="textarea-traffic-requirements" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="restrictions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ограничения</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} placeholder="Укажите запрещённые источники трафика..." data-testid="textarea-restrictions" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="moderatorComment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Комментарий модератору</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} placeholder="Дополнительная информация для модерации..." data-testid="textarea-moderator-comment" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Отмена
                      </Button>
                      <Button type="submit" disabled={createOfferMutation.isPending} data-testid="button-submit-create">
                        {createOfferMutation.isPending ? "Создание..." : "Создать оффер"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Фильтры и поиск
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger data-testid="filter-category">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все категории</SelectItem>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="filter-status">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                  <SelectItem value="pending">На модерации</SelectItem>
                  <SelectItem value="rejected">Отклонённые</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={payoutTypeFilter} onValueChange={setPayoutTypeFilter}>
                <SelectTrigger data-testid="filter-payout-type">
                  <SelectValue placeholder="Тип выплаты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все типы</SelectItem>
                  {PAYOUT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={geoFilter} onValueChange={setGeoFilter}>
                <SelectTrigger data-testid="filter-geo">
                  <SelectValue placeholder="Гео" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все страны</SelectItem>
                  {GEO_COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("");
                  setStatusFilter("");
                  setPayoutTypeFilter("");
                  setGeoFilter("");
                  setDateFrom("");
                  setDateTo("");
                }}
                data-testid="button-clear-filters"
              >
                Очистить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Offers Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Список офферов ({filteredOffers.length})</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Показать:</span>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Тип / Ставка</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Партнёры</TableHead>
                      <TableHead>Лиды</TableHead>
                      <TableHead>CR%</TableHead>
                      <TableHead>EPC</TableHead>
                      <TableHead>Доход</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOffers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{offer.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Создан: {new Date(offer.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{offer.category}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline">{offer.payoutType}</Badge>
                            <div className="text-sm">{offer.payoutAmount} {offer.currency}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              offer.status === 'active' ? 'default' :
                              offer.status === 'pending' ? 'secondary' :
                              offer.status === 'rejected' ? 'destructive' : 'outline'
                            }>
                              {offer.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {offer.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {offer.status === 'rejected' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {offer.status}
                            </Badge>
                            <Switch
                              checked={offer.isActive}
                              onCheckedChange={(checked) => 
                                toggleOfferMutation.mutate({ id: offer.id, isActive: checked })
                              }
                              size="sm"
                              data-testid={`switch-${offer.id}`}
                            />
                          </div>
                        </TableCell>
                        <TableCell>{offer.partnersCount}</TableCell>
                        <TableCell>{offer.leads}</TableCell>
                        <TableCell>{offer.cr.toFixed(2)}%</TableCell>
                        <TableCell>${offer.epc.toFixed(2)}</TableCell>
                        <TableCell>${offer.revenue.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewStats(offer)}
                              data-testid={`button-stats-${offer.id}`}
                              title="Статистика"
                            >
                              <BarChart3 className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditOffer(offer)}
                              data-testid={`button-edit-${offer.id}`}
                              title="Редактировать"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => copyTrackingLink(offer)}
                              data-testid={`button-copy-${offer.id}`}
                              title="Копировать ссылку"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Показано {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredOffers.length)} из {filteredOffers.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Назад
                      </Button>
                      <span className="text-sm">Страница {currentPage} из {totalPages}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Вперёд
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Offer Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактировать оффер</DialogTitle>
              <DialogDescription>
                Внесите изменения в настройки оффера.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                {/* Same form fields as create, but simplified for editing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название оффера</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Категория</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <FormLabel className="text-sm">Активный</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={updateOfferMutation.isPending}>
                    {updateOfferMutation.isPending ? "Сохранение..." : "Сохранить"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Stats Dialog */}
        <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Статистика оффера: {selectedOffer?.name}</DialogTitle>
              <DialogDescription>
                Подробная аналитика по эффективности оффера
              </DialogDescription>
            </DialogHeader>
            
            {selectedOffer && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{selectedOffer.partnersCount}</div>
                      <p className="text-xs text-muted-foreground">Партнёров</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{selectedOffer.leads}</div>
                      <p className="text-xs text-muted-foreground">Лидов</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{selectedOffer.cr.toFixed(2)}%</div>
                      <p className="text-xs text-muted-foreground">CR</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">${selectedOffer.revenue.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Доход</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Partners Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Партнёры, работающие с оффером</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Партнёр</TableHead>
                          <TableHead>Трафик</TableHead>
                          <TableHead>Лиды</TableHead>
                          <TableHead>CR%</TableHead>
                          <TableHead>Доход</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Подключён</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {offerPartners?.map((partner: any) => (
                          <TableRow key={partner.id}>
                            <TableCell className="font-medium">{partner.name}</TableCell>
                            <TableCell>{partner.traffic}</TableCell>
                            <TableCell>{partner.leads}</TableCell>
                            <TableCell>{partner.cr}%</TableCell>
                            <TableCell>${partner.revenue}</TableCell>
                            <TableCell>
                              <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                                {partner.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(partner.connectedAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        )) || (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                              Нет подключённых партнёров
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <DialogFooter>
              <Button onClick={() => setShowStatsDialog(false)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}