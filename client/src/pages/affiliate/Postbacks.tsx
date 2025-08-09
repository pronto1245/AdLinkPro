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
    queryKey: ['/api/affiliate/postback/profiles'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/affiliate/postback/profiles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch profiles');
      return response.json();
    }
  });

  // Fetch delivery logs
  const { data: deliveries } = useQuery({
    queryKey: ['/api/affiliate/postback/deliveries'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/affiliate/postback/deliveries', {
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
      const response = await fetch('/api/affiliate/postback/profiles', {
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
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/postback/profiles'] });
      setIsCreateModalOpen(false);
      toast({ title: 'Профиль создан', description: 'Постбек профиль успешно создан' });
    }
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...profile }: PostbackProfile) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/affiliate/postback/profiles/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/postback/profiles'] });
      setIsEditModalOpen(false);
      setSelectedProfile(null);
      toast({ title: 'Профиль обновлен', description: 'Постбек профиль успешно обновлен' });
    }
  });

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
              placeholder="Мой трекер"
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
                <SelectItem value="offer">Оффер</SelectItem>
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
                placeholder="https://mytracker.com/postback"
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
                      <TableHead>Попытка</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Длительность</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries?.map((delivery: any) => (
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
              Настройте интеграцию с вашим трекером для автоматической передачи событий
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
    </div>
  );
}