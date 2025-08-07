import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Plus, Minus, Upload, Image, Globe, DollarSign, Target, Settings, ArrowLeft, Save, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ObjectUploader } from '@/components/ObjectUploader';
// import { useAuth } from '@/contexts/AuthContext';

import { apiRequest } from '@/lib/queryClient';

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
  antifraudMethods: string[]; // Выбранные методы антифрод защиты
  partnerApprovalType: 'auto' | 'manual' | 'by_request' | 'whitelist_only';
  
  // Дополнительные настройки
  kycRequired: boolean;
  isPrivate: boolean;
  
  // Мета данные
  kpi: string;
  status: 'draft' | 'active' | 'paused' | 'on_request';
}

const initialFormData: OfferFormData = {
  // Основная информация
  name: '',
  description: { ru: '', en: '' },
  category: '',
  logo: '',
  
  // GEO и устройства
  geoTargeting: [],
  
  // Ссылки
  targetUrl: '',
  postbackUrl: '',
  hasGlobalGeoSetting: false,
  hasGlobalPayoutSetting: false,
  globalGeo: '',
  globalPayout: '',
  landingPages: [{ id: '1', name: 'Основная', url: '', geo: '', payout: '', hasCustomGeo: false, hasCustomPayout: false, isDefault: true }],
  
  // Выплаты
  payoutType: 'cpa',
  payoutAmount: 0,
  currency: 'USD',
  
  // Условия
  trafficSources: [],
  allowedApplications: [],
  
  // Кепы и лимиты
  dailyLimit: 0,
  monthlyLimit: 0,
  
  // Антифрод
  antifraudEnabled: true,
  antifraudMethods: ['ip_check', 'vpn_detection'], // По умолчанию включены базовые методы
  partnerApprovalType: 'manual',
  
  // Дополнительные настройки
  kycRequired: false,
  isPrivate: false,
  
  // Мета данные
  kpi: '',
  status: 'draft'
};

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
  { code: 'georgia', name: '🇬🇪 Грузия' },
  { code: 'germany', name: '🇩🇪 Германия' },
  { code: 'ghana', name: '🇬🇭 Гана' },
  { code: 'greece', name: '🇬🇷 Греция' },
  { code: 'hungary', name: '🇭🇺 Венгрия' },
  { code: 'iceland', name: '🇮🇸 Исландия' },
  { code: 'india', name: '🇮🇳 Индия' },
  { code: 'indonesia', name: '🇮🇩 Индонезия' },
  { code: 'iran', name: '🇮🇷 Иран' },
  { code: 'iraq', name: '🇮🇶 Ирак' },
  { code: 'ireland', name: '🇮🇪 Ирландия' },
  { code: 'israel', name: '🇮🇱 Израиль' },
  { code: 'italy', name: '🇮🇹 Италия' },
  { code: 'japan', name: '🇯🇵 Япония' },
  { code: 'jordan', name: '🇯🇴 Иордания' },
  { code: 'kazakhstan', name: '🇰🇿 Казахстан' },
  { code: 'kenya', name: '🇰🇪 Кения' },
  { code: 'kuwait', name: '🇰🇼 Кувейт' },
  { code: 'latvia', name: '🇱🇻 Латвия' },
  { code: 'lebanon', name: '🇱🇧 Ливан' },
  { code: 'lithuania', name: '🇱🇹 Литва' },
  { code: 'malaysia', name: '🇲🇾 Малайзия' },
  { code: 'malta', name: '🇲🇹 Мальта' },
  { code: 'mexico', name: '🇲🇽 Мексика' },
  { code: 'morocco', name: '🇲🇦 Марокко' },
  { code: 'netherlands', name: '🇳🇱 Нидерланды' },
  { code: 'newzealand', name: '🇳🇿 Новая Зеландия' },
  { code: 'nigeria', name: '🇳🇬 Нигерия' },
  { code: 'norway', name: '🇳🇴 Норвегия' },
  { code: 'pakistan', name: '🇵🇰 Пакистан' },
  { code: 'peru', name: '🇵🇪 Перу' },
  { code: 'philippines', name: '🇵🇭 Филиппины' },
  { code: 'poland', name: '🇵🇱 Польша' },
  { code: 'portugal', name: '🇵🇹 Португалия' },
  { code: 'qatar', name: '🇶🇦 Катар' },
  { code: 'romania', name: '🇷🇴 Румыния' },
  { code: 'russia', name: '🇷🇺 Россия' },
  { code: 'saudiarabia', name: '🇸🇦 Саудовская Аравия' },
  { code: 'singapore', name: '🇸🇬 Сингапур' },
  { code: 'slovakia', name: '🇸🇰 Словакия' },
  { code: 'slovenia', name: '🇸🇮 Словения' },
  { code: 'southafrica', name: '🇿🇦 Южная Африка' },
  { code: 'southkorea', name: '🇰🇷 Южная Корея' },
  { code: 'spain', name: '🇪🇸 Испания' },
  { code: 'sweden', name: '🇸🇪 Швеция' },
  { code: 'switzerland', name: '🇨🇭 Швейцария' },
  { code: 'thailand', name: '🇹🇭 Таиланд' },
  { code: 'turkey', name: '🇹🇷 Турция' },
  { code: 'uae', name: '🇦🇪 ОАЭ' },
  { code: 'ukraine', name: '🇺🇦 Украина' },
  { code: 'uk', name: '🇬🇧 Великобритания' },
  { code: 'usa', name: '🇺🇸 США' },
  { code: 'venezuela', name: '🇻🇪 Венесуэла' },
  { code: 'vietnam', name: '🇻🇳 Вьетнам' }
];

const allowedTrafficSources = [
  'Push', 'Popunder', 'Google Ads', 'Facebook Ads', 'TikTok Ads', 
  'Instagram', 'YouTube Ads', 'Native', 'UAC', 'SEO', 'Email', 
  'WhatsApp', 'Telegram', 'Motivated', 'In-App', 'Cloaking', 
  'Bot', 'Farm', 'Doros', 'APK', 'VK', 'Discord', 'Phishing', 
  'Autoredirect', 'Proxy/VPN', 'Twitter/X'
];

// 16 типов разрешенных приложений согласно требованию пользователя
const allowedAppTypes = [
  'PWA App', 'WebView App', 'APK', 'iOS App', 'SPA', 'Landing App',
  'SmartLink', 'Mini App', 'Desktop App', 'iFrame', 'ZIP', 'Cloud App',
  'DApp', 'Masked App', 'WebRTC', 'TWA'
];

const deniedTrafficSources = [
  'Adult Traffic', 'Motivational Traffic', 'Incentive Traffic', 'Bot Traffic',
  'Click Spam', 'Fraud Traffic', 'Toolbar Traffic', 'Expired Domain Traffic',
  'Spam Email', 'Auto-surf Traffic', 'Forced Clicks', 'PTC Sites'
];

const deviceTypes = [
  { value: 'mobile', label: 'Мобильные устройства' },
  { value: 'desktop', label: 'Десктоп' },
  { value: 'tablet', label: 'Планшеты' }
];

const osTypes = [
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' },
  { value: 'windows', label: 'Windows' },
  { value: 'mac', label: 'macOS' },
  { value: 'linux', label: 'Linux' }
];

// Методы антифрод защиты с описаниями для полной интеграции
const antifraudMethods = [
  { 
    value: 'ip_check', 
    label: 'Проверка IP адресов',
    description: 'Анализ подозрительных IP и геолокации'
  },
  { 
    value: 'vpn_detection', 
    label: 'Детекция VPN/Proxy',
    description: 'Обнаружение VPN, прокси и анонимайзеров'
  },
  { 
    value: 'bot_protection', 
    label: 'Защита от ботов',
    description: 'Идентификация автоматизированного трафика'
  },
  { 
    value: 'device_fingerprint', 
    label: 'Отпечаток устройства',
    description: 'Уникальная идентификация устройств'
  },
  { 
    value: 'behavioral_analysis', 
    label: 'Поведенческий анализ',
    description: 'Анализ паттернов поведения пользователей'
  },
  { 
    value: 'click_spam_protection', 
    label: 'Защита от кликспама',
    description: 'Предотвращение массовых фиктивных кликов'
  },
  { 
    value: 'time_analysis', 
    label: 'Временной анализ',
    description: 'Контроль времени между событиями'
  },
  { 
    value: 'referrer_validation', 
    label: 'Проверка источников',
    description: 'Валидация источников переходов'
  },
  { 
    value: 'conversion_validation', 
    label: 'Проверка конверсий',
    description: 'Валидация качества конверсий'
  }
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'ar', label: 'العربية' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'th', label: 'ไทย' },
  { value: 'tr', label: 'Türkçe' }
];

// Компонент выбора страны с поиском
function CountrySelect({ value, onChange, placeholder = "Выберите страну" }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-sm"
        >
          {value
            ? countries.find((country) => country.code === value)?.name || value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Поиск страны..." className="h-9" />
          <CommandEmpty>Страна не найдена.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {countries.map((country) => (
              <CommandItem
                key={country.code}
                value={country.name}
                onSelect={() => {
                  onChange(country.code);
                  setOpen(false);
                }}
              >
                {country.name}
                <Check
                  className={`ml-auto h-4 w-4 ${
                    value === country.code ? "opacity-100" : "opacity-0"
                  }`}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function CreateOffer() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Получаем ID пользователя из локального хранилища или используем заглушку
  const getUserId = () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
      }
    } catch (e) {
      console.warn('Error parsing token:', e);
    }
    return null;
  };
  
  const [formData, setFormData] = useState<OfferFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState('basic');
  const [newTag, setNewTag] = useState('');

  // Мутация для создания оффера
  const createOfferMutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      // Преобразуем данные формы в формат API
      const apiData = {
        name: data.name,
        description: data.description,
        category: data.category,
        logo: data.logo,
        countries: data.hasGlobalGeoSetting 
          ? data.landingPages.map(lp => lp.geo).filter(geo => geo && geo.trim() !== '')
          : data.globalGeo ? [data.globalGeo] : [],
        landingPageUrl: data.landingPages.find(lp => lp.isDefault)?.url || data.landingPages[0]?.url || '',
        landingPages: data.landingPages,
        payout: data.hasGlobalPayoutSetting 
          ? (data.landingPages.find(lp => lp.isDefault)?.payout || data.landingPages[0]?.payout || '0')
          : (data.globalPayout || '0'),
        payoutType: data.payoutType,
        currency: data.currency,
        trafficSources: data.trafficSources,
        allowedApplications: data.allowedApplications, // Новое поле для 16 типов приложений
        dailyLimit: data.dailyLimit || null,
        monthlyLimit: data.monthlyLimit || null,
        antifraudEnabled: data.antifraudEnabled,
        antifraudMethods: data.antifraudMethods, // Выбранные методы антифрод защиты
        partnerApprovalType: data.partnerApprovalType, // Тип подтверждения партнеров
        kycRequired: data.kycRequired,
        isPrivate: data.isPrivate,
        kpiConditions: { en: data.kpi, ru: data.kpi },
        advertiserId: getUserId(),
        status: data.status
      };
      return apiRequest('/api/advertiser/offers', 'POST', apiData);
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
    
    // Валидация основных полей
    if (!formData.name?.trim()) {
      toast({
        title: 'Заполните название оффера',
        description: 'Название оффера обязательно для заполнения',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: 'Выберите категорию',
        description: 'Категория оффера обязательна для выбора',
        variant: 'destructive'
      });
      return;
    }

    // Проверяем URL в landing pages
    const hasValidUrl = formData.landingPages.some(lp => lp.url && lp.url.trim() !== '');
    if (!hasValidUrl) {
      toast({
        title: 'Укажите URL целевой страницы',
        description: 'Необходимо указать хотя бы один URL целевой страницы',
        variant: 'destructive'
      });
      return;
    }

    // Проверяем выплаты в landing pages
    const hasValidPayout = formData.hasGlobalPayoutSetting 
      ? formData.landingPages.some(lp => parseFloat(lp.payout || '0') > 0)
      : parseFloat(formData.globalPayout || '0') > 0;
    
    if (!hasValidPayout) {
      toast({
        title: 'Укажите размер выплаты',
        description: 'Размер выплаты должен быть больше нуля',
        variant: 'destructive'
      });
      return;
    }

    // Проверяем гео в landing pages
    const hasValidGeo = formData.hasGlobalGeoSetting 
      ? formData.landingPages.some(lp => lp.geo && lp.geo.trim() !== '')
      : formData.globalGeo && formData.globalGeo.trim() !== '';
    
    if (!hasValidGeo) {
      toast({
        title: 'Выберите гео',
        description: 'Необходимо указать гео для целевых страниц',
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
      geo: formData.hasGlobalGeoSetting ? '' : formData.globalGeo,
      payout: formData.hasGlobalPayoutSetting ? '' : formData.globalPayout,
      hasCustomGeo: formData.hasGlobalGeoSetting,
      hasCustomPayout: formData.hasGlobalPayoutSetting,
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

  const toggleGeoTarget = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      geoTargeting: prev.geoTargeting.includes(countryCode)
        ? prev.geoTargeting.filter(geo => geo !== countryCode)
        : [...prev.geoTargeting, countryCode]
    }));
  };

  const toggleTrafficSource = (source: string) => {
    setFormData(prev => ({
      ...prev,
      trafficSources: prev.trafficSources.includes(source)
        ? prev.trafficSources.filter(s => s !== source)
        : [...prev.trafficSources, source]
    }));
  };

  return (
    <div>
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Основная информация
              </TabsTrigger>
              <TabsTrigger value="links" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Ссылки
              </TabsTrigger>
              <TabsTrigger value="targeting" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Таргетинг
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Настройки
              </TabsTrigger>
            </TabsList>

            {/* Вкладка: Основная информация */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Основная информация оффера
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Название оффера *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Введите название оффера"
                        required
                        data-testid="input-offer-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Категория *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description-ru">Описание на русском</Label>
                    <Textarea
                      id="description-ru"
                      value={formData.description.ru}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        description: { ...prev.description, ru: e.target.value } 
                      }))}
                      placeholder="Описание оффера на русском языке"
                      className="min-h-[100px]"
                      data-testid="textarea-description-ru"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description-en">Описание на английском</Label>
                    <Textarea
                      id="description-en"
                      value={formData.description.en}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        description: { ...prev.description, en: e.target.value } 
                      }))}
                      placeholder="Описание оффера на английском языке"
                      className="min-h-[100px]"
                      data-testid="textarea-description-en"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payoutType">Тип выплаты</Label>
                      <Select
                        value={formData.payoutType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, payoutType: value as any }))}
                      >
                        <SelectTrigger data-testid="select-payout-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpa">CPA - за действие</SelectItem>
                          <SelectItem value="cpl">CPL - за лид</SelectItem>
                          <SelectItem value="cps">CPS - за продажу</SelectItem>
                          <SelectItem value="revshare">RevShare - доля выручки</SelectItem>
                          <SelectItem value="hybrid">Hybrid - гибридная</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Валюта</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger data-testid="select-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - Доллар США</SelectItem>
                          <SelectItem value="EUR">EUR - Евро</SelectItem>
                          <SelectItem value="RUB">RUB - Российский рубль</SelectItem>
                          <SelectItem value="GBP">GBP - Британский фунт</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partnerApprovalType">Подтверждение партнеров</Label>
                      <Select
                        value={formData.partnerApprovalType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, partnerApprovalType: value as any }))}
                      >
                        <SelectTrigger data-testid="select-partner-approval">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Автоматическое</SelectItem>
                          <SelectItem value="manual">Ручное</SelectItem>
                          <SelectItem value="by_request">По запросу</SelectItem>
                          <SelectItem value="whitelist_only">Только white-лист</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Логотип оффера</Label>
                    <div className="flex items-center gap-4">
                      {formData.logo && (
                        <img
                          src={formData.logo}
                          alt="Logo preview"
                          className="h-16 w-16 object-cover rounded border"
                        />
                      )}
                      <ObjectUploader
                        onGetUploadParameters={async () => ({
                          method: 'PUT' as const,
                          url: '/api/upload-logo'
                        })}
                        onComplete={(result) => {
                          if (result.successful?.[0]?.uploadURL) {
                            setFormData(prev => ({ ...prev, logo: result.successful[0].uploadURL }));
                          }
                        }}
                        maxNumberOfFiles={1}
                        maxFileSize={5 * 1024 * 1024} // 5MB
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Загрузить логотип
                      </ObjectUploader>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Рекомендуемый размер: 200x200px, формат: PNG, JPG (до 5MB)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка: Ссылки */}
            <TabsContent value="links" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Лендинги и настройки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-medium">Целевые страницы</Label>
                      <Button type="button" onClick={addLandingPage} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить лендинг
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {/* Заголовки таблицы */}
                      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-2">
                        <div className="col-span-3">Название / URL</div>
                        <div className="col-span-3">ГЕО</div>
                        <div className="col-span-2">Выплата</div>
                        <div className="col-span-1 text-center">По умолчанию</div>
                        <div className="col-span-1 text-center">Действия</div>
                      </div>
                      
                      {formData.landingPages.map((landing, index) => (
                        <div key={landing.id} className="grid grid-cols-12 gap-2 p-2 border rounded-lg">
                          <div className="col-span-3 space-y-1">
                            <Input
                              placeholder="Название"
                              value={landing.name}
                              onChange={(e) => updateLandingPage(landing.id, 'name', e.target.value)}
                              className="text-sm"
                            />
                            <Input
                              placeholder="https://example.com/landing"
                              value={landing.url}
                              onChange={(e) => updateLandingPage(landing.id, 'url', e.target.value)}
                              className="text-sm"
                              required
                            />
                          </div>
                          
                          <div className="col-span-3">
                            <div className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={formData.hasGlobalGeoSetting || false}
                                onChange={(e) => setFormData(prev => ({ 
                                  ...prev, 
                                  hasGlobalGeoSetting: e.target.checked,
                                  landingPages: prev.landingPages.map(lp => ({
                                    ...lp,
                                    hasCustomGeo: e.target.checked
                                  }))
                                }))}
                                className="rounded flex-shrink-0"
                                title="Разные ГЕО для URL"
                              />
                              <CountrySelect
                                placeholder="Выберите ГЕО"
                                value={formData.hasGlobalGeoSetting ? (landing.geo || '') : formData.globalGeo || ''}
                                onChange={(value) => {
                                  if (formData.hasGlobalGeoSetting) {
                                    updateLandingPage(landing.id, 'geo', value);
                                  } else {
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      globalGeo: value,
                                      landingPages: prev.landingPages.map(lp => ({
                                        ...lp,
                                        geo: value
                                      }))
                                    }));
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={formData.hasGlobalPayoutSetting || false}
                                onChange={(e) => setFormData(prev => ({ 
                                  ...prev, 
                                  hasGlobalPayoutSetting: e.target.checked,
                                  landingPages: prev.landingPages.map(lp => ({
                                    ...lp,
                                    hasCustomPayout: e.target.checked
                                  }))
                                }))}
                                className="rounded flex-shrink-0"
                                title="Разные выплаты для URL"
                              />
                              <Input
                                placeholder="Сумма"
                                value={formData.hasGlobalPayoutSetting ? (landing.payout || '') : formData.globalPayout || ''}
                                onChange={(e) => {
                                  if (formData.hasGlobalPayoutSetting) {
                                    updateLandingPage(landing.id, 'payout', e.target.value);
                                  } else {
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      globalPayout: e.target.value,
                                      landingPages: prev.landingPages.map(lp => ({
                                        ...lp,
                                        payout: e.target.value
                                      }))
                                    }));
                                  }
                                }}
                                className="w-full text-sm"
                              />
                            </div>
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <input
                              type="checkbox"
                              checked={landing.isDefault}
                              onChange={(e) => updateLandingPage(landing.id, 'isDefault', e.target.checked)}
                              className="rounded"
                              title="По умолчанию"
                            />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            {formData.landingPages.length > 1 && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => removeLandingPage(landing.id)}
                                title="Удалить лендинг"
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Целевые ссылки оффера, куда будут направляться пользователи
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dailyLimit">Дневной лимит</Label>
                      <Input
                        id="dailyLimit"
                        type="number"
                        value={formData.dailyLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, dailyLimit: Number(e.target.value) }))}
                        placeholder="0 - без ограничений"
                        data-testid="input-daily-limit"
                      />
                    </div>

                    <div>
                      <Label htmlFor="monthlyLimit">Месячный лимит</Label>
                      <Input
                        id="monthlyLimit"
                        type="number"
                        value={formData.monthlyLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, monthlyLimit: Number(e.target.value) }))}
                        placeholder="0 - без ограничений"
                        data-testid="input-monthly-limit"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="postbackUrl">Postback URL</Label>
                    <Input
                      id="postbackUrl"
                      value={formData.postbackUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, postbackUrl: e.target.value }))}
                      placeholder="https://example.com/postback"
                      data-testid="input-postback-url"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      URL для получения уведомлений о конверсиях
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка: Таргетинг */}
            <TabsContent value="targeting" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Источники трафика и таргетинг
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Разрешенные источники трафика</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {allowedTrafficSources.map((source) => (
                        <div key={source} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`traffic-${source}`}
                            checked={formData.trafficSources.includes(source)}
                            onChange={() => toggleTrafficSource(source)}
                            className="rounded"
                          />
                          <label htmlFor={`traffic-${source}`} className="text-sm cursor-pointer">
                            {source}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Выберите разрешенные источники трафика для этого оффера
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-base font-medium">Типы приложений</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {allowedAppTypes.map((appType) => (
                        <div key={appType} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`app-${appType}`}
                            checked={formData.allowedApplications.includes(appType)}
                            onChange={() => {
                              setFormData(prev => ({
                                ...prev,
                                allowedApplications: prev.allowedApplications.includes(appType)
                                  ? prev.allowedApplications.filter(app => app !== appType)
                                  : [...prev.allowedApplications, appType]
                              }));
                            }}
                            className="rounded"
                          />
                          <label htmlFor={`app-${appType}`} className="text-sm cursor-pointer">
                            {appType}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Выберите разрешенные типы приложений для продвижения оффера
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Антифрод защита</Label>
                      <Switch
                        checked={formData.antifraudEnabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, antifraudEnabled: checked }))}
                      />
                    </div>
                    
                    {formData.antifraudEnabled && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Методы защиты</Label>
                        <div className="grid gap-3">
                          {antifraudMethods.map((method) => (
                            <div key={method.value} className="flex items-start space-x-2 p-3 border rounded-lg">
                              <input
                                type="checkbox"
                                id={`antifraud-${method.value}`}
                                checked={formData.antifraudMethods.includes(method.value)}
                                onChange={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    antifraudMethods: prev.antifraudMethods.includes(method.value)
                                      ? prev.antifraudMethods.filter(m => m !== method.value)
                                      : [...prev.antifraudMethods, method.value]
                                  }));
                                }}
                                className="rounded mt-0.5"
                              />
                              <div className="flex-1">
                                <label htmlFor={`antifraud-${method.value}`} className="text-sm font-medium cursor-pointer">
                                  {method.label}
                                </label>
                                <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Выберите методы защиты от фрод-трафика для этого оффера
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Вкладка: Настройки */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Настройки оффера
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label className="text-base font-medium">KYC обязателен</Label>
                        <p className="text-sm text-muted-foreground">
                          Требовать от партнеров прохождение верификации
                        </p>
                      </div>
                      <Switch
                        checked={formData.kycRequired}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, kycRequired: checked }))}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label className="text-base font-medium">Приватный оффер</Label>
                        <p className="text-sm text-muted-foreground">
                          Скрыть оффер из общего каталога
                        </p>
                      </div>
                      <Switch
                        checked={formData.isPrivate}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="kpi">KPI и условия</Label>
                      <Textarea
                        id="kpi"
                        value={formData.kpi}
                        onChange={(e) => setFormData(prev => ({ ...prev, kpi: e.target.value }))}
                        placeholder="Опишите KPI и дополнительные условия для партнеров"
                        className="min-h-[100px]"
                        data-testid="textarea-kpi"
                      />
                      <p className="text-sm text-muted-foreground">
                        Дополнительные требования и условия для партнеров
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Статус оффера</Label>
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
                          <SelectItem value="on_request">По запросу</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Кнопки управления */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setFormData(initialFormData)}
            >
              Сбросить
            </Button>
            
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({ ...prev, status: 'draft' }));
                  handleSubmit(new Event('submit') as any);
                }}
                disabled={createOfferMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Сохранить как черновик
              </Button>
              
              <Button 
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, status: 'active' }));
                  handleSubmit(new Event('submit') as any);
                }}
                disabled={createOfferMutation.isPending}
              >
                {createOfferMutation.isPending ? 'Создание...' : 'Создать оффер'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}