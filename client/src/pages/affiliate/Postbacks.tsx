import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Settings, 
  Play, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Send, 
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PostbackProfile {
  id: string;
  name: string;
  trackerType: 'keitaro' | 'custom';
  scopeType: 'global' | 'offer';
  scopeId?: string;
  priority: number;
  enabled: boolean;
  endpointUrl: string;
  method: 'GET' | 'POST';
  idParam: 'subid' | 'clickid';
  authQueryKey?: string;
  authQueryVal?: string;
  authHeaderName?: string;
  authHeaderVal?: string;
  statusMap: Record<string, string>;
  paramsTemplate: Record<string, string>;
  urlEncode: boolean;
  hmacEnabled: boolean;
  hmacSecret?: string;
  hmacPayloadTpl?: string;
  hmacParamName?: string;
  retries: number;
  timeoutMs: number;
  backoffBaseSec: number;
  filterRevenueGt0: boolean;
  filterCountryWhitelist: string[];
  filterCountryBlacklist: string[];
  filterExcludeBots: boolean;
  lastDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

// Предварительно настроенные шаблоны для популярных трекеров
const trackerTemplates = {
  keitaro: {
    name: 'Keitaro Tracker',
    trackerType: 'keitaro' as const,
    endpointUrl: 'https://your-keitaro-domain.com/api/v1/postback',
    method: 'GET' as const,
    paramsTemplate: {
      'token': '{{auth_token}}',
      'clickid': '{{clickid}}',
      'status': '{{status}}',
      'payout': '{{revenue}}',
      'currency': '{{currency}}',
      'country': '{{country_iso}}'
    },
    statusMap: {
      'lead': 'lead',
      'deposit': 'sale',
      'conversion': 'sale',
      'approved': 'approved',
      'hold': 'hold',
      'rejected': 'rejected'
    }
  },
  binom: {
    name: 'Binom Tracker',
    trackerType: 'custom' as const,
    endpointUrl: 'https://your-binom-domain.com/click.php',
    method: 'GET' as const,
    paramsTemplate: {
      'cnv_id': '{{clickid}}',
      'cnv_status': '{{status}}',
      'payout': '{{revenue}}',
      'currency': '{{currency}}',
      'country': '{{country_iso}}'
    },
    statusMap: {
      'lead': '1',
      'deposit': '2', 
      'conversion': '2',
      'approved': '3',
      'hold': '4',
      'rejected': '5'
    }
  },
  redtrack: {
    name: 'RedTrack',
    trackerType: 'custom' as const,
    endpointUrl: 'https://your-redtrack-domain.com/postback',
    method: 'GET' as const,
    paramsTemplate: {
      'clickid': '{{clickid}}',
      'goal': '{{status}}',
      'revenue': '{{revenue}}',
      'currency': '{{currency}}',
      'country': '{{country_iso}}'
    },
    statusMap: {
      'lead': 'lead',
      'deposit': 'deposit',
      'conversion': 'sale',
      'approved': 'approved',
      'hold': 'pending',
      'rejected': 'rejected'
    }
  },
  voluum: {
    name: 'Voluum',
    trackerType: 'custom' as const,
    endpointUrl: 'https://your-voluum-domain.com/postback',
    method: 'GET' as const,
    paramsTemplate: {
      'cid': '{{clickid}}',
      'cv': '{{status}}',
      'payout': '{{revenue}}',
      'txid': '{{transaction_id}}',
      'country': '{{country_iso}}'
    },
    statusMap: {
      'lead': '1',
      'deposit': '2',
      'conversion': '2', 
      'approved': '3',
      'hold': '4',
      'rejected': '0'
    }
  },
  custom: {
    name: 'Пользовательский трекер',
    trackerType: 'custom' as const,
    endpointUrl: '',
    method: 'GET' as const,
    paramsTemplate: {
      'clickid': '{{clickid}}',
      'status': '{{status}}',
      'revenue': '{{revenue}}',
      'currency': '{{currency}}'
    },
    statusMap: {
      'lead': 'lead',
      'deposit': 'sale',
      'conversion': 'sale'
    }
  }
};

const defaultProfile: Partial<PostbackProfile> = {
  name: '',
  trackerType: 'custom',
  scopeType: 'global',
  priority: 100,
  enabled: true,
  endpointUrl: '',
  method: 'GET',
  idParam: 'clickid',
  statusMap: {
    open: 'open',
    reg: 'lead',
    deposit: 'sale',
    lp_click: 'click'
  },
  paramsTemplate: {
    clickid: '{{clickid}}',
    status: '{{status}}',
    revenue: '{{revenue}}',
    currency: '{{currency}}',
    country: '{{country_iso}}'
  },
  urlEncode: true,
  hmacEnabled: false,
  retries: 5,
  timeoutMs: 4000,
  backoffBaseSec: 2,
  filterRevenueGt0: false,
  filterCountryWhitelist: [],
  filterCountryBlacklist: [],
  filterExcludeBots: true
};

export function AffiliatePostbacks() {
  // Debug fetch calls with stack trace
  React.useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = function(url: RequestInfo | URL, init?: RequestInit) {
      if (init && init.method !== undefined) {
        console.log('🔍 FETCH CALL:', {
          url: String(url),
          method: init.method,
          methodType: typeof init.method,
          methodValue: JSON.stringify(init.method),
          stack: new Error().stack
        });
        
        if (typeof init.method !== 'string') {
          console.error('❌ BAD METHOD TYPE:', {
            url,
            method: init.method,
            methodType: typeof init.method,
            fullInit: init,
            stack: new Error().stack
          });
          debugger; // Pause in debugger
          throw new Error(`Invalid method type: ${typeof init.method}. Expected string, got ${typeof init.method}`);
        }
      }
      return originalFetch.call(this, url, init);
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const [selectedProfile, setSelectedProfile] = useState<PostbackProfile | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profiles');
  const [testData, setTestData] = useState({ clickid: '', type: 'reg', revenue: '100', currency: 'USD' });
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof trackerTemplates>('custom');
  const [formData, setFormData] = useState<Partial<PostbackProfile>>(defaultProfile);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch postback profiles using default queryFn
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['/api/postback/profiles']
  });

  // Fetch delivery logs using default queryFn
  const { data: deliveries } = useQuery({
    queryKey: ['/api/postback/logs']
  });

  // Create profile mutation
  const createMutation = useMutation({
    mutationFn: async (profile: Partial<PostbackProfile>) => {
      console.log('Creating profile via apiRequest:', profile);
      return await apiRequest('/api/postback/profiles', 'POST', profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postback/profiles'] });
      setIsCreateModalOpen(false);
      setFormData(defaultProfile);
      toast({ title: 'Профиль создан', description: 'Постбек профиль успешно создан' });
    },
    onError: (error) => {
      console.error('Create mutation error:', error);
      toast({ 
        title: 'Ошибка создания', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (profileData: any) => {
      console.log('Updating profile via apiRequest:', profileData);
      
      if (!profileData || typeof profileData !== 'object') {
        throw new Error('Invalid profile data');
      }
      
      const { id, ...profile } = profileData;
      
      if (!id) {
        throw new Error('Profile ID is required');
      }
      
      return await apiRequest(`/api/postback/profiles/${id}`, 'PUT', profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postback/profiles'] });
      setIsEditModalOpen(false);
      setSelectedProfile(null);
      toast({ title: 'Профиль обновлен', description: 'Постбек профиль успешно обновлен' });
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
      toast({ 
        title: 'Ошибка обновления', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Delete profile mutation
  const deleteMutation = useMutation({
    mutationFn: async (profileId: string) => {
      console.log('Deleting profile via apiRequest:', profileId);
      return await apiRequest(`/api/postback/profiles/${profileId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postback/profiles'] });
      toast({ title: 'Профиль удален', description: 'Постбек профиль успешно удален' });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast({ 
        title: 'Ошибка удаления', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Test postback mutation
  const testMutation = useMutation({
    mutationFn: async ({ profileId, testData: data }: { profileId: string, testData: any }) => {
      console.log('Testing postback via apiRequest:', { profileId, testData: data });
      return await apiRequest(`/api/postback/test/${profileId}`, 'POST', data);
    },
    onSuccess: (data) => {
      toast({ 
        title: data.success ? 'Тест успешен' : 'Тест неудачен', 
        description: data.message || 'Постбек отправлен'
      });
      setIsTestModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/postback/logs'] });
    },
    onError: (error) => {
      console.error('Test mutation error:', error);
      toast({ 
        title: 'Ошибка тестирования', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Функция для применения шаблона трекера
  const applyTemplate = (templateKey: keyof typeof trackerTemplates) => {
    const template = trackerTemplates[templateKey];
    setFormData({
      ...defaultProfile,
      ...template,
      name: template.name,
      scopeType: 'global'
    });
  };

  const PostbackForm = ({ profile, onSave }: { profile: Partial<PostbackProfile>; onSave: (data: Partial<PostbackProfile>) => void }) => {
    const [localFormData, setLocalFormData] = useState(profile);

    return (
      <div className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            Быстрая настройка по шаблону
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(trackerTemplates).map(([key, template]) => (
              <Button
                key={key}
                variant={selectedTemplate === key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedTemplate(key as keyof typeof trackerTemplates);
                  const templateData = {
                    ...defaultProfile,
                    ...template,
                    scopeType: 'global' as const
                  };
                  setLocalFormData(templateData);
                }}
                className="h-auto p-3 flex flex-col items-center text-center"
                data-testid={`template-${key}`}
              >
                <div className="font-medium text-xs mb-1">
                  {key === 'keitaro' && '🔥'} 
                  {key === 'binom' && '⚡'} 
                  {key === 'redtrack' && '🚀'} 
                  {key === 'voluum' && '📊'} 
                  {key === 'custom' && '⚙️'}
                </div>
                <div className="text-xs">{template.name}</div>
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Выберите шаблон для автоматического заполнения настроек популярных трекеров
          </p>
        </div>

        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input
              value={localFormData.name || ''}
              onChange={(e) => setLocalFormData({ ...localFormData, name: e.target.value })}
              placeholder="Мой трекер"
              data-testid="input-profile-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Тип трекера</Label>
            <Select value={localFormData.trackerType} onValueChange={(value) => setLocalFormData({ ...localFormData, trackerType: value as 'keitaro' | 'custom' })}>
              <SelectTrigger data-testid="select-tracker-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keitaro">Keitaro</SelectItem>
                <SelectItem value="custom">Пользовательский</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Область применения</Label>
            <Select value={localFormData.scopeType} onValueChange={(value) => setLocalFormData({ ...localFormData, scopeType: value as any })}>
              <SelectTrigger data-testid="select-scope-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Глобально</SelectItem>
                <SelectItem value="offer">Оффер</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Приоритет</Label>
            <Input
              type="number"
              value={localFormData.priority || 100}
              onChange={(e) => setLocalFormData({ ...localFormData, priority: parseInt(e.target.value) })}
              data-testid="input-priority"
            />
          </div>
        </div>

        {/* Endpoint Settings */}
        <div className="space-y-4">
          <h3 className="font-medium">Настройки эндпоинта</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label>URL эндпоинта</Label>
              <Input
                value={localFormData.endpointUrl || ''}
                onChange={(e) => setLocalFormData({ ...localFormData, endpointUrl: e.target.value })}
                placeholder="https://mytracker.com/postback"
                data-testid="input-endpoint-url"
              />
            </div>

            <div className="space-y-2">
              <Label>Метод</Label>
              <Select 
                value={String(localFormData.method || 'GET')} 
                onValueChange={(value) => {
                  console.log('Method select changed to:', value, typeof value);
                  setLocalFormData({ ...localFormData, method: value as 'GET' | 'POST' });
                }}
              >
                <SelectTrigger data-testid="select-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Status Mapping */}
        <div className="space-y-4">
          <h3 className="font-medium">Маппинг статусов</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(localFormData.statusMap || {}).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label>{key}</Label>
                <Input
                  value={value}
                  onChange={(e) => setLocalFormData({
                    ...localFormData,
                    statusMap: { ...localFormData.statusMap, [key]: e.target.value }
                  })}
                  data-testid={`input-status-${key}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Parameters Template */}
        <div className="space-y-4">
          <h3 className="font-medium">Шаблон параметров</h3>
          <Textarea
            value={JSON.stringify(localFormData.paramsTemplate || {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setLocalFormData({ ...localFormData, paramsTemplate: parsed });
              } catch (error) {
                // Invalid JSON, don't update
              }
            }}
            className="font-mono text-sm"
            rows={8}
            placeholder={`{\n  "clickid": "{{clickid}}",\n  "status": "{{status}}",\n  "revenue": "{{revenue}}"\n}`}
            data-testid="textarea-params-template"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
            }}
            data-testid="button-cancel"
          >
            Отмена
          </Button>
          <Button
            onClick={() => {
              console.log('Saving form data:', localFormData);
              
              // Ensure method is a string
              const sanitizedData = {
                ...localFormData,
                method: String(localFormData.method || 'GET') as 'GET' | 'POST'
              };
              
              console.log('Sanitized form data:', sanitizedData);
              onSave(sanitizedData);
            }}
            disabled={!localFormData.name || !localFormData.endpointUrl}
            data-testid="button-save"
          >
            Сохранить
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Постбеки</h1>
          <p className="text-muted-foreground">
            Настройка интеграции с внешними трекерами
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create-profile">
          <Plus className="h-4 w-4 mr-2" />
          Создать профиль
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profiles">Профили</TabsTrigger>
          <TabsTrigger value="logs">Логи доставок</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Загрузка профилей...</span>
            </div>
          ) : (
            <div className="grid gap-4">
              {profiles?.map((profile: PostbackProfile) => (
                <Card key={profile.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <Badge variant="outline">{profile.trackerType}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={profile.enabled ? "default" : "secondary"}>
                          {profile.enabled ? 'Включен' : 'Отключен'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Эндпоинт</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {profile.method} {profile.endpointUrl}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Последняя доставка</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.lastDelivery 
                            ? new Date(profile.lastDelivery).toLocaleString('ru-RU')
                            : 'Не было'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={profile.enabled}
                          onCheckedChange={(checked) => {
                            console.log('Switch toggled:', checked, 'for profile:', profile.id);
                            updateMutation.mutate({ ...profile, enabled: checked });
                          }}
                          data-testid={`switch-enabled-${profile.id}`}
                        />
                        <span className="text-sm">Включен</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProfile(profile);
                            setTestData({ 
                              clickid: `test_${Date.now()}`, 
                              type: 'lead', 
                              revenue: '100', 
                              currency: 'USD' 
                            });
                            setIsTestModalOpen(true);
                          }}
                          disabled={testMutation.isPending}
                          title="Протестировать постбек"
                          data-testid={`button-test-${profile.id}`}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Тест
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProfile(profile);
                            setIsEditModalOpen(true);
                          }}
                          title="Редактировать профиль"
                          data-testid={`button-edit-${profile.id}`}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Настройки
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Вы уверены, что хотите удалить этот профиль?')) {
                              deleteMutation.mutate(profile.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          title="Удалить профиль"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-${profile.id}`}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!profiles || profiles.length === 0) && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Send className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Нет постбек профилей</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Создайте первый профиль для интеграции с вашим трекером
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Создать профиль
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Логи доставок</CardTitle>
              <CardDescription>
                История отправки постбеков в трекеры
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Время</TableHead>
                      <TableHead>Профиль</TableHead>
                      <TableHead>ClickID</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Код ответа</TableHead>
                      <TableHead>Попытка</TableHead>
                      <TableHead>Время ответа</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries?.map((delivery: any) => (
                      <TableRow key={delivery.id}>
                        <TableCell>
                          {new Date(delivery.created_at).toLocaleString('ru-RU')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{delivery.profile_name}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {delivery.clickid}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={delivery.response_code >= 200 && delivery.response_code < 300 ? "default" : "destructive"}
                          >
                            {delivery.response_code >= 200 && delivery.response_code < 300 ? (
                              <><CheckCircle className="h-3 w-3 mr-1" />Успех</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" />Ошибка</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{delivery.response_code || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          {delivery.attempt}/{delivery.max_attempts}
                        </TableCell>
                        <TableCell>
                          {delivery.duration_ms ? `${delivery.duration_ms}ms` : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!deliveries || deliveries.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <Clock className="h-8 w-8 mx-auto mb-2" />
                          Пока нет логов доставок
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создать постбек профиль</DialogTitle>
            <DialogDescription>
              Настройте интеграцию с вашим трекером для автоматической отправки данных о конверсиях
            </DialogDescription>
          </DialogHeader>
          <PostbackForm
            profile={formData}
            onSave={(data) => createMutation.mutate(data)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать профиль</DialogTitle>
            <DialogDescription>
              Изменить настройки интеграции с трекером
            </DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <PostbackForm
              profile={selectedProfile}
              onSave={(data) => {
                console.log('PostbackForm onSave called with:', data);
                console.log('Selected profile:', selectedProfile);
                const updatedProfile = { ...selectedProfile, ...data };
                console.log('Final profile data:', updatedProfile);
                updateMutation.mutate(updatedProfile);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Test Modal */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Тестирование постбека</DialogTitle>
            <DialogDescription>
              Отправить тестовый постбек для проверки настроек
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Click ID</Label>
                <Input
                  value={testData.clickid}
                  onChange={(e) => setTestData({ ...testData, clickid: e.target.value })}
                  placeholder="test123456"
                  data-testid="input-test-clickid"
                />
              </div>
              <div className="space-y-2">
                <Label>Тип события</Label>
                <Select value={testData.type} onValueChange={(value) => setTestData({ ...testData, type: value })}>
                  <SelectTrigger data-testid="select-test-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead (Лид)</SelectItem>
                    <SelectItem value="deposit">Deposit (Депозит)</SelectItem>
                    <SelectItem value="conversion">Conversion (Конверсия)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Сумма</Label>
                <Input
                  value={testData.revenue}
                  onChange={(e) => setTestData({ ...testData, revenue: e.target.value })}
                  placeholder="100"
                  data-testid="input-test-revenue"
                />
              </div>
              <div className="space-y-2">
                <Label>Валюта</Label>
                <Input
                  value={testData.currency}
                  onChange={(e) => setTestData({ ...testData, currency: e.target.value })}
                  placeholder="USD"
                  data-testid="input-test-currency"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsTestModalOpen(false)}>
                Отмена
              </Button>
              <Button 
                onClick={() => {
                  if (selectedProfile) {
                    testMutation.mutate({
                      profileId: selectedProfile.id,
                      testData
                    });
                  }
                }}
                disabled={testMutation.isPending || !testData.clickid}
              >
                {testMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Отправить тест
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AffiliatePostbacks;