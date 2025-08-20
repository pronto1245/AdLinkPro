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
import { AlertCircle, CheckCircle2, Copy, RefreshCw, Trash2, Eye, EyeOff, User, Building2, Globe, Save, Key, Bell, Shield, Link } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import DomainVerification from '@/components/advertiser/DomainVerification';
import { CustomDomainManager } from '@/components/advertiser/CustomDomainManager';

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
  twoFactorEnabled?: boolean;
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

  const [activeTab, setActiveTab] = useState('account');
  const [isEditing, setIsEditing] = useState(false);
  const [showTokens, setShowTokens] = useState<{ [key: string]: boolean }>({});
  const [newPassword, setNewPassword] = useState({ current: '', new: '', confirm: '' });
  const [formData, setFormData] = useState<Partial<AdvertiserProfile>>({});

  const [webhookForm, setWebhookForm] = useState<WebhookSettings>({
    defaultUrl: '',
    ipWhitelist: [],
    enabled: true
  });
  const [notificationForm, setNotificationForm] = useState({
    email: false,
    telegram: false,
    sms: false
  });

  const [telegramChatId, setTelegramChatId] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!user
  });

  const { data: apiTokens, isLoading: tokensLoading } = useQuery<ApiToken[]>({
    queryKey: ['/api/advertiser/api-tokens']
  });



  const { data: webhookSettings, isLoading: webhookLoading } = useQuery<WebhookSettings>({
    queryKey: ['/api/advertiser/profile/webhook']
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '', 
        email: user.email || '',
        phone: (user as any).phone || '',
        company: user.company || '',
        country: (user as any).country || 'US',
        language: user.language || 'en',
        timezone: (user as any).timezone || 'UTC',
        currency: (user as any).currency || 'USD',
        twoFactorEnabled: (user as any).twoFactorEnabled || false,
        settings: {
          brandName: (user as any).settings?.brandName || '',
          brandDescription: (user as any).settings?.brandDescription || '',
          brandLogo: (user as any).settings?.brandLogo || '',
          vertical: (user as any).settings?.vertical || '',
          partnerRules: (user as any).settings?.partnerRules || '',
          notifications: {
            email: (user as any).settings?.notifications?.email || false,
            telegram: (user as any).settings?.notifications?.telegram || false,
            sms: (user as any).settings?.notifications?.sms || false
          }
        }
      });
      
      setNotificationForm({
        email: (user as any).settings?.notifications?.email || false,
        telegram: (user as any).settings?.notifications?.telegram || false,
        sms: (user as any).settings?.notifications?.sms || false
      });

      setTelegramChatId((user as any).telegramChatId ? String((user as any).telegramChatId) : '');
      
      // Также обновляем formData с Telegram полем
      setFormData(prev => ({
        ...prev,
        telegram: (user as any).telegram || '',
        telegramChatId: (user as any).telegramChatId || null
      }));
    }
  }, [user]);

  useEffect(() => {
    if (webhookSettings) {
      setWebhookForm({
        defaultUrl: webhookSettings.defaultUrl || '',
        ipWhitelist: webhookSettings.ipWhitelist || [],
        enabled: webhookSettings.enabled !== undefined ? webhookSettings.enabled : true
      });
    }
  }, [webhookSettings]);

  // --- MUTATIONS ---
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<AdvertiserProfile>) => {
      return apiRequest('/api/advertiser/profile', 'PATCH', data);
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
      return apiRequest('/api/advertiser/profile/change-password', 'POST', passwordData);
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

  // Removed 2FA Toggle Mutation - 2FA is disabled
  
  const generateTokenMutation = useMutation({
    mutationFn: async (tokenName: string) => {
      return apiRequest('/api/advertiser/api-tokens', 'POST', { name: tokenName });
    },
    onSuccess: () => {
      toast({
        title: "Токен создан",
        description: "Новый API токен успешно создан"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/api-tokens'] });
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
      return apiRequest(`/api/advertiser/api-tokens/${tokenId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Токен удален",
        description: "API токен успешно удален"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/api-tokens'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить токен",
        variant: "destructive"
      });
    }
  });



  const updateWebhookMutation = useMutation({
    mutationFn: async (webhookData: WebhookSettings) => {
      return apiRequest('/api/advertiser/profile/webhook', 'PATCH', webhookData);
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

  const updateNotificationsMutation = useMutation({
    mutationFn: async (notificationsData: { email: boolean; telegram: boolean; sms: boolean }) => {
      return apiRequest('/api/advertiser/profile/notifications', 'PATCH', { notifications: notificationsData });
    },
    onSuccess: () => {
      toast({
        title: "Уведомления обновлены",
        description: "Настройки уведомлений успешно сохранены"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить уведомления",
        variant: "destructive"
      });
    }
  });

  const linkTelegramMutation = useMutation({
    mutationFn: async (chatId: string) => {
      return apiRequest('/api/telegram/link', 'PATCH', { telegramChatId: chatId });
    },
    onSuccess: () => {
      toast({
        title: "Telegram привязан",
        description: "Аккаунт Telegram успешно привязан к профилю"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: () => {
      toast({
        title: "Ошибка привязки",
        description: "Не удалось привязать Telegram аккаунт",
        variant: "destructive"
      });
    }
  });

  const testTelegramMutation = useMutation({
    mutationFn: async (type: string) => {
      return apiRequest('/api/telegram/test', 'POST', { 
        userId: user?.id, 
        type: type,
        data: {
          offerName: 'Test Offer',
          partnerName: 'Test Partner', 
          amount: 100,
          currency: 'USD',
          country: 'RU'
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Тест отправлен",
        description: "Тестовое уведомление отправлено в Telegram"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить тестовое уведомление",
        variant: "destructive"
      });
    }
  });

  // --- HANDLERS ---
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
    const tokenName = window.prompt('Введите название токена:');
    if (tokenName && tokenName.trim()) {
      generateTokenMutation.mutate(tokenName.trim());
    }
  };

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast({
        title: "Скопировано",
        description: "API токен скопирован в буфер обмена"
      });
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = token;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "Скопировано",
        description: "API токен скопирован в буфер обмена"
      });
    }
  };

  const handleToggleTokenVisibility = (tokenId: string) => {
    setShowTokens(prev => ({
      ...prev,
      [tokenId]: !prev[tokenId]
    }));
  };



  const handleWebhookSave = () => {
    updateWebhookMutation.mutate(webhookForm);
  };

  const handleSaveNotifications = () => {
    updateNotificationsMutation.mutate(notificationForm);
  };

  // Removed handle2FAToggle - 2FA is disabled

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
          email: field === 'email' ? value : prev.settings?.notifications?.email || false,
          telegram: field === 'telegram' ? value : prev.settings?.notifications?.telegram || false,
          sms: field === 'sms' ? value : prev.settings?.notifications?.sms || false
        }
      }
    }));
  };

  const handleLinkTelegram = () => {
    if (!telegramChatId) {
      toast({
        title: "Ошибка",
        description: "Введите Chat ID",
        variant: "destructive"
      });
      return;
    }
    linkTelegramMutation.mutate(telegramChatId);
  };

  const handleTestTelegram = (type: string) => {
    testTelegramMutation.mutate(type);
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
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Профиль рекламодателя</h1>
          <p className="text-muted-foreground">
            Управление профилем, API-доступом, кастомным доменом и настройками
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="account" data-testid="tab-account">Аккаунт</TabsTrigger>
          <TabsTrigger value="api" data-testid="tab-api">API-доступ</TabsTrigger>
          <TabsTrigger value="telegram" data-testid="tab-telegram">Telegram</TabsTrigger>
          <TabsTrigger value="domain" data-testid="tab-domain">Домен</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">Безопасность</TabsTrigger>
        </TabsList>

        {/* ACCOUNT TAB */}
        <TabsContent value="account" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Информация аккаунта</h2>
            <div className="space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} data-testid="button-cancel-edit">Отмена</Button>
                  <Button onClick={handleProfileSave} disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">Редактировать</Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Основные данные */}
            <Card>
              <CardHeader><CardTitle>Основные данные</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Имя</Label>
                    <Input value={formData.firstName || ''} onChange={(e) => handleInputChange('firstName', e.target.value)} disabled={!isEditing} data-testid="input-first-name" />
                  </div>
                  <div>
                    <Label>Фамилия</Label>
                    <Input value={formData.lastName || ''} onChange={(e) => handleInputChange('lastName', e.target.value)} disabled={!isEditing} data-testid="input-last-name" />
                  </div>
                </div>
                <Label>Email</Label>
                <Input type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} disabled={!isEditing} data-testid="input-email" />

                <Label>Телефон</Label>
                <Input value={formData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} disabled={!isEditing} data-testid="input-phone" />

                <Label>Telegram</Label>
                <Input value={formData.telegram || ''} onChange={(e) => handleInputChange('telegram', e.target.value)} disabled={!isEditing} data-testid="input-telegram" />

                <Label>Название компании</Label>
                <Input value={formData.company || ''} onChange={(e) => handleInputChange('company', e.target.value)} disabled={!isEditing} data-testid="input-company" />
              </CardContent>
            </Card>

            {/* Региональные настройки */}
            <Card>
              <CardHeader><CardTitle>Региональные настройки</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Label>Страна</Label>
                <Input value={formData.country || ''} onChange={(e) => handleInputChange('country', e.target.value)} disabled={!isEditing} data-testid="input-country" />

                <Label>Язык интерфейса</Label>
                <Select value={formData.language || 'en'} onValueChange={(v) => handleInputChange('language', v)} disabled={!isEditing}>
                  <SelectTrigger data-testid="select-language"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Label>Часовой пояс</Label>
                <Select value={formData.timezone || 'UTC'} onValueChange={(v) => handleInputChange('timezone', v)} disabled={!isEditing}>
                  <SelectTrigger data-testid="select-timezone"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Label>Валюта</Label>
                <Select value={formData.currency || 'USD'} onValueChange={(v) => handleInputChange('currency', v)} disabled={!isEditing}>
                  <SelectTrigger data-testid="select-currency"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(curr => <SelectItem key={curr.value} value={curr.value}>{curr.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Настройки бренда */}
          <Card>
            <CardHeader><CardTitle>Настройки бренда</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Label>Название бренда</Label>
              <Input value={formData.settings?.brandName || ''} onChange={(e) => handleSettingsChange('brandName', e.target.value)} disabled={!isEditing} data-testid="input-brand-name" />

              <Label>Вертикаль</Label>
              <Input value={formData.settings?.vertical || ''} onChange={(e) => handleSettingsChange('vertical', e.target.value)} disabled={!isEditing} data-testid="input-vertical" />

              <Label>Описание бренда</Label>
              <Textarea rows={3} value={formData.settings?.brandDescription || ''} onChange={(e) => handleSettingsChange('brandDescription', e.target.value)} disabled={!isEditing} data-testid="textarea-brand-description" />

              <Label>Правила для партнёров</Label>
              <Textarea rows={4} value={formData.settings?.partnerRules || ''} onChange={(e) => handleSettingsChange('partnerRules', e.target.value)} disabled={!isEditing} data-testid="textarea-partner-rules" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* API ACCESS TAB */}
        <TabsContent value="api" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">API-доступ</h2>
            <Button onClick={handleTokenGenerate} data-testid="button-generate-token">
              <Key className="h-4 w-4 mr-2" />
              Создать новый токен
            </Button>
          </div>

          {/* API TOKENS */}
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
                    <div key={token.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`token-${token.id}`}>
                      <div className="space-y-1">
                        <div className="font-medium" data-testid={`token-name-${token.id}`}>{token.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Создан: {new Date(token.createdAt).toLocaleDateString()}
                          {token.lastUsed && ` • Последнее использование: ${new Date(token.lastUsed).toLocaleDateString()}`}
                        </div>
                        <div className="font-mono text-sm bg-muted p-2 rounded" data-testid={`token-value-${token.id}`}>
                          {showTokens[token.id] ? token.token : '••••••••••••••••••••••••••••••••'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleToggleTokenVisibility(token.id)} data-testid={`button-toggle-token-${token.id}`} title="Показать/скрыть токен">
                          {showTokens[token.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleCopyToken(token.token)} data-testid={`button-copy-token-${token.id}`} title="Копировать токен">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteTokenMutation.mutate(token.id)} data-testid={`button-delete-token-${token.id}`} title="Удалить токен">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground" data-testid="empty-tokens">
                    У вас пока нет API токенов
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* WEBHOOK */}
          <Card>
            <CardHeader>
              <CardTitle>Webhook настройки</CardTitle>
              <CardDescription>
                URL по умолчанию для постбеков и IP-белый список
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
                <Label htmlFor="ipWhitelist">IP-белый список</Label>
                <Textarea
                  id="ipWhitelist"
                  value={webhookForm.ipWhitelist.join('\n')}
                  onChange={(e) =>
                    setWebhookForm(prev => ({
                      ...prev,
                      ipWhitelist: e.target.value.split('\n').map(ip => ip.trim()).filter(Boolean)
                    }))
                  }
                  placeholder="192.168.1.1\n10.0.0.1"
                  rows={4}
                  data-testid="textarea-ip-whitelist"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  Один IP на строку
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="webhookEnabled"
                  checked={webhookForm.enabled}
                  onCheckedChange={(checked) => setWebhookForm(prev => ({ ...prev, enabled: checked }))}
                  data-testid="switch-webhook-enabled"
                />
                <Label htmlFor="webhookEnabled">Включить Webhook</Label>
              </div>

              <Button onClick={handleWebhookSave} data-testid="button-save-webhook">
                Сохранить настройки Webhook
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TELEGRAM TAB */}
        <TabsContent value="telegram" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Telegram интеграция</h2>
          </div>

          {/* ИНСТРУКЦИЯ ПО ПОДКЛЮЧЕНИЮ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">📖</span>
                </div>
                <span>Инструкция по подключению</span>
              </CardTitle>
              <CardDescription>
                Пошаговое руководство для подключения Telegram бота
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-medium">Найдите бота в Telegram</h4>
                      <p className="text-sm text-muted-foreground">
                        Перейдите к боту <code className="bg-muted px-1 py-0.5 rounded">@integracia7980_bot</code> или по ссылке: 
                        <a href="https://t.me/integracia7980_bot" target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline ml-1">
                          https://t.me/integracia7980_bot
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-medium">Получите Chat ID</h4>
                      <p className="text-sm text-muted-foreground">
                        Напишите боту команду <code className="bg-muted px-1 py-0.5 rounded">/start</code>
                        <br />
                        Бот пришлёт вам ваш Chat ID (например: <code className="bg-muted px-1 py-0.5 rounded">123456789</code>)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-medium">Привяжите в профиле</h4>
                      <p className="text-sm text-muted-foreground">
                        Скопируйте полученный Chat ID и вставьте его в поле ниже, затем нажмите "Привязать"
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="h-6 w-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                    <div>
                      <h4 className="font-medium">Протестируйте уведомления</h4>
                      <p className="text-sm text-muted-foreground">
                        После успешной привязки используйте кнопки тестирования для проверки всех типов уведомлений
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Доступные команды бота:</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">/start</code> - получить Chat ID</div>
                    <div><code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">/help</code> - помощь</div>
                    <div><code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">/stats</code> - статистика</div>
                    <div><code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">/report</code> - дневной отчёт</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Подключение к Telegram боту</CardTitle>
              <CardDescription>
                Привяжите ваш Telegram аккаунт для получения уведомлений и управления через бота
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="telegram-chat-id">Chat ID</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="telegram-chat-id"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="Например: 123456789"
                      data-testid="input-telegram-chat-id"
                    />
                    <Button onClick={handleLinkTelegram} disabled={linkTelegramMutation.isPending} data-testid="button-link-telegram">
                      {linkTelegramMutation.isPending ? 'Привязка...' : 'Привязать'}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Получите ваш Chat ID, написав команду /start боту <code className="bg-muted px-1 py-0.5 rounded">@integracia7980_bot</code>
                  </div>
                </div>

                {profile?.telegramChatId && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        Telegram подключён (Chat ID: {profile.telegramChatId})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {profile?.telegramChatId && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Тестирование уведомлений</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleTestTelegram('conversion')}
                      disabled={testTelegramMutation.isPending}
                      data-testid="button-test-conversion"
                    >
                      Тест уведомления о конверсии
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleTestTelegram('offer_alert')}
                      disabled={testTelegramMutation.isPending}
                      data-testid="button-test-offer-alert"
                    >
                      Тест алерта по офферу
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleTestTelegram('fraud_alert')}
                      disabled={testTelegramMutation.isPending}
                      data-testid="button-test-fraud-alert"
                    >
                      Тест антифрод алерта
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleTestTelegram('system_message')}
                      disabled={testTelegramMutation.isPending}
                      data-testid="button-test-system"
                    >
                      Тест системного сообщения
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Настройки Telegram уведомлений</CardTitle>
              <CardDescription>
                Выберите типы уведомлений для получения в Telegram
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Уведомления о конверсиях</Label>
                    <p className="text-sm text-muted-foreground">
                      Получать сообщения при новых лидах и депозитах
                    </p>
                  </div>
                  <Switch
                    checked={notificationForm.telegram}
                    onCheckedChange={(checked) =>
                      setNotificationForm(prev => ({ ...prev, telegram: checked }))
                    }
                    data-testid="switch-telegram-conversions"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Антифрод алерты</Label>
                    <p className="text-sm text-muted-foreground">
                      Предупреждения о подозрительной активности
                    </p>
                  </div>
                  <Switch
                    defaultChecked={true}
                    data-testid="switch-telegram-fraud"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Системные уведомления</Label>
                    <p className="text-sm text-muted-foreground">
                      Сообщения о важных изменениях в системе
                    </p>
                  </div>
                  <Switch
                    defaultChecked={true}
                    data-testid="switch-telegram-system"
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} data-testid="button-save-telegram-settings">
                Сохранить настройки Telegram
              </Button>
            </CardContent>
          </Card>


        </TabsContent>

        {/* DOMAIN TAB */}
        <TabsContent value="domain" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">DNS-подтверждение доменов</h2>
          </div>
          
          <CustomDomainManager />
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Уведомления</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Настройка уведомлений</CardTitle>
              <CardDescription>
                Выберите, по каким каналам получать уведомления от платформы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-email">Email</Label>
                  <p className="text-muted-foreground text-sm">
                    Уведомления на вашу почту ({formData.email})
                  </p>
                </div>
                <Switch
                  id="notif-email"
                  checked={notificationForm.email}
                  onCheckedChange={(checked) =>
                    setNotificationForm(prev => ({ ...prev, email: checked }))
                  }
                  data-testid="switch-email-notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-telegram">Telegram</Label>
                  <p className="text-muted-foreground text-sm">
                    Уведомления в Telegram-бот (если подключён)
                  </p>
                </div>
                <Switch
                  id="notif-telegram"
                  checked={notificationForm.telegram}
                  onCheckedChange={(checked) =>
                    setNotificationForm(prev => ({ ...prev, telegram: checked }))
                  }
                  data-testid="switch-telegram-notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-sms">SMS</Label>
                  <p className="text-muted-foreground text-sm">
                    SMS-уведомления (если активны)
                  </p>
                </div>
                <Switch
                  id="notif-sms"
                  checked={notificationForm.sms}
                  onCheckedChange={(checked) =>
                    setNotificationForm(prev => ({ ...prev, sms: checked }))
                  }
                  data-testid="switch-sms-notifications"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} data-testid="button-save-notifications">
                  Сохранить уведомления
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Безопасность</h2>
          </div>

          {/* Смена пароля */}
          <Card>
            <CardHeader>
              <CardTitle>Сменить пароль</CardTitle>
              <CardDescription>
                Мы рекомендуем использовать уникальный и сложный пароль
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="confirmPassword">Повторите пароль</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={newPassword.confirm}
                    onChange={(e) => setNewPassword(prev => ({ ...prev, confirm: e.target.value }))}
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>

              <Button onClick={handlePasswordChange} data-testid="button-change-password">
                Обновить пароль
              </Button>
            </CardContent>
          </Card>

          {/* 2FA Status - Disabled */}
          <Card>
            <CardHeader>
              <CardTitle>Двухфакторная аутентификация (2FA)</CardTitle>
              <CardDescription>
                2FA временно отключена для упрощения входа в систему.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground" data-testid="text-2fa-status">
                  Статус: <strong>Отключена</strong>
                </p>
              </div>
              <Button 
                variant="outline" 
                disabled={true}
                data-testid="button-toggle-2fa"
              >
                Недоступно
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}