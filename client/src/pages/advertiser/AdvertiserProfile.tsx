import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, CheckCircle2, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { User, Building2, Globe, Camera, Save, Key, Bell, Shield, Link, Eye, EyeOff } from 'lucide-react';

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
  settings?: {
    brandName?: string;
    brandDescription?: string;
    brandLogo?: string;
    vertical?: string;
    partnerRules?: string;
    notifications?: {
      email: boolean;
      telegram: boolean;
      sms: boolean;
    };
  };
}

interface ApiToken {
  id: string;
  token: string;
  name: string;
  lastUsed: string | null;
  createdAt: string;
  isActive: boolean;
}

interface CustomDomain {
  id: string;
  domain: string;
  status: 'pending' | 'verified' | 'error';
  type: 'a_record' | 'cname';
  verificationValue: string;
  createdAt: string;
  lastChecked: string | null;
  errorMessage?: string;
}

interface WebhookSettings {
  defaultUrl: string;
  ipWhitelist: string[];
  enabled: boolean;
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
  
  // State management
  const [activeTab, setActiveTab] = useState('account');
  const [isEditing, setIsEditing] = useState(false);
  const [showTokens, setShowTokens] = useState<{ [key: string]: boolean }>({});
  const [newPassword, setNewPassword] = useState({ current: '', new: '', confirm: '' });
  const [formData, setFormData] = useState<Partial<AdvertiserProfile>>({});
  const [domainForm, setDomainForm] = useState({ domain: '', type: 'cname' as const });
  const [webhookForm, setWebhookForm] = useState<WebhookSettings>({
    defaultUrl: '',
    ipWhitelist: [],
    enabled: true
  });

  // API queries
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!user
  });

  const { data: apiTokens, isLoading: tokensLoading } = useQuery({
    queryKey: ['/api/advertiser/profile/tokens'],
    queryFn: async () => {
      return await apiRequest('/api/advertiser/profile/tokens') as ApiToken[];
    }
  });

  const { data: customDomains, isLoading: domainsLoading } = useQuery({
    queryKey: ['/api/advertiser/profile/domains'],
    queryFn: async () => {
      return await apiRequest('/api/advertiser/profile/domains') as CustomDomain[];
    }
  });

  const { data: webhookSettings, isLoading: webhookLoading } = useQuery({
    queryKey: ['/api/advertiser/profile/webhook'],
    queryFn: async () => {
      return await apiRequest('/api/advertiser/profile/webhook') as WebhookSettings;
    }
  });

  // Initialize forms when data loads
  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        settings: {
          brandName: profile.settings?.brandName || '',
          brandDescription: profile.settings?.brandDescription || '',
          brandLogo: profile.settings?.brandLogo || '',
          vertical: profile.settings?.vertical || '',
          partnerRules: profile.settings?.partnerRules || '',
          notifications: {
            email: profile.settings?.notifications?.email || false,
            telegram: profile.settings?.notifications?.telegram || false,
            sms: profile.settings?.notifications?.sms || false
          }
        }
      });
    }
  }, [profile]);

  useEffect(() => {
    if (webhookSettings) {
      setWebhookForm({
        defaultUrl: webhookSettings.defaultUrl || '',
        ipWhitelist: webhookSettings.ipWhitelist || [],
        enabled: webhookSettings.enabled !== undefined ? webhookSettings.enabled : true
      });
    }
  }, [webhookSettings]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<AdvertiserProfile>) => {
      return await apiRequest('/api/advertiser/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Профиль обновлен",
        description: "Данные профиля успешно сохранены"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive"
      });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: { currentPassword: string; newPassword: string }) => {
      return await apiRequest('/api/advertiser/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Пароль изменен",
        description: "Пароль успешно обновлен"
      });
      setNewPassword({ current: '', new: '', confirm: '' });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить пароль",
        variant: "destructive"
      });
    }
  });

  const generateTokenMutation = useMutation({
    mutationFn: async (tokenName: string) => {
      return await apiRequest('/api/advertiser/profile/tokens/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tokenName })
      });
    },
    onSuccess: () => {
      toast({
        title: "Токен создан",
        description: "Новый API токен успешно создан"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/profile/tokens'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать токен",
        variant: "destructive"
      });
    }
  });

  const deleteTokenMutation = useMutation({
    mutationFn: async (tokenId: string) => {
      return await apiRequest(`/api/advertiser/profile/tokens/${tokenId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Токен удален",
        description: "API токен успешно удален"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/profile/tokens'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить токен",
        variant: "destructive"
      });
    }
  });

  const addDomainMutation = useMutation({
    mutationFn: async (domainData: { domain: string; type: string }) => {
      return await apiRequest('/api/advertiser/profile/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(domainData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Домен добавлен",
        description: "Кастомный домен добавлен и ожидает проверки"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/profile/domains'] });
      setDomainForm({ domain: '', type: 'cname' });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить домен",
        variant: "destructive"
      });
    }
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      return await apiRequest(`/api/advertiser/profile/domains/${domainId}/verify`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Проверка запущена",
        description: "Проверка домена выполняется"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/profile/domains'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось проверить домен",
        variant: "destructive"
      });
    }
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      return await apiRequest(`/api/advertiser/profile/domains/${domainId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Домен удален",
        description: "Кастомный домен успешно удален"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/profile/domains'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить домен",
        variant: "destructive"
      });
    }
  });

  const updateWebhookMutation = useMutation({
    mutationFn: async (webhookData: WebhookSettings) => {
      return await apiRequest('/api/advertiser/profile/webhook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Webhook обновлен",
        description: "Настройки webhook успешно сохранены"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/profile/webhook'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить webhook",
        variant: "destructive"
      });
    }
  });

  // Handlers
  const handleProfileSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordChange = () => {
    if (newPassword.new !== newPassword.confirm) {
      toast({
        title: "Ошибка",
        description: "Новые пароли не совпадают",
        variant: "destructive"
      });
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: newPassword.current,
      newPassword: newPassword.new
    });
  };

  const handleTokenGenerate = () => {
    const tokenName = prompt('Введите название токена:');
    if (tokenName) {
      generateTokenMutation.mutate(tokenName);
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({
      title: "Скопировано",
      description: "API токен скопирован в буфер обмена"
    });
  };

  const handleToggleTokenVisibility = (tokenId: string) => {
    setShowTokens(prev => ({
      ...prev,
      [tokenId]: !prev[tokenId]
    }));
  };

  const handleDomainAdd = () => {
    if (!domainForm.domain.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите домен",
        variant: "destructive"
      });
      return;
    }
    addDomainMutation.mutate(domainForm);
  };

  const handleWebhookSave = () => {
    updateWebhookMutation.mutate(webhookForm);
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

  const handleNotificationChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        notifications: {
          ...prev.settings?.notifications,
          [field]: value
        }
      }
    }));
  };

  const getStatusBadge = (status: 'pending' | 'verified' | 'error') => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Ожидание' },
      verified: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Проверен' },
      error: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Ошибка' }
    };
    const variant = variants[status];
    return <Badge className={variant.color}>{variant.text}</Badge>;
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
            Управление профилем, API-доступом, кастомным доменом и настройками
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account" data-testid="tab-account" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <User className="h-4 w-4 mr-2 text-blue-500" />
            Аккаунт
          </TabsTrigger>
          <TabsTrigger value="api" data-testid="tab-api" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Key className="h-4 w-4 mr-2 text-green-500" />
            API-доступ
          </TabsTrigger>
          <TabsTrigger value="domain" data-testid="tab-domain" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Link className="h-4 w-4 mr-2 text-purple-500" />
            Кастомный домен
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Bell className="h-4 w-4 mr-2 text-orange-500" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            <Shield className="h-4 w-4 mr-2 text-red-500" />
            Безопасность
          </TabsTrigger>
        </TabsList>

        {/* Вкладка: Аккаунт */}
        <TabsContent value="account" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Информация аккаунта</h2>
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
                    onClick={handleProfileSave}
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
                <div>
                  <Label htmlFor="company">Название компании</Label>
                  <Input
                    id="company"
                    value={formData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    disabled={!isEditing}
                    data-testid="input-company"
                  />
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
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка: API-доступ */}
        <TabsContent value="api" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">API-доступ</h2>
            <Button onClick={handleTokenGenerate} data-testid="button-generate-token">
              <Key className="h-4 w-4 mr-2" />
              Создать новый токен
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API токены</CardTitle>
              <CardDescription>
                Секретные токены для интеграций и API-запросов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tokensLoading ? (
                  <div>Загрузка токенов...</div>
                ) : apiTokens && apiTokens.length > 0 ? (
                  apiTokens.map(token => (
                    <div key={token.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{token.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Создан: {new Date(token.createdAt).toLocaleDateString()}
                          {token.lastUsed && ` • Последнее использование: ${new Date(token.lastUsed).toLocaleDateString()}`}
                        </div>
                        <div className="font-mono text-sm bg-muted p-2 rounded">
                          {showTokens[token.id] ? token.token : '••••••••••••••••••••••••••••••••'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleTokenVisibility(token.id)}
                          data-testid={`button-toggle-visibility-${token.id}`}
                        >
                          {showTokens[token.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyToken(token.token)}
                          data-testid={`button-copy-token-${token.id}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteTokenMutation.mutate(token.id)}
                          data-testid={`button-delete-token-${token.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    У вас пока нет API токенов
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook настройки</CardTitle>
              <CardDescription>
                URL по умолчанию для postback'ов и IP белый список
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defaultWebhookUrl">Webhook URL по умолчанию</Label>
                <Input
                  id="defaultWebhookUrl"
                  value={webhookForm.defaultUrl}
                  onChange={(e) => setWebhookForm(prev => ({ ...prev, defaultUrl: e.target.value }))}
                  placeholder="https://your-domain.com/postback"
                  data-testid="input-webhook-url"
                />
              </div>
              <div>
                <Label htmlFor="ipWhitelist">IP белый список</Label>
                <Textarea
                  id="ipWhitelist"
                  value={webhookForm.ipWhitelist?.join('\n') || ''}
                  onChange={(e) => setWebhookForm(prev => ({ 
                    ...prev, 
                    ipWhitelist: e.target.value.split('\n').filter(ip => ip.trim()) 
                  }))}
                  placeholder="192.168.1.1&#10;10.0.0.1"
                  rows={4}
                  data-testid="textarea-ip-whitelist"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  Укажите IP-адреса, с которых разрешены API-запросы (по одному на строку)
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="webhookEnabled"
                  checked={webhookForm.enabled}
                  onCheckedChange={(checked) => setWebhookForm(prev => ({ ...prev, enabled: checked }))}
                  data-testid="switch-webhook-enabled"
                />
                <Label htmlFor="webhookEnabled">Включить webhook</Label>
              </div>
              <Button onClick={handleWebhookSave} data-testid="button-save-webhook">
                Сохранить настройки webhook
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка: Кастомный домен */}
        <TabsContent value="domain" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Кастомный домен</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Подключение кастомного домена</CardTitle>
              <CardDescription>
                Используйте собственный домен для генерации партнёрских ссылок
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="customDomain">Домен</Label>
                  <Input
                    id="customDomain"
                    value={domainForm.domain}
                    onChange={(e) => setDomainForm(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="trk.brandname.com"
                    data-testid="input-custom-domain"
                  />
                </div>
                <div>
                  <Label htmlFor="domainType">Тип записи</Label>
                  <Select
                    value={domainForm.type}
                    onValueChange={(value: 'a_record' | 'cname') => setDomainForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger data-testid="select-domain-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cname">CNAME</SelectItem>
                      <SelectItem value="a_record">A запись</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleDomainAdd} data-testid="button-add-domain">
                Добавить домен
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Подключенные домены</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {domainsLoading ? (
                  <div>Загрузка доменов...</div>
                ) : customDomains && customDomains.length > 0 ? (
                  customDomains.map(domain => (
                    <div key={domain.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">{domain.domain}</div>
                          {getStatusBadge(domain.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Добавлен: {new Date(domain.createdAt).toLocaleDateString()}
                        </div>
                        {domain.status === 'pending' && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <div className="font-medium text-sm mb-2">Инструкция по настройке DNS:</div>
                            <div className="text-sm space-y-1">
                              <div>Тип: <code className="bg-muted px-1 rounded">{domain.type.toUpperCase()}</code></div>
                              <div>Имя: <code className="bg-muted px-1 rounded">@</code></div>
                              <div>Значение: <code className="bg-muted px-1 rounded">{domain.verificationValue}</code></div>
                            </div>
                          </div>
                        )}
                        {domain.status === 'error' && domain.errorMessage && (
                          <div className="text-sm text-red-600 dark:text-red-400">
                            Ошибка: {domain.errorMessage}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyDomainMutation.mutate(domain.id)}
                          disabled={domain.status === 'verified'}
                          data-testid={`button-verify-domain-${domain.id}`}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Проверить
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteDomainMutation.mutate(domain.id)}
                          data-testid={`button-delete-domain-${domain.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    У вас пока нет подключенных доменов
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка: Уведомления */}
        <TabsContent value="notifications" className="space-y-6">
          <h2 className="text-2xl font-semibold">Настройки уведомлений</h2>

          <Card>
            <CardHeader>
              <CardTitle>Типы уведомлений</CardTitle>
              <CardDescription>
                Выберите, какие уведомления вы хотите получать
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email уведомления</Label>
                  <div className="text-sm text-muted-foreground">
                    Получать уведомления на электронную почту
                  </div>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={formData.settings?.notifications?.email || false}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  data-testid="switch-email-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="telegramNotifications">Telegram уведомления</Label>
                  <div className="text-sm text-muted-foreground">
                    Получать уведомления в Telegram
                  </div>
                </div>
                <Switch
                  id="telegramNotifications"
                  checked={formData.settings?.notifications?.telegram || false}
                  onCheckedChange={(checked) => handleNotificationChange('telegram', checked)}
                  data-testid="switch-telegram-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS уведомления</Label>
                  <div className="text-sm text-muted-foreground">
                    Получать SMS уведомления на телефон
                  </div>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={formData.settings?.notifications?.sms || false}
                  onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                  data-testid="switch-sms-notifications"
                />
              </div>
              <Button onClick={handleProfileSave} data-testid="button-save-notifications">
                Сохранить настройки уведомлений
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка: Безопасность */}
        <TabsContent value="security" className="space-y-6">
          <h2 className="text-2xl font-semibold">Настройки безопасности</h2>

          <Card>
            <CardHeader>
              <CardTitle>Смена пароля</CardTitle>
              <CardDescription>
                Обновите пароль для входа в систему
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Текущий пароль</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={newPassword.current}
                  onChange={(e) => setNewPassword(prev => ({ ...prev, current: e.target.value }))}
                  data-testid="input-current-password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword.new}
                  onChange={(e) => setNewPassword(prev => ({ ...prev, new: e.target.value }))}
                  data-testid="input-new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={newPassword.confirm}
                  onChange={(e) => setNewPassword(prev => ({ ...prev, confirm: e.target.value }))}
                  data-testid="input-confirm-password"
                />
              </div>
              <Button 
                onClick={handlePasswordChange}
                disabled={changePasswordMutation.isPending}
                data-testid="button-change-password"
              >
                Изменить пароль
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}