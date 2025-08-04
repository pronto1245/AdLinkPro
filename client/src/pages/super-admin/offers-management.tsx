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
  logo: z.string().optional(),
  status: z.string().default('draft'),
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
  allowedApps: z.array(z.string()).default([]),
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
      logo: '',
      status: 'draft',
      landingPages: [{ name: 'Основная страница', url: '', payoutAmount: 0, currency: 'USD', geo: '' }],
      payoutType: 'cpa',
      currency: 'USD',
      kpiConditions: '',
      allowedTrafficSources: [],
      allowedApps: [],
      antifraudEnabled: true,
      autoApprovePartners: false,
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: CreateOfferFormData) => {
      // Transform the data to match the API schema
      const transformedData = {
        ...data,
        trafficSources: data.allowedTrafficSources || [],
        allowedApps: data.allowedApps || [],
      };
      console.log('Sending offer data:', transformedData);
      return await apiRequest('POST', '/api/admin/offers', transformedData);
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
    'pop_traffic', 'email_marketing', 'seo_organic', 'mobile_app', 'influencer', 'teaser_networks', 'uac', 'pps', 'kmc', 'other'
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
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Статус</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="pending">Ожидает</SelectItem>
                    <SelectItem value="active">Активный</SelectItem>
                    <SelectItem value="paused">Остановлен</SelectItem>
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

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Логотип оффера</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Проверяем размер файла (максимум 2MB)
                        if (file.size > 2 * 1024 * 1024) {
                          alert('Размер файла слишком большой. Максимум 2MB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          field.onChange(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    data-testid="input-logo" 
                  />
                  {field.value && (
                    <div className="flex items-center gap-3">
                      <img src={field.value} alt="Логотип" className="h-16 w-16 object-cover rounded border" />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => field.onChange('')}
                      >
                        Удалить логотип
                      </Button>
                    </div>
                  )}
                </div>
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
              <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <FormField
                    control={form.control}
                    name={`landingPages.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Название лендинга</FormLabel>
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
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
                          <Input {...field} placeholder="US, GB, DE" data-testid={`input-landing-geo-${index}`} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
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

        <div className="space-y-4">
          <Label className="text-base font-medium">Разрешенные приложения</Label>
          <FormField
            control={form.control}
            name="allowedApps"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="space-y-3">
                    <Select 
                      onValueChange={(value) => {
                        const current = (field.value as string[]) || [];
                        if (!current.includes(value)) {
                          field.onChange([...current, value]);
                        }
                      }}
                    >
                      <SelectTrigger data-testid="select-allowed-apps">
                        <SelectValue placeholder="Выберите приложение" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PWA apps">PWA приложения</SelectItem>
                        <SelectItem value="WebView apps">WebView приложения</SelectItem>
                        <SelectItem value="Native Android (.apk) apps">Android приложения (.apk)</SelectItem>
                        <SelectItem value="iOS apps">iOS приложения</SelectItem>
                        <SelectItem value="Mobile apps">Мобильные приложения</SelectItem>
                        <SelectItem value="Desktop apps">Настольные приложения</SelectItem>
                        <SelectItem value="Web apps">Веб приложения</SelectItem>
                        <SelectItem value="Telegram bots">Telegram боты</SelectItem>
                        <SelectItem value="Browser extensions">Браузерные расширения</SelectItem>
                        <SelectItem value="Chrome extensions">Расширения Chrome</SelectItem>
                        <SelectItem value="Firefox extensions">Расширения Firefox</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Введите своё приложение"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();
                            if (value) {
                              const current = field.value || [];
                              if (!current.includes(value)) {
                                field.onChange([...current, value]);
                              }
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                        data-testid="input-custom-app"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          const value = input.value.trim();
                          if (value) {
                            const current = (field.value as string[]) || [];
                            if (!current.includes(value)) {
                              field.onChange([...current, value]);
                            }
                            input.value = '';
                          }
                        }}
                        data-testid="button-add-custom-app"
                      >
                        Добавить
                      </Button>
                    </div>
                    
                    {field.value && (field.value as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(field.value as string[]).map((app: string, index: number) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {app}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => {
                                const current = (field.value as string[]) || [];
                                field.onChange(current.filter((_: string, i: number) => i !== index));
                              }}
                            >
                              ×
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
  logo?: string;
  category: string;
  vertical: string;
  goals: string;
  advertiserId: string;
  advertiserName?: string;
  payout: string;
  payoutType: string;
  currency: string;
  countries: string[];
  landingPages?: Array<{
    name: string;
    url: string;
    payoutAmount: number;
    currency: string;
    geo?: string;
  }>;
  geoPricing?: Array<{
    geo: string;
    payout: number;
    currency: string;
  }>;
  trafficSources: string[];
  allowedApps?: string[];
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
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusChangeOffer, setStatusChangeOffer] = useState<Offer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [moderationFilter, setModerationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [advertiserFilter, setAdvertiserFilter] = useState('all');

  // Fetch offers
  const { data: offers = [], isLoading: offersLoading } = useQuery({
    queryKey: ['/api/admin/offers'],
    select: (data: Offer[]) => data
      // Сначала сортируем по дате создания (новые вверху)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      // Затем фильтруем
      .filter(offer => {
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

  // Delete offer mutation
  const deleteOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/offers/${offerId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      toast({
        title: "Успех",
        description: "Оффер успешно удален",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить оффер",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string, moderationStatus: string, isBlocked: boolean, isArchived: boolean) => {
    if (isArchived) return <Badge variant="secondary">{t('archived')}</Badge>;
    if (isBlocked) return <Badge variant="destructive">{t('blocked')}</Badge>;
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Активен</Badge>;
      case 'paused':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Остановлен</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Ожидает</Badge>;
      case 'draft':
        return <Badge variant="outline">Черновик</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Change status mutation
  const changeStatusMutation = useMutation({
    mutationFn: async ({ offerId, status }: { offerId: string; status: string }) => {
      const response = await apiRequest('PUT', `/api/admin/offers/${offerId}`, { status });
      return await response.json();
    },
    onSuccess: (updatedOffer) => {
      // Update the cache directly instead of invalidating to preserve order
      queryClient.setQueryData(['/api/admin/offers'], (oldOffers: any[]) => {
        if (!oldOffers) return oldOffers;
        return oldOffers.map(offer => 
          offer.id === updatedOffer.id ? { ...offer, status: updatedOffer.status } : offer
        );
      });
      setIsStatusDialogOpen(false);
      setStatusChangeOffer(null);
      toast({
        title: 'Успешно',
        description: 'Статус оффера изменен',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: "destructive",
      });
    }
  });

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
                <SelectItem value="paused">Остановлен</SelectItem>
                <SelectItem value="pending">Ожидает</SelectItem>
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
                  <TableHead>Источники трафика</TableHead>
                  <TableHead>Разрешенные приложения</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('created')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {offer.logo && (
                          <img 
                            src={offer.logo} 
                            alt={offer.name}
                            className="w-8 h-8 rounded object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <div 
                            className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                            onClick={() => setSelectedOffer(offer)}
                            data-testid={`link-offer-name-${offer.id}`}
                            title="Открыть детали оффера"
                          >
                            {offer.name}
                          </div>
                          <div className="text-sm text-muted-foreground truncate max-w-48">
                            {offer.description}
                          </div>
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
                      {(() => {
                        // Цвета для категорий офферов
                        const getCategoryColor = (category: string) => {
                          switch (category?.toLowerCase()) {
                            case 'gambling': return 'bg-red-100 text-red-800 border-red-200';
                            case 'finance': return 'bg-green-100 text-green-800 border-green-200';
                            case 'nutra': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                            case 'dating': return 'bg-pink-100 text-pink-800 border-pink-200';
                            case 'sweepstakes': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                            case 'crypto': return 'bg-orange-100 text-orange-800 border-orange-200';
                            case 'e-commerce': return 'bg-blue-100 text-blue-800 border-blue-200';
                            case 'mobile': return 'bg-purple-100 text-purple-800 border-purple-200';
                            case 'games': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                            case 'software': return 'bg-gray-100 text-gray-800 border-gray-200';
                            default: return 'bg-slate-100 text-slate-800 border-slate-200';
                          }
                        };
                        const categoryColor = getCategoryColor(offer.category);
                        const categoryLabels: {[key: string]: string} = {
                          'gambling': 'Гемблинг',
                          'finance': 'Финансы',
                          'nutra': 'Нутра',
                          'dating': 'Знакомства',
                          'sweepstakes': 'Лотереи',
                          'crypto': 'Криптовалюты',
                          'e-commerce': 'E-commerce',
                          'mobile': 'Мобильные',
                          'games': 'Игры',
                          'software': 'ПО'
                        };
                        const categoryLabel = categoryLabels[offer.category] || offer.category;
                        return (
                          <Badge className={`${categoryColor} border text-xs`}>
                            {categoryLabel}
                          </Badge>
                        );
                      })()}
                      {offer.vertical && (
                        <div className="text-xs text-muted-foreground mt-1">{offer.vertical}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {offer.landingPages && offer.landingPages.length > 0 ? (
                        <div>
                          <div className="text-xs font-bold text-green-600 uppercase mb-1">
                            {offer.payoutType}
                          </div>
                          <div className={`text-sm font-medium ${offer.landingPages?.length >= 3 ? 'grid grid-cols-2 gap-1' : 'space-x-1'}`}>
                            {offer.landingPages?.map((landing, index) => {
                              const countryFlags: {[key: string]: string} = {
                                'us': '🇺🇸',
                                'gb': '🇬🇧', 
                                'uk': '🇬🇧',
                                'it': '🇮🇹',
                                'de': '🇩🇪',
                                'fr': '🇫🇷',
                                'es': '🇪🇸',
                                'ca': '🇨🇦',
                                'au': '🇦🇺',
                                'br': '🇧🇷',
                                'mx': '🇲🇽',
                                'jp': '🇯🇵',
                                'kr': '🇰🇷',
                                'in': '🇮🇳',
                                'ru': '🇷🇺',
                                'cn': '🇨🇳'
                              };
                              const flag = countryFlags[landing.geo?.toLowerCase() || ''] || '🌍';
                              const geo = (landing.geo || 'XX').toUpperCase();
                              const currencySymbols: {[key: string]: string} = {
                                'USD': '$',
                                'EUR': '€',
                                'GBP': '£',
                                'RUB': '₽',
                                'JPY': '¥',
                                'CNY': '¥',
                                'KRW': '₩',
                                'INR': '₹',
                                'CAD': 'C$',
                                'AUD': 'A$',
                                'BRL': 'R$',
                                'MXN': '$'
                              };
                              const currencySymbol = currencySymbols[landing.currency] || landing.currency;
                              return (
                                <span key={index} className={`text-xs ${(offer.landingPages?.length || 0) >= 3 ? 'block' : 'inline-block mr-1'}`}>
                                  {flag}{geo}-{landing.payoutAmount}{currencySymbol}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs font-bold text-green-600 uppercase mb-1">
                            {offer.payoutType}
                          </div>
                          <div className="font-medium">${offer.payout}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        {/* Traffic Sources */}
                        {offer.trafficSources && offer.trafficSources.length > 0 ? (
                          <div className="space-y-1">
                            {/* Группируем источники по 2 в ряд */}
                            {Array.from({ length: Math.ceil(Math.min(offer.trafficSources.length, 4) / 2) }, (_, rowIndex) => (
                              <div key={rowIndex} className="flex gap-1">
                                {offer.trafficSources.slice(rowIndex * 2, (rowIndex + 1) * 2).map((source, index) => {
                                  const trafficSourceLabels: {[key: string]: string} = {
                                    'facebook_ads': 'Facebook',
                                    'google_ads': 'Google',
                                    'instagram_ads': 'Instagram',
                                    'tiktok_ads': 'TikTok',
                                    'youtube_ads': 'YouTube',
                                    'twitter_ads': 'Twitter',
                                    'linkedin_ads': 'LinkedIn',
                                    'pinterest_ads': 'Pinterest',
                                    'snapchat_ads': 'Snapchat',
                                    'reddit_ads': 'Reddit',
                                    'mytarget': 'MyTarget',
                                    'push_traffic': 'Push',
                                    'inpage_push': 'InPage',
                                    'calendar_push': 'Calendar',
                                    'sms_push': 'SMS Push',
                                    'outbrain': 'Outbrain',
                                    'taboola': 'Taboola',
                                    'mgid': 'MGID',
                                    'revcontent': 'RevContent',
                                    'adnow': 'AdNow',
                                    'pop_traffic': 'Pop',
                                    'email_marketing': 'Email',
                                    'seo_organic': 'SEO',
                                    'mobile_app': 'Mobile',
                                    'influencer': 'Influencer',
                                    'teaser_networks': 'Teaser',
                                    'uac': 'UAC',
                                    'pps': 'PPS',
                                    'kmc': 'KMC',
                                    'other': 'Other'
                                  };
                                  const sourceLabel = trafficSourceLabels[source] || source;
                                  
                                  // Цвета для разных типов источников трафика
                                  const getTrafficSourceColor = (source: string) => {
                                    if (source.includes('facebook') || source.includes('instagram')) return 'bg-blue-100 text-blue-800';
                                    if (source.includes('google') || source.includes('youtube')) return 'bg-red-100 text-red-800';
                                    if (source.includes('tiktok')) return 'bg-black text-white';
                                    if (source.includes('twitter') || source.includes('linkedin')) return 'bg-cyan-100 text-cyan-800';
                                    if (source.includes('pinterest')) return 'bg-red-100 text-red-800';
                                    if (source.includes('snapchat')) return 'bg-yellow-100 text-yellow-800';
                                    if (source.includes('push') || source.includes('pop')) return 'bg-orange-100 text-orange-800';
                                    if (source.includes('email') || source.includes('sms')) return 'bg-green-100 text-green-800';
                                    if (source.includes('outbrain') || source.includes('taboola') || source.includes('mgid') || source.includes('revcontent') || source.includes('adnow')) return 'bg-purple-100 text-purple-800';
                                    if (source.includes('seo') || source.includes('organic')) return 'bg-emerald-100 text-emerald-800';
                                    if (source.includes('influencer') || source.includes('teaser')) return 'bg-pink-100 text-pink-800';
                                    return 'bg-gray-100 text-gray-800';
                                  };
                                  
                                  const colorClass = getTrafficSourceColor(source);
                                  
                                  return (
                                    <Badge key={rowIndex * 2 + index} className={`text-xs whitespace-nowrap ${colorClass} border-0`}>
                                      {sourceLabel}
                                    </Badge>
                                  );
                                })}
                              </div>
                            ))}
                            {offer.trafficSources.length > 4 && (
                              <div className="text-muted-foreground text-xs">+{offer.trafficSources.length - 4} еще</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Не указано</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        {/* Allowed Apps */}
                        {offer.allowedApps && Array.isArray(offer.allowedApps) && offer.allowedApps.length > 0 ? (
                          <div className="space-y-1">
                            {/* Группируем приложения по 2 в ряд */}
                            {Array.from({ length: Math.ceil(Math.min(offer.allowedApps?.length || 0, 4) / 2) }, (_, rowIndex) => (
                              <div key={rowIndex} className="flex gap-1">
                                {(offer.allowedApps || []).slice(rowIndex * 2, (rowIndex + 1) * 2).map((app: string, index: number) => {
                                  const appLabels: {[key: string]: string} = {
                                    'PWA apps': 'PWA',
                                    'WebView apps': 'WebView',
                                    'Native Android (.apk) apps': 'Android',
                                    'iOS apps': 'iOS',
                                    'Mobile apps': 'Mobile',
                                    'Desktop apps': 'Desktop',
                                    'Web apps': 'Web',
                                    'Telegram bots': 'Telegram',
                                    'Browser extensions': 'Extensions',
                                    'Chrome extensions': 'Chrome Ext',
                                    'Firefox extensions': 'Firefox Ext'
                                  };
                                  const appLabel = appLabels[app] || app;
                                  const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-orange-100 text-orange-800'];
                                  const colorClass = colors[(rowIndex * 2 + index) % colors.length];
                                  return (
                                    <Badge key={rowIndex * 2 + index} className={`text-xs whitespace-nowrap ${colorClass} border-0`}>
                                      {appLabel}
                                    </Badge>
                                  );
                                })}
                              </div>
                            ))}
                            {(offer.allowedApps?.length || 0) > 4 && (
                              <div className="text-muted-foreground text-xs">+{(offer.allowedApps?.length || 0) - 4} еще</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Не указано</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div 
                        className="cursor-pointer"
                        onClick={() => {
                          setStatusChangeOffer(offer);
                          setIsStatusDialogOpen(true);
                        }}
                      >
                        {getStatusBadge(offer.status, offer.moderationStatus, offer.isBlocked, offer.isArchived)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOffer(offer)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          data-testid={`button-view-offer-${offer.id}`}
                          title="Открыть детали"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setIsEditDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/20"
                          data-testid={`button-edit-offer-${offer.id}`}
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Вы уверены, что хотите удалить этот оффер?')) {
                              deleteOfferMutation.mutate(offer.id);
                            }
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                          data-testid={`button-delete-offer-${offer.id}`}
                          disabled={deleteOfferMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
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
                {selectedOffer.logo && (
                  <div>
                    <Label>Логотип</Label>
                    <div className="mt-2">
                      <img 
                        src={selectedOffer.logo} 
                        alt={selectedOffer.name}
                        className="w-16 h-16 rounded object-cover border"
                      />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('category')}</Label>
                    <div className="font-medium">
                      {(() => {
                        // Цвета для категорий офферов
                        const getCategoryColor = (category: string) => {
                          switch (category?.toLowerCase()) {
                            case 'gambling': return 'bg-red-100 text-red-800 border-red-200';
                            case 'finance': return 'bg-green-100 text-green-800 border-green-200';
                            case 'nutra': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                            case 'dating': return 'bg-pink-100 text-pink-800 border-pink-200';
                            case 'sweepstakes': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                            case 'crypto': return 'bg-orange-100 text-orange-800 border-orange-200';
                            case 'e-commerce': return 'bg-blue-100 text-blue-800 border-blue-200';
                            case 'mobile': return 'bg-purple-100 text-purple-800 border-purple-200';
                            case 'games': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                            case 'software': return 'bg-gray-100 text-gray-800 border-gray-200';
                            default: return 'bg-slate-100 text-slate-800 border-slate-200';
                          }
                        };
                        const categoryColor = getCategoryColor(selectedOffer.category);
                        const categoryLabels: {[key: string]: string} = {
                          'gambling': 'Гемблинг',
                          'finance': 'Финансы',
                          'nutra': 'Нутра',
                          'dating': 'Знакомства',
                          'sweepstakes': 'Лотереи',
                          'crypto': 'Криптовалюты',
                          'e-commerce': 'E-commerce',
                          'mobile': 'Мобильные',
                          'games': 'Игры',
                          'software': 'ПО'
                        };
                        const categoryLabel = categoryLabels[selectedOffer.category] || selectedOffer.category;
                        return (
                          <Badge className={`${categoryColor} border inline-block`}>
                            {categoryLabel}
                          </Badge>
                        );
                      })()}
                    </div>
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

                {selectedOffer.landingPages && selectedOffer.landingPages.length > 0 && (
                  <div>
                    <Label>Лендинги и цены по гео</Label>
                    <div className="mt-2 space-y-2">
                      {selectedOffer.landingPages.map((landing, index) => {
                        const countryFlags: {[key: string]: string} = {
                          'us': '🇺🇸',
                          'gb': '🇬🇧', 
                          'uk': '🇬🇧',
                          'it': '🇮🇹',
                          'de': '🇩🇪',
                          'fr': '🇫🇷',
                          'es': '🇪🇸',
                          'ca': '🇨🇦',
                          'au': '🇦🇺',
                          'br': '🇧🇷',
                          'mx': '🇲🇽',
                          'jp': '🇯🇵',
                          'kr': '🇰🇷',
                          'in': '🇮🇳',
                          'ru': '🇷🇺',
                          'cn': '🇨🇳'
                        };
                        const flag = countryFlags[landing.geo?.toLowerCase() || ''] || '🌍';
                        const geo = (landing.geo || 'XX').toUpperCase();
                        const currencySymbols: {[key: string]: string} = {
                          'USD': '$',
                          'EUR': '€',
                          'GBP': '£',
                          'RUB': '₽',
                          'JPY': '¥',
                          'CNY': '¥',
                          'KRW': '₩',
                          'INR': '₹',
                          'CAD': 'C$',
                          'AUD': 'A$',
                          'BRL': 'R$',
                          'MXN': '$'
                        };
                        const currencySymbol = currencySymbols[landing.currency] || landing.currency;
                        
                        return (
                          <div key={index} className="border rounded p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  <span>{flag} {geo}</span>
                                  <span>{landing.name}</span>
                                </div>
                                <div className="text-sm text-muted-foreground break-all">{landing.url}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-lg">{flag}{geo}-{landing.payoutAmount}{currencySymbol}</div>
                                <div className="text-sm text-muted-foreground">{landing.currency}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div>
                  <Label>{t('landing_page')}</Label>
                  <div className="font-medium break-all">{selectedOffer.landingPageUrl || 'Не указано'}</div>
                </div>
                
                {selectedOffer.trafficSources && selectedOffer.trafficSources.length > 0 && (
                  <div>
                    <Label>Разрешенные источники трафика</Label>
                    <div className="mt-2 space-y-2">
                      {/* Группируем источники по 2 в ряд */}
                      {Array.from({ length: Math.ceil(selectedOffer.trafficSources.length / 2) }, (_, rowIndex) => (
                        <div key={rowIndex} className="flex gap-2">
                          {selectedOffer.trafficSources.slice(rowIndex * 2, (rowIndex + 1) * 2).map((source, index) => {
                            const trafficSourceLabels: {[key: string]: string} = {
                              'facebook_ads': 'Facebook Ads',
                              'google_ads': 'Google Ads',
                              'instagram_ads': 'Instagram Ads',
                              'tiktok_ads': 'TikTok Ads',
                              'youtube_ads': 'YouTube Ads',
                              'twitter_ads': 'Twitter Ads',
                              'linkedin_ads': 'LinkedIn Ads',
                              'pinterest_ads': 'Pinterest Ads',
                              'snapchat_ads': 'Snapchat Ads',
                              'reddit_ads': 'Reddit Ads',
                              'mytarget': 'MyTarget',
                              'push_traffic': 'Push трафик',
                              'inpage_push': 'InPage Push',
                              'calendar_push': 'Calendar Push',
                              'sms_push': 'SMS Push',
                              'outbrain': 'Outbrain',
                              'taboola': 'Taboola',
                              'mgid': 'MGID',
                              'revcontent': 'RevContent',
                              'adnow': 'AdNow',
                              'pop_traffic': 'Pop трафик',
                              'email_marketing': 'Email маркетинг',
                              'seo_organic': 'SEO органический',
                              'mobile_app': 'Мобильные приложения',
                              'influencer': 'Инфлюенсер маркетинг',
                              'teaser_networks': 'Тизерные сети',
                              'uac': 'UAC',
                              'pps': 'PPS',
                              'kmc': 'KMC',
                              'other': 'Другое'
                            };
                            const sourceLabel = trafficSourceLabels[source] || source;
                            
                            // Цвета для разных типов источников трафика
                            const getTrafficSourceColor = (source: string) => {
                              if (source.includes('facebook') || source.includes('instagram')) return 'bg-blue-100 text-blue-800 border-blue-200';
                              if (source.includes('google') || source.includes('youtube')) return 'bg-red-100 text-red-800 border-red-200';
                              if (source.includes('tiktok')) return 'bg-gray-800 text-white border-gray-900';
                              if (source.includes('twitter') || source.includes('linkedin')) return 'bg-cyan-100 text-cyan-800 border-cyan-200';
                              if (source.includes('pinterest')) return 'bg-red-100 text-red-800 border-red-200';
                              if (source.includes('snapchat')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                              if (source.includes('push') || source.includes('pop')) return 'bg-orange-100 text-orange-800 border-orange-200';
                              if (source.includes('email') || source.includes('sms')) return 'bg-green-100 text-green-800 border-green-200';
                              if (source.includes('outbrain') || source.includes('taboola') || source.includes('mgid') || source.includes('revcontent') || source.includes('adnow')) return 'bg-purple-100 text-purple-800 border-purple-200';
                              if (source.includes('seo') || source.includes('organic')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                              if (source.includes('influencer') || source.includes('teaser')) return 'bg-pink-100 text-pink-800 border-pink-200';
                              if (source.includes('mytarget') || source.includes('reddit')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                              return 'bg-gray-100 text-gray-800 border-gray-200';
                            };
                            
                            const colorClass = getTrafficSourceColor(source);
                            
                            return (
                              <Badge key={rowIndex * 2 + index} className={`${colorClass} border`}>
                                {sourceLabel}
                              </Badge>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedOffer.allowedApps && Array.isArray(selectedOffer.allowedApps) && selectedOffer.allowedApps.length > 0 && (
                  <div>
                    <Label>Разрешенные приложения</Label>
                    <div className="mt-2 space-y-2">
                      {/* Группируем приложения по 2 в ряд */}
                      {Array.from({ length: Math.ceil((selectedOffer.allowedApps?.length || 0) / 2) }, (_, rowIndex) => (
                        <div key={rowIndex} className="flex gap-2">
                          {(selectedOffer.allowedApps || []).slice(rowIndex * 2, (rowIndex + 1) * 2).map((app: string, index: number) => {
                            const appLabels: {[key: string]: string} = {
                              'PWA apps': 'PWA приложения',
                              'WebView apps': 'WebView приложения',
                              'Native Android (.apk) apps': 'Android приложения (.apk)',
                              'iOS apps': 'iOS приложения',
                              'Mobile apps': 'Мобильные приложения',
                              'Desktop apps': 'Настольные приложения',
                              'Web apps': 'Веб приложения',
                              'Telegram bots': 'Telegram боты',
                              'Browser extensions': 'Браузерные расширения',
                              'Chrome extensions': 'Расширения Chrome',
                              'Firefox extensions': 'Расширения Firefox'
                            };
                            const appLabel = appLabels[app] || app;
                            const colors = ['bg-blue-100 text-blue-800 border-blue-200', 'bg-green-100 text-green-800 border-green-200', 'bg-purple-100 text-purple-800 border-purple-200', 'bg-orange-100 text-orange-800 border-orange-200', 'bg-red-100 text-red-800 border-red-200', 'bg-indigo-100 text-indigo-800 border-indigo-200'];
                            const colorClass = colors[(rowIndex * 2 + index) % colors.length];
                            return (
                              <Badge key={rowIndex * 2 + index} className={`${colorClass} border`}>
                                {appLabel}
                              </Badge>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
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

      {/* Status Change Modal */}
      {statusChangeOffer && (
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Изменить статус оффера</DialogTitle>
              <DialogDescription>
                Выберите новый статус для оффера "{statusChangeOffer.name}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={statusChangeOffer.status === 'active' ? 'default' : 'outline'}
                  className={statusChangeOffer.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'border-green-500 text-green-600 hover:bg-green-50'}
                  onClick={() => changeStatusMutation.mutate({ offerId: statusChangeOffer.id, status: 'active' })}
                  disabled={changeStatusMutation.isPending}
                  data-testid="button-status-active"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Активен
                  </div>
                </Button>
                
                <Button
                  variant={statusChangeOffer.status === 'paused' ? 'default' : 'outline'}
                  className={statusChangeOffer.status === 'paused' ? 'bg-red-500 hover:bg-red-600' : 'border-red-500 text-red-600 hover:bg-red-50'}
                  onClick={() => changeStatusMutation.mutate({ offerId: statusChangeOffer.id, status: 'paused' })}
                  disabled={changeStatusMutation.isPending}
                  data-testid="button-status-paused"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Остановлен
                  </div>
                </Button>
                
                <Button
                  variant={statusChangeOffer.status === 'pending' ? 'default' : 'outline'}
                  className={statusChangeOffer.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'}  
                  onClick={() => changeStatusMutation.mutate({ offerId: statusChangeOffer.id, status: 'pending' })}
                  disabled={changeStatusMutation.isPending}
                  data-testid="button-status-pending"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    Ожидает
                  </div>
                </Button>
                
                <Button
                  variant={statusChangeOffer.status === 'draft' ? 'default' : 'outline'}
                  onClick={() => changeStatusMutation.mutate({ offerId: statusChangeOffer.id, status: 'draft' })}
                  disabled={changeStatusMutation.isPending}
                  data-testid="button-status-draft"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    Черновик
                  </div>
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Текущий статус: <strong>{statusChangeOffer.status}</strong>
              </div>
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