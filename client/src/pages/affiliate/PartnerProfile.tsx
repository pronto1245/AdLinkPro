import { useState, useEffect } from 'react';
import { Save, User, Mail, Phone, MapPin, Calendar, Globe, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { useAuth } from '../contexts/auth-context';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';

interface PartnerProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  timezone: string;
  currency: string;
  telegram: string;
  partnerNumber: string;
  createdAt: string;
  lastLoginAt: string;
}

export default function PartnerProfile() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Загружаем полный профиль партнёра с error handling
  const { data: profileData, isLoading: isProfileLoading, error } = useQuery<PartnerProfileData>({
    queryKey: ['/api/partner/profile'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) throw new Error('No auth token');
        
        const response = await fetch('/api/partner/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          console.warn('Profile API failed:', response.status);
          throw new Error(`Profile fetch failed: ${response.status}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('Profile error:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    retry: false // Prevent multiple retry attempts
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    timezone: 'UTC',
    currency: 'USD',
    telegram: '',
  });

  // Обновляем форму при загрузке данных
  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        company: profileData.company || '',
        country: profileData.country || '',
        timezone: profileData.timezone || 'UTC',
        currency: profileData.currency || 'USD',
        telegram: profileData.telegram ? profileData.telegram.replace(/^../, '') : '',
      });
    }
  }, [profileData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Мутация для обновления профиля
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/partner/profile', 'PATCH', data);
    },
    onSuccess: (data) => {
      toast({
        title: "Профиль обновлён",
        description: "Ваши данные успешно сохранены.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка сохранения",
        description: error.message || "Не удалось сохранить изменения.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    // Проверяем, что whitespace-only значения не допускаются
    if (formData.firstName.trim() === '' && formData.firstName.length > 0) {
      toast({
        title: "Неверное значение имени",
        description: "Имя не может состоять только из пробелов.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.lastName.trim() === '' && formData.lastName.length > 0) {
      toast({
        title: "Неверное значение фамилии", 
        description: "Фамилия не может состоять только из пробелов.",
        variant: "destructive",
      });
      return;
    }

    // Валидация email (если он изменен)
    if (formData.email && formData.email !== profileData?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Неверный формат email",
          description: "Пожалуйста, введите корректный email адрес.",
          variant: "destructive",
        });
        return;
      }
    }

    // Валидация телефона (если заполнен)
    if (formData.phone.trim()) {
      const phoneRegex = /^[\+]?[\d\s\(\)\-]{7,20}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        toast({
          title: "Неверный формат телефона",
          description: "Пожалуйста, введите корректный номер телефона.",
          variant: "destructive",
        });
        return;
      }
    }

    // Подготавливаем финальные данные
    let finalFormData = { ...formData };
    
    // Валидация и форматирование Telegram (если заполнен)
    if (formData.telegram.trim()) {
      const telegramValue = formData.telegram.trim().replace(/^../, '');
      const telegramRegex = /^[a-zA-Z0-9_]+$/;
      
      if (!telegramRegex.test(telegramValue)) {
        toast({
          title: "Неверный формат Telegram",
          description: "Telegram никнейм может содержать только буквы, цифры и подчеркивание.",
          variant: "destructive",
        });
        return;
      }
      
      finalFormData.telegram = '@' + telegramValue;
    }

    updateProfileMutation.mutate(finalFormData);
  };

  // Показываем скелетон при загрузке
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-80" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Показываем ошибку если не удалось загрузить
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <RefreshCw className="h-12 w-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-semibold">Ошибка загрузки профиля</h3>
              <p className="text-muted-foreground">Не удалось загрузить данные профиля</p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/partner/profile'] })}>
                Повторить
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('profile.title')}</h1>
            <p className="text-muted-foreground mt-1">
              Управляйте своей личной информацией и настройками аккаунта
            </p>
          </div>
          <div className="flex items-center gap-3">
            {profileData?.partnerNumber && (
              <div className="text-sm text-muted-foreground">
                ID: <span className="font-mono">{profileData.partnerNumber}</span>
              </div>
            )}
            <Button 
              onClick={handleSave} 
              disabled={updateProfileMutation.isPending || isProfileLoading}
              className="flex items-center gap-2"
              data-testid="button-save-profile"
              title="Сохранить изменения в профиле"
            >
              <Save className="h-4 w-4" />
              {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Личная информация
            </CardTitle>
            <CardDescription>
              Обновите свои личные данные и контактную информацию
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Введите ваше имя"
                  data-testid="input-firstName"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Введите вашу фамилию"
                  data-testid="input-lastName"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className="pl-10"
                    disabled
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+7 (999) 999-99-99"
                    className="pl-10"
                    data-testid="input-phone"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Компания</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Название вашей компании"
                data-testid="input-company"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-muted-foreground">@</span>
                <Input
                  id="telegram"
                  value={formData.telegram.startsWith('@') ? formData.telegram.slice(1) : formData.telegram}
                  onChange={(e) => {
                    const value = e.target.value.replace(/^../, '');
                    handleInputChange('telegram', value);
                  }}
                  placeholder="username"
                  className="pl-8"
                  data-testid="input-telegram"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Ваш Telegram никнейм (без @)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location & Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Локализация и предпочтения
            </CardTitle>
            <CardDescription>
              Настройте свои региональные предпочтения
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Страна</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger data-testid="select-country">
                    <SelectValue placeholder="Выберите страну" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="AF">🇦🇫 Афганистан</SelectItem>
                    <SelectItem value="AL">🇦🇱 Албания</SelectItem>
                    <SelectItem value="DZ">🇩🇿 Алжир</SelectItem>
                    <SelectItem value="AD">🇦🇩 Андорра</SelectItem>
                    <SelectItem value="AO">🇦🇴 Ангола</SelectItem>
                    <SelectItem value="AR">🇦🇷 Аргентина</SelectItem>
                    <SelectItem value="AM">🇦🇲 Армения</SelectItem>
                    <SelectItem value="AU">🇦🇺 Австралия</SelectItem>
                    <SelectItem value="AT">🇦🇹 Австрия</SelectItem>
                    <SelectItem value="AZ">🇦🇿 Азербайджан</SelectItem>
                    <SelectItem value="BD">🇧🇩 Бангладеш</SelectItem>
                    <SelectItem value="BB">🇧🇧 Барбадос</SelectItem>
                    <SelectItem value="BY">🇧🇾 Беларусь</SelectItem>
                    <SelectItem value="BE">🇧🇪 Бельгия</SelectItem>
                    <SelectItem value="BZ">🇧🇿 Белиз</SelectItem>
                    <SelectItem value="BJ">🇧🇯 Бенин</SelectItem>
                    <SelectItem value="BG">🇧🇬 Болгария</SelectItem>
                    <SelectItem value="BO">🇧🇴 Боливия</SelectItem>
                    <SelectItem value="BA">🇧🇦 Босния и Герцеговина</SelectItem>
                    <SelectItem value="BW">🇧🇼 Ботсвана</SelectItem>
                    <SelectItem value="BR">🇧🇷 Бразилия</SelectItem>
                    <SelectItem value="GB">🇬🇧 Великобритания</SelectItem>
                    <SelectItem value="HU">🇭🇺 Венгрия</SelectItem>
                    <SelectItem value="VE">🇻🇪 Венесуэла</SelectItem>
                    <SelectItem value="VN">🇻🇳 Вьетнам</SelectItem>
                    <SelectItem value="GA">🇬🇦 Габон</SelectItem>
                    <SelectItem value="GH">🇬🇭 Гана</SelectItem>
                    <SelectItem value="GT">🇬🇹 Гватемала</SelectItem>
                    <SelectItem value="GW">🇬🇼 Гвинея-Бисау</SelectItem>
                    <SelectItem value="GN">🇬🇳 Гвинея</SelectItem>
                    <SelectItem value="DE">🇩🇪 Германия</SelectItem>
                    <SelectItem value="GR">🇬🇷 Греция</SelectItem>
                    <SelectItem value="GE">🇬🇪 Грузия</SelectItem>
                    <SelectItem value="DK">🇩🇰 Дания</SelectItem>
                    <SelectItem value="EG">🇪🇬 Египет</SelectItem>
                    <SelectItem value="ZM">🇿🇲 Замбия</SelectItem>
                    <SelectItem value="ZW">🇿🇼 Зимбабве</SelectItem>
                    <SelectItem value="IL">🇮🇱 Израиль</SelectItem>
                    <SelectItem value="IN">🇮🇳 Индия</SelectItem>
                    <SelectItem value="ID">🇮🇩 Индонезия</SelectItem>
                    <SelectItem value="JO">🇯🇴 Иордания</SelectItem>
                    <SelectItem value="IQ">🇮🇶 Ирак</SelectItem>
                    <SelectItem value="IR">🇮🇷 Иран</SelectItem>
                    <SelectItem value="IE">🇮🇪 Ирландия</SelectItem>
                    <SelectItem value="IS">🇮🇸 Исландия</SelectItem>
                    <SelectItem value="ES">🇪🇸 Испания</SelectItem>
                    <SelectItem value="IT">🇮🇹 Италия</SelectItem>
                    <SelectItem value="YE">🇾🇪 Йемен</SelectItem>
                    <SelectItem value="KZ">🇰🇿 Казахстан</SelectItem>
                    <SelectItem value="KH">🇰🇭 Камбоджа</SelectItem>
                    <SelectItem value="CM">🇨🇲 Камерун</SelectItem>
                    <SelectItem value="CA">🇨🇦 Канада</SelectItem>
                    <SelectItem value="QA">🇶🇦 Катар</SelectItem>
                    <SelectItem value="KE">🇰🇪 Кения</SelectItem>
                    <SelectItem value="CY">🇨🇾 Кипр</SelectItem>
                    <SelectItem value="KG">🇰🇬 Киргизия</SelectItem>
                    <SelectItem value="CN">🇨🇳 Китай</SelectItem>
                    <SelectItem value="CO">🇨🇴 Колумбия</SelectItem>
                    <SelectItem value="CR">🇨🇷 Коста-Рика</SelectItem>
                    <SelectItem value="CU">🇨🇺 Куба</SelectItem>
                    <SelectItem value="KW">🇰🇼 Кувейт</SelectItem>
                    <SelectItem value="LV">🇱🇻 Латвия</SelectItem>
                    <SelectItem value="LS">🇱🇸 Лесото</SelectItem>
                    <SelectItem value="LR">🇱🇷 Либерия</SelectItem>
                    <SelectItem value="LB">🇱🇧 Ливан</SelectItem>
                    <SelectItem value="LY">🇱🇾 Ливия</SelectItem>
                    <SelectItem value="LT">🇱🇹 Литва</SelectItem>
                    <SelectItem value="LU">🇱🇺 Люксембург</SelectItem>
                    <SelectItem value="MU">🇲🇺 Маврикий</SelectItem>
                    <SelectItem value="MG">🇲🇬 Мадагаскар</SelectItem>
                    <SelectItem value="MK">🇲🇰 Македония</SelectItem>
                    <SelectItem value="MW">🇲🇼 Малави</SelectItem>
                    <SelectItem value="MY">🇲🇾 Малайзия</SelectItem>
                    <SelectItem value="ML">🇲🇱 Мали</SelectItem>
                    <SelectItem value="MT">🇲🇹 Мальта</SelectItem>
                    <SelectItem value="MA">🇲🇦 Марокко</SelectItem>
                    <SelectItem value="MX">🇲🇽 Мексика</SelectItem>
                    <SelectItem value="MZ">🇲🇿 Мозамбик</SelectItem>
                    <SelectItem value="MD">🇲🇩 Молдова</SelectItem>
                    <SelectItem value="MN">🇲🇳 Монголия</SelectItem>
                    <SelectItem value="MM">🇲🇲 Мьянма</SelectItem>
                    <SelectItem value="NA">🇳🇦 Намибия</SelectItem>
                    <SelectItem value="NP">🇳🇵 Непал</SelectItem>
                    <SelectItem value="NE">🇳🇪 Нигер</SelectItem>
                    <SelectItem value="NG">🇳🇬 Нигерия</SelectItem>
                    <SelectItem value="NL">🇳🇱 Нидерланды</SelectItem>
                    <SelectItem value="NZ">🇳🇿 Новая Зеландия</SelectItem>
                    <SelectItem value="NO">🇳🇴 Норвегия</SelectItem>
                    <SelectItem value="AE">🇦🇪 ОАЭ</SelectItem>
                    <SelectItem value="OM">🇴🇲 Оман</SelectItem>
                    <SelectItem value="PK">🇵🇰 Пакистан</SelectItem>
                    <SelectItem value="PA">🇵🇦 Панама</SelectItem>
                    <SelectItem value="PY">🇵🇾 Парагвай</SelectItem>
                    <SelectItem value="PE">🇵🇪 Перу</SelectItem>
                    <SelectItem value="PL">🇵🇱 Польша</SelectItem>
                    <SelectItem value="PT">🇵🇹 Португалия</SelectItem>
                    <SelectItem value="RU">🇷🇺 Россия</SelectItem>
                    <SelectItem value="RW">🇷🇼 Руанда</SelectItem>
                    <SelectItem value="RO">🇷🇴 Румыния</SelectItem>
                    <SelectItem value="SV">🇸🇻 Сальвадор</SelectItem>
                    <SelectItem value="SA">🇸🇦 Саудовская Аравия</SelectItem>
                    <SelectItem value="SZ">🇸🇿 Свазиленд</SelectItem>
                    <SelectItem value="SG">🇸🇬 Сингапур</SelectItem>
                    <SelectItem value="SY">🇸🇾 Сирия</SelectItem>
                    <SelectItem value="SK">🇸🇰 Словакия</SelectItem>
                    <SelectItem value="SI">🇸🇮 Словения</SelectItem>
                    <SelectItem value="US">🇺🇸 США</SelectItem>
                    <SelectItem value="TJ">🇹🇯 Таджикистан</SelectItem>
                    <SelectItem value="TH">🇹🇭 Таиланд</SelectItem>
                    <SelectItem value="TZ">🇹🇿 Танзания</SelectItem>
                    <SelectItem value="TN">🇹🇳 Тунис</SelectItem>
                    <SelectItem value="TM">🇹🇲 Туркменистан</SelectItem>
                    <SelectItem value="TR">🇹🇷 Турция</SelectItem>
                    <SelectItem value="UG">🇺🇬 Уганда</SelectItem>
                    <SelectItem value="UZ">🇺🇿 Узбекистан</SelectItem>
                    <SelectItem value="UA">🇺🇦 Украина</SelectItem>
                    <SelectItem value="UY">🇺🇾 Уругвай</SelectItem>
                    <SelectItem value="PH">🇵🇭 Филиппины</SelectItem>
                    <SelectItem value="FI">🇫🇮 Финляндия</SelectItem>
                    <SelectItem value="FR">🇫🇷 Франция</SelectItem>
                    <SelectItem value="HR">🇭🇷 Хорватия</SelectItem>
                    <SelectItem value="TD">🇹🇩 Чад</SelectItem>
                    <SelectItem value="CZ">🇨🇿 Чехия</SelectItem>
                    <SelectItem value="CL">🇨🇱 Чили</SelectItem>
                    <SelectItem value="CH">🇨🇭 Швейцария</SelectItem>
                    <SelectItem value="SE">🇸🇪 Швеция</SelectItem>
                    <SelectItem value="LK">🇱🇰 Шри-Ланка</SelectItem>
                    <SelectItem value="EC">🇪🇨 Эквадор</SelectItem>
                    <SelectItem value="EE">🇪🇪 Эстония</SelectItem>
                    <SelectItem value="ET">🇪🇹 Эфиопия</SelectItem>
                    <SelectItem value="ZA">🇿🇦 ЮАР</SelectItem>
                    <SelectItem value="KR">🇰🇷 Южная Корея</SelectItem>
                    <SelectItem value="JM">🇯🇲 Ямайка</SelectItem>
                    <SelectItem value="JP">🇯🇵 Япония</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Часовой пояс</Label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger data-testid="select-timezone">
                    <SelectValue placeholder="Выберите часовой пояс" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="UTC">UTC+0 (Универсальное время)</SelectItem>
                    
                    {/* Европа */}
                    <SelectItem value="Europe/London">UTC+0 (Лондон, Дублин)</SelectItem>
                    <SelectItem value="Europe/Berlin">UTC+1 (Берлин, Рим, Париж)</SelectItem>
                    <SelectItem value="Europe/Helsinki">UTC+2 (Хельсинки, Киев)</SelectItem>
                    <SelectItem value="Europe/Moscow">UTC+3 (Москва, Минск)</SelectItem>
                    <SelectItem value="Europe/Samara">UTC+4 (Самара)</SelectItem>
                    <SelectItem value="Asia/Yekaterinburg">UTC+5 (Екатеринбург)</SelectItem>
                    <SelectItem value="Asia/Omsk">UTC+6 (Омск)</SelectItem>
                    <SelectItem value="Asia/Krasnoyarsk">UTC+7 (Красноярск)</SelectItem>
                    <SelectItem value="Asia/Irkutsk">UTC+8 (Иркутск)</SelectItem>
                    <SelectItem value="Asia/Yakutsk">UTC+9 (Якутск)</SelectItem>
                    <SelectItem value="Asia/Vladivostok">UTC+10 (Владивосток)</SelectItem>
                    <SelectItem value="Asia/Magadan">UTC+11 (Магадан)</SelectItem>
                    <SelectItem value="Asia/Kamchatka">UTC+12 (Камчатка)</SelectItem>
                    
                    {/* Америка */}
                    <SelectItem value="America/Los_Angeles">UTC-8 (Лос-Анджелес, Сан-Франциско)</SelectItem>
                    <SelectItem value="America/Denver">UTC-7 (Денвер, Солт-Лейк-Сити)</SelectItem>
                    <SelectItem value="America/Chicago">UTC-6 (Чикаго, Даллас)</SelectItem>
                    <SelectItem value="America/New_York">UTC-5 (Нью-Йорк, Вашингтон)</SelectItem>
                    <SelectItem value="America/Halifax">UTC-4 (Галифакс)</SelectItem>
                    <SelectItem value="America/St_Johns">UTC-3:30 (Сент-Джонс)</SelectItem>
                    <SelectItem value="America/Sao_Paulo">UTC-3 (Сан-Паулу, Буэнос-Айрес)</SelectItem>
                    <SelectItem value="America/Noronha">UTC-2 (Фернанду-ди-Норонья)</SelectItem>
                    <SelectItem value="America/Scoresbysund">UTC-1 (Азорские острова)</SelectItem>
                    
                    {/* Азия */}
                    <SelectItem value="Asia/Dubai">UTC+4 (Дубай, Баку)</SelectItem>
                    <SelectItem value="Asia/Karachi">UTC+5 (Карачи, Ташкент)</SelectItem>
                    <SelectItem value="Asia/Kolkata">UTC+5:30 (Дели, Мумбаи)</SelectItem>
                    <SelectItem value="Asia/Kathmandu">UTC+5:45 (Катманду)</SelectItem>
                    <SelectItem value="Asia/Dhaka">UTC+6 (Дакка, Алма-Ата)</SelectItem>
                    <SelectItem value="Asia/Yangon">UTC+6:30 (Янгон)</SelectItem>
                    <SelectItem value="Asia/Bangkok">UTC+7 (Бангкок, Джакарта)</SelectItem>
                    <SelectItem value="Asia/Shanghai">UTC+8 (Пекин, Сингапур)</SelectItem>
                    <SelectItem value="Asia/Tokyo">UTC+9 (Токио, Сеул)</SelectItem>
                    <SelectItem value="Australia/Adelaide">UTC+9:30 (Аделаида)</SelectItem>
                    <SelectItem value="Australia/Sydney">UTC+10 (Сидней, Мельбурн)</SelectItem>
                    <SelectItem value="Pacific/Norfolk">UTC+11 (Норфолк)</SelectItem>
                    <SelectItem value="Pacific/Auckland">UTC+12 (Окленд)</SelectItem>
                    <SelectItem value="Pacific/Chatham">UTC+12:45 (Чатем)</SelectItem>
                    <SelectItem value="Pacific/Tongatapu">UTC+13 (Нукуалофа)</SelectItem>
                    <SelectItem value="Pacific/Kiritimati">UTC+14 (Киритимати)</SelectItem>
                    
                    {/* Африка */}
                    <SelectItem value="Africa/Casablanca">UTC+0 (Касабланка)</SelectItem>
                    <SelectItem value="Africa/Lagos">UTC+1 (Лагос, Алжир)</SelectItem>
                    <SelectItem value="Africa/Cairo">UTC+2 (Каир, Йоханнесбург)</SelectItem>
                    <SelectItem value="Africa/Nairobi">UTC+3 (Найроби, Аддис-Абеба)</SelectItem>
                    
                    {/* Океания */}
                    <SelectItem value="Pacific/Honolulu">UTC-10 (Гонолулу)</SelectItem>
                    <SelectItem value="Pacific/Marquesas">UTC-9:30 (Маркизские острова)</SelectItem>
                    <SelectItem value="Pacific/Gambier">UTC-9 (Гамбье)</SelectItem>
                    <SelectItem value="Pacific/Pitcairn">UTC-8 (Питкэрн)</SelectItem>
                    <SelectItem value="Pacific/Easter">UTC-6 (Остров Пасхи)</SelectItem>
                    
                    {/* Атлантика */}
                    <SelectItem value="Atlantic/Cape_Verde">UTC-1 (Кабо-Верде)</SelectItem>
                    <SelectItem value="Atlantic/Azores">UTC-1 (Азорские острова)</SelectItem>
                    <SelectItem value="Atlantic/Reykjavik">UTC+0 (Рейкьявик)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Валюта</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger data-testid="select-currency">
                    <SelectValue placeholder="Выберите валюту" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="RUB">RUB (₽)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle>Статус аккаунта</CardTitle>
            <CardDescription>
              Информация о состоянии вашего аккаунта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Статус верификации</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    В ожидании
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Статус аккаунта</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Активен
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Дата регистрации</span>
                  <span className="text-sm text-muted-foreground">
                    {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Последний вход</span>
                  <span className="text-sm text-muted-foreground">
                    {profileData?.lastLoginAt ? new Date(profileData.lastLoginAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Номер партнёра</span>
                  <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
                    #{profileData?.partnerNumber || 'Не присвоен'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}