import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  Globe, 
  Clock,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Settings
} from 'lucide-react';

interface SecuritySettings {
  two_factor_enabled: boolean;
  ip_restrictions: string[];
  geo_restrictions: string[];
  time_restrictions: any;
  session_timeout: number;
  password_changed_at: string;
  last_login_at: string;
  login_attempts: number;
}

interface LoginSession {
  id: string;
  ip_address: string;
  user_agent: string;
  location: string;
  is_current: boolean;
  last_activity: string;
  created_at: string;
}

export default function SecuritySettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showIPForm, setShowIPForm] = useState(false);
  const [newIP, setNewIP] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const { data: securitySettings, isLoading } = useQuery({
    queryKey: ['security-settings'],
    queryFn: () => apiRequest('/api/partner/security/settings')
  });

  const { data: loginSessions } = useQuery({
    queryKey: ['login-sessions'],
    queryFn: () => apiRequest('/api/partner/security/sessions')
  });

  const { data: loginHistory } = useQuery({
    queryKey: ['login-history'],
    queryFn: () => apiRequest('/api/partner/security/login-history')
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: typeof passwordForm) => 
      apiRequest('/api/partner/security/password', 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      setShowPasswordForm(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      toast({
        title: t('common.success', 'Успешно'),
        description: t('security.passwordUpdated', 'Пароль обновлен')
      });
    }
  });

  const toggle2FAMutation = useMutation({
    mutationFn: (enabled: boolean) => 
      apiRequest('/api/partner/security/2fa', 'PUT', { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      toast({
        title: t('common.success', 'Успешно'),
        description: t('security.2faToggled', '2FA настройки изменены')
      });
    }
  });

  const addIPRestrictionMutation = useMutation({
    mutationFn: (ip: string) => 
      apiRequest('/api/partner/security/ip-restrictions', 'POST', { ip }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      setNewIP('');
      setShowIPForm(false);
      toast({
        title: t('common.success', 'Успешно'),
        description: t('security.ipAdded', 'IP адрес добавлен')
      });
    }
  });

  const removeIPRestrictionMutation = useMutation({
    mutationFn: (ip: string) => 
      apiRequest(`/api/partner/security/ip-restrictions/${encodeURIComponent(ip)}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      toast({
        title: t('common.success', 'Успешно'),
        description: t('security.ipRemoved', 'IP адрес удален')
      });
    }
  });

  const terminateSessionMutation = useMutation({
    mutationFn: (sessionId: string) => 
      apiRequest(`/api/partner/security/sessions/${sessionId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['login-sessions'] });
      toast({
        title: t('common.success', 'Успешно'),
        description: t('security.sessionTerminated', 'Сессия завершена')
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">{t('common.loading', 'Загрузка...')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <Shield className="h-8 w-8 mr-3 text-blue-600" />
          {t('security.title', 'Безопасность')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('security.description', 'Управляйте настройками безопасности вашего аккаунта')}
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">{t('security.general', 'Общие')}</TabsTrigger>
          <TabsTrigger value="sessions">{t('security.sessions', 'Сессии')}</TabsTrigger>
          <TabsTrigger value="restrictions">{t('security.restrictions', 'Ограничения')}</TabsTrigger>
          <TabsTrigger value="history">{t('security.history', 'История')}</TabsTrigger>
        </TabsList>

        {/* General Security Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                {t('security.passwordAuth', 'Пароль и аутентификация')}
              </CardTitle>
              <CardDescription>
                {t('security.passwordDescription', 'Обновите пароль и настройки аутентификации')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{t('security.password', 'Пароль')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('security.passwordUpdated', 'Обновлен')}: {
                      securitySettings?.password_changed_at 
                        ? new Date(securitySettings.password_changed_at).toLocaleDateString()
                        : t('common.never', 'никогда')
                    }
                  </div>
                </div>
                <Dialog open={showPasswordForm} onOpenChange={setShowPasswordForm}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      {t('security.changePassword', 'Изменить пароль')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('security.changePassword', 'Изменить пароль')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>{t('security.currentPassword', 'Текущий пароль')}</Label>
                        <div className="relative">
                          <Input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>{t('security.newPassword', 'Новый пароль')}</Label>
                        <div className="relative">
                          <Input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordForm.new_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>{t('security.confirmPassword', 'Подтвердить пароль')}</Label>
                        <div className="relative">
                          <Input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordForm.confirm_password}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setShowPasswordForm(false)}>
                          {t('common.cancel', 'Отмена')}
                        </Button>
                        <Button 
                          className="flex-1" 
                          onClick={() => updatePasswordMutation.mutate(passwordForm)}
                          disabled={!passwordForm.current_password || !passwordForm.new_password || 
                                   passwordForm.new_password !== passwordForm.confirm_password || 
                                   updatePasswordMutation.isPending}
                        >
                          {updatePasswordMutation.isPending ? t('common.saving', 'Сохранение...') : t('common.save', 'Сохранить')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium flex items-center">
                    <Key className="h-4 w-4 mr-2" />
                    {t('security.twoFactor', 'Двухфакторная аутентификация')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {securitySettings?.two_factor_enabled 
                      ? t('security.2faEnabled', 'Дополнительная защита включена')
                      : t('security.2faDisabled', 'Рекомендуется включить для дополнительной защиты')
                    }
                  </div>
                </div>
                <Switch
                  checked={securitySettings?.two_factor_enabled || false}
                  onCheckedChange={(checked) => toggle2FAMutation.mutate(checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Sessions */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                {t('security.activeSessions', 'Активные сессии')}
              </CardTitle>
              <CardDescription>
                {t('security.sessionsDescription', 'Управляйте активными сессиями в вашем аккаунте')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loginSessions?.length === 0 ? (
                <div className="text-center py-8">
                  <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="text-lg font-semibold mb-2">{t('security.noSessions', 'Нет активных сессий')}</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {loginSessions?.map((session: LoginSession) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="font-medium flex items-center">
                              {session.location}
                              {session.is_current && (
                                <Badge variant="default" className="ml-2">
                                  {t('security.current', 'Текущая')}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {session.ip_address} • {session.user_agent.split(' ')[0]}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {t('security.lastActivity', 'Последняя активность')}: {new Date(session.last_activity).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      {!session.is_current && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => terminateSessionMutation.mutate(session.id)}
                          disabled={terminateSessionMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {t('security.terminate', 'Завершить')}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Restrictions */}
        <TabsContent value="restrictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                {t('security.ipRestrictions', 'IP ограничения')}
              </CardTitle>
              <CardDescription>
                {t('security.ipDescription', 'Ограничьте доступ к аккаунту только с определенных IP адресов')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {securitySettings?.ip_restrictions?.length || 0} {t('security.allowedIps', 'разрешенных IP адресов')}
                  </div>
                  <Dialog open={showIPForm} onOpenChange={setShowIPForm}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        {t('security.addIP', 'Добавить IP')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t('security.addIPAddress', 'Добавить IP адрес')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>{t('security.ipAddress', 'IP адрес')}</Label>
                          <Input
                            value={newIP}
                            onChange={(e) => setNewIP(e.target.value)}
                            placeholder="192.168.1.1"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex-1" onClick={() => setShowIPForm(false)}>
                            {t('common.cancel', 'Отмена')}
                          </Button>
                          <Button 
                            className="flex-1"
                            onClick={() => addIPRestrictionMutation.mutate(newIP)}
                            disabled={!newIP || addIPRestrictionMutation.isPending}
                          >
                            {t('common.add', 'Добавить')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {securitySettings?.ip_restrictions?.length > 0 && (
                  <div className="space-y-2">
                    {securitySettings.ip_restrictions.map((ip: string) => (
                      <div key={ip} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-mono">{ip}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIPRestrictionMutation.mutate(ip)}
                          disabled={removeIPRestrictionMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Login History */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                {t('security.loginHistory', 'История входов')}
              </CardTitle>
              <CardDescription>
                {t('security.historyDescription', 'Последние попытки входа в ваш аккаунт')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loginHistory?.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="text-lg font-semibold mb-2">{t('security.noHistory', 'Нет истории')}</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {loginHistory?.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {entry.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">
                            {entry.success ? t('security.successfulLogin', 'Успешный вход') : t('security.failedLogin', 'Неудачный вход')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.ip_address} • {entry.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}