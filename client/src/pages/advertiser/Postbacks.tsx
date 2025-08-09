import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Settings, 
  Play, 
  Trash2, 
  Eye, 
  Copy, 
  RefreshCw, 
  Send, 
  AlertTriangle,
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
  scopeType: 'global' | 'campaign' | 'offer' | 'flow';
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

interface PostbackDelivery {
  id: string;
  profileId: string;
  profileName: string;
  eventId: string;
  clickid: string;
  attempt: number;
  maxAttempts: number;
  requestMethod: string;
  requestUrl: string;
  requestBody?: string;
  responseCode?: number;
  responseBody?: string;
  error?: string;
  durationMs?: number;
  createdAt: string;
}

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

export function AdvertiserPostbacks() {
  const [selectedProfile, setSelectedProfile] = useState<PostbackProfile | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profiles');
  const [testData, setTestData] = useState({ clickid: '', type: 'reg', revenue: '100', currency: 'USD' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch postback profiles
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['/api/postback/profiles'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/postback/profiles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch profiles');
      return response.json();
    }
  });

  // Fetch delivery logs
  const { data: deliveries } = useQuery({
    queryKey: ['/api/postback/deliveries'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/postback/deliveries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch deliveries');
      return response.json();
    }
  });

  // Create profile mutation
  const createMutation = useMutation({
    mutationFn: async (profile: Partial<PostbackProfile>) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/postback/profiles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });
      if (!response.ok) throw new Error('Failed to create profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postback/profiles'] });
      setIsCreateModalOpen(false);
      toast({ title: 'Профиль создан', description: 'Постбек профиль успешно создан' });
    }
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...profile }: PostbackProfile) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/postback/profiles/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postback/profiles'] });
      setIsEditModalOpen(false);
      setSelectedProfile(null);
      toast({ title: 'Профиль обновлен', description: 'Постбек профиль успешно обновлен' });
    }
  });

  // Delete profile mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/postback/profiles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete profile');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postback/profiles'] });
      toast({ title: 'Профиль удален', description: 'Постбек профиль успешно удален' });
    }
  });

  // Test postback mutation
  const testMutation = useMutation({
    mutationFn: async ({ profileId, testData: data }: { profileId: string; testData: any }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/postback/profiles/${profileId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to test postback');
      return response.json();
    }
  });

  const getScopeIcon = (scopeType: string) => {
    switch (scopeType) {
      case 'global': return <Globe className="h-4 w-4" />;
      case 'campaign': return <Target className="h-4 w-4" />;
      case 'offer': return <Zap className="h-4 w-4" />;
      case 'flow': return <Send className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (enabled: boolean, lastDelivery?: string) => {
    if (!enabled) {
      return <Badge variant="secondary">Отключен</Badge>;
    }
    if (!lastDelivery) {
      return <Badge variant="outline">Нет доставок</Badge>;
    }
    return <Badge variant="default">Активен</Badge>;
  };

  const PostbackForm = ({ profile, onSave }: { profile: Partial<PostbackProfile>; onSave: (data: Partial<PostbackProfile>) => void }) => {
    const [formData, setFormData] = useState(profile);

    return (
      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Keitaro Tracker"
              data-testid="input-profile-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Тип трекера</Label>
            <Select value={formData.trackerType} onValueChange={(value) => setFormData({ ...formData, trackerType: value as 'keitaro' | 'custom' })}>
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
            <Select value={formData.scopeType} onValueChange={(value) => setFormData({ ...formData, scopeType: value as any })}>
              <SelectTrigger data-testid="select-scope-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Глобально</SelectItem>
                <SelectItem value="campaign">Кампания</SelectItem>
                <SelectItem value="offer">Оффер</SelectItem>
                <SelectItem value="flow">Поток</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Приоритет</Label>
            <Input
              type="number"
              value={formData.priority || 100}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
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
                value={formData.endpointUrl || ''}
                onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })}
                placeholder="https://tracker.com/postback"
                data-testid="input-endpoint-url"
              />
            </div>

            <div className="space-y-2">
              <Label>Метод</Label>
              <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value as 'GET' | 'POST' })}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ID параметр</Label>
              <Select value={formData.idParam} onValueChange={(value) => setFormData({ ...formData, idParam: value as 'subid' | 'clickid' })}>
                <SelectTrigger data-testid="select-id-param">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clickid">clickid</SelectItem>
                  <SelectItem value="subid">subid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={formData.urlEncode || false}
                onCheckedChange={(checked) => setFormData({ ...formData, urlEncode: checked })}
                data-testid="switch-url-encode"
              />
              <Label>URL-кодирование</Label>
            </div>
          </div>
        </div>

        {/* Status Mapping */}
        <div className="space-y-4">
          <h3 className="font-medium">Маппинг статусов</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.statusMap || {}).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label>{key}</Label>
                <Input
                  value={value}
                  onChange={(e) => setFormData({
                    ...formData,
                    statusMap: { ...formData.statusMap, [key]: e.target.value }
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
            value={JSON.stringify(formData.paramsTemplate || {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData({ ...formData, paramsTemplate: parsed });
              } catch (error) {
                // Invalid JSON, don't update
              }
            }}
            className="font-mono text-sm"
            rows={8}
            placeholder='{\n  "clickid": "{{clickid}}",\n  "status": "{{status}}",\n  "revenue": "{{revenue}}"\n}'
            data-testid="textarea-params-template"
          />
        </div>

        {/* Authentication */}
        <div className="space-y-4">
          <h3 className="font-medium">Аутентификация</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Query ключ</Label>
              <Input
                value={formData.authQueryKey || ''}
                onChange={(e) => setFormData({ ...formData, authQueryKey: e.target.value })}
                placeholder="api_key"
                data-testid="input-auth-query-key"
              />
            </div>

            <div className="space-y-2">
              <Label>Query значение</Label>
              <Input
                type="password"
                value={formData.authQueryVal || ''}
                onChange={(e) => setFormData({ ...formData, authQueryVal: e.target.value })}
                placeholder="your_api_key"
                data-testid="input-auth-query-val"
              />
            </div>

            <div className="space-y-2">
              <Label>Header имя</Label>
              <Input
                value={formData.authHeaderName || ''}
                onChange={(e) => setFormData({ ...formData, authHeaderName: e.target.value })}
                placeholder="Authorization"
                data-testid="input-auth-header-name"
              />
            </div>

            <div className="space-y-2">
              <Label>Header значение</Label>
              <Input
                type="password"
                value={formData.authHeaderVal || ''}
                onChange={(e) => setFormData({ ...formData, authHeaderVal: e.target.value })}
                placeholder="Bearer token"
                data-testid="input-auth-header-val"
              />
            </div>
          </div>
        </div>

        {/* HMAC Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.hmacEnabled || false}
              onCheckedChange={(checked) => setFormData({ ...formData, hmacEnabled: checked })}
              data-testid="switch-hmac-enabled"
            />
            <Label>Включить HMAC подпись</Label>
          </div>

          {formData.hmacEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>HMAC секрет</Label>
                <Input
                  type="password"
                  value={formData.hmacSecret || ''}
                  onChange={(e) => setFormData({ ...formData, hmacSecret: e.target.value })}
                  data-testid="input-hmac-secret"
                />
              </div>

              <div className="space-y-2">
                <Label>Имя параметра подписи</Label>
                <Input
                  value={formData.hmacParamName || 'signature'}
                  onChange={(e) => setFormData({ ...formData, hmacParamName: e.target.value })}
                  data-testid="input-hmac-param-name"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Шаблон для подписи</Label>
                <Input
                  value={formData.hmacPayloadTpl || ''}
                  onChange={(e) => setFormData({ ...formData, hmacPayloadTpl: e.target.value })}
                  placeholder="{{clickid}}{{status}}{{revenue}}"
                  data-testid="input-hmac-payload"
                />
              </div>
            </div>
          )}
        </div>

        {/* Retry Settings */}
        <div className="space-y-4">
          <h3 className="font-medium">Настройки повторов</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Попытки</Label>
              <Input
                type="number"
                value={formData.retries || 5}
                onChange={(e) => setFormData({ ...formData, retries: parseInt(e.target.value) })}
                data-testid="input-retries"
              />
            </div>

            <div className="space-y-2">
              <Label>Таймаут (мс)</Label>
              <Input
                type="number"
                value={formData.timeoutMs || 4000}
                onChange={(e) => setFormData({ ...formData, timeoutMs: parseInt(e.target.value) })}
                data-testid="input-timeout"
              />
            </div>

            <div className="space-y-2">
              <Label>Базовая задержка (сек)</Label>
              <Input
                type="number"
                value={formData.backoffBaseSec || 2}
                onChange={(e) => setFormData({ ...formData, backoffBaseSec: parseInt(e.target.value) })}
                data-testid="input-backoff"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <h3 className="font-medium">Фильтры</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.filterRevenueGt0 || false}
                onCheckedChange={(checked) => setFormData({ ...formData, filterRevenueGt0: checked })}
                data-testid="switch-filter-revenue"
              />
              <Label>Только с доходом &gt; 0</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.filterExcludeBots || false}
                onCheckedChange={(checked) => setFormData({ ...formData, filterExcludeBots: checked })}
                data-testid="switch-filter-bots"
              />
              <Label>Исключать ботов</Label>
            </div>
          </div>
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
            onClick={() => onSave(formData)}
            disabled={!formData.name || !formData.endpointUrl}
            data-testid="button-save"
          >
            Сохранить
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Постбеки</h1>
          <p className="text-muted-foreground">
            Управление интеграциями с трекерами и системами аналитики
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
                        {getScopeIcon(profile.scopeType)}
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <Badge variant="outline">{profile.trackerType}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(profile.enabled, profile.lastDelivery)}
                        <span className="text-sm text-muted-foreground">
                          Приоритет: {profile.priority}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Эндпоинт</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {profile.method} {profile.endpointUrl}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Область</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.scopeType} {profile.scopeId ? `(${profile.scopeId})` : ''}
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
                            setIsTestModalOpen(true);
                          }}
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
                          data-testid={`button-edit-${profile.id}`}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Настройки
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(profile.id)}
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
                      Создайте первый профиль для интеграции с трекерами
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
                      <TableHead>Попытка</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Длительность</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries?.map((delivery: PostbackDelivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell>
                          {new Date(delivery.createdAt).toLocaleString('ru-RU')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{delivery.profileName}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {delivery.clickid}
                        </TableCell>
                        <TableCell>
                          {delivery.attempt}/{delivery.maxAttempts}
                        </TableCell>
                        <TableCell>
                          {delivery.responseCode ? (
                            <Badge variant={delivery.responseCode >= 200 && delivery.responseCode < 300 ? "default" : "destructive"}>
                              {delivery.responseCode}
                            </Badge>
                          ) : delivery.error ? (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Ошибка
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              В обработке
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {delivery.durationMs ? `${delivery.durationMs}мс` : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Show delivery details modal
                            }}
                            data-testid={`button-view-delivery-${delivery.id}`}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Profile Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создать постбек профиль</DialogTitle>
            <DialogDescription>
              Настройте интеграцию с трекером для автоматической передачи событий
            </DialogDescription>
          </DialogHeader>
          <PostbackForm
            profile={defaultProfile}
            onSave={(data) => createMutation.mutate(data)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать профиль</DialogTitle>
            <DialogDescription>
              Изменить настройки постбек профиля
            </DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <PostbackForm
              profile={selectedProfile}
              onSave={(data) => updateMutation.mutate({ ...selectedProfile, ...data })}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Test Postback Modal */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Тестировать постбек</DialogTitle>
            <DialogDescription>
              Отправить тестовое событие для проверки интеграции
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ClickID</Label>
                <Input
                  value={testData.clickid}
                  onChange={(e) => setTestData({ ...testData, clickid: e.target.value })}
                  placeholder="test-click-123"
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
                    <SelectItem value="open">open</SelectItem>
                    <SelectItem value="reg">reg</SelectItem>
                    <SelectItem value="deposit">deposit</SelectItem>
                    <SelectItem value="lp_click">lp_click</SelectItem>
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

            {testMutation.data && (
              <div className="space-y-2">
                <Label>Результат теста</Label>
                <div className="p-3 bg-muted rounded-md">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(testMutation.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsTestModalOpen(false)}
                data-testid="button-test-cancel"
              >
                Отмена
              </Button>
              <Button
                onClick={() => selectedProfile && testMutation.mutate({ 
                  profileId: selectedProfile.id, 
                  testData 
                })}
                disabled={!testData.clickid || testMutation.isPending}
                data-testid="button-test-send"
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

export default AdvertiserPostbacks;