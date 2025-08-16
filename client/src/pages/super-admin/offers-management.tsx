import { useState, useEffect, useMemo, useCallback } from 'react';
import * as React from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Removed old language context import
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import Sidebar from '../../components/layout/sidebar';
import { useSidebar } from '../../contexts/sidebar-context';
import { useAuth } from '../../contexts/auth-context';
import Header from '../../components/layout/header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Search, Filter, Eye, Edit, Ban, Archive, CheckCircle, XCircle, AlertTriangle, Download, Upload, Plus, Trash2, PlusCircle, Check, Play, Pause, Copy } from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Checkbox } from '../../components/ui/checkbox';

const createOfferSchema = z.object({
  name: z.string().min(1, 'Название оффера обязательно'),
  category: z.string().min(1, 'Категория обязательна'),
  description_ru: z.string().optional(),
  description_en: z.string().optional(),
  goals_ru: z.string().optional(),
  goals_en: z.string().optional(),
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
  kpiConditions_ru: z.string().optional(),
  kpiConditions_en: z.string().optional(),
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
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<CreateOfferFormData>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      name: '',
      category: '',
      description_ru: '',
      description_en: '',
      goals_ru: '',
      goals_en: '',
      logo: '',
      status: 'draft',
      landingPages: [{ name: 'Основная страница', url: '', payoutAmount: 0, currency: 'USD', geo: '' }],
      payoutType: 'cpa',
      currency: 'USD',
      kpiConditions_ru: '',
      kpiConditions_en: '',
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
        description: {
          ru: data.description_ru || '',
          en: data.description_en || ''
        },
        goals: {
          ru: data.goals_ru || '',
          en: data.goals_en || ''
        },
        kpiConditions: {
          ru: data.kpiConditions_ru || '',
          en: data.kpiConditions_en || ''
        },
        trafficSources: data.allowedTrafficSources || [],
        allowedApps: data.allowedApps || [],
      };
      console.log('Sending offer data:', transformedData);
      return await apiRequest('/api/admin/offers', 'POST', transformedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      toast({
        title: t('success'),
        description: t('offer_created_successfully'),
      });
      onSuccess();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message || t('failed_to_create_offer'),
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
              <FormLabel>{t('offer_name')} *</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('offer_name_placeholder')} data-testid="input-offer-name" />
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
                <FormLabel>{t('category')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder={t('select_category')} />
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
                <FormLabel>{t('status')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">{t('draft')}</SelectItem>
                    <SelectItem value="pending">{t('waiting')}</SelectItem>
                    <SelectItem value="active">{t('active')}</SelectItem>
                    <SelectItem value="paused">{t('paused')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">{t('description')}</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="description_ru"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание (Русский)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Описание оффера на русском языке" rows={3} data-testid="textarea-description-ru" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (English)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Offer description in English" rows={3} data-testid="textarea-description-en" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('offer_logo')}</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            // Проверяем размер файла (максимум 2MB)
                            if (file.size > 2 * 1024 * 1024) {
                              alert(t('file_size_too_large'));
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              field.onChange(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      data-testid="button-choose-logo"
                    >
                      {t('choose_file')}
                    </Button>
                    {field.value && (
                      <span className="text-sm text-muted-foreground">{t('file_selected')}</span>
                    )}
                  </div>
                  {field.value && (
                    <div className="flex items-center gap-3">
                      <img src={field.value} alt={t('logo')} className="h-16 w-16 object-cover rounded border" />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => field.onChange('')}
                        title={t('remove_logo')}
                      >
                        {t('remove_logo')}
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
            <Label className="text-base font-medium">{t('landing_pages')}</Label>
            <Button 
              type="button" 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              size="sm"
              onClick={() => {
                const current = form.getValues('landingPages');
                form.setValue('landingPages', [...current, { name: '', url: '', payoutAmount: 0, currency: 'USD', geo: '' }]);
              }}
              data-testid="button-add-landing-page"
              title="Добавить новую посадочную страницу"
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
                        <FormLabel className="text-sm">{t('landing_name')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('main_page')} data-testid={`input-landing-name-${index}`} />
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
                          <Input {...field} placeholder={t('url_placeholder')} data-testid={`input-landing-url-${index}`} />
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
                        <FormLabel className="text-sm">{t('payout_amount')}</FormLabel>
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
                        <FormLabel className="text-sm">{t('currency')}</FormLabel>
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
                        <FormLabel className="text-sm">{t('geo')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('geo_placeholder')} data-testid={`input-landing-geo-${index}`} />
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
                        title={t('remove_landing_page')}
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
                <FormLabel>{t('payout_type')} ({t('default')})</FormLabel>
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
                <FormLabel>{t('default_currency')}</FormLabel>
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



        <div className="space-y-4">
          <Label className="text-base font-medium">{t('kpi_conditions')}</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="kpiConditions_ru"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI условия (Русский)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Условия KPI на русском языке"
                      rows={2}
                      data-testid="textarea-kpi-conditions-ru"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kpiConditions_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI Conditions (English)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="KPI conditions in English"
                      rows={2}
                      data-testid="textarea-kpi-conditions-en"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">{t('offer_goals')}</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="goals_ru"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цели (Русский)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Цели оффера на русском языке"
                      rows={2}
                      data-testid="textarea-goals-ru"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goals_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goals (English)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Offer goals in English"
                      rows={2}
                      data-testid="textarea-goals-en"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>



        <div className="space-y-4">
          <Label className="text-base font-medium">{t('allowed_traffic_sources')}</Label>
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
          <Label className="text-base font-medium">{t('allowed_apps')}</Label>
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
                        <SelectValue placeholder={t('select_app')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PWA apps">{t('pwa_apps')}</SelectItem>
                        <SelectItem value="WebView apps">{t('webview_apps')}</SelectItem>
                        <SelectItem value="Native Android (.apk) apps">{t('android_apps')}</SelectItem>
                        <SelectItem value="iOS apps">{t('ios_apps')}</SelectItem>
                        <SelectItem value="Mobile apps">{t('mobile_apps')}</SelectItem>
                        <SelectItem value="Desktop apps">{t('desktop_apps')}</SelectItem>
                        <SelectItem value="Web apps">{t('web_apps')}</SelectItem>
                        <SelectItem value="Telegram bots">{t('telegram_bots')}</SelectItem>
                        <SelectItem value="Browser extensions">{t('browser_extensions')}</SelectItem>
                        <SelectItem value="Chrome extensions">{t('chrome_extensions')}</SelectItem>
                        <SelectItem value="Firefox extensions">{t('firefox_extensions')}</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Input 
                        placeholder={t('custom_app_placeholder')}
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
                        {t('add')}
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
                <FormLabel>{t('daily_limit')}</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder={t('unlimited')} 
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
                <FormLabel>{t('monthly_limit')}</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder={t('unlimited')} 
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
                  <FormLabel className="text-base">{t('antifraud_enabled')}</FormLabel>
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
                  <FormLabel className="text-base">{t('auto_approve_partners')}</FormLabel>
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
            {t('cancel')}
          </Button>
          <Button 
            type="submit" 
            disabled={createOfferMutation.isPending}
            data-testid="button-submit-offer"
          >
            {createOfferMutation.isPending ? t('creating') : t('create_offer')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface Offer {
  id: string;
  name: string;
  description: any; // Multilingual object: { ru: string, en: string }
  logo?: string;
  category: string;
  vertical: string;
  goals: any; // Multilingual object: { ru: string, en: string }
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
  kpiConditions?: any; // Multilingual object: { ru: string, en: string }
  dailyLimit?: number;
  monthlyLimit?: number;
  antifraudEnabled?: boolean;
  autoApprovePartners?: boolean;
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
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { collapsed } = useSidebar();
  
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  
  // Copy URL state
  const [copiedUrls, setCopiedUrls] = useState<{[key: string]: boolean}>({});
  
  // Copy URL function
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrls(prev => ({ ...prev, [id]: true }));
      toast({
        title: "URL скопирован",
        description: "URL успешно скопирован в буфер обмена",
      });
      setTimeout(() => {
        setCopiedUrls(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать URL",
        variant: "destructive"
      });
    }
  };
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [isModerationDialogOpen, setIsModerationDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusChangeOffer, setStatusChangeOffer] = useState<Offer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300мс задержка для поиска
  const [statusFilter, setStatusFilter] = useState('all');

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [advertiserFilter, setAdvertiserFilter] = useState('all');
  const [offerNameSearch, setOfferNameSearch] = useState('all');

  // Fetch all offers for dropdown
  const { data: allOffers = [] } = useQuery<Offer[]>({
    queryKey: ['/api/admin/offers'],
  });

  // Filter and sort offers
  const offers = allOffers
    // Сначала сортируем по дате создания (новые вверху)
    .sort((a: Offer, b: Offer) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    // Затем фильтруем
    .filter((offer: Offer) => {
      const matchesGeneralSearch = !searchTerm || (
        offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof offer.description === 'object' ? 
          (offer.description || '').toLowerCase().includes(searchTerm.toLowerCase()) :
          offer.description?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        offer.advertiserName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesOfferNameSearch = !offerNameSearch || offerNameSearch === 'all' || 
        offer.name === offerNameSearch;
      const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || offer.category === categoryFilter;
      const matchesAdvertiser = advertiserFilter === 'all' || offer.advertiserId === advertiserFilter;
      
      return matchesGeneralSearch && matchesOfferNameSearch && matchesStatus && matchesCategory && matchesAdvertiser;
    });

  const isLoading = !allOffers.length;



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
      const response = await apiRequest(`/api/admin/offers/${offerId}/moderate`, 'POST', {
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

  // Bulk actions mutations
  const bulkActivateMutation = useMutation({
    mutationFn: async (offerIds: string[]) => {
      const response = await apiRequest('/api/admin/offers/bulk-activate', 'POST', { offerIds });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      setSelectedOffers([]);
      setShowBulkActions(false);
      toast({
        title: 'Успех',
        description: `Активировано офферов: ${selectedOffers.length}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось активировать офферы',
        variant: "destructive",
      });
    }
  });

  const bulkPauseMutation = useMutation({
    mutationFn: async (offerIds: string[]) => {
      const response = await apiRequest('/api/admin/offers/bulk-pause', 'POST', { offerIds });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      setSelectedOffers([]);
      setShowBulkActions(false);
      toast({
        title: 'Успех',
        description: `Остановлено офферов: ${selectedOffers.length}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось остановить офферы',
        variant: "destructive",
      });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (offerIds: string[]) => {
      const response = await apiRequest('/api/admin/offers/bulk-delete', 'POST', { offerIds });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      setSelectedOffers([]);
      setShowBulkActions(false);
      toast({
        title: 'Успех',
        description: `Удалено офферов: ${selectedOffers.length}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить офферы',
        variant: "destructive",
      });
    }
  });

  // Handle offer selection
  const handleOfferSelect = (offerId: string, checked: boolean) => {
    if (checked) {
      setSelectedOffers(prev => [...prev, offerId]);
    } else {
      setSelectedOffers(prev => prev.filter(id => id !== offerId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOffers(offers.map(offer => offer.id));
    } else {
      setSelectedOffers([]);
    }
  };

  // Update showBulkActions when selectedOffers changes
  React.useEffect(() => {
    setShowBulkActions(selectedOffers.length > 0);
  }, [selectedOffers]);

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
      const response = await apiRequest(`/api/admin/offers/${offerId}`, 'DELETE');
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

  // Экспорт офферов
  const handleExportOffers = () => {
    try {
      const offersToExport = selectedOffers.length > 0 
        ? offers.filter((offer: any) => selectedOffers.includes(offer.id))
        : offers;
        
      const dataToExport = offersToExport.map(offer => ({
        id: offer.id,
        name: offer.name,
        category: offer.category,
        description: offer.description || '',
        status: offer.status,
        payoutType: offer.payoutType,
        geoPricing: offer.geoPricing,
        landingPages: offer.landingPages,
        allowedTrafficSources: offer.trafficSources,
        allowedApplications: offer.allowedApps,
        kycRequired: offer.kycRequired,
        isPrivate: offer.isPrivate,
        restrictions: offer.restrictions,
        createdAt: offer.createdAt,
        advertiserId: offer.advertiserId
      }));

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `offers_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Успех",
        description: `Экспортировано ${dataToExport.length} офферов`,
      });
      
      // Сбрасываем выбор после экспорта
      setSelectedOffers([]);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать офферы",
        variant: "destructive",
      });
    }
  };



  const isAllSelected = offers.length > 0 && selectedOffers.length === offers.length;
  const isIndeterminate = selectedOffers.length > 0 && selectedOffers.length < offers.length;

  // Импорт офферов
  const handleImportOffers = async (file: File) => {
    try {
      const text = await file.text();
      const importedOffers = JSON.parse(text);
      
      if (!Array.isArray(importedOffers)) {
        throw new Error('Файл должен содержать массив офферов');
      }

      // Отправляем данные на сервер для импорта
      const response = await apiRequest('POST', '/api/admin/offers/import', {
        offers: importedOffers
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
        setIsImportDialogOpen(false);
        toast({
          title: "Успех",
          description: `Импортировано ${importedOffers.length} офферов`,
        });
      } else {
        throw new Error('Ошибка импорта на сервере');
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось импортировать офферы",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, moderationStatus: string, isBlocked: boolean, isArchived: boolean) => {
    if (isArchived) return <Badge variant="secondary">{t('archived')}</Badge>;
    if (isBlocked) return <Badge variant="destructive">{t('blocked')}</Badge>;
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">{t('active')}</Badge>;
      case 'paused':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">{t('paused')}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">{t('pending')}</Badge>;
      case 'draft':
        return <Badge variant="outline">{t('draft')}</Badge>;
      default:
        return <Badge variant="outline">{t(status)}</Badge>;
    }
  };

  // Change status mutation
  const changeStatusMutation = useMutation({
    mutationFn: async ({ offerId, status }: { offerId: string; status: string }) => {
      const response = await apiRequest(`/api/admin/offers/${offerId}`, 'PUT', { status });
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
        title: t('success'),
        description: t('status_changed_successfully'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: t('failed_to_change_status'),
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
    if (!editingOffer) return;
    setEditingOffer({
      ...editingOffer,
      ...updates
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="" subtitle="" />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center p-8">{t('loading')}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header title="" subtitle="" />
        <main className="flex-1 p-6">
          <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OffersManagement</h1>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-offer" title={t('create_offer_button')}>
                <Plus className="w-4 h-4 mr-2" />
                {t('create_offer_button')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('create_new_offer')}</DialogTitle>
                <DialogDescription>
                  {t('fill_offer_information')}
                </DialogDescription>
              </DialogHeader>
              <CreateOfferForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
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
            
            <Select value={offerNameSearch} onValueChange={setOfferNameSearch}>
              <SelectTrigger data-testid="select-offer-name" title={t('offer_name_filter_tooltip')}>
                <SelectValue placeholder={t('all_offers')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_offers')}</SelectItem>
                {allOffers?.map((offer: Offer) => (
                  <SelectItem key={offer.id} value={offer.name}>
                    {offer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter" title={t('status_filter_tooltip')}>
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_statuses_filter')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="paused">{t('paused')}</SelectItem>
                <SelectItem value="pending">{t('waiting')}</SelectItem>
                <SelectItem value="draft">{t('draft')}</SelectItem>
              </SelectContent>
            </Select>



            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="select-category-filter" title={t('category_filter_tooltip')}>
                <SelectValue placeholder={t('category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_categories_filter')}</SelectItem>
                <SelectItem value="gambling">{t('gambling')}</SelectItem>
                <SelectItem value="finance">{t('finance')}</SelectItem>
                <SelectItem value="nutra">{t('nutra')}</SelectItem>
                <SelectItem value="dating">{t('dating')}</SelectItem>
                <SelectItem value="sweepstakes">{t('sweepstakes')}</SelectItem>
                <SelectItem value="crypto">{t('crypto')}</SelectItem>
                <SelectItem value="e-commerce">{t('e_commerce')}</SelectItem>
                <SelectItem value="mobile">{t('mobile')}</SelectItem>
                <SelectItem value="games">{t('games')}</SelectItem>
                <SelectItem value="software">{t('software')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={advertiserFilter} onValueChange={setAdvertiserFilter}>
              <SelectTrigger data-testid="select-advertiser-filter" title={t('advertiser_filter_tooltip')}>
                <SelectValue placeholder={t('advertiser')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_advertisers_filter')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Offers Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('offers')} ({offers.length})</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportOffers}
                className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                data-testid="button-export-offers"
                disabled={offers.length === 0}
                title={t('export_csv_tooltip')}
              >
                <Download className="w-4 h-4 mr-2" />
                {selectedOffers.length > 0 ? `${t('export')} (${selectedOffers.length})` : t('export')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsImportDialogOpen(true)}
                className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                data-testid="button-import-offers"
                title={t('import_csv_tooltip')}
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('import')}
              </Button>

            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions Bar */}
          {showBulkActions && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {t('selected_offers')}: {selectedOffers.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkActivateMutation.mutate(selectedOffers)}
                    disabled={bulkActivateMutation.isPending}
                    className="border-green-600 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    title={t('activate_selected_tooltip')}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    {t('activate')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkPauseMutation.mutate(selectedOffers)}
                    disabled={bulkPauseMutation.isPending}
                    className="border-yellow-600 text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    title={t('pause_selected_tooltip')}
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    {t('pause')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkDeleteMutation.mutate(selectedOffers)}
                    disabled={bulkDeleteMutation.isPending}
                    className="border-red-600 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title={t('delete_selected_tooltip')}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t('delete')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedOffers([]);
                      setShowBulkActions(false);
                    }}
                    className="text-gray-600 hover:text-gray-800"
                    title={t('cancel_selection_tooltip')}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    {t('cancel')}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      data-testid="checkbox-select-all"
                      className={isIndeterminate ? "data-[state=checked]:bg-blue-600" : ""}
                      ref={(el) => {
                        if (el) {
                          (el as any).indeterminate = isIndeterminate;
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>{t('offer_name')}</TableHead>
                  <TableHead>{t('advertiser')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('payout')}</TableHead>
                  <TableHead>{t('traffic_sources_column')}</TableHead>
                  <TableHead>{t('allowed_apps_column')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('created')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOffers.includes(offer.id)}
                        onCheckedChange={(checked) => handleOfferSelect(offer.id, checked as boolean)}
                        data-testid={`checkbox-select-${offer.id}`}
                      />
                    </TableCell>
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
                            onClick={() => setLocation(`/admin/OfferDetails/${offer.id}`)}
                            data-testid={`link-offer-name-${offer.id}`}
                            title="Открыть детали оффера"
                          >
                            {offer.name}
                          </div>
                          <div className="text-sm text-muted-foreground truncate max-w-48">
                            {offer.description || t('not_specified')}
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
                          'gambling': t('gambling'),
                          'finance': t('finance'),
                          'nutra': t('nutra'),
                          'dating': t('dating'),
                          'sweepstakes': t('sweepstakes'),
                          'crypto': t('crypto'),
                          'e-commerce': t('e_commerce'),
                          'mobile': t('mobile'),
                          'games': t('games'),
                          'software': t('software')
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
                              <div className="text-muted-foreground text-xs">+{offer.trafficSources.length - 4} {t('more')}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{t('not_specified')}</span>
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
                              <div className="text-muted-foreground text-xs">+{(offer.allowedApps?.length || 0) - 4} {t('more')}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{t('not_specified')}</span>
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
                          onClick={() => setLocation(`/admin/OfferDetails/${offer.id}`)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          data-testid={`button-view-offer-${offer.id}`}
                          title={t('view_details')}
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingOffer(offer);
                            setIsEditDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/20"
                          data-testid={`button-edit-offer-${offer.id}`}
                          title={t('edit_offer_action')}
                        >
                          <Edit className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(t('confirm_delete_offer'))) {
                              deleteOfferMutation.mutate(offer.id);
                            }
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                          data-testid={`button-delete-offer-${offer.id}`}
                          disabled={deleteOfferMutation.isPending}
                          title={t('delete_offer')}
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
                    <Label>{t('logo')}</Label>
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
                          'gambling': t('gambling'),
                          'finance': t('finance'),
                          'nutra': t('nutra'),
                          'dating': t('dating'),
                          'sweepstakes': t('sweepstakes'),
                          'crypto': t('crypto'),
                          'e-commerce': t('e_commerce'),
                          'mobile': t('mobile'),
                          'games': t('games'),
                          'software': t('software')
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
                              <div className="flex-1 min-w-0">
                                <div className="font-medium flex items-center gap-2">
                                  <span>{flag} {geo}</span>
                                  <span>{landing.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span className="break-all">{landing.url}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                    onClick={() => copyToClipboard(landing.url, `modal-landing-${index}`)}
                                    title="Копировать URL"
                                  >
                                    {copiedUrls[`modal-landing-${index}`] ? (
                                      <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-blue-600" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <div className="text-right ml-4">
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
      {editingOffer && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingOffer(null);
        }}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактировать оффер: {editingOffer.name}</DialogTitle>
              <DialogDescription>
                Полное редактирование всех параметров оффера
              </DialogDescription>
            </DialogHeader>
            {/* Полная форма редактирования оффера */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Название оффера</Label>
                  <Input
                    defaultValue={editingOffer.name}
                    onChange={(e) => handleOfferUpdate({ name: e.target.value })}
                    placeholder="Введите название оффера"
                  />
                </div>
                
                <div>
                  <Label>Категория</Label>
                  <Select 
                    defaultValue={editingOffer.category}
                    onValueChange={(value) => handleOfferUpdate({ category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gambling">Гемблинг</SelectItem>
                      <SelectItem value="finance">Финансы</SelectItem>
                      <SelectItem value="nutra">Нутра</SelectItem>
                      <SelectItem value="dating">Знакомства</SelectItem>
                      <SelectItem value="sweepstakes">Лотереи</SelectItem>
                      <SelectItem value="crypto">Криптовалюты</SelectItem>
                      <SelectItem value="e-commerce">E-commerce</SelectItem>
                      <SelectItem value="mobile">Мобильные</SelectItem>
                      <SelectItem value="gaming">Игры</SelectItem>
                      <SelectItem value="software">ПО</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Описание</Label>
                <Textarea
                  defaultValue={editingOffer.description}
                  onChange={(e) => handleOfferUpdate({ description: e.target.value })}
                  placeholder="Описание оффера"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>Статус</Label>
                  <Select 
                    defaultValue={editingOffer.status}
                    onValueChange={(value) => handleOfferUpdate({ status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активен</SelectItem>
                      <SelectItem value="paused">Остановлен</SelectItem>
                      <SelectItem value="pending">Ожидает</SelectItem>
                      <SelectItem value="draft">Черновик</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Тип выплаты</Label>
                  <Select 
                    defaultValue={editingOffer.payoutType}
                    onValueChange={(value) => handleOfferUpdate({ payoutType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CPA">CPA</SelectItem>
                      <SelectItem value="CPS">CPS</SelectItem>
                      <SelectItem value="CPL">CPL</SelectItem>
                      <SelectItem value="CRL">CRL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Валюта</Label>
                  <Select 
                    defaultValue={editingOffer.currency}
                    onValueChange={(value) => handleOfferUpdate({ currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="RUB">RUB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>URL логотипа</Label>
                <Input
                  defaultValue={editingOffer.logo || ''}
                  onChange={(e) => handleOfferUpdate({ logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <Label>KPI условия</Label>
                <Textarea
                  defaultValue={editingOffer.kpiConditions || ''}
                  onChange={(e) => handleOfferUpdate({ kpiConditions: e.target.value })}
                  placeholder="Условия достижения KPI"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Дневной лимит</Label>
                  <Input
                    type="number"
                    defaultValue={editingOffer.dailyLimit?.toString() || ''}
                    onChange={(e) => handleOfferUpdate({ dailyLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Без ограничений"
                  />
                </div>
                
                <div>
                  <Label>Месячный лимит</Label>
                  <Input
                    type="number"
                    defaultValue={editingOffer.monthlyLimit?.toString() || ''}
                    onChange={(e) => handleOfferUpdate({ monthlyLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Без ограничений"
                  />
                </div>
              </div>

              {/* Источники трафика */}
              <div>
                <Label>Разрешенные источники трафика</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {['Facebook', 'Google', 'TikTok', 'Instagram', 'YouTube', 'Twitter', 'LinkedIn', 'Snapchat', 'Pinterest'].map((source) => (
                    <div key={source} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`traffic-${source}`}
                        checked={editingOffer.trafficSources?.includes(source) || false}
                        onChange={(e) => {
                          const current = editingOffer.trafficSources || [];
                          const updated = e.target.checked 
                            ? [...current, source]
                            : current.filter(s => s !== source);
                          handleOfferUpdate({ trafficSources: updated });
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`traffic-${source}`} className="text-sm">{source}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Разрешенные приложения */}
              <div>
                <Label>Разрешенные приложения</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {['Мобильные приложения', 'Веб-приложения', 'Telegram боты', 'Браузерные расширения', 'Desktop приложения', 'PWA'].map((app) => (
                    <div key={app} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`app-${app}`}
                        checked={editingOffer.allowedApps?.includes(app) || false}
                        onChange={(e) => {
                          const current = editingOffer.allowedApps || [];
                          const updated = e.target.checked 
                            ? [...current, app]
                            : current.filter(a => a !== app);
                          handleOfferUpdate({ allowedApps: updated });
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`app-${app}`} className="text-sm">{app}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Landing Pages */}
              <div>
                <Label>Landing Pages</Label>
                <div className="space-y-3 mt-2">
                  {(editingOffer.landingPages || []).map((lp, index) => (
                    <div key={index} className="space-y-3 p-3 border rounded">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Название"
                          defaultValue={lp.name}
                          onChange={(e) => {
                            const updated = [...(editingOffer.landingPages || [])];
                            updated[index] = { ...lp, name: e.target.value };
                            handleOfferUpdate({ landingPages: updated });
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="URL"
                            defaultValue={lp.url}
                            className="flex-1"
                            onChange={(e) => {
                              const updated = [...(editingOffer.landingPages || [])];
                              updated[index] = { ...lp, url: e.target.value };
                              handleOfferUpdate({ landingPages: updated });
                            }}
                          />
                          {lp.url && (
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                              onClick={() => copyToClipboard(lp.url, `edit-landing-${index}`)}
                              title="Копировать URL"
                            >
                              {copiedUrls[`edit-landing-${index}`] ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-blue-600" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          type="number"
                          placeholder="Сумма"
                          defaultValue={lp.payoutAmount.toString()}
                          onChange={(e) => {
                            const updated = [...(editingOffer.landingPages || [])];
                            updated[index] = { ...lp, payoutAmount: parseFloat(e.target.value) || 0 };
                            handleOfferUpdate({ landingPages: updated });
                          }}
                        />
                        <Input
                          placeholder="GEO"
                          defaultValue={lp.geo}
                          onChange={(e) => {
                            const updated = [...(editingOffer.landingPages || [])];
                            updated[index] = { ...lp, geo: e.target.value };
                            handleOfferUpdate({ landingPages: updated });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const updated = [...(editingOffer.landingPages || []), {
                        name: '',
                        url: '',
                        payoutAmount: 0,
                        currency: editingOffer.currency,
                        geo: ''
                      }];
                      handleOfferUpdate({ landingPages: updated });
                    }}
                    title="Добавить новую лендинг страницу"
                  >
                    Добавить Landing Page
                  </Button>
                </div>
              </div>

              {/* Дополнительные поля */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Ограничения</Label>
                  <Textarea
                    defaultValue={editingOffer.restrictions || ''}
                    onChange={(e) => handleOfferUpdate({ restrictions: e.target.value })}
                    placeholder="Ограничения по траффику"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label>Комментарий модерации</Label>
                  <Textarea
                    defaultValue={editingOffer.moderationComment || ''}
                    onChange={(e) => handleOfferUpdate({ moderationComment: e.target.value })}
                    placeholder="Комментарий модератора"
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Защита от фрода</Label>
                    <div className="text-sm text-muted-foreground">
                      Включить автоматическую защиту от мошенничества
                    </div>
                  </div>
                  <Switch
                    defaultChecked={editingOffer.antifraudEnabled || false}
                    onCheckedChange={(checked) => handleOfferUpdate({ antifraudEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Автоодобрение партнеров</Label>
                    <div className="text-sm text-muted-foreground">
                      Автоматически одобрять новых партнеров
                    </div>
                  </div>
                  <Switch
                    defaultChecked={editingOffer.autoApprovePartners || false}
                    onCheckedChange={(checked) => handleOfferUpdate({ autoApprovePartners: checked })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">KYC обязателен</Label>
                    <div className="text-sm text-muted-foreground">
                      Требовать верификацию партнеров
                    </div>
                  </div>
                  <Switch
                    defaultChecked={editingOffer.kycRequired || false}
                    onCheckedChange={(checked) => handleOfferUpdate({ kycRequired: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Приватный оффер</Label>
                    <div className="text-sm text-muted-foreground">
                      Скрыть от публичного просмотра
                    </div>
                  </div>
                  <Switch
                    defaultChecked={editingOffer.isPrivate || false}
                    onCheckedChange={(checked) => handleOfferUpdate({ isPrivate: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Smartlink</Label>
                    <div className="text-sm text-muted-foreground">
                      Включить умную маршрутизацию
                    </div>
                  </div>
                  <Switch
                    defaultChecked={editingOffer.smartlinkEnabled || false}
                    onCheckedChange={(checked) => handleOfferUpdate({ smartlinkEnabled: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button 
                  onClick={() => {
                    if (editingOffer) {
                      updateOfferMutation.mutate(editingOffer);
                    }
                  }}
                  disabled={updateOfferMutation.isPending}
                >
                  {updateOfferMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Status Change Modal */}
      {statusChangeOffer && (
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('change_offer_status')}</DialogTitle>
              <DialogDescription>
                {t('select_new_status_for')} "{statusChangeOffer.name}"
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
                    {t('active')}
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
                    {t('paused')}
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
                    {t('pending')}
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
                    {t('draft')}
                  </div>
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {t('current_status')}: <strong>{t(statusChangeOffer.status)}</strong>
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

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Импорт офферов</DialogTitle>
            <DialogDescription>
              Выберите JSON файл с офферами для импорта
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="importFile">Файл офферов (JSON)</Label>
              <Input
                id="importFile"
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImportOffers(file);
                  }
                }}
                data-testid="input-import-file"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Файл должен содержать массив объектов офферов в формате JSON.</p>
              <p>Поддерживаемые поля: name, category, description, status, payoutType, geoPricing, и другие.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}