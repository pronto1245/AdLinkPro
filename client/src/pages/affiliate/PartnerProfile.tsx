import { useState, useEffect } from 'react';
import { Save, User, Mail, Phone, MapPin, Calendar, Globe, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function PartnerProfile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Загружаем полный профиль партнёра
  const { data: profileData, isLoading: isProfileLoading, error } = useQuery({
    queryKey: ['/api/partner/profile'],
    enabled: !!user?.id,
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
    bio: '',
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
        telegram: profileData.telegram || '',
        bio: profileData.bio || '',
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
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Заполните обязательные поля",
        description: "Имя и фамилия обязательны для заполнения.",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate(formData);
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
            <h1 className="text-3xl font-bold text-foreground">Профиль партнёра</h1>
            <p className="text-muted-foreground mt-1">
              Управляйте своей личной информацией и настройками аккаунта
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={updateProfileMutation.isPending} 
            data-testid="button-save-profile"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить'}
          </Button>
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
              <Input
                id="telegram"
                value={formData.telegram}
                onChange={(e) => handleInputChange('telegram', e.target.value)}
                placeholder="@username"
                data-testid="input-telegram"
              />
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
                  <SelectContent>
                    <SelectItem value="RU">🇷🇺 Россия</SelectItem>
                    <SelectItem value="US">🇺🇸 США</SelectItem>
                    <SelectItem value="DE">🇩🇪 Германия</SelectItem>
                    <SelectItem value="GB">🇬🇧 Великобритания</SelectItem>
                    <SelectItem value="FR">🇫🇷 Франция</SelectItem>
                    <SelectItem value="CA">🇨🇦 Канада</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Часовой пояс</Label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger data-testid="select-timezone">
                    <SelectValue placeholder="Выберите часовой пояс" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="Europe/Moscow">UTC+3 (Москва)</SelectItem>
                    <SelectItem value="Europe/London">UTC+0 (Лондон)</SelectItem>
                    <SelectItem value="America/New_York">UTC-5 (Нью-Йорк)</SelectItem>
                    <SelectItem value="America/Los_Angeles">UTC-8 (Лос-Анджелес)</SelectItem>
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