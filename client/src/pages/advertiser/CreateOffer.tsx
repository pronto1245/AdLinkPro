import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Upload, Image, Globe, DollarSign, Target, Settings, ArrowLeft, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import { apiRequest } from '@/lib/queryClient';

interface OfferFormData {
  name: string;
  description: string;
  category: string;
  vertical: string;
  geoTargeting: string[];
  payoutType: 'cpa' | 'cpl' | 'cps' | 'revenue_share';
  payoutAmount: number;
  currency: string;
  cap: number;
  dailyCap: number;
  landingPages: Array<{
    id: string;
    name: string;
    url: string;
    isDefault: boolean;
  }>;
  trackingDomains: string[];
  restrictions: {
    trafficSources: string[];
    deviceTypes: string[];
    osTypes: string[];
    browserTypes: string[];
  };
  isActive: boolean;
  requiresApproval: boolean;
  allowDeeplink: boolean;
  postbackUrl: string;
  conversionFlow: string;
  kpi: string;
  logo: string;
  images: string[];
  tags: string[];
}

const initialFormData: OfferFormData = {
  name: '',
  description: '',
  category: '',
  vertical: '',
  geoTargeting: [],
  payoutType: 'cpa',
  payoutAmount: 0,
  currency: 'USD',
  cap: 0,
  dailyCap: 0,
  landingPages: [{ id: '1', name: 'Основная', url: '', isDefault: true }],
  trackingDomains: [],
  restrictions: {
    trafficSources: [],
    deviceTypes: [],
    osTypes: [],
    browserTypes: []
  },
  isActive: true,
  requiresApproval: false,
  allowDeeplink: true,
  postbackUrl: '',
  conversionFlow: '',
  kpi: '',
  logo: '',
  images: [],
  tags: []
};

const categories = [
  'Gambling', 'Dating', 'Finance', 'Health', 'E-commerce', 
  'Gaming', 'Crypto', 'VPN', 'Antivirus', 'Education'
];

const verticals = [
  'Casino', 'Sports Betting', 'Adult Dating', 'Mainstream Dating',
  'Forex', 'Binary Options', 'Crypto Trading', 'Insurance',
  'Nutra', 'Beauty', 'Mobile Apps', 'Software'
];

const countries = [
  { code: 'IN', name: '🇮🇳 Индия' },
  { code: 'BR', name: '🇧🇷 Бразилия' },
  { code: 'RU', name: '🇷🇺 Россия' },
  { code: 'BD', name: '🇧🇩 Бангладеш' },
  { code: 'US', name: '🇺🇸 США' },
  { code: 'UK', name: '🇬🇧 Великобритания' },
  { code: 'DE', name: '🇩🇪 Германия' },
  { code: 'FR', name: '🇫🇷 Франция' },
  { code: 'JP', name: '🇯🇵 Япония' },
  { code: 'KR', name: '🇰🇷 Южная Корея' }
];

const trafficSources = [
  'Google Ads', 'Facebook Ads', 'Native Ads', 'Push Notifications',
  'Pop Traffic', 'Email Marketing', 'SMS Marketing', 'Influencer Marketing',
  'SEO', 'Social Media', 'Display Ads', 'Video Ads'
];

export default function CreateOffer() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<OfferFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState('basic');
  const [newTag, setNewTag] = useState('');

  // Мутация для создания оффера
  const createOfferMutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      return apiRequest('/api/advertiser/offers', 'POST', data);
    },
    onSuccess: (data) => {
      toast({
        title: 'Оффер создан',
        description: `Оффер "${formData.name}" успешно создан`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      navigate('/advertiser/offers');
    },
    onError: (error) => {
      toast({
        title: 'Ошибка создания',
        description: 'Не удалось создать оффер. Попробуйте снова.',
        variant: 'destructive'
      });
    }
  });

  // Загрузка доступных трекинг доменов
  const { data: trackingDomains = [] } = useQuery({
    queryKey: ['/api/advertiser/tracking-domains'],
    queryFn: () => apiRequest('/api/advertiser/tracking-domains')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.name || !formData.description || !formData.category) {
      toast({
        title: 'Заполните обязательные поля',
        description: 'Название, описание и категория обязательны для заполнения',
        variant: 'destructive'
      });
      return;
    }

    if (formData.landingPages.length === 0 || !formData.landingPages[0].url) {
      toast({
        title: 'Добавьте лендинг',
        description: 'Необходимо указать хотя бы одну посадочную страницу',
        variant: 'destructive'
      });
      return;
    }

    createOfferMutation.mutate(formData);
  };

  const addLandingPage = () => {
    const newLanding = {
      id: Date.now().toString(),
      name: `Лендинг ${formData.landingPages.length + 1}`,
      url: '',
      isDefault: false
    };
    setFormData(prev => ({
      ...prev,
      landingPages: [...prev.landingPages, newLanding]
    }));
  };

  const removeLandingPage = (id: string) => {
    if (formData.landingPages.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      landingPages: prev.landingPages.filter(lp => lp.id !== id)
    }));
  };

  const updateLandingPage = (id: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      landingPages: prev.landingPages.map(lp =>
        lp.id === id ? { ...lp, [field]: value } : lp
      )
    }));
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const toggleGeoTarget = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      geoTargeting: prev.geoTargeting.includes(countryCode)
        ? prev.geoTargeting.filter(geo => geo !== countryCode)
        : [...prev.geoTargeting, countryCode]
    }));
  };

  return (
    <RoleBasedLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/advertiser/offers')}
              data-testid="button-back"
              title="Вернуться к офферам"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Создание оффера</h1>
              <p className="text-muted-foreground">
                Настройте все параметры для нового оффера
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/advertiser/offers')}
              data-testid="button-cancel"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createOfferMutation.isPending}
              data-testid="button-save-offer"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {createOfferMutation.isPending ? 'Сохранение...' : 'Сохранить оффер'}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Основное
              </TabsTrigger>
              <TabsTrigger value="targeting" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Таргетинг
              </TabsTrigger>
              <TabsTrigger value="payout" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Выплаты
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Трекинг
              </TabsTrigger>
              <TabsTrigger value="creative" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Креативы
              </TabsTrigger>
            </TabsList>

            {/* Основная информация */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Название оффера *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Введите название оффера"
                        data-testid="input-offer-name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Категория *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vertical">Вертикаль</Label>
                      <Select value={formData.vertical} onValueChange={(value) => setFormData(prev => ({ ...prev, vertical: value }))}>
                        <SelectTrigger data-testid="select-vertical">
                          <SelectValue placeholder="Выберите вертикаль" />
                        </SelectTrigger>
                        <SelectContent>
                          {verticals.map(vert => (
                            <SelectItem key={vert} value={vert}>{vert}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="currency">Валюта</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger data-testid="select-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - Доллар США</SelectItem>
                          <SelectItem value="EUR">EUR - Евро</SelectItem>
                          <SelectItem value="RUB">RUB - Российский рубль</SelectItem>
                          <SelectItem value="INR">INR - Индийская рупия</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Описание *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Подробное описание оффера"
                      rows={4}
                      data-testid="textarea-description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="kpi">KPI / Цель</Label>
                      <Input
                        id="kpi"
                        value={formData.kpi}
                        onChange={(e) => setFormData(prev => ({ ...prev, kpi: e.target.value }))}
                        placeholder="Например: FTD, Registration, Sale"
                        data-testid="input-kpi"
                      />
                    </div>

                    <div>
                      <Label htmlFor="conversionFlow">Воронка конверсии</Label>
                      <Input
                        id="conversionFlow"
                        value={formData.conversionFlow}
                        onChange={(e) => setFormData(prev => ({ ...prev, conversionFlow: e.target.value }))}
                        placeholder="Click → Lead → Registration → Deposit"
                        data-testid="input-conversion-flow"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        data-testid="switch-active"
                      />
                      <Label htmlFor="isActive">Активный оффер</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Гео и таргетинг */}
            <TabsContent value="targeting" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Гео-таргетинг</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Разрешенные страны</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                      {countries.map(country => (
                        <div key={country.code} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`geo-${country.code}`}
                            checked={formData.geoTargeting.includes(country.code)}
                            onChange={() => toggleGeoTarget(country.code)}
                            className="rounded"
                          />
                          <Label htmlFor={`geo-${country.code}`} className="text-sm">{country.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Источники трафика</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {trafficSources.map(source => (
                        <div key={source} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`traffic-${source}`}
                            checked={formData.restrictions.trafficSources.includes(source)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setFormData(prev => ({
                                ...prev,
                                restrictions: {
                                  ...prev.restrictions,
                                  trafficSources: isChecked
                                    ? [...prev.restrictions.trafficSources, source]
                                    : prev.restrictions.trafficSources.filter(s => s !== source)
                                }
                              }));
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={`traffic-${source}`} className="text-sm">{source}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Выплаты */}
            <TabsContent value="payout" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Настройки выплат</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payoutType">Тип выплаты</Label>
                      <Select value={formData.payoutType} onValueChange={(value: 'cpa' | 'cpl' | 'cps' | 'revenue_share') => setFormData(prev => ({ ...prev, payoutType: value }))}>
                        <SelectTrigger data-testid="select-payout-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpa">CPA - Cost Per Action</SelectItem>
                          <SelectItem value="cpl">CPL - Cost Per Lead</SelectItem>
                          <SelectItem value="cps">CPS - Cost Per Sale</SelectItem>
                          <SelectItem value="revenue_share">Revenue Share</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="payoutAmount">Размер выплаты</Label>
                      <Input
                        id="payoutAmount"
                        type="number"
                        value={formData.payoutAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, payoutAmount: Number(e.target.value) }))}
                        placeholder="0"
                        data-testid="input-payout-amount"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cap">Общий кап</Label>
                      <Input
                        id="cap"
                        type="number"
                        value={formData.cap}
                        onChange={(e) => setFormData(prev => ({ ...prev, cap: Number(e.target.value) }))}
                        placeholder="0 - без ограничений"
                        data-testid="input-cap"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dailyCap">Дневной кап</Label>
                      <Input
                        id="dailyCap"
                        type="number"
                        value={formData.dailyCap}
                        onChange={(e) => setFormData(prev => ({ ...prev, dailyCap: Number(e.target.value) }))}
                        placeholder="0 - без ограничений"
                        data-testid="input-daily-cap"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Трекинг */}
            <TabsContent value="tracking" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Лендинги и трекинг</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Посадочные страницы</Label>
                    <div className="space-y-2 mt-2">
                      {formData.landingPages.map((landing, index) => (
                        <div key={landing.id} className="flex items-center gap-2 p-3 border rounded-lg">
                          <Input
                            placeholder="Название"
                            value={landing.name}
                            onChange={(e) => updateLandingPage(landing.id, 'name', e.target.value)}
                            className="w-32"
                          />
                          <Input
                            placeholder="URL посадочной страницы"
                            value={landing.url}
                            onChange={(e) => updateLandingPage(landing.id, 'url', e.target.value)}
                            className="flex-1"
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={landing.isDefault}
                              onChange={(e) => updateLandingPage(landing.id, 'isDefault', e.target.checked)}
                            />
                            <Label className="text-sm">По умолчанию</Label>
                          </div>
                          {formData.landingPages.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeLandingPage(landing.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addLandingPage}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить лендинг
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="postbackUrl">Postback URL</Label>
                    <Input
                      id="postbackUrl"
                      value={formData.postbackUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, postbackUrl: e.target.value }))}
                      placeholder="https://yourserver.com/postback?clickid={clickid}&payout={payout}"
                      data-testid="input-postback-url"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requiresApproval"
                        checked={formData.requiresApproval}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresApproval: checked }))}
                      />
                      <Label htmlFor="requiresApproval">Требует одобрения партнера</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allowDeeplink"
                        checked={formData.allowDeeplink}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowDeeplink: checked }))}
                      />
                      <Label htmlFor="allowDeeplink">Разрешить диплинки</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Креативы */}
            <TabsContent value="creative" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Креативы и материалы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="logo">Логотип (URL)</Label>
                    <Input
                      id="logo"
                      value={formData.logo}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                      data-testid="input-logo"
                    />
                  </div>

                  <div>
                    <Label>Теги</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-xs hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Добавить тег"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </RoleBasedLayout>
  );
}