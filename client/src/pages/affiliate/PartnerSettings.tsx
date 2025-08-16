import { useState, useEffect } from 'react';
import { Save, Bell, Shield, Eye, EyeOff, Key, Globe, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../contexts/auth-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../../hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';

export default function PartnerSettings() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const setLanguage = (lang: string) => i18n.changeLanguage(lang);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Загружаем профиль партнёра с сервера
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['/api/partner/profile'],
    queryFn: async () => await apiRequest('/api/partner/profile', 'GET')
  });

  const [notifications, setNotifications] = useState({
    emailOffers: true,
    emailPayments: true,
    emailNews: false,
    pushOffers: true,
    pushPayments: true,
    pushNews: false,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: '24',
    ipRestrictions: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Инициализация данных из профиля
  useEffect(() => {
    if (profileData) {
      setSecurity(prev => ({
        ...prev,
        twoFactorEnabled: profileData.twoFactorEnabled || false,
        sessionTimeout: profileData.sessionTimeout || '24',
        ipRestrictions: profileData.ipRestrictions || '',
      }));
    }
  }, [profileData]);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleSecurityChange = (key: string, value: string | boolean) => {
    setSecurity(prev => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = (key: string, value: string) => {
    setPasswords(prev => ({ ...prev, [key]: value }));
  };

  // Мутация для сохранения общих настроек
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/partner/profile', 'PATCH', data);
    },
    onSuccess: () => {
      toast({
        title: "Настройки сохранены",
        description: "Ваши настройки успешно обновлены.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить настройки.",
        variant: "destructive",
      });
    }
  });

  const handleSaveSettings = () => {
    // Сохраняем язык и тему локально, остальные настройки отправляем на сервер
    const settingsData = {
      language,
      timezone: profileData?.timezone || 'Europe/Moscow',
    };
    updatePreferencesMutation.mutate(settingsData);
  };

  // Мутация для смены пароля
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return apiRequest('/api/partner/profile/change-password', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Пароль обновлён",
        description: "Ваш пароль успешно изменён.",
        variant: "default",
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка смены пароля",
        description: error.message || "Неверный текущий пароль или ошибка сервера.",
        variant: "destructive",
      });
    }
  });

  // Мутация для сохранения настроек безопасности 
  const updateSecurityMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/partner/profile', 'PATCH', data);
    },
    onSuccess: () => {
      toast({
        title: "Настройки безопасности сохранены",
        description: "Параметры безопасности обновлены.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить настройки безопасности.",
        variant: "destructive",
      });
    }
  });

  // Мутация для настроек уведомлений
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/partner/profile', 'PATCH', { settings: data });
    },
    onSuccess: () => {
      toast({
        title: "Настройки уведомлений сохранены",
        description: "Предпочтения уведомлений обновлены.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить настройки уведомлений.",
        variant: "destructive",
      });
    }
  });

  const handlePasswordUpdate = () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast({
        title: "Заполните все поля",
        description: "Введите текущий и новый пароль.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast({
        title: "Слабый пароль",
        description: "Пароль должен содержать не менее 6 символов.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword
    });
  };

  const handleSaveSecuritySettings = () => {
    updateSecurityMutation.mutate({
      twoFactorEnabled: security.twoFactorEnabled,
      sessionTimeout: security.sessionTimeout,
      ipRestrictions: security.ipRestrictions
    });
  };

  const handleSaveNotifications = () => {
    updateNotificationsMutation.mutate(notifications);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
            <p className="text-muted-foreground mt-1">
              Управляйте настройками аккаунта и предпочтениями
            </p>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Общие</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
            <TabsTrigger value="account">Аккаунт</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Локализация и внешний вид
                </CardTitle>
                <CardDescription>
                  Настройте язык интерфейса и тему оформления
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Язык интерфейса</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger data-testid="select-language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">Тема оформления</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger data-testid="select-theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Светлая</SelectItem>
                        <SelectItem value="dark">Тёмная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={updatePreferencesMutation.isPending}
                  data-testid="button-save-general"
                  title="Сохранить общие настройки"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updatePreferencesMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Уведомления по Email
                </CardTitle>
                <CardDescription>
                  Управляйте получением уведомлений на электронную почту
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailOffers">Новые офферы</Label>
                    <p className="text-sm text-muted-foreground">
                      Уведомления о новых доступных офферах
                    </p>
                  </div>
                  <Switch
                    id="emailOffers"
                    checked={notifications.emailOffers}
                    onCheckedChange={(value) => handleNotificationChange('emailOffers', value)}
                    data-testid="switch-email-offers"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailPayments">Выплаты</Label>
                    <p className="text-sm text-muted-foreground">
                      Уведомления о выплатах и транзакциях
                    </p>
                  </div>
                  <Switch
                    id="emailPayments"
                    checked={notifications.emailPayments}
                    onCheckedChange={(value) => handleNotificationChange('emailPayments', value)}
                    data-testid="switch-email-payments"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNews">Новости и обновления</Label>
                    <p className="text-sm text-muted-foreground">
                      Информация о новых функциях и изменениях
                    </p>
                  </div>
                  <Switch
                    id="emailNews"
                    checked={notifications.emailNews}
                    onCheckedChange={(value) => handleNotificationChange('emailNews', value)}
                    data-testid="switch-email-news"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Push-уведомления</CardTitle>
                <CardDescription>
                  Настройте push-уведомления в браузере
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushOffers">Новые офферы</Label>
                    <p className="text-sm text-muted-foreground">
                      Мгновенные уведомления о новых офферах
                    </p>
                  </div>
                  <Switch
                    id="pushOffers"
                    checked={notifications.pushOffers}
                    onCheckedChange={(value) => handleNotificationChange('pushOffers', value)}
                    data-testid="switch-push-offers"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushPayments">Выплаты</Label>
                    <p className="text-sm text-muted-foreground">
                      Уведомления о статусе выплат
                    </p>
                  </div>
                  <Switch
                    id="pushPayments"
                    checked={notifications.pushPayments}
                    onCheckedChange={(value) => handleNotificationChange('pushPayments', value)}
                    data-testid="switch-push-payments"
                  />
                </div>
                <Button 
                  onClick={handleSaveNotifications} 
                  disabled={updateNotificationsMutation.isPending}
                  data-testid="button-save-notifications"
                  title="Сохранить настройки уведомлений"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateNotificationsMutation.isPending ? 'Сохранение...' : 'Сохранить настройки'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Безопасность аккаунта
                </CardTitle>
                <CardDescription>
                  Настройте параметры безопасности вашего аккаунта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="twoFactor">Двухфакторная аутентификация</Label>
                    <p className="text-sm text-muted-foreground">
                      Дополнительная защита вашего аккаунта
                    </p>
                  </div>
                  <Switch
                    id="twoFactor"
                    checked={security.twoFactorEnabled}
                    onCheckedChange={(value) => handleSecurityChange('twoFactorEnabled', value)}
                    data-testid="switch-two-factor"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="loginNotifications">Уведомления о входе</Label>
                    <p className="text-sm text-muted-foreground">
                      Получать уведомления о новых входах в аккаунт
                    </p>
                  </div>
                  <Switch
                    id="loginNotifications"
                    checked={security.loginNotifications}
                    onCheckedChange={(value) => handleSecurityChange('loginNotifications', value)}
                    data-testid="switch-login-notifications"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Тайм-аут сессии (часы)</Label>
                  <Select 
                    value={security.sessionTimeout} 
                    onValueChange={(value) => handleSecurityChange('sessionTimeout', value)}
                  >
                    <SelectTrigger data-testid="select-session-timeout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 час</SelectItem>
                      <SelectItem value="8">8 часов</SelectItem>
                      <SelectItem value="24">24 часа</SelectItem>
                      <SelectItem value="168">7 дней</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Изменение пароля</CardTitle>
                <CardDescription>
                  Обновите пароль для вашего аккаунта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Текущий пароль</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwords.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      data-testid="input-current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwords.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      data-testid="input-new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    data-testid="input-confirm-password"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePasswordUpdate} 
                    disabled={changePasswordMutation.isPending}
                    data-testid="button-update-password"
                    title="Обновить пароль"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {changePasswordMutation.isPending ? 'Обновление...' : 'Обновить пароль'}
                  </Button>
                  <Button 
                    onClick={handleSaveSecuritySettings} 
                    disabled={updateSecurityMutation.isPending}
                    variant="outline"
                    data-testid="button-save-security"
                    title="Сохранить настройки безопасности"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {updateSecurityMutation.isPending ? 'Сохранение...' : 'Сохранить безопасность'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление аккаунтом</CardTitle>
                <CardDescription>
                  Опции для управления вашим аккаунтом
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex items-start space-x-3">
                    <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-destructive">Удаление аккаунта</h3>
                      <p className="text-sm text-muted-foreground">
                        Удаление аккаунта приведёт к безвозвратной потере всех данных, 
                        статистики и настроек. Это действие нельзя отменить.
                      </p>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        data-testid="button-delete-account"
                        title="Удалить аккаунт безвозвратно"
                        onClick={() => {
                          toast({
                            title: "Функция недоступна",
                            description: "Для удаления аккаунта свяжитесь с администрацией.",
                            variant: "default",
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить аккаунт
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}