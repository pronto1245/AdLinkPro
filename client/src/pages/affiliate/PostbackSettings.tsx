import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { AlertCircle, Plus, Settings, TestTube, Eye, Trash2, Check, X } from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';

interface PostbackProfile {
  id: string;
  name: string;
  tracker_type: 'keitaro' | 'binom' | 'redtrack' | 'voluum' | 'custom';
  enabled: boolean;
  endpoint_url: string;
  method: 'GET' | 'POST';
  events: string[];
  last_delivery?: string;
  status: 'active' | 'error' | 'disabled';
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
}

export default function PostbackSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('profiles');

  // Fetch postback profiles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['/api/postback/profiles'],
  });

  // Fetch postback logs
  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['/api/postback/logs'],
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/postback/profiles', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postback/profiles'] });
      setShowCreateForm(false);
      toast({
        title: "Успешно",
        description: "Профиль постбека создан",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать профиль",
        variant: "destructive",
      });
    },
  });

  // Test postback mutation
  const testPostbackMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/track/postback/test', 'POST', data),
    onSuccess: (data) => {
      toast({
        title: "Тест успешен",
        description: `Статус: ${data.response?.status || 'OK'}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Тест не прошел",
        description: error.message || "Ошибка при тестировании",
        variant: "destructive",
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
      enabled: formData.get('enabled') === 'on',
    };
    createProfileMutation.mutate(data);
  };

  const handleTestPostback = (profile: PostbackProfile) => {
    testPostbackMutation.mutate({
      tracker_url: profile.endpoint_url,
      method: profile.method,
      test_data: {
        clickid: 'test_' + Date.now(),
        status: 'lead',
        revenue: '25.00',
        currency: 'USD'
      }
    });
  };

  const trackerPresets = {
    keitaro: {
      name: 'Keitaro',
      url_template: 'https://your-keitaro.com/api/v1/conversions?clickid={clickid}&status={status}&revenue={revenue}',
      method: 'GET'
    },
    binom: {
      name: 'Binom',
      url_template: 'https://your-binom.com/click.php?cnv_id={clickid}&payout={revenue}',
      method: 'GET'
    },
    redtrack: {
      name: 'RedTrack',
      url_template: 'https://your-redtrack.com/postback?clickid={clickid}&status={status}&sum={revenue}',
      method: 'GET'
    },
    voluum: {
      name: 'Voluum',
      url_template: 'https://your-voluum.com/postback?cid={clickid}&payout={revenue}',
      method: 'GET'
    },
    custom: {
      name: 'Произвольный',
      url_template: 'https://your-tracker.com/postback?clickid={clickid}&status={status}',
      method: 'GET'
    }
  };

  return (
    <div className="space-y-6" data-testid="postback-settings-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Настройки постбеков</h1>
          <p className="text-muted-foreground">
            Настройте отправку данных в ваши трекеры (Keitaro, Binom, RedTrack, Voluum)
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-create-postback"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить постбек
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profiles">Профили постбеков</TabsTrigger>
          <TabsTrigger value="logs">Логи отправки</TabsTrigger>
          <TabsTrigger value="help">Помощь</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4">
          {profilesLoading ? (
            <div className="text-center py-8">Загрузка профилей...</div>
          ) : profiles.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">Нет настроенных постбеков</h3>
                    <p className="text-muted-foreground">
                      Добавьте первый постбек для интеграции с вашим трекером
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    data-testid="button-create-first-postback"
                  >
                    Создать постбек
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {profiles.map((profile: PostbackProfile) => (
                <Card key={profile.id} className="relative">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <Badge variant={profile.enabled ? "default" : "secondary"}>
                          {profile.enabled ? "Активен" : "Отключен"}
                        </Badge>
                        <Badge 
                          variant={profile.status === 'active' ? "success" : profile.status === 'error' ? "destructive" : "secondary"}
                        >
                          {profile.status === 'active' ? 'Работает' : profile.status === 'error' ? 'Ошибка' : 'Отключен'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {trackerPresets[profile.tracker_type]?.name || profile.tracker_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestPostback(profile)}
                        disabled={testPostbackMutation.isPending}
                        data-testid={`button-test-postback-${profile.id}`}
                        title="Протестировать постбек"
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-edit-postback-${profile.id}`}
                        title="Редактировать"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-delete-postback-${profile.id}`}
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">URL постбека</Label>
                        <div className="font-mono text-sm bg-muted p-2 rounded">
                          {profile.endpoint_url}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Метод: <Badge variant="outline">{profile.method}</Badge></span>
                        <span>События: {profile.events?.join(', ') || 'Все'}</span>
                        {profile.last_delivery && (
                          <span className="text-muted-foreground">
                            Последняя отправка: {profile.last_delivery && profile.last_delivery !== 'null' ? new Date(profile.last_delivery).toLocaleString('ru') : 'Не отправлялось'}
                          </span>
                        )}
                      </div>
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
                        <th className="text-left p-2">Статус</th>
                        <th className="text-left p-2">Ответ</th>
                        <th className="text-left p-2">Время ответа</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-muted-foreground">
                            Нет данных о постбеках
                          </td>
                        </tr>
                      ) : (
                        logs.map((log: PostbackLog) => (
                          <tr key={log.id} className="border-b">
                            <td className="p-2 text-sm">
                              {log.sent_at && log.sent_at !== 'null' ? new Date(log.sent_at).toLocaleString('ru') : 'Неизвестно'}
                            </td>
                            <td className="p-2 font-mono text-sm">{log.clickid}</td>
                            <td className="p-2">
                              <Badge variant="outline">{log.event_type}</Badge>
                            </td>
                            <td className="p-2">
                              {log.status === 'sent' ? (
                                <Badge variant="success" className="bg-green-100 text-green-800">
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
                                  variant={log.response_status < 400 ? "success" : "destructive"}
                                  className="font-mono"
                                >
                                  {log.response_status}
                                </Badge>
                              )}
                              {log.error_message && (
                                <div className="text-xs text-red-600 mt-1">
                                  {log.error_message}
                                </div>
                              )}
                            </td>
                            <td className="p-2 text-sm">
                              {log.response_time ? `${log.response_time}ms` : '-'}
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

        <TabsContent value="help" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройка постбеков для трекеров</CardTitle>
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
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">{'{country}'}</code> - Страна
                  </div>
                  <div>
                    <code className="bg-muted px-2 py-1 rounded">{'{device}'}</code> - Устройство
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Примеры настройки для популярных трекеров:</h3>
                <div className="space-y-4">
                  {Object.entries(trackerPresets).map(([key, preset]) => (
                    <div key={key} className="border rounded p-4">
                      <h4 className="font-semibold">{preset.name}</h4>
                      <div className="font-mono text-sm bg-muted p-2 rounded mt-2">
                        {preset.url_template}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Метод: {preset.method}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Profile Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
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
                <div>
                  <Label htmlFor="name">Название профиля</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Например: Keitaro Main"
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

                <div>
                  <Label htmlFor="endpoint_url">URL постбека</Label>
                  <Textarea 
                    id="endpoint_url" 
                    name="endpoint_url"
                    placeholder="https://your-tracker.com/postback?clickid={clickid}&status={status}&revenue={revenue}"
                    rows={3}
                    required 
                  />
                </div>

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
                    data-testid="button-save-postback"
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