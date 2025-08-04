import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/language-context';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Search, Filter, Eye, Edit, Ban, Archive, CheckCircle, XCircle, AlertTriangle, Download, Upload, Plus, Trash2, PlusCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';

const createOfferSchema = z.object({
  name: z.string().min(1, 'Название оффера обязательно'),
  category: z.string().min(1, 'Категория обязательна'),
  description: z.string().optional(),
  payoutType: z.string().default('cpa'),
  currency: z.string().default('USD'),
  landingPages: z.array(z.object({
    name: z.string().min(1, 'Название обязательно'),
    url: z.string().url('Неверный URL'),
    payoutAmount: z.number().min(0, 'Сумма должна быть положительной'),
    currency: z.string().default('USD'),
    geo: z.string().optional(),
  })).default([{ name: 'Основная страница', url: '', payoutAmount: 0, currency: 'USD', geo: '' }]),
  kpiConditions: z.string().optional(),
  allowedTrafficSources: z.array(z.string()).default([]),
  dailyLimit: z.number().optional(),
  monthlyLimit: z.number().optional(),
  antifraudEnabled: z.boolean().default(true),
  autoApprovePartners: z.boolean().default(false),
});

type CreateOfferFormData = z.infer<typeof createOfferSchema>;

interface CreateOfferFormProps {
  onSuccess: () => void;
}

function CreateOfferForm({ onSuccess }: CreateOfferFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<CreateOfferFormData>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      landingPages: [{ name: 'Основная страница', url: '', payoutAmount: 0, currency: 'USD', geo: '' }],
      payoutType: 'cpa',
      currency: 'USD',
      kpiConditions: '',
      allowedTrafficSources: [],
      antifraudEnabled: true,
      autoApprovePartners: false,
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: CreateOfferFormData) => {
      return await apiRequest('POST', '/api/admin/offers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      toast({
        title: "Успех",
        description: "Оффер успешно создан",
      });
      onSuccess();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать оффер",
        variant: "destructive",
      });
    },
  });

  const categories = [
    'gambling', 'finance', 'nutra', 'dating', 'sweepstakes', 'crypto', 'e-commerce', 'mobile', 'games', 'software'
  ];



  const trafficSources = [
    'facebook_ads', 'google_ads', 'tiktok_ads', 'instagram_ads', 'snapchat_ads', 'twitter_ads', 'pinterest_ads', 'reddit_ads', 'linkedin_ads', 'mytarget',
    'push_traffic', 'inpage_push', 'calendar_push', 'sms_push',
    'outbrain', 'taboola', 'mgid', 'revcontent', 'adnow',
    'pop_traffic', 'email_marketing', 'seo_organic', 'mobile_app', 'influencer', 'teaser_networks', 'other'
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createOfferMutation.mutate(data))} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название оффера *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Введите название оффера (например: Pronto Casino)" data-testid="input-offer-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Категория</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
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
                <Textarea {...field} placeholder="Описание оффера" rows={3} data-testid="textarea-description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Посадочные страницы</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => {
                const current = form.getValues('landingPages');
                form.setValue('landingPages', [...current, { name: '', url: '', payoutAmount: 0, currency: 'USD', geo: '' }]);
              }}
              data-testid="button-add-landing-page"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Добавить страницу
            </Button>
          </div>
          
          <div className="space-y-3">
            {form.watch('landingPages').map((_, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <FormField
                  control={form.control}
                  name={`landingPages.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Название</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Основная страница" data-testid={`input-landing-name-${index}`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`landingPages.${index}.url`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com" data-testid={`input-landing-url-${index}`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`landingPages.${index}.payoutAmount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Сумма выплаты</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          onWheel={(e) => e.currentTarget.blur()}
                          placeholder="0.00" 
                          data-testid={`input-landing-payout-${index}`}
                          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`landingPages.${index}.currency`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Валюта</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid={`select-landing-currency-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="RUB">RUB</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`landingPages.${index}.geo`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Гео</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="US, GB, DE..." data-testid={`input-landing-geo-${index}`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-end">
                  {form.watch('landingPages').length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const current = form.getValues('landingPages');
                        form.setValue('landingPages', current.filter((_, i) => i !== index));
                      }}
                      data-testid={`button-remove-landing-page-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="payoutType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип выплаты (по умолчанию)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-payout-type">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cpa">CPA - Cost Per Action</SelectItem>
                    <SelectItem value="cps">CPS - Cost Per Sale</SelectItem>
                    <SelectItem value="cpl">CPL - Cost Per Lead</SelectItem>
                    <SelectItem value="cpm">CPM - Cost Per Mile</SelectItem>
                    <SelectItem value="cpc">CPC - Cost Per Click</SelectItem>
                    <SelectItem value="cpi">CPI - Cost Per Install</SelectItem>
                    <SelectItem value="cro">CRO - Cost Per Registration</SelectItem>
                    <SelectItem value="revshare">RevShare - Revenue Share</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Валюта по умолчанию</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>



        <FormField
          control={form.control}
          name="kpiConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KPI условия</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Условия KPI для данного оффера (например: минимальный депозит $100, активные игроки только)..."
                  rows={2}
                  data-testid="textarea-kpi-conditions"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <div className="space-y-4">
          <Label className="text-base font-medium">Разрешенные источники трафика</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
            {trafficSources.map((source) => (
              <div key={source} className="flex items-center space-x-2">
                <Checkbox
                  id={`source-${source}`}
                  checked={form.watch('allowedTrafficSources').includes(source)}
                  onCheckedChange={(checked) => {
                    const current = form.getValues('allowedTrafficSources');
                    if (checked) {
                      form.setValue('allowedTrafficSources', [...current, source]);
                    } else {
                      form.setValue('allowedTrafficSources', current.filter(s => s !== source));
                    }
                  }}
                />
                <Label htmlFor={`source-${source}`} className="text-sm">
                  {source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dailyLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Дневной лимит</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="Без ограничений" 
                    data-testid="input-daily-limit"
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="monthlyLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Месячный лимит</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="Без ограничений" 
                    data-testid="input-monthly-limit"
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="antifraudEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Антифрод включен</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-antifraud"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="autoApprovePartners"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Автоодобрение партнеров</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-auto-approve"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Отмена
          </Button>
          <Button 
            type="submit" 
            disabled={createOfferMutation.isPending}
            data-testid="button-submit-offer"
          >
            {createOfferMutation.isPending ? 'Создание...' : 'Создать оффер'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface Offer {
  id: string;
  name: string;
  description: string;
  category: string;
  vertical: string;
  goals: string;
  advertiserId: string;
  advertiserName?: string;
  payout: string;
  payoutType: string;
  currency: string;
  countries: string[];
  trafficSources: string[];
  status: string;
  moderationStatus: string;
  moderationComment: string;
  landingPageUrl: string;
  trackingUrl: string;
  previewUrl: string;
  restrictions: string;
  fraudRestrictions: string;
  macros: string;
  kycRequired: boolean;
  isPrivate: boolean;
  smartlinkEnabled: boolean;
  isBlocked: boolean;
  blockedReason: string;
  isArchived: boolean;
  regionVisibility: string[];
  createdAt: string;
  updatedAt: string;
}

interface OfferLog {
  id: string;
  action: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  comment: string;
  userName: string;
  createdAt: string;
}

export default function OffersManagement() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isModerationDialogOpen, setIsModerationDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [moderationFilter, setModerationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [advertiserFilter, setAdvertiserFilter] = useState('all');

  // Fetch offers
  const { data: offers = [], isLoading: offersLoading } = useQuery({
    queryKey: ['/api/admin/offers'],
    select: (data: Offer[]) => data.filter(offer => {
      const matchesSearch = offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           offer.advertiserName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
      const matchesModeration = moderationFilter === 'all' || offer.moderationStatus === moderationFilter;
      const matchesCategory = categoryFilter === 'all' || offer.category === categoryFilter;
      const matchesAdvertiser = advertiserFilter === 'all' || offer.advertiserId === advertiserFilter;
      
      return matchesSearch && matchesStatus && matchesModeration && matchesCategory && matchesAdvertiser;
    })
  });

  // Fetch offer logs
  const { data: offerLogs = [] } = useQuery({
    queryKey: ['/api/admin/offer-logs', selectedOffer?.id],
    enabled: !!selectedOffer?.id,
  });

  // Fetch statistics for selected offer
  const { data: offerStats } = useQuery({
    queryKey: ['/api/admin/offer-stats', selectedOffer?.id],
    enabled: !!selectedOffer?.id,
  });

  // Moderate offer mutation
  const moderateOfferMutation = useMutation({
    mutationFn: async ({ offerId, action, comment }: { offerId: string; action: string; comment?: string }) => {
      const response = await apiRequest('POST', `/api/admin/offers/${offerId}/moderate`, {
        action,
        comment
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      setIsModerationDialogOpen(false);
      toast({
        title: t('success'),
        description: t('operation_completed'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update offer mutation
  const updateOfferMutation = useMutation({
    mutationFn: async (offerData: Partial<Offer>) => {
      const response = await apiRequest('PUT', `/api/admin/offers/${offerData.id}`, offerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      setIsEditDialogOpen(false);
      toast({
        title: t('success'),
        description: t('data_updated'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string, moderationStatus: string, isBlocked: boolean, isArchived: boolean) => {
    if (isArchived) return <Badge variant="secondary">{t('archived')}</Badge>;
    if (isBlocked) return <Badge variant="destructive">{t('blocked')}</Badge>;
    
    switch (moderationStatus) {
      case 'pending':
        return <Badge variant="outline">{t('pending')}</Badge>;
      case 'approved':
        return <Badge variant="default">{status === 'active' ? t('active') : t('inactive')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t('rejected')}</Badge>;
      case 'needs_revision':
        return <Badge variant="secondary">{t('needs_revision')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleModerationAction = (action: string, comment?: string) => {
    if (!selectedOffer) return;
    moderateOfferMutation.mutate({
      offerId: selectedOffer.id,
      action,
      comment
    });
  };

  const handleOfferUpdate = (updates: Partial<Offer>) => {
    if (!selectedOffer) return;
    updateOfferMutation.mutate({
      ...selectedOffer,
      ...updates
    });
  };

  if (offersLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Управление офферами" />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center p-8">{t('loading')}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <Header title="offers_management" subtitle="manage_and_moderate_offers" />
        <main className="flex-1 p-6">
          <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('offer_management')}</h1>
          <p className="text-muted-foreground">{t('manage_all_offers_platform')}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-offer">
                <Plus className="w-4 h-4 mr-2" />
                Создать оффер
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Создать новый оффер</DialogTitle>
                <DialogDescription>
                  Заполните информацию для создания нового оффера
                </DialogDescription>
              </DialogHeader>
              <CreateOfferForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            {t('import')}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t('export')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t('filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-offers"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_statuses')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
                <SelectItem value="draft">{t('draft')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={moderationFilter} onValueChange={setModerationFilter}>
              <SelectTrigger data-testid="select-moderation-filter">
                <SelectValue placeholder={t('moderation_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_statuses')}</SelectItem>
                <SelectItem value="pending">{t('pending')}</SelectItem>
                <SelectItem value="approved">{t('approved')}</SelectItem>
                <SelectItem value="rejected">{t('rejected')}</SelectItem>
                <SelectItem value="needs_revision">{t('needs_revision')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="select-category-filter">
                <SelectValue placeholder={t('category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_categories')}</SelectItem>
                <SelectItem value="finance">{t('finance')}</SelectItem>
                <SelectItem value="dating">{t('dating')}</SelectItem>
                <SelectItem value="gaming">{t('gaming')}</SelectItem>
                <SelectItem value="health">{t('health')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={advertiserFilter} onValueChange={setAdvertiserFilter}>
              <SelectTrigger data-testid="select-advertiser-filter">
                <SelectValue placeholder={t('advertiser')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_advertisers')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('offers')} ({offers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('offer_name')}</TableHead>
                  <TableHead>{t('advertiser')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('payout')}</TableHead>
                  <TableHead>{t('countries')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('created')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{offer.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-48">
                          {offer.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{offer.advertiserName || 'Unknown'}</div>
                        <div className="text-muted-foreground text-xs">{offer.advertiserId.slice(0, 8)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{offer.category}</Badge>
                      {offer.vertical && (
                        <div className="text-xs text-muted-foreground mt-1">{offer.vertical}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${offer.payout}</div>
                      <div className="text-sm text-muted-foreground">{offer.payoutType}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {Array.isArray(offer.countries) && offer.countries.length > 0 
                          ? offer.countries.slice(0, 2).join(', ') + (offer.countries.length > 2 ? `... +${offer.countries.length - 2}` : '')
                          : t('all_countries')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(offer.status, offer.moderationStatus, offer.isBlocked, offer.isArchived)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOffer(offer)}
                          data-testid={`button-view-offer-${offer.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setIsEditDialogOpen(true);
                          }}
                          data-testid={`button-edit-offer-${offer.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setIsModerationDialogOpen(true);
                          }}
                          data-testid={`button-moderate-offer-${offer.id}`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Offer Details Modal */}
      {selectedOffer && (
        <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedOffer.name}</DialogTitle>
              <DialogDescription>{selectedOffer.description}</DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">{t('details')}</TabsTrigger>
                <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
                <TabsTrigger value="creatives">{t('creatives')}</TabsTrigger>
                <TabsTrigger value="history">{t('history')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('category')}</Label>
                    <div className="font-medium">{selectedOffer.category}</div>
                  </div>
                  <div>
                    <Label>{t('vertical')}</Label>
                    <div className="font-medium">{selectedOffer.vertical || 'N/A'}</div>
                  </div>
                  <div>
                    <Label>{t('payout')}</Label>
                    <div className="font-medium">${selectedOffer.payout} {selectedOffer.payoutType}</div>
                  </div>
                  <div>
                    <Label>{t('countries')}</Label>
                    <div className="font-medium">
                      {Array.isArray(selectedOffer.countries) && selectedOffer.countries.length > 0 
                        ? selectedOffer.countries.join(', ')
                        : t('all_countries')}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>{t('landing_page')}</Label>
                  <div className="font-medium break-all">{selectedOffer.landingPageUrl}</div>
                </div>
                
                <div>
                  <Label>{t('restrictions')}</Label>
                  <div className="font-medium">{selectedOffer.restrictions || t('no_restrictions')}</div>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                {offerStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{t('clicks')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{(offerStats as any)?.clicks || 0}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{t('conversions')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{(offerStats as any)?.conversions || 0}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{t('cr')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{(offerStats as any)?.cr || '0.00'}%</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{t('epc')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${(offerStats as any)?.epc || '0.00'}</div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">{t('no_data')}</div>
                )}
              </TabsContent>
              
              <TabsContent value="creatives" className="space-y-4">
                <div className="text-center py-8">{t('no_creatives_available')}</div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                {Array.isArray(offerLogs) && offerLogs.length > 0 ? (
                  <div className="space-y-2">
                    {(offerLogs as OfferLog[]).map((log: OfferLog) => (
                      <div key={log.id} className="border rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{log.action}</div>
                            {log.fieldChanged && (
                              <div className="text-sm text-muted-foreground">
                                {log.fieldChanged}: {log.oldValue} → {log.newValue}
                              </div>
                            )}
                            {log.comment && (
                              <div className="text-sm mt-1">{log.comment}</div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>{log.userName}</div>
                            <div>{new Date(log.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">{t('no_history_available')}</div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Offer Modal */}
      {selectedOffer && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('edit_offer')}</DialogTitle>
              <DialogDescription>
                {t('edit_offer_details')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payout">{t('payout')}</Label>
                  <Input
                    id="payout"
                    type="number"
                    step="0.01"
                    defaultValue={selectedOffer.payout}
                    onChange={(e) => handleOfferUpdate({ payout: e.target.value })}
                    onWheel={(e) => e.currentTarget.blur()}
                    data-testid="input-edit-payout"
                  />
                </div>
                <div>
                  <Label htmlFor="payoutType">{t('payout_type')}</Label>
                  <Select 
                    defaultValue={selectedOffer.payoutType}
                    onValueChange={(value) => handleOfferUpdate({ payoutType: value })}
                  >
                    <SelectTrigger data-testid="select-edit-payout-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CPA">CPA</SelectItem>
                      <SelectItem value="CPS">CPS</SelectItem>
                      <SelectItem value="CPL">CPL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="fraudRestrictions">{t('fraud_restrictions')}</Label>
                <Textarea
                  id="fraudRestrictions"
                  placeholder={t('enter_fraud_restrictions')}
                  defaultValue={selectedOffer.fraudRestrictions || ''}
                  onChange={(e) => handleOfferUpdate({ fraudRestrictions: e.target.value })}
                  data-testid="textarea-edit-fraud-restrictions"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smartlink"
                  defaultChecked={selectedOffer.smartlinkEnabled}
                  onCheckedChange={(checked) => handleOfferUpdate({ smartlinkEnabled: checked })}
                  data-testid="switch-edit-smartlink"
                />
                <Label htmlFor="smartlink">{t('smartlink_enabled')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="blocked"
                  defaultChecked={selectedOffer.isBlocked}
                  onCheckedChange={(checked) => handleOfferUpdate({ isBlocked: checked })}
                  data-testid="switch-edit-blocked"
                />
                <Label htmlFor="blocked">{t('block_offer')}</Label>
              </div>

              {selectedOffer.isBlocked && (
                <div>
                  <Label htmlFor="blockedReason">{t('blocked_reason')}</Label>
                  <Textarea
                    id="blockedReason"
                    placeholder={t('enter_blocked_reason')}
                    defaultValue={selectedOffer.blockedReason || ''}
                    onChange={(e) => handleOfferUpdate({ blockedReason: e.target.value })}
                    data-testid="textarea-edit-blocked-reason"
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Moderation Modal */}
      {selectedOffer && (
        <Dialog open={isModerationDialogOpen} onOpenChange={setIsModerationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('moderate_offer')}</DialogTitle>
              <DialogDescription>
                {selectedOffer.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => handleModerationAction('approve')}
                  className="flex-1"
                  disabled={moderateOfferMutation.isPending}
                  data-testid="button-approve-offer"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('approve')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleModerationAction('reject')}
                  className="flex-1"
                  disabled={moderateOfferMutation.isPending}
                  data-testid="button-reject-offer"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {t('reject')}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleModerationAction('needs_revision')}
                  className="flex-1"
                  disabled={moderateOfferMutation.isPending}
                  data-testid="button-needs-revision-offer"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t('needs_revision')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleModerationAction('archive')}
                  className="flex-1"
                  disabled={moderateOfferMutation.isPending}
                  data-testid="button-archive-offer"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {t('archive')}
                </Button>
              </div>

              <div>
                <Label htmlFor="moderationComment">{t('comment')}</Label>
                <Textarea
                  id="moderationComment"
                  placeholder={t('enter_moderation_comment')}
                  data-testid="textarea-moderation-comment"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}