import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Settings, TestTube, Eye, Trash2, Check, X, Building, Target } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AdvertiserPostbackProfile {
  id: string;
  name: string;
  tracker_type: 'keitaro' | 'binom' | 'redtrack' | 'voluum' | 'custom';
  enabled: boolean;
  endpoint_url: string;
  method: 'GET' | 'POST';
  events: string[];
  offers: string[]; // Specific offers this postback applies to
  partners: string[]; // Specific partners this postback applies to
  last_delivery?: string;
  status: 'active' | 'error' | 'disabled';
  delivery_stats: {
    total_sent: number;
    success_rate: number;
    avg_response_time: number;
  };
}

interface AdvertiserPostbackLog {
  id: string;
  profile_id: string;
  event_type: string;
  status: string;
  response_code: number;
  response_body: string;
  url: string;
  created_at: string;
}

interface PostbackLog {
  id: string;
  event_type: string;
  status: 'sent' | 'failed' | 'pending';
  response_status?: number;
  response_time?: number;
  error_message?: string;
  sent_at: string;
  clickid: string;
  partner_name?: string;
  offer_name?: string;
}

export default function AdvertiserPostbackSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AdvertiserPostbackProfile | null>(null);
  const [activeTab, setActiveTab] = useState('profiles');

  // Fetch advertiser postback profiles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery<AdvertiserPostbackProfile[]>({
    queryKey: ['/api/advertiser/postback/profiles'],
  });

  // Fetch postback logs for advertiser
  const { data: logs = [], isLoading: logsLoading } = useQuery<AdvertiserPostbackLog[]>({
    queryKey: ['/api/advertiser/postback/logs'],
  });

  // Fetch offers for selection
  const { data: offers = [] } = useQuery({
    queryKey: ['/api/advertiser/offers'],
  });

  // Fetch partners for selection
  const { data: partners = [] } = useQuery({
    queryKey: ['/api/advertiser/partners'],
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/advertiser/postback/profiles', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/postback/profiles'] });
      setShowCreateForm(false);
      toast({
        title: 'Успешно',
        description: 'Профиль постбека создан',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать профиль',
        variant: 'destructive' as const,
      });
    },
  });

  // Test postback mutation
  const testPostbackMutation = useMutation({
    mutationFn: async (data: { tracker_url: string; method?: string; test_data?: any }) => {
      const response = await fetch('/api/track/postback/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: (response: any) => {
      if (response.success) {
        toast({
          title: 'Тест успешен',
          description: `Статус: ${response.response?.status || 'OK'} (${response.response?.time || 0}ms)`,
        });
      } else {
        toast({
          title: 'Ошибка теста',
          description: response.error || `HTTP ${response.response?.status || 'Unknown'}`,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      console.error('Test error:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Произошла ошибка при тестировании постбека',
        variant: 'destructive',
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, _data: any }) =>
      apiRequest(`/api/advertiser/postback/profiles/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/postback/profiles'] });
      setShowEditForm(false);
      setEditingProfile(null);
      toast({
        title: 'Успешно',
        description: 'Профиль постбека обновлен',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить профиль',
        variant: 'destructive' as const,
      });
    },
  });

  // Delete profile mutation
  const deleteProfileMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/advertiser/postback/profiles/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/postback/profiles'] });
      toast({
        title: 'Успешно',
        description: 'Профиль постбека удален',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить профиль',
        variant: 'destructive' as const,
      });
    },
  });

  const handleCreateProfile = (formData: FormData) => {
    const data = {
      name: formData.get('name'),
      tracker_type: formData.get('tracker_type'),
      endpoint_url: formData.get('endpoint_url'),
      method: formData.get('method'),
      events: formData.getAll('events'),
      offers: formData.getAll('offers'),
      partners: formData.getAll('partners'),
      enabled: formData.get('enabled') === 'on',
    };
    createProfileMutation.mutate(data);
  };

  const handleTestPostback = (profile: AdvertiserPostbackProfile) => {
    testPostbackMutation.mutate({
      tracker_url: profile.endpoint_url,
      method: profile.method,
      test_data: {
        clickid: 'adv_test_' + Date.now(),
        status: 'lead',
        revenue: '45.00',
        currency: 'USD',
        partner_id: 'test_partner',
        offer_id: 'test_offer'
      }
    });
  };

  const handleEditProfile = (profile: AdvertiserPostbackProfile) => {
    setEditingProfile(profile);
    setShowEditForm(true);
  };

  const handleUpdateProfile = (formData: FormData) => {
    if (!editingProfile) {return;}

    const data = {
      name: formData.get('name'),
      tracker_type: formData.get('tracker_type'),
      endpoint_url: formData.get('endpoint_url'),
      method: formData.get('method'),
      events: formData.getAll('events'),
      offers: formData.getAll('offers'),
      partners: formData.getAll('partners'),
      enabled: formData.get('enabled') === 'on',
    };

    updateProfileMutation.mutate({ id: editingProfile.id, data });
  };

  const handleDeleteProfile = (profile: AdvertiserPostbackProfile) => {
    if (confirm(`Удалить профиль "${profile.name}"? Это действие нельзя отменить.`)) {
      deleteProfileMutation.mutate(profile.id);
    }
  };

  const trackerPresets = {
    keitaro: {
      name: 'Keitaro',
      url_template: 'https://your-keitaro.com/api/v1/conversions?clickid={clickid}&status={status}&revenue={revenue}&offer_id={offer_id}&partner_id={partner_id}',
      method: 'GET'
    },
    binom: {
      name: 'Binom',
      url_template: 'https://your-binom.com/click.php?cnv_id={clickid}&payout={revenue}&offer={offer_id}&affiliate={partner_id}',
      method: 'GET'
    },
    redtrack: {
      name: 'RedTrack',
      url_template: 'https://your-redtrack.com/postback?clickid={clickid}&status={status}&sum={revenue}&offer={offer_id}',
      method: 'GET'
    },
    voluum: {
      name: 'Voluum',
      url_template: 'https://your-voluum.com/postback?cid={clickid}&payout={revenue}&offer={offer_id}',
      method: 'GET'
    },
    custom: {
      name: 'Произвольный',
      url_template: 'https://your-tracker.com/postback?clickid={clickid}&status={status}&revenue={revenue}',
      method: 'GET'
    }
  };

  return (
    <div className="space-y-6" data-testid="advertiser-postback-settings-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8 text-blue-600" />
            Настройки постбеков рекламодателя
          </h1>
          <p className="text-muted-foreground">
            Настройте отправку данных о конверсиях в ваши трекеры и системы аналитики
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-create-advertiser-postback"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить постбек
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profiles">Профили постбеков</TabsTrigger>
          <TabsTrigger value="logs">Логи отправки</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          <TabsTrigger value="help">Помощь</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4">
          {profilesLoading ? (
            <div className="text-center py-8">Загрузка профилей...</div>
          ) : profiles.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">Нет настроенных постбеков</h3>
                    <p className="text-muted-foreground">
                      Настройте постбеки для отправки данных о конверсиях в ваши системы аналитики
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    data-testid="button-create-first-advertiser-postback"
                  >
                    Создать постбек
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {profiles.map((profile: AdvertiserPostbackProfile) => (
                <Card key={profile.id} className="relative">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <Badge variant={profile.enabled ? 'default' : 'secondary'}>
                          {profile.enabled ? 'Активен' : 'Отключен'}
                        </Badge>
                        <Badge
                          variant={profile.status === 'active' ? 'default' : profile.status === 'error' ? 'destructive' : 'secondary'}
                        >
                          {profile.status === 'active' ? 'Работает' : profile.status === 'error' ? 'Ошибка' : 'Отключен'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {trackerPresets[profile.tracker_type]?.name || profile.tracker_type}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Отправлено: {profile.delivery_stats?.total_sent || 0}</span>
                        <span>Успешность: {profile.delivery_stats?.success_rate || 0}%</span>
                        <span>Время ответа: {profile.delivery_stats?.avg_response_time || 0}ms</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestPostback(profile)}
                        disabled={testPostbackMutation.isPending}
                        data-testid={`button-test-advertiser-postback-${profile.id}`}
                        title="Протестировать постбек"
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProfile(profile)}
                        data-testid={`button-edit-advertiser-postback-${profile.id}`}
                        title="Редактировать"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProfile(profile)}
                        disabled={deleteProfileMutation.isPending}
                        data-testid={`button-delete-advertiser-postback-${profile.id}`}
                        title="Удалить"
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">URL постбека</Label>
                        <div className="font-mono text-sm bg-muted p-2 rounded">
                          {profile.endpoint_url}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">События</Label>
                          <div className="flex flex-wrap gap-1">
                            {profile.events?.map(event => (
                              <Badge key={event} variant="outline" className="text-xs">
                                {event}
                              </Badge>
                            )) || <span className="text-muted-foreground">Все</span>}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Офферы</Label>
                          <div className="text-xs text-muted-foreground">
                            {profile.offers?.length ? `${profile.offers.length} выбрано` : 'Все офферы'}
                          </div>
                        </div>
                      </div>
                      {profile.last_delivery && (
                        <div className="text-xs text-muted-foreground">
                          Последняя отправка: {new Date(profile.last_delivery).toLocaleString('ru')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {logsLoading ? (
            <div className="text-center py-8">Загрузка логов...</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Журнал отправки постбеков</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Время</th>
                        <th className="text-left p-2">ClickID</th>
                        <th className="text-left p-2">Событие</th>
                        <th className="text-left p-2">Партнер</th>
                        <th className="text-left p-2">Оффер</th>
                        <th className="text-left p-2">Статус</th>
                        <th className="text-left p-2">Ответ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-muted-foreground">
                            Нет данных о постбеках
                          </td>
                        </tr>
                      ) : (
                        logs.map((log: PostbackLog) => (
                          <tr key={log.id} className="border-b">
                            <td className="p-2 text-sm">
                              {new Date(log.sent_at).toLocaleString('ru')}
                            </td>
                            <td className="p-2 font-mono text-sm">{log.clickid}</td>
                            <td className="p-2">
                              <Badge variant="outline">{log.event_type}</Badge>
                            </td>
                            <td className="p-2 text-sm">{log.partner_name || '-'}</td>
                            <td className="p-2 text-sm">{log.offer_name || '-'}</td>
                            <td className="p-2">
                              {log.status === 'sent' ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  Отправлен
                                </Badge>
                              ) : log.status === 'failed' ? (
                                <Badge variant="destructive">
                                  <X className="h-3 w-3 mr-1" />
                                  Ошибка
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Ожидание</Badge>
                              )}
                            </td>
                            <td className="p-2">
                              {log.response_status && (
                                <Badge
                                  variant={log.response_status < 400 ? 'default' : 'destructive'}
                                  className="font-mono"
                                >
                                  {log.response_status}
                                </Badge>
                              )}
                              {log.response_time && (
                                <div className="text-xs text-muted-foreground">
                                  {log.response_time}ms
                                </div>
                              )}
                              {log.error_message && (
                                <div className="text-xs text-red-600 mt-1">
                                  {log.error_message}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего отправлено</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profiles.reduce((sum, p) => sum + (p.delivery_stats?.total_sent || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">постбеков за все время</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Успешность</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profiles.length > 0 ? Math.round(
                    profiles.reduce((sum, p) => sum + (p.delivery_stats?.success_rate || 0), 0) / profiles.length
                  ) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">средняя по всем профилям</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Время ответа</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profiles.length > 0 ? Math.round(
                    profiles.reduce((sum, p) => sum + (p.delivery_stats?.avg_response_time || 0), 0) / profiles.length
                  ) : 0}ms
                </div>
                <p className="text-xs text-muted-foreground">среднее время</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="help" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройка постбеков для рекламодателей</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Доступные макросы:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">{'{clickid}'}</code> - ID клика
                  </div>
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">{'{status}'}</code> - Статус события
                  </div>
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">{'{revenue}'}</code> - Доход
                  </div>
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">{'{currency}'}</code> - Валюта
                  </div>
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">{'{partner_id}'}</code> - ID партнера
                  </div>
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">{'{offer_id}'}</code> - ID оффера
                  </div>
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">{'{sub1}'}</code> - SubID 1
                  </div>
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">{'{sub2}'}</code> - SubID 2
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Особенности для рекламодателей:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Настройка постбеков на уровне конкретных офферов</li>
                  <li>Фильтрация по партнерам для избирательной отправки</li>
                  <li>Расширенная аналитика доставки постбеков</li>
                  <li>Мониторинг конверсий от каждого партнера</li>
                  <li>Интеграция с CRM и системами аналитики</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Примеры использования:</h3>
                <div className="space-y-4">
                  <div className="border rounded p-4">
                    <h4 className="font-semibold">Отправка в CRM</h4>
                    <div className="font-mono text-sm bg-muted p-2 rounded mt-2">
                      https://your-crm.com/api/leads?clickid={'{clickid}'}&partner={'{partner_id}'}&revenue={'{revenue}'}
                    </div>
                  </div>
                  <div className="border rounded p-4">
                    <h4 className="font-semibold">Аналитика по офферам</h4>
                    <div className="font-mono text-sm bg-muted p-2 rounded mt-2">
                      https://analytics.example.com/conversion?offer={'{offer_id}'}&amount={'{revenue}'}&source={'{sub1}'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Form Modal */}
      {showEditForm && editingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Редактировать профиль постбека</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingProfile(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateProfile(formData);
            }} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Название профиля</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingProfile.name}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-tracker-type">Тип трекера</Label>
                <Select name="tracker_type" defaultValue={editingProfile.tracker_type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип трекера" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keitaro">Keitaro</SelectItem>
                    <SelectItem value="binom">Binom</SelectItem>
                    <SelectItem value="redtrack">RedTrack</SelectItem>
                    <SelectItem value="voluum">Voluum</SelectItem>
                    <SelectItem value="custom">Произвольный</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-endpoint-url">URL постбека</Label>
                <Textarea
                  id="edit-endpoint-url"
                  name="endpoint_url"
                  defaultValue={editingProfile.endpoint_url}
                  placeholder="https://your-tracker.com/postback?clickid={clickid}&status={status}&revenue={revenue}"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-method">HTTP метод</Label>
                <Select name="method" defaultValue={editingProfile.method}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите метод" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>События</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['lp_click', 'lead', 'deposit', 'conversion'].map(event => (
                    <label key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="events"
                        value={event}
                        defaultChecked={editingProfile.events?.includes(event)}
                      />
                      <span className="capitalize">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Офферы (оставьте пустым для всех)</Label>
                <div className="max-h-32 overflow-y-auto border rounded p-2">
                  {offers.map((offer: any) => (
                    <label key={offer.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        name="offers"
                        value={offer.id}
                        defaultChecked={editingProfile.offers?.includes(offer.id)}
                      />
                      <span className="text-sm">{offer.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-enabled"
                  name="enabled"
                  defaultChecked={editingProfile.enabled}
                />
                <Label htmlFor="edit-enabled">Активен</Label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingProfile(null);
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Profile Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Создать профиль постбека</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateProfile(new FormData(e.currentTarget));
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Название профиля</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Например: Main Analytics Tracker"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="tracker_type">Тип трекера</Label>
                    <Select name="tracker_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите трекер" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(trackerPresets).map(([key, preset]) => (
                          <SelectItem key={key} value={key}>
                            {preset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="endpoint_url">URL постбека</Label>
                  <Textarea
                    id="endpoint_url"
                    name="endpoint_url"
                    placeholder="https://your-tracker.com/postback?clickid={clickid}&status={status}&revenue={revenue}&offer_id={offer_id}&partner_id={partner_id}"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="method">HTTP метод</Label>
                    <Select name="method" defaultValue="GET">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="enabled" name="enabled" defaultChecked />
                    <Label htmlFor="enabled">Включить профиль</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProfileMutation.isPending}
                    data-testid="button-save-advertiser-postback"
                  >
                    Сохранить
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
