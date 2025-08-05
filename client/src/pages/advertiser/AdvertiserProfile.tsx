import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { User, Building2, Globe, Camera, Save } from 'lucide-react';

interface AdvertiserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  telegram: string;
  country: string;
  language: string;
  timezone: string;
  currency: string;
  settings: {
    brandName?: string;
    brandDescription?: string;
    brandLogo?: string;
    vertical?: string;
    partnerRules?: string;
  };
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'zh', label: '中文' },
  { value: 'it', label: 'Italiano' }
];

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar' },
  { value: 'EUR', label: 'Euro' },
  { value: 'GBP', label: 'British Pound' },
  { value: 'RUB', label: 'Russian Ruble' },
  { value: 'BRL', label: 'Brazilian Real' }
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' }
];

export default function AdvertiserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!user
  });

  const [formData, setFormData] = useState<Partial<AdvertiserProfile>>({});

  React.useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        ...profile,
        settings: profile.settings || {}
      });
    }
  }, [profile, isEditing]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<AdvertiserProfile>) => 
      apiRequest(`/api/admin/users/${user?.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({
        title: "Профиль обновлен",
        description: "Изменения в профиле успешно сохранены."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingsChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Профиль рекламодателя</h1>
          <p className="text-muted-foreground">
            Управление данными бренда и настройками кабинета
          </p>
        </div>
        <div className="space-x-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                data-testid="button-cancel"
              >
                Отмена
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                data-testid="button-save"
              >
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              data-testid="button-edit"
            >
              Редактировать
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Основные данные */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Основные данные
            </CardTitle>
            <CardDescription>
              Личная информация и контактные данные
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-firstName"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-lastName"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                data-testid="input-email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                data-testid="input-phone"
              />
            </div>
            <div>
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                value={formData.telegram || ''}
                onChange={(e) => handleInputChange('telegram', e.target.value)}
                disabled={!isEditing}
                data-testid="input-telegram"
              />
            </div>
          </CardContent>
        </Card>

        {/* Информация о бренде */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Информация о бренде
            </CardTitle>
            <CardDescription>
              Данные о компании и бренде, видимые партнерам
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="brandName">Название бренда</Label>
              <Input
                id="brandName"
                value={formData.settings?.brandName || ''}
                onChange={(e) => handleSettingsChange('brandName', e.target.value)}
                disabled={!isEditing}
                data-testid="input-brandName"
              />
            </div>
            <div>
              <Label htmlFor="company">Компания</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                disabled={!isEditing}
                data-testid="input-company"
              />
            </div>
            <div>
              <Label htmlFor="vertical">Вертикаль/Категория</Label>
              <Input
                id="vertical"
                value={formData.settings?.vertical || ''}
                onChange={(e) => handleSettingsChange('vertical', e.target.value)}
                disabled={!isEditing}
                placeholder="Например: Finance, Gaming, E-commerce"
                data-testid="input-vertical"
              />
            </div>
            <div>
              <Label htmlFor="brandDescription">Описание бренда</Label>
              <Textarea
                id="brandDescription"
                value={formData.settings?.brandDescription || ''}
                onChange={(e) => handleSettingsChange('brandDescription', e.target.value)}
                disabled={!isEditing}
                rows={3}
                data-testid="textarea-brandDescription"
              />
            </div>
            <div>
              <Label htmlFor="brandLogo">URL логотипа</Label>
              <div className="flex space-x-2">
                <Input
                  id="brandLogo"
                  value={formData.settings?.brandLogo || ''}
                  onChange={(e) => handleSettingsChange('brandLogo', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://example.com/logo.png"
                  data-testid="input-brandLogo"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  disabled={!isEditing}
                  title="Загрузить логотип"
                  data-testid="button-upload-logo"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Региональные настройки */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Региональные настройки
            </CardTitle>
            <CardDescription>
              Язык интерфейса, часовой пояс и валюта
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Язык интерфейса</Label>
              <Select
                value={formData.language || 'en'}
                onValueChange={(value) => handleInputChange('language', value)}
                disabled={!isEditing}
              >
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Часовой пояс</Label>
              <Select
                value={formData.timezone || 'UTC'}
                onValueChange={(value) => handleInputChange('timezone', value)}
                disabled={!isEditing}
              >
                <SelectTrigger data-testid="select-timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Валюта</Label>
              <Select
                value={formData.currency || 'USD'}
                onValueChange={(value) => handleInputChange('currency', value)}
                disabled={!isEditing}
              >
                <SelectTrigger data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(curr => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="country">Страна</Label>
              <Input
                id="country"
                value={formData.country || ''}
                onChange={(e) => handleInputChange('country', e.target.value)}
                disabled={!isEditing}
                data-testid="input-country"
              />
            </div>
          </CardContent>
        </Card>

        {/* Правила для партнёров */}
        <Card>
          <CardHeader>
            <CardTitle>Правила для партнёров</CardTitle>
            <CardDescription>
              Установите правила и требования для ваших партнёров
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="partnerRules">Правила и требования</Label>
              <Textarea
                id="partnerRules"
                value={formData.settings?.partnerRules || ''}
                onChange={(e) => handleSettingsChange('partnerRules', e.target.value)}
                disabled={!isEditing}
                rows={6}
                placeholder="Укажите требования к трафику, запрещённые методы продвижения, условия работы и другие важные правила для партнёров..."
                data-testid="textarea-partnerRules"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}