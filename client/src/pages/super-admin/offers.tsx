import { useState } from 'react';
import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { getMultilingualText } from '@/lib/i18n';
import { queryClient } from '@/lib/queryClient';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOfferFrontendSchema } from '@shared/schema';
import { z } from 'zod';
import { Plus, Search, Edit, Trash2, Target, DollarSign, Globe, Eye, Pause, Play, Shield } from 'lucide-react';
import { useLocation } from 'wouter';


export default function OffersManagement() {
  const { token } = useAuth();
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Add global error handler for debugging
  React.useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      console.error('Stack trace:', event.reason?.stack);
      // Don't prevent default to see the actual error
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  const { data: offers, isLoading } = useQuery({
    queryKey: ['/api/admin/offers'],
    queryFn: async () => {
      const response = await window.fetch('/api/admin/offers', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json();
    },
  });

  const { data: advertisers } = useQuery({
    queryKey: ['/api/admin/advertisers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users?role=advertiser', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch advertisers');
      return response.json();
    },
  });

  const createOfferMutation = useMutation({
    mutationKey: ['createOffer'],
    mutationFn: async (offerData: any) => {
      console.log('Creating offer with data:', offerData);
      
      // Use standard fetch with explicit configuration
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(offerData),
      };
      
      const response = await window.fetch('/api/admin/offers', fetchOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Offer created successfully:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      alert('Оффер успешно создан!');
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      console.error('Create offer error:', error);
      alert('Ошибка создания оффера: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    },
  });

  const updateOfferStatusMutation = useMutation({
    mutationFn: async ({ offerId, status }: { offerId: string; status: string }) => {
      const response = await fetch(`/api/admin/offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update offer status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const response = await fetch(`/api/admin/offers/${offerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete offer');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
    },
  });

  const form = useForm<z.infer<typeof createOfferFrontendSchema>>({
    resolver: zodResolver(createOfferFrontendSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      payoutType: 'cpa',
      currency: 'USD',
      status: 'draft',
      antifraudEnabled: true,
      autoApprovePartners: false,
    },
  });

  const filteredOffers = offers?.filter((offer: any) => {
    const matchesSearch = offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || offer.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'archived': return <Trash2 className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header title={t('offers_management')} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('offers_management')}</h1>
                <p className="text-gray-600 dark:text-gray-400">{t('manage_platform_offers')}</p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-offer">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('create_offer')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('create_new_offer')}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      if (createOfferMutation.isPending) return;
                      
                      const formData = new FormData(e.target as HTMLFormElement);
                      const data = {
                        name: formData.get('name') as string,
                        category: formData.get('category') as string,
                        description_ru: formData.get('description_ru') as string || '',
                        description_en: formData.get('description_en') as string || '',
                        goals_ru: formData.get('goals_ru') as string || '',
                        goals_en: formData.get('goals_en') as string || '',
                        logo: formData.get('logo') as string || '',
                        status: formData.get('status') as string,
                        payoutType: formData.get('payoutType') as string,
                        currency: formData.get('currency') as string,
                        kpiConditions_ru: formData.get('kpiConditions_ru') as string || '',
                        kpiConditions_en: formData.get('kpiConditions_en') as string || '',
                        allowedTrafficSources: [formData.get('trafficSource') as string].filter(Boolean),
                        allowedApps: [formData.get('allowedApp') as string].filter(Boolean),
                        antifraudEnabled: formData.get('antifraudEnabled') === 'on',
                        autoApprovePartners: formData.get('autoApprovePartners') === 'on',
                        landingPages: formData.get('landingPageUrl') ? [{
                          name: formData.get('landingPageName') as string || 'Основная страница',
                          url: formData.get('landingPageUrl') as string,
                          payoutAmount: Number(formData.get('landingPagePayout')) || 0,
                          currency: formData.get('currency') as string,
                          geo: formData.get('landingPageGeo') as string || ''
                        }] : []
                      };
                      
                      console.log('Form data:', data);
                      createOfferMutation.mutate(data);
                    }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Название оффера *</label>
                        <input name="name" type="text" required className="w-full p-2 border rounded" placeholder="Введите название оффера" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Описание (RU)</label>
                          <textarea name="description_ru" className="w-full p-2 border rounded" placeholder="Описание на русском"></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Описание (EN)</label>
                          <textarea name="description_en" className="w-full p-2 border rounded" placeholder="Description in English"></textarea>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Цели (RU)</label>
                          <textarea name="goals_ru" className="w-full p-2 border rounded" placeholder="Цели на русском"></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Цели (EN)</label>
                          <textarea name="goals_en" className="w-full p-2 border rounded" placeholder="Goals in English"></textarea>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Категория *</label>
                          <select name="category" required className="w-full p-2 border rounded">
                            <option value="gambling">Gambling</option>
                            <option value="finance">Finance</option>
                            <option value="dating">Dating</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Логотип URL</label>
                          <input name="logo" type="url" className="w-full p-2 border rounded" placeholder="https://example.com/logo.png" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Тип выплаты</label>
                          <select name="payoutType" className="w-full p-2 border rounded">
                            <option value="cpa">CPA</option>
                            <option value="cps">CPS</option>
                            <option value="cpl">CPL</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Валюта</label>
                          <select name="currency" className="w-full p-2 border rounded">
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="RUB">RUB</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Статус</label>
                          <select name="status" className="w-full p-2 border rounded">
                            <option value="draft">Черновик</option>
                            <option value="active">Активный</option>
                            <option value="paused">Приостановлен</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Landing Page</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input name="landingPageName" type="text" className="p-2 border rounded" placeholder="Название" />
                          <input name="landingPageUrl" type="url" className="p-2 border rounded" placeholder="URL" />
                          <input name="landingPagePayout" type="number" className="p-2 border rounded" placeholder="Выплата" />
                          <input name="landingPageGeo" type="text" className="p-2 border rounded" placeholder="GEO" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Источник трафика</label>
                          <select name="trafficSource" className="w-full p-2 border rounded">
                            <option value="">Выберите источник</option>
                            <option value="facebook_ads">Facebook Ads</option>
                            <option value="google_ads">Google Ads</option>
                            <option value="native">Native</option>
                            <option value="push">Push</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Разрешенные приложения</label>
                          <select name="allowedApp" className="w-full p-2 border rounded">
                            <option value="">Выберите приложение</option>
                            <option value="PWA apps">PWA apps</option>
                            <option value="Mobile apps">Mobile apps</option>
                            <option value="Desktop">Desktop</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input name="antifraudEnabled" type="checkbox" className="mr-2" defaultChecked />
                          Анти-фрод включен
                        </label>
                        <label className="flex items-center">
                          <input name="autoApprovePartners" type="checkbox" className="mr-2" />
                          Автоматическое одобрение партнеров
                        </label>
                      </div>
                      

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          {t('cancel')}
                        </Button>
                        <Button type="submit" disabled={createOfferMutation.isPending} data-testid="button-submit-offer">
                          {createOfferMutation.isPending ? 'Создание...' : 'Создать оффер'}
                        </Button>
                      </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder={t('search_offers')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-offers"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all_statuses')}</SelectItem>
                      <SelectItem value="active">{t('active')}</SelectItem>
                      <SelectItem value="paused">{t('paused')}</SelectItem>
                      <SelectItem value="draft">{t('draft')}</SelectItem>
                      <SelectItem value="archived">{t('archived')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Offers Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {t('offers')} ({filteredOffers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('offer')}</TableHead>
                        <TableHead>{t('advertiser')}</TableHead>
                        <TableHead>{t('payout')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>Фрод-статус</TableHead>
                        <TableHead>{t('created_at')}</TableHead>
                        <TableHead>{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOffers.map((offer: any) => (
                        <TableRow key={offer.id} data-testid={`row-offer-${offer.id}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white" data-testid={`text-offer-name-${offer.id}`}>
                                {offer.name}
                              </div>
                              <div className="text-sm text-gray-500">{offer.category}</div>
                              {offer.description && (
                                <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                  {typeof offer.description === 'object' ? 
                                    getMultilingualText(offer.description, language, '') : 
                                    offer.description
                                  }
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell data-testid={`text-advertiser-${offer.id}`}>
                            <div className="text-sm">
                              {offer.advertiser?.username || 'N/A'}
                            </div>
                            {offer.advertiser?.company && (
                              <div className="text-xs text-gray-500">{offer.advertiser.company}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-medium" data-testid={`text-payout-${offer.id}`}>
                                {offer.payout} {offer.currency}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 uppercase">{offer.payoutType}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusBadgeColor(offer.status)} flex items-center gap-1 w-fit`} data-testid={`status-${offer.id}`}>
                              {getStatusIcon(offer.status)}
                              {t(offer.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Безопасно
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setLocation(`/admin/fraud?offer=${offer.id}`)}
                                title="Фрод-анализ оффера"
                                className="p-1"
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell data-testid={`text-created-${offer.id}`}>
                            {new Date(offer.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => updateOfferStatusMutation.mutate({
                                  offerId: offer.id,
                                  status: offer.status === 'active' ? 'paused' : 'active'
                                })}
                                disabled={updateOfferStatusMutation.isPending}
                                data-testid={`button-toggle-${offer.id}`}
                              >
                                {offer.status === 'active' ? (
                                  <Pause className="w-4 h-4 text-yellow-600" />
                                ) : (
                                  <Play className="w-4 h-4 text-green-600" />
                                )}
                              </Button>
                              <Button size="sm" variant="ghost" data-testid={`button-edit-${offer.id}`}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => deleteOfferMutation.mutate(offer.id)}
                                disabled={deleteOfferMutation.isPending}
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
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}