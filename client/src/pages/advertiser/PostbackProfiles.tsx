import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Settings, Trash2, Edit, Eye, Copy, TestTube, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiRequest } from '@/lib/queryClient';

interface PostbackProfile {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  endpointUrl: string;
  method: 'GET' | 'POST';
  ownerScope: 'owner' | 'advertiser' | 'partner';
  scopeType: 'global' | 'campaign' | 'offer' | 'flow';
  scopeId?: string;
  idParam: 'subid' | 'clickid';
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
  filterCountryWhitelist?: string[];
  filterCountryBlacklist?: string[];
  filterExcludeBots: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PostbackDelivery {
  id: string;
  profileId: string;
  eventId?: string;
  clickid: string;
  attempt: number;
  maxAttempts: number;
  requestMethod: string;
  requestUrl: string;
  requestBody?: string;
  requestHeaders?: Record<string, string>;
  responseCode?: number;
  responseBody?: string;
  error?: string;
  durationMs?: number;
  createdAt: string;
}

function PostbackForm({ 
  postback, 
  onSubmit, 
  onCancel 
}: { 
  postback?: PostbackProfile; 
  onSubmit: (data: any) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: postback?.name || '',
    endpointUrl: postback?.endpointUrl || '',
    method: postback?.method || 'GET' as const,
    scopeType: postback?.scopeType || 'offer' as const,
    scopeId: postback?.scopeId || '',
    idParam: postback?.idParam || 'clickid' as const,
    enabled: postback?.enabled ?? true,
    priority: postback?.priority || 100,
    
    // Status mapping
    statusMap: postback?.statusMap || { 
      reg: 'lead', 
      deposit: 'sale',
      open: 'open',
      lp_click: 'click'
    },
    
    // Parameters template 
    paramsTemplate: postback?.paramsTemplate || {
      clickid: '{{clickid}}',
      status: '{{status}}',
      revenue: '{{revenue}}',
      currency: '{{currency}}',
      sub1: '{{sub1}}',
      sub2: '{{sub2}}'
    },
    
    urlEncode: postback?.urlEncode ?? true,
    
    // HMAC settings
    hmacEnabled: postback?.hmacEnabled || false,
    hmacSecret: postback?.hmacSecret || '',
    hmacPayloadTpl: postback?.hmacPayloadTpl || '',
    hmacParamName: postback?.hmacParamName || 'signature',
    
    // Retry settings
    retries: postback?.retries || 5,
    timeoutMs: postback?.timeoutMs || 4000,
    backoffBaseSec: postback?.backoffBaseSec || 2,
    
    // Filters
    filterRevenueGt0: postback?.filterRevenueGt0 || false,
    filterExcludeBots: postback?.filterExcludeBots ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleParamsTemplateChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      paramsTemplate: {
        ...prev.paramsTemplate,
        [key]: value
      }
    }));
  };

  const handleStatusMapChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      statusMap: {
        ...prev.statusMap,
        [key]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Основные</TabsTrigger>
          <TabsTrigger value="params">Параметры</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          <TabsTrigger value="filters">Фильтры</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Keitaro Tracker"
                required
                data-testid="input-name"
              />
            </div>
            <div>
              <Label htmlFor="priority">Приоритет</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="999"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                data-testid="input-priority"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="endpointUrl">URL эндпоинта</Label>
            <Input
              id="endpointUrl"
              type="url"
              value={formData.endpointUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, endpointUrl: e.target.value }))}
              placeholder="https://your-tracker.com/postback"
              required
              data-testid="input-endpoint-url"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="method">HTTP метод</Label>
              <Select 
                value={formData.method} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, method: value as 'GET' | 'POST' }))}
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
            <div>
              <Label htmlFor="scopeType">Область применения</Label>
              <Select 
                value={formData.scopeType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, scopeType: value as any }))}
              >
                <SelectTrigger data-testid="select-scope-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Глобальный</SelectItem>
                  <SelectItem value="offer">Оффер</SelectItem>
                  <SelectItem value="campaign">Кампания</SelectItem>
                  <SelectItem value="flow">Поток</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="idParam">ID параметр</Label>
              <Select 
                value={formData.idParam} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, idParam: value as 'subid' | 'clickid' }))}
              >
                <SelectTrigger data-testid="select-id-param">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clickid">clickid</SelectItem>
                  <SelectItem value="subid">subid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="retries">Повторы</Label>
              <Input
                id="retries"
                type="number"
                min="1"
                max="10"
                value={formData.retries}
                onChange={(e) => setFormData(prev => ({ ...prev, retries: parseInt(e.target.value) }))}
                data-testid="input-retries"
              />
            </div>
            <div>
              <Label htmlFor="timeoutMs">Таймаут (мс)</Label>
              <Input
                id="timeoutMs"
                type="number"
                min="1000"
                max="30000"
                value={formData.timeoutMs}
                onChange={(e) => setFormData(prev => ({ ...prev, timeoutMs: parseInt(e.target.value) }))}
                data-testid="input-timeout"
              />
            </div>
            <div>
              <Label htmlFor="backoffBaseSec">База для backoff (сек)</Label>
              <Input
                id="backoffBaseSec"
                type="number"
                min="1"
                max="60"
                value={formData.backoffBaseSec}
                onChange={(e) => setFormData(prev => ({ ...prev, backoffBaseSec: parseInt(e.target.value) }))}
                data-testid="input-backoff"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                data-testid="switch-enabled"
              />
              <Label htmlFor="enabled">Включен</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="urlEncode"
                checked={formData.urlEncode}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, urlEncode: checked }))}
                data-testid="switch-url-encode"
              />
              <Label htmlFor="urlEncode">URL кодирование</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="params" className="space-y-4">
          <div>
            <Label>Маппинг статусов событий</Label>
            <div className="space-y-2 mt-2">
              {Object.entries(formData.statusMap).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-2">
                  <Input
                    value={key}
                    placeholder="Тип события"
                    readOnly
                    data-testid={`input-status-event-${key}`}
                  />
                  <Input
                    value={value}
                    onChange={(e) => handleStatusMapChange(key, e.target.value)}
                    placeholder="Статус для трекера"
                    data-testid={`input-status-mapped-${key}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Шаблон параметров (Mustache)</Label>
            <div className="space-y-2 mt-2">
              {Object.entries(formData.paramsTemplate).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-2">
                  <Input
                    value={key}
                    placeholder="Имя параметра"
                    readOnly
                    data-testid={`input-param-name-${key}`}
                  />
                  <Input
                    value={value}
                    onChange={(e) => handleParamsTemplateChange(key, e.target.value)}
                    placeholder="Значение (например: {{clickid}})"
                    data-testid={`input-param-value-${key}`}
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Доступные переменные: clickid, status, revenue, currency, sub1-sub10, country_iso, device_type
            </p>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="hmacEnabled"
              checked={formData.hmacEnabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hmacEnabled: checked }))}
              data-testid="switch-hmac-enabled"
            />
            <Label htmlFor="hmacEnabled">Включить HMAC подпись</Label>
          </div>

          {formData.hmacEnabled && (
            <>
              <div>
                <Label htmlFor="hmacSecret">HMAC секретный ключ</Label>
                <Input
                  id="hmacSecret"
                  type="password"
                  value={formData.hmacSecret}
                  onChange={(e) => setFormData(prev => ({ ...prev, hmacSecret: e.target.value }))}
                  placeholder="Секретный ключ для подписи"
                  data-testid="input-hmac-secret"
                />
              </div>

              <div>
                <Label htmlFor="hmacPayloadTpl">Шаблон payload для HMAC</Label>
                <Textarea
                  id="hmacPayloadTpl"
                  value={formData.hmacPayloadTpl}
                  onChange={(e) => setFormData(prev => ({ ...prev, hmacPayloadTpl: e.target.value }))}
                  placeholder="{{clickid}}{{status}}{{revenue}}"
                  rows={3}
                  data-testid="input-hmac-payload"
                />
              </div>

              <div>
                <Label htmlFor="hmacParamName">Имя параметра подписи</Label>
                <Input
                  id="hmacParamName"
                  value={formData.hmacParamName}
                  onChange={(e) => setFormData(prev => ({ ...prev, hmacParamName: e.target.value }))}
                  placeholder="signature"
                  data-testid="input-hmac-param-name"
                />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="filterRevenueGt0"
              checked={formData.filterRevenueGt0}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, filterRevenueGt0: checked }))}
              data-testid="switch-filter-revenue"
            />
            <Label htmlFor="filterRevenueGt0">Только события с revenue &gt; 0</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="filterExcludeBots"
              checked={formData.filterExcludeBots}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, filterExcludeBots: checked }))}
              data-testid="switch-filter-bots"
            />
            <Label htmlFor="filterExcludeBots">Исключить ботов</Label>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
          Отмена
        </Button>
        <Button type="submit" data-testid="button-submit">
          {postback ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
}

export default function PostbackProfilesPage() {
  const [selectedPostback, setSelectedPostback] = useState<PostbackProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeliveries, setShowDeliveries] = useState(false);
  const [selectedDeliveryProfile, setSelectedDeliveryProfile] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch postback profiles
  const { data: postbacks, isLoading } = useQuery({
    queryKey: ['/api/postback-profiles'],
    queryFn: () => apiRequest('/api/postback-profiles')
  });

  // Fetch delivery logs
  const { data: deliveries } = useQuery({
    queryKey: ['/api/postback/deliveries', selectedDeliveryProfile],
    queryFn: () => apiRequest(`/api/postback/deliveries${selectedDeliveryProfile ? `?profileId=${selectedDeliveryProfile}` : ''}`),
    enabled: showDeliveries
  });

  // Create postback mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/postback-profiles', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postback-profiles'] });
      setShowForm(false);
      toast({ title: "Профиль постбека создан", description: "Новый профиль постбека успешно создан" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось создать профиль постбека", variant: "destructive" });
    }
  });

  // Update postback mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/postback-profiles/${id}`, { 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postback-profiles'] });
      setShowForm(false);
      setSelectedPostback(null);
      toast({ title: "Профиль обновлен", description: "Изменения сохранены" });
    }
  });

  // Delete postback mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/postback-profiles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postback-profiles'] });
      toast({ title: "Профиль удален", description: "Профиль постбека успешно удален" });
    }
  });

  const handleSubmit = (data: any) => {
    if (selectedPostback) {
      updateMutation.mutate({ id: selectedPostback.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (postback: PostbackProfile) => {
    setSelectedPostback(postback);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот профиль постбека?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (responseCode?: number) => {
    if (!responseCode) {return <Badge variant="secondary">Нет ответа</Badge>;}
    
    if (responseCode >= 200 && responseCode < 300) {
      return <Badge variant="default" className="bg-green-500">Успех</Badge>;
    } else if (responseCode >= 400) {
      return <Badge variant="destructive">Ошибка</Badge>;
    } else {
      return <Badge variant="secondary">{responseCode}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8" data-testid="loading-indicator">Загрузка...</div>;
  }

  return (
    <div className="space-y-6" data-testid="postback-profiles-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Профили постбеков</h1>
          <p className="text-muted-foreground" data-testid="page-description">
            Настройка и управление профилями постбеков для передачи данных о конверсиях
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowDeliveries(true)}
            data-testid="button-view-deliveries"
          >
            <Eye className="h-4 w-4 mr-2" />
            Логи доставки
          </Button>
          <Button 
            onClick={() => {
              setSelectedPostback(null);
              setShowForm(true);
            }}
            data-testid="button-create-postback"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить профиль
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список профилей постбеков</CardTitle>
          <CardDescription>
            Управление профилями постбеков для отправки уведомлений о конверсиях
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table data-testid="postback-profiles-table">
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Метод</TableHead>
                <TableHead>Область</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Приоритет</TableHead>
                <TableHead>Обновлен</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postbacks?.map((postback: PostbackProfile) => (
                <TableRow key={postback.id} data-testid={`row-postback-${postback.id}`}>
                  <TableCell className="font-medium" data-testid={`text-name-${postback.id}`}>
                    {postback.name}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" data-testid={`text-url-${postback.id}`}>
                    {postback.endpointUrl}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" data-testid={`badge-method-${postback.id}`}>
                      {postback.method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" data-testid={`badge-scope-${postback.id}`}>
                      {postback.scopeType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={postback.enabled ? "default" : "secondary"}
                      data-testid={`badge-status-${postback.id}`}
                    >
                      {postback.enabled ? "Активен" : "Отключен"}
                    </Badge>
                  </TableCell>
                  <TableCell data-testid={`text-priority-${postback.id}`}>
                    {postback.priority}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground" data-testid={`text-updated-${postback.id}`}>
                      {new Date(postback.updatedAt).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid={`button-actions-${postback.id}`}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEdit(postback)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedDeliveryProfile(postback.id);
                          setShowDeliveries(true);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Логи доставки
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TestTube className="h-4 w-4 mr-2" />
                          Тестировать
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(postback.endpointUrl)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Копировать URL
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(postback.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!postbacks?.length && (
            <div className="text-center py-8" data-testid="empty-state">
              <p className="text-muted-foreground mb-4" data-testid="text-empty-message">
                Профили постбеков не настроены
              </p>
              <Button 
                onClick={() => setShowForm(true)} 
                data-testid="button-create-first-postback"
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать первый профиль
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-form">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title">
              {selectedPostback ? 'Редактировать профиль постбека' : 'Создать профиль постбека'}
            </DialogTitle>
            <DialogDescription data-testid="dialog-description">
              Настройте параметры профиля постбека для отправки уведомлений о конверсиях
            </DialogDescription>
          </DialogHeader>
          <PostbackForm
            postback={selectedPostback || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedPostback(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delivery Logs Dialog */}
      <Dialog open={showDeliveries} onOpenChange={setShowDeliveries}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto" data-testid="dialog-deliveries">
          <DialogHeader>
            <DialogTitle>Логи доставки постбеков</DialogTitle>
            <DialogDescription>
              История отправки постбеков и их результаты
            </DialogDescription>
          </DialogHeader>
          
          <Table data-testid="deliveries-table">
            <TableHeader>
              <TableRow>
                <TableHead>Время</TableHead>
                <TableHead>Click ID</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Метод</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Время ответа</TableHead>
                <TableHead>Попытка</TableHead>
                <TableHead>Ошибка</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries?.map((delivery: PostbackDelivery) => (
                <TableRow key={delivery.id} data-testid={`row-delivery-${delivery.id}`}>
                  <TableCell data-testid={`text-delivery-time-${delivery.id}`}>
                    {new Date(delivery.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-sm" data-testid={`text-delivery-clickid-${delivery.id}`}>
                    {delivery.clickid}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" data-testid={`text-delivery-url-${delivery.id}`}>
                    {delivery.requestUrl}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" data-testid={`badge-delivery-method-${delivery.id}`}>
                      {delivery.requestMethod}
                    </Badge>
                  </TableCell>
                  <TableCell data-testid={`badge-delivery-status-${delivery.id}`}>
                    {getStatusBadge(delivery.responseCode)}
                  </TableCell>
                  <TableCell data-testid={`text-delivery-duration-${delivery.id}`}>
                    {delivery.durationMs && `${delivery.durationMs}ms`}
                  </TableCell>
                  <TableCell data-testid={`text-delivery-attempt-${delivery.id}`}>
                    {delivery.attempt} / {delivery.maxAttempts}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-red-600" data-testid={`text-delivery-error-${delivery.id}`}>
                    {delivery.error}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!deliveries?.length && (
            <div className="text-center py-8" data-testid="empty-deliveries">
              <p className="text-muted-foreground">Логи доставки не найдены</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}