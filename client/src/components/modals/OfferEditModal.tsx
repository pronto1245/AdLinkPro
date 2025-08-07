import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, Upload, Image, Globe, DollarSign, Target, Settings, Save, Eye, Trash2, X, Shield, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ObjectUploader } from '@/components/ObjectUploader';

interface OfferFormData {
  // Основная информация
  name: string;
  description: { ru: string; en: string };
  category: string;
  logo: string;
  
  // GEO и устройства
  geoTargeting: string[];
  
  // Ссылки
  targetUrl: string;
  postbackUrl: string;
  hasGlobalGeoSetting: boolean;
  hasGlobalPayoutSetting: boolean;
  globalGeo: string;
  globalPayout: string;
  landingPages: Array<{
    id: string;
    name: string;
    url: string;
    geo?: string;
    payout?: string;
    hasCustomGeo?: boolean;
    hasCustomPayout?: boolean;
    isDefault: boolean;
  }>;
  
  // Выплаты
  payoutType: 'cpa' | 'cpl' | 'cps' | 'revshare' | 'hybrid';
  payoutAmount: number;
  currency: string;
  
  // Условия
  trafficSources: string[];
  allowedApplications: string[];
  
  // Кепы и лимиты
  dailyLimit: number;
  monthlyLimit: number;
  
  // Антифрод
  antifraudEnabled: boolean;
  antifraudMethods: string[];
  partnerApprovalType: 'auto' | 'manual' | 'by_request' | 'whitelist_only';
  
  // Дополнительные настройки
  kycRequired: boolean;
  isPrivate: boolean;
  tags: string[];
  notes: string;
  requiresApproval: boolean;
  trackingEnabled: boolean;
  saveAsTemplate: boolean;
  
  // Мета данные
  kpi: string;
  status: 'draft' | 'active' | 'paused' | 'on_request';
}

interface OfferEditModalProps {
  offer: any;
  onClose: () => void;
  onSave: (offer: any) => void;
}

const categories = [
  'gambling', 'dating', 'crypto', 'betting', 'e-commerce', 
  'gaming', 'finance', 'health', 'vpn', 'antivirus', 'education',
  'software', 'mobile_apps', 'nutra', 'beauty'
];

const verticals = [
  'Casino', 'Sports Betting', 'Adult Dating', 'Mainstream Dating',
  'Forex', 'Binary Options', 'Crypto Trading', 'Insurance',
  'Nutra', 'Beauty', 'Mobile Apps', 'Software', 'VPN Services',
  'Antivirus', 'E-commerce', 'Gambling', 'Betting'
];

const countries = [
  { code: 'afghanistan', name: '🇦🇫 Афганистан' },
  { code: 'albania', name: '🇦🇱 Албания' },
  { code: 'algeria', name: '🇩🇿 Алжир' },
  { code: 'andorra', name: '🇦🇩 Андорра' },
  { code: 'angola', name: '🇦🇴 Ангола' },
  { code: 'argentina', name: '🇦🇷 Аргентина' },
  { code: 'armenia', name: '🇦🇲 Армения' },
  { code: 'australia', name: '🇦🇺 Австралия' },
  { code: 'austria', name: '🇦🇹 Австрия' },
  { code: 'azerbaijan', name: '🇦🇿 Азербайджан' },
  { code: 'bahrain', name: '🇧🇭 Бахрейн' },
  { code: 'bangladesh', name: '🇧🇩 Бангладеш' },
  { code: 'belarus', name: '🇧🇾 Беларусь' },
  { code: 'belgium', name: '🇧🇪 Бельгия' },
  { code: 'bolivia', name: '🇧🇴 Боливия' },
  { code: 'brazil', name: '🇧🇷 Бразилия' },
  { code: 'bulgaria', name: '🇧🇬 Болгария' },
  { code: 'cambodia', name: '🇰🇭 Камбоджа' },
  { code: 'canada', name: '🇨🇦 Канада' },
  { code: 'chile', name: '🇨🇱 Чили' },
  { code: 'china', name: '🇨🇳 Китай' },
  { code: 'colombia', name: '🇨🇴 Колумбия' },
  { code: 'croatia', name: '🇭🇷 Хорватия' },
  { code: 'cyprus', name: '🇨🇾 Кипр' },
  { code: 'czech', name: '🇨🇿 Чехия' },
  { code: 'denmark', name: '🇩🇰 Дания' },
  { code: 'ecuador', name: '🇪🇨 Эквадор' },
  { code: 'egypt', name: '🇪🇬 Египет' },
  { code: 'estonia', name: '🇪🇪 Эстония' },
  { code: 'finland', name: '🇫🇮 Финляндия' },
  { code: 'france', name: '🇫🇷 Франция' },
  { code: 'germany', name: '🇩🇪 Германия' },
  { code: 'greece', name: '🇬🇷 Греция' },
  { code: 'hungary', name: '🇭🇺 Венгрия' },
  { code: 'india', name: '🇮🇳 Индия' },
  { code: 'indonesia', name: '🇮🇩 Индонезия' },
  { code: 'italy', name: '🇮🇹 Италия' },
  { code: 'japan', name: '🇯🇵 Япония' },
  { code: 'malaysia', name: '🇲🇾 Малайзия' },
  { code: 'mexico', name: '🇲🇽 Мексика' },
  { code: 'netherlands', name: '🇳🇱 Нидерланды' },
  { code: 'poland', name: '🇵🇱 Польша' },
  { code: 'portugal', name: '🇵🇹 Португалия' },
  { code: 'russia', name: '🇷🇺 Россия' },
  { code: 'spain', name: '🇪🇸 Испания' },
  { code: 'sweden', name: '🇸🇪 Швеция' },
  { code: 'switzerland', name: '🇨🇭 Швейцария' },
  { code: 'thailand', name: '🇹🇭 Таиланд' },
  { code: 'turkey', name: '🇹🇷 Турция' },
  { code: 'ukraine', name: '🇺🇦 Украина' },
  { code: 'united_kingdom', name: '🇬🇧 Великобритания' },
  { code: 'united_states', name: '🇺🇸 США' },
  { code: 'vietnam', name: '🇻🇳 Вьетнам' }
];

const trafficSources = [
  'Google Ads', 'Facebook Ads', 'TikTok Ads', 'Snapchat Ads', 
  'Push Notifications', 'Pop-under', 'Banner', 'Native', 
  'Instagram', 'YouTube Ads', 'UAC', 'SEO', 'Email', 
  'WhatsApp', 'Telegram', 'Motivated', 'In-App', 'Cloaking',
  'Display', 'Video', 'Affiliate', 'Direct', 'Contextual'
];

const allowedAppTypes = [
  'Web Browser', 'Mobile App', 'Desktop Application', 'Browser Extension',
  'Progressive Web App', 'Hybrid App', 'Native Mobile', 'Cross-Platform'
];

const deniedTrafficSources = [
  'Adult Traffic', 'Malware Distribution', 'Click Injection', 
  'Fraudulent Sources', 'Bot Traffic', 'Incentivized Traffic'
];

const deviceTypes = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'smarttv', label: 'Smart TV' },
  { value: 'console', label: 'Console' }
];

const antifraudMethods = [
  { value: 'ip_filtering', label: 'IP фильтрация', description: 'Блокировка подозрительных IP адресов' },
  { value: 'device_fingerprinting', label: 'Отпечатки устройств', description: 'Анализ уникальных характеристик устройства' },
  { value: 'behavioral_analysis', label: 'Анализ поведения', description: 'Отслеживание паттернов поведения пользователей' },
  { value: 'geo_verification', label: 'Проверка геолокации', description: 'Верификация реального местоположения' },
  { value: 'rate_limiting', label: 'Лимит запросов', description: 'Ограничение частоты запросов от одного источника' },
  { value: 'bot_detection', label: 'Детекция ботов', description: 'Выявление автоматизированного трафика' }
];

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' }
];

const OfferEditModal: React.FC<OfferEditModalProps> = ({ offer, onClose, onSave }) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<OfferFormData>({
    // Основная информация
    name: offer.name || '',
    description: { 
      ru: offer.description?.ru || offer.description || '', 
      en: offer.description?.en || '' 
    },
    category: offer.category || '',
    logo: offer.logo || '',
    
    // GEO и устройства
    geoTargeting: offer.geoTargeting || [],
    
    // Ссылки
    targetUrl: offer.targetUrl || offer.url || '',
    postbackUrl: offer.postbackUrl || '',
    hasGlobalGeoSetting: offer.hasGlobalGeoSetting || false,
    hasGlobalPayoutSetting: offer.hasGlobalPayoutSetting || false,
    globalGeo: offer.globalGeo || '',
    globalPayout: offer.globalPayout || '',
    landingPages: offer.landingPages || [{ 
      id: '1', 
      name: 'Основная', 
      url: offer.url || '', 
      geo: '', 
      payout: '', 
      hasCustomGeo: false, 
      hasCustomPayout: false, 
      isDefault: true 
    }],
    
    // Выплаты
    payoutType: offer.payoutType || 'cpa',
    payoutAmount: offer.payout || offer.payoutAmount || 0,
    currency: offer.currency || 'USD',
    
    // Условия
    trafficSources: offer.trafficSources || [],
    allowedApplications: offer.allowedApplications || [],
    
    // Кепы и лимиты
    dailyLimit: offer.dailyLimit || offer.cap || 0,
    monthlyLimit: offer.monthlyLimit || 0,
    
    // Антифрод
    antifraudEnabled: offer.antifraudEnabled !== undefined ? offer.antifraudEnabled : true,
    antifraudMethods: offer.antifraudMethods || ['ip_check', 'vpn_detection'],
    partnerApprovalType: offer.partnerApprovalType || 'manual',
    
    // Дополнительные настройки
    kycRequired: offer.kycRequired || false,
    isPrivate: offer.isPrivate || false,
    tags: offer.tags || [],
    notes: offer.notes || '',
    requiresApproval: offer.requiresApproval || false,
    trackingEnabled: offer.trackingEnabled !== undefined ? offer.trackingEnabled : true,
    saveAsTemplate: false,
    
    // Мета данные
    kpi: offer.kpi || '',
    status: offer.status || 'active'
  });

  const [openGeoCombobox, setOpenGeoCombobox] = useState(false);
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);

  // Обработчики для управления лендингами
  const addLanding = () => {
    const newId = (formData.landingPages.length + 1).toString();
    const newLanding = {
      id: newId,
      name: `Лендинг ${newId}`,
      url: '',
      geo: formData.hasGlobalGeoSetting ? formData.globalGeo : '',
      payout: formData.hasGlobalPayoutSetting ? formData.globalPayout : '',
      hasCustomGeo: !formData.hasGlobalGeoSetting,
      hasCustomPayout: !formData.hasGlobalPayoutSetting,
      isDefault: false
    };
    setFormData(prev => ({
      ...prev,
      landingPages: [...prev.landingPages, newLanding]
    }));
  };

  const removeLanding = (id: string) => {
    if (formData.landingPages.length > 1) {
      setFormData(prev => ({
        ...prev,
        landingPages: prev.landingPages.filter(landing => landing.id !== id)
      }));
    }
  };

  const updateLanding = (id: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      landingPages: prev.landingPages.map(landing => 
        landing.id === id ? { ...landing, [field]: value } : landing
      )
    }));
  };

  // Обработчик для переключения источников трафика
  const toggleTrafficSource = (source: string) => {
    const isSelected = formData.trafficSources.includes(source);
    setFormData(prev => ({
      ...prev,
      trafficSources: isSelected
        ? prev.trafficSources.filter(s => s !== source)
        : [...prev.trafficSources, source]
    }));
  };

  // Обработчик для переключения разрешенных приложений
  const toggleAllowedApplication = (app: string) => {
    const isSelected = formData.allowedApplications.includes(app);
    setFormData(prev => ({
      ...prev,
      allowedApplications: isSelected
        ? prev.allowedApplications.filter(a => a !== app)
        : [...prev.allowedApplications, app]
    }));
  };

  // Обработчик для переключения антифрод методов
  const toggleAntifraudMethod = (method: string) => {
    const isSelected = formData.antifraudMethods.includes(method);
    setFormData(prev => ({
      ...prev,
      antifraudMethods: isSelected
        ? prev.antifraudMethods.filter(m => m !== method)
        : [...prev.antifraudMethods, method]
    }));
  };

  // Обработчик для переключения гео
  const toggleGeoTargeting = (geoCode: string) => {
    const isSelected = formData.geoTargeting.includes(geoCode);
    setFormData(prev => ({
      ...prev,
      geoTargeting: isSelected
        ? prev.geoTargeting.filter(g => g !== geoCode)
        : [...prev.geoTargeting, geoCode]
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите название оффера",
        variant: "destructive"
      });
      return;
    }

    if (!formData.targetUrl.trim()) {
      toast({
        title: "Ошибка", 
        description: "Укажите целевую URL",
        variant: "destructive"
      });
      return;
    }

    if (formData.geoTargeting.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите хотя бы одну страну для таргетинга",
        variant: "destructive"
      });
      return;
    }

    // Преобразуем данные формы в формат для сохранения
    const updatedOffer = {
      ...offer,
      ...formData,
      // Обратная совместимость для существующих полей
      url: formData.targetUrl,
      payout: formData.payoutAmount,
      cap: formData.dailyLimit,
    };

    onSave(updatedOffer);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Редактировать оффер: {formData.name || 'Без названия'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              Основная информация
            </TabsTrigger>
            <TabsTrigger value="geo" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Гео и лендинги
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Выплаты
            </TabsTrigger>
            <TabsTrigger value="traffic" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Трафик
            </TabsTrigger>
            <TabsTrigger value="antifraud" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Антифрод
            </TabsTrigger>
            <TabsTrigger value="additional" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Дополнительно
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Основная информация об оффере
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Название и статус */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Название оффера *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Введите название оффера"
                      data-testid="input-offer-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Статус оффера</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Черновик</SelectItem>
                        <SelectItem value="active">Активный</SelectItem>
                        <SelectItem value="paused">Приостановлен</SelectItem>
                        <SelectItem value="on_request">На запрос</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Описание на русском и английском */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Описание (RU)</Label>
                    <Textarea
                      value={formData.description.ru}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        description: { ...prev.description, ru: e.target.value }
                      }))}
                      placeholder="Описание оффера на русском языке..."
                      rows={4}
                      data-testid="textarea-description-ru"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Описание (EN)</Label>
                    <Textarea
                      value={formData.description.en}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        description: { ...prev.description, en: e.target.value }
                      }))}
                      placeholder="Offer description in English..."
                      rows={4}
                      data-testid="textarea-description-en"
                    />
                  </div>
                </div>

                {/* Категория */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Категория</Label>
                  <Popover open={openCategoryCombobox} onOpenChange={setOpenCategoryCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCategoryCombobox}
                        className="w-full justify-between"
                        data-testid="button-select-category"
                      >
                        {formData.category 
                          ? categories.find(cat => cat === formData.category)
                          : "Выберите категорию..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Поиск категории..." />
                        <CommandEmpty>Категория не найдена.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {categories.map((category) => (
                            <CommandItem
                              key={category}
                              value={category}
                              onSelect={() => {
                                setFormData(prev => ({ ...prev, category }));
                                setOpenCategoryCombobox(false);
                              }}
                              data-testid={`command-item-category-${category}`}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  formData.category === category ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {category}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Загрузка логотипа */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Логотип оффера</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={5242880}
                      onGetUploadParameters={async () => {
                        // Здесь должен быть запрос к API для получения URL загрузки
                        return {
                          method: 'PUT' as const,
                          url: '/api/upload-placeholder'
                        };
                      }}
                      onComplete={(result) => {
                        if (result.successful && result.successful[0]) {
                          const uploadURL = result.successful[0].uploadURL;
                          if (uploadURL) {
                            const objectPath = uploadURL.split('uploads/')[1]?.split('?')[0];
                            if (objectPath) {
                              const finalURL = `/objects/uploads/${objectPath}`;
                              setFormData(prev => ({ ...prev, logo: finalURL }));
                              toast({
                                title: "Успех",
                                description: "Логотип успешно загружен"
                              });
                            }
                          }
                        }
                      }}
                      buttonClassName="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Загрузить логотип
                    </ObjectUploader>
                    
                    {formData.logo && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Image className="h-4 w-4" />
                          Предварительный просмотр:
                        </div>
                        <img 
                          src={formData.logo} 
                          alt="Логотип оффера" 
                          className="w-20 h-20 object-cover rounded-lg border border-border"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                          data-testid="button-remove-logo"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Удалить логотип
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* KPI */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">KPI и цели</Label>
                  <Textarea
                    value={formData.kpi}
                    onChange={(e) => setFormData(prev => ({ ...prev, kpi: e.target.value }))}
                    placeholder="Опишите ключевые показатели эффективности и цели оффера..."
                    rows={3}
                    data-testid="textarea-kpi"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geo" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Гео-таргетинг и лендинги
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Выбор стран */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Доступные страны *</Label>
                  <Popover open={openGeoCombobox} onOpenChange={setOpenGeoCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openGeoCombobox}
                        className="w-full justify-between"
                        data-testid="button-select-geo"
                      >
                        {formData.geoTargeting.length > 0
                          ? `Выбрано стран: ${formData.geoTargeting.length}`
                          : "Выберите страны..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Поиск страны..." />
                        <CommandEmpty>Страна не найдена.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {countries.map((country) => (
                            <CommandItem
                              key={country.code}
                              value={country.code}
                              onSelect={() => toggleGeoTargeting(country.code)}
                              data-testid={`command-item-country-${country.code}`}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  formData.geoTargeting.includes(country.code) ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {country.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  {/* Выбранные страны */}
                  {formData.geoTargeting.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/50">
                      {formData.geoTargeting.map((geoCode) => {
                        const country = countries.find(c => c.code === geoCode);
                        return country ? (
                          <Badge
                            key={geoCode}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {country.name}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-destructive"
                              onClick={() => toggleGeoTargeting(geoCode)}
                            />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Лендинг страницы */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Лендинг страницы</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLanding}
                      data-testid="button-add-landing"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Добавить лендинг
                    </Button>
                  </div>

                  {/* Глобальные настройки */}
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.hasGlobalGeoSetting}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasGlobalGeoSetting: checked }))
                          }
                          data-testid="switch-global-geo"
                        />
                        <Label className="text-sm">Глобальное гео</Label>
                      </div>
                      {formData.hasGlobalGeoSetting && (
                        <Input
                          value={formData.globalGeo}
                          onChange={(e) => setFormData(prev => ({ ...prev, globalGeo: e.target.value }))}
                          placeholder="Все страны"
                          data-testid="input-global-geo"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.hasGlobalPayoutSetting}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasGlobalPayoutSetting: checked }))
                          }
                          data-testid="switch-global-payout"
                        />
                        <Label className="text-sm">Глобальная выплата</Label>
                      </div>
                      {formData.hasGlobalPayoutSetting && (
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.globalPayout}
                          onChange={(e) => setFormData(prev => ({ ...prev, globalPayout: e.target.value }))}
                          placeholder="0.00"
                          data-testid="input-global-payout"
                        />
                      )}
                    </div>
                  </div>

                  {/* Список лендингов */}
                  <div className="space-y-3">
                    {formData.landingPages.map((landing) => (
                      <div key={landing.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Input
                              value={landing.name}
                              onChange={(e) => updateLanding(landing.id, 'name', e.target.value)}
                              className="w-40"
                              placeholder="Название лендинга"
                              data-testid={`input-landing-name-${landing.id}`}
                            />
                            {landing.isDefault && (
                              <Badge variant="default">По умолчанию</Badge>
                            )}
                          </div>
                          {!landing.isDefault && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLanding(landing.id)}
                              data-testid={`button-remove-landing-${landing.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">URL лендинга *</Label>
                          <Input
                            value={landing.url}
                            onChange={(e) => updateLanding(landing.id, 'url', e.target.value)}
                            placeholder="https://example.com/landing"
                            data-testid={`input-landing-url-${landing.id}`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {(!formData.hasGlobalGeoSetting || landing.hasCustomGeo) && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={landing.hasCustomGeo}
                                  onCheckedChange={(checked) => 
                                    updateLanding(landing.id, 'hasCustomGeo', checked)
                                  }
                                  data-testid={`switch-custom-geo-${landing.id}`}
                                />
                                <Label className="text-sm">Кастомное гео</Label>
                              </div>
                              {landing.hasCustomGeo && (
                                <Input
                                  value={landing.geo || ''}
                                  onChange={(e) => updateLanding(landing.id, 'geo', e.target.value)}
                                  placeholder="US, CA, GB"
                                  data-testid={`input-landing-geo-${landing.id}`}
                                />
                              )}
                            </div>
                          )}

                          {(!formData.hasGlobalPayoutSetting || landing.hasCustomPayout) && (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={landing.hasCustomPayout}
                                  onCheckedChange={(checked) => 
                                    updateLanding(landing.id, 'hasCustomPayout', checked)
                                  }
                                  data-testid={`switch-custom-payout-${landing.id}`}
                                />
                                <Label className="text-sm">Кастомная выплата</Label>
                              </div>
                              {landing.hasCustomPayout && (
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={landing.payout || ''}
                                  onChange={(e) => updateLanding(landing.id, 'payout', e.target.value)}
                                  placeholder="0.00"
                                  data-testid={`input-landing-payout-${landing.id}`}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Целевая ссылка и постбэк */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Целевая ссылка *</Label>
                    <Input
                      value={formData.targetUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
                      placeholder="https://example.com/offer"
                      data-testid="input-target-url"
                    />
                    <p className="text-xs text-muted-foreground">
                      Основная ссылка куда будет перенаправлен трафик
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Postback URL</Label>
                    <Input
                      value={formData.postbackUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, postbackUrl: e.target.value }))}
                      placeholder="https://example.com/postback"
                      data-testid="input-postback-url"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL для получения уведомлений о конверсиях
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Настройки выплат
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Основные параметры выплаты */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Модель выплат</Label>
                    <Select 
                      value={formData.payoutType} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, payoutType: value as any }))}
                    >
                      <SelectTrigger data-testid="select-payout-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpa">CPA - За действие</SelectItem>
                        <SelectItem value="cpl">CPL - За лид</SelectItem>
                        <SelectItem value="cps">CPS - За продажу</SelectItem>
                        <SelectItem value="revshare">RevShare - Доля от дохода</SelectItem>
                        <SelectItem value="hybrid">Hybrid - Гибридная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Размер выплаты</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.payoutAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, payoutAmount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      data-testid="input-payout-amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Валюта</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger data-testid="select-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.symbol} {curr.code} - {curr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Лимиты и ограничения */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Лимиты и ограничения</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Дневной лимит конверсий</Label>
                      <Input
                        type="number"
                        value={formData.dailyLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) || 0 }))}
                        placeholder="0 = без лимита"
                        data-testid="input-daily-limit"
                      />
                      <p className="text-xs text-muted-foreground">
                        Максимальное количество конверсий в день
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Месячный лимит конверсий</Label>
                      <Input
                        type="number"
                        value={formData.monthlyLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, monthlyLimit: parseInt(e.target.value) || 0 }))}
                        placeholder="0 = без лимита"
                        data-testid="input-monthly-limit"
                      />
                      <p className="text-xs text-muted-foreground">
                        Максимальное количество конверсий в месяц
                      </p>
                    </div>
                  </div>
                </div>

                {/* Дополнительная информация о выплатах */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-sm">Информация о моделях выплат:</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <strong>CPA:</strong> Фиксированная сумма за каждое целевое действие<br/>
                      <strong>CPL:</strong> Оплата за каждый квалифицированный лид<br/>
                      <strong>CPS:</strong> Процент или фиксированная сумма с каждой продажи
                    </div>
                    <div>
                      <strong>RevShare:</strong> Процент от дохода рекламодателя<br/>
                      <strong>Hybrid:</strong> Комбинация фиксированной суммы и процента
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traffic" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Источники трафика и приложения
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Разрешенные источники трафика */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Разрешенные источники трафика</Label>
                  <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {trafficSources.map((source) => (
                      <label
                        key={source}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                        data-testid={`checkbox-traffic-${source.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        <Switch
                          checked={formData.trafficSources.includes(source)}
                          onCheckedChange={() => toggleTrafficSource(source)}
                          size="sm"
                        />
                        <span className="text-xs">{source}</span>
                      </label>
                    ))}
                  </div>
                  {formData.trafficSources.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Выбрано источников: {formData.trafficSources.length}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Разрешенные типы приложений */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Разрешенные типы приложений</Label>
                  <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {allowedAppTypes.map((appType) => (
                      <label
                        key={appType}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                        data-testid={`checkbox-app-${appType.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        <Switch
                          checked={formData.allowedApplications.includes(appType)}
                          onCheckedChange={() => toggleAllowedApplication(appType)}
                          size="sm"
                        />
                        <span className="text-xs">{appType}</span>
                      </label>
                    ))}
                  </div>
                  {formData.allowedApplications.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Выбрано приложений: {formData.allowedApplications.length}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Запрещенные источники трафика */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-destructive">Запрещенные источники трафика</Label>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-2 text-sm text-destructive">
                      {deniedTrafficSources.map((source) => (
                        <div key={source} className="flex items-center gap-2">
                          <X className="h-3 w-3" />
                          {source}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-destructive mt-3">
                      Трафик из этих источников будет автоматически отклонен системой антифрод
                    </p>
                  </div>
                </div>

                {/* Информация о типах устройств */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-sm">Поддерживаемые типы устройств:</h4>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {deviceTypes.map((device) => (
                      <div key={device.value} className="flex items-center gap-2 p-2 bg-background rounded border">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {device.label}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="antifraud" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Защита от мошенничества
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Методы антифрода */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Активные методы защиты</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {antifraudMethods.map((method) => (
                      <div 
                        key={method.value} 
                        className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/30"
                      >
                        <Switch
                          checked={formData.antifraudMethods.includes(method.value)}
                          onCheckedChange={() => toggleAntifraudMethod(method.value)}
                          data-testid={`switch-antifraud-${method.value}`}
                        />
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">{method.label}</Label>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {formData.antifraudMethods.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Активно методов защиты: {formData.antifraudMethods.length}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Настройки для модерации партнеров */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Тип модерации партнеров</Label>
                  <Select 
                    value={formData.partnerApprovalType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, partnerApprovalType: value as any }))}
                  >
                    <SelectTrigger data-testid="select-partner-approval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Автоматическое подтверждение
                        </div>
                      </SelectItem>
                      <SelectItem value="manual">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          Ручная модерация
                        </div>
                      </SelectItem>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          Без модерации
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Определяет как будут проверяться заявки партнеров на доступ к офферу
                  </p>
                </div>

                {/* Дополнительные настройки безопасности */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-sm">Рекомендации по безопасности:</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-green-500" />
                        <strong>Активная защита</strong>
                      </div>
                      <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>Включить IP фильтрацию для географических ограничений</li>
                        <li>Использовать анализ поведения для выявления ботов</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-3 w-3 text-blue-500" />
                        <strong>Мониторинг</strong>
                      </div>
                      <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>Отслеживать аномальный трафик и подозрительные паттерны</li>
                        <li>Настроить алерты при превышении лимитов конверсий</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Дополнительные настройки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Приватность оффера */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={formData.isPrivate}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
                      data-testid="switch-private"
                    />
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Приватный оффер</Label>
                      <p className="text-xs text-muted-foreground">
                        Оффер будет доступен только выбранным партнерам по приглашению
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Теги */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Теги для категоризации</Label>
                  <Textarea
                    value={formData.tags.join(', ')}
                    onChange={(e) => {
                      const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                      setFormData(prev => ({ ...prev, tags: tagsArray }));
                    }}
                    placeholder="premium, exclusive, tier1, high-converting..."
                    rows={2}
                    data-testid="textarea-tags"
                  />
                  <p className="text-xs text-muted-foreground">
                    Добавьте теги для удобного поиска и фильтрации (разделяйте запятыми)
                  </p>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              const newTags = formData.tags.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, tags: newTags }));
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Заметки */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Внутренние заметки</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Дополнительные заметки для внутреннего использования..."
                    rows={3}
                    data-testid="textarea-notes"
                  />
                  <p className="text-xs text-muted-foreground">
                    Эти заметки видны только вам и вашей команде, партнеры их не увидят
                  </p>
                </div>

                {/* Дополнительные параметры */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-sm">Дополнительные настройки:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={formData.requiresApproval}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresApproval: checked }))}
                        data-testid="switch-requires-approval"
                      />
                      <div>
                        <Label className="text-sm">Требует одобрение</Label>
                        <p className="text-xs text-muted-foreground">Партнеры должны ждать одобрения</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={formData.trackingEnabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, trackingEnabled: checked }))}
                        data-testid="switch-tracking"
                      />
                      <div>
                        <Label className="text-sm">Расширенное отслеживание</Label>
                        <p className="text-xs text-muted-foreground">Детальная аналитика конверсий</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Действия с шаблоном */}
                <div className="border border-dashed rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-sm">Шаблоны:</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={formData.saveAsTemplate}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, saveAsTemplate: checked === true }))}
                        data-testid="checkbox-save-template"
                      />
                      <Label className="text-sm">Сохранить как шаблон для будущих офферов</Label>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Создание шаблона поможет быстро создавать похожие офферы в будущем
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 gap-2 mt-6 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel"
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSave}
            data-testid="button-save"
          >
            {offer.id ? 'Сохранить изменения' : 'Создать оффер'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferEditModal;