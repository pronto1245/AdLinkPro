import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, ExternalLink, Copy, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import TrackingUrlGenerator from './TrackingUrlGenerator';

interface Postback {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST';
  events: string[];
  isActive: boolean;
  offerId?: string;
  offerName?: string;
  signatureKey?: string;
  ipWhitelist?: string[];
  retryEnabled: boolean;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  createdAt: string;
}

interface PostbackLog {
  id: string;
  postbackName: string;
  eventType: string;
  url: string;
  method: string;
  responseStatus?: number;
  responseTime?: number;
  retryCount: number;
  status: 'pending' | 'sent' | 'failed';
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

interface Offer {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface PostbackFormData {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  events: string[];
  isActive: boolean;
  offerId?: string;
  signatureKey?: string;
  ipWhitelist?: string[];
  retryEnabled: boolean;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

const EVENT_TYPES = [
  { value: 'click', label: 'Клик' },
  { value: 'lead', label: 'Лид (Регистрация)' },
  { value: 'ftd', label: 'FTD (Первый депозит)' },
  { value: 'deposit', label: 'Депозит' },
  { value: 'approve', label: 'Апрув' },
  { value: 'reject', label: 'Отклонение' },
  { value: 'hold', label: 'Холд' },
  { value: 'conversion', label: 'Конверсия' },
];

const MACRO_EXAMPLES = `
Доступные макросы:
{clickid} - Уникальный ID клика
{status} - Статус события (lead, ftd, approve, etc.)
{offer_id} - ID оффера
{partner_id} - ID партнёра
{payout} - Выплата партнёру
{revenue} - Доход рекламодателя
{currency} - Валюта
{sub1}-{sub5} - Подпараметры
{country} - Страна
{device} - Устройство
{ip} - IP адрес
{txid} - ID транзакции
{amount} - Сумма
{timestamp} - Временная метка

Пример URL:
https://tracker.com/postback?cid={clickid}&status={status}&sum={payout}&offer={offer_id}
`;

export default function PostbackManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPostback, setEditingPostback] = useState<Postback | null>(null);
  const [selectedTab, setSelectedTab] = useState<'postbacks' | 'logs' | 'tracking'>('postbacks');

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'GET' as 'GET' | 'POST',
    events: [] as string[],
    offerId: '',
    signatureKey: '',
    ipWhitelist: '',
    retryEnabled: true,
    maxRetries: 3,
    retryDelay: 60,
    timeout: 30,
    isActive: true,
  });

  // Fetch postbacks
  const { data: postbacks = [], isLoading: postbacksLoading } = useQuery<Postback[]>({
    queryKey: ['/api/postbacks'],
  });

  // Fetch postback logs
  const { data: logs = [], isLoading: logsLoading } = useQuery<PostbackLog[]>({
    queryKey: ['/api/postback-logs'],
  });

  // Fetch offers for dropdown
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ['/api/admin/offers'],
  });

  // Create/Update postback mutation
  const savePostbackMutation = useMutation({
    mutationFn: async (data: PostbackFormData) => {
      const url = editingPostback ? `/api/postbacks/${editingPostback.id}` : '/api/postbacks';
      const method = editingPostback ? 'PUT' : 'POST';
      return apiRequest(url, method, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postbacks'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingPostback ? 'Постбек обновлён' : 'Постбек создан',
        description: 'Изменения сохранены успешно',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить постбек',
        variant: 'destructive',
      });
    },
  });

  // Delete postback mutation
  const deletePostbackMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/postbacks/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postbacks'] });
      toast({
        title: 'Постбек удалён',
        description: 'Постбек успешно удалён',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить постбек',
        variant: 'destructive',
      });
    },
  });

  // Test postback mutation
  const testPostbackMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/postbacks/${id}/test`, 'POST'),
    onSuccess: () => {
      toast({
        title: 'Тест отправлен',
        description: 'Тестовый постбек отправлен успешно',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка теста',
        description: error.message || 'Не удалось отправить тестовый постбек',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      method: 'GET',
      events: [],
      offerId: '',
      signatureKey: '',
      ipWhitelist: '',
      retryEnabled: true,
      maxRetries: 3,
      retryDelay: 60,
      timeout: 30,
      isActive: true,
    });
    setEditingPostback(null);
  };

  const openEditDialog = (postback: Postback) => {
    setEditingPostback(postback);
    setFormData({
      name: postback.name,
      url: postback.url,
      method: postback.method,
      events: postback.events,
      offerId: postback.offerId || '',
      signatureKey: postback.signatureKey || '',
      ipWhitelist: postback.ipWhitelist?.join('\n') || '',
      retryEnabled: postback.retryEnabled,
      maxRetries: postback.maxRetries,
      retryDelay: postback.retryDelay,
      timeout: postback.timeout,
      isActive: postback.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      events: formData.events,
      ipWhitelist: formData.ipWhitelist ? formData.ipWhitelist.split('\n').filter(ip => ip.trim()) : [],
      offerId: formData.offerId || null,
    };

    savePostbackMutation.mutate(submitData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано',
      description: 'URL скопирован в буфер обмена',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    
    const statusLabels = {
      sent: 'Отправлен',
      failed: 'Ошибка',
      pending: 'В ожидании',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Управление Постбеками
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Настройка уведомлений о событиях для партнёров и рекламодателей
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={selectedTab === 'postbacks' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('postbacks')}
            data-testid="tab-postbacks"
          >
            Постбеки
          </Button>
          <Button
            variant={selectedTab === 'logs' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('logs')}
            data-testid="tab-logs"
          >
            Логи
          </Button>
          <Button
            variant={selectedTab === 'tracking' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('tracking')}
            data-testid="tab-tracking"
          >
            Tracking URL
          </Button>
        </div>
      </div>

      {selectedTab === 'postbacks' && (
        <div className="space-y-6">
          {/* Add Button */}
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} data-testid="button-add-postback">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить Постбек
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPostback ? 'Редактировать Постбек' : 'Создать Постбек'}
                  </DialogTitle>
                  <DialogDescription>
                    Настройте URL для получения уведомлений о событиях
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Название</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        data-testid="input-name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="method">Метод</Label>
                      <Select
                        value={formData.method}
                        onValueChange={(value: 'GET' | 'POST') => 
                          setFormData(prev => ({ ...prev, method: value }))
                        }
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

                  <div>
                    <Label htmlFor="url">Postback URL</Label>
                    <Textarea
                      id="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://tracker.com/postback?cid={clickid}&status={status}&sum={payout}"
                      required
                      data-testid="input-url"
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      <details>
                        <summary className="cursor-pointer">Показать доступные макросы</summary>
                        <pre className="mt-2 whitespace-pre-wrap text-xs">{MACRO_EXAMPLES}</pre>
                      </details>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="offer">Оффер (оставьте пустым для глобального)</Label>
                    <Select
                      value={formData.offerId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, offerId: value }))}
                    >
                      <SelectTrigger data-testid="select-offer">
                        <SelectValue placeholder="Выберите оффер или оставьте пустым" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Все офферы (глобальный)</SelectItem>
                        {offers.map((offer: Offer) => (
                          <SelectItem key={offer.id} value={offer.id}>
                            {offer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>События для отправки</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {EVENT_TYPES.map(event => (
                        <label key={event.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.events.includes(event.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  events: [...prev.events, event.value]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  events: prev.events.filter(ev => ev !== event.value)
                                }));
                              }
                            }}
                            data-testid={`checkbox-event-${event.value}`}
                          />
                          <span className="text-sm">{event.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signatureKey">Ключ подписи (опционально)</Label>
                      <Input
                        id="signatureKey"
                        type="password"
                        value={formData.signatureKey}
                        onChange={(e) => setFormData(prev => ({ ...prev, signatureKey: e.target.value }))}
                        placeholder="Для HMAC подписи"
                        data-testid="input-signature-key"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="timeout">Таймаут (сек)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={formData.timeout}
                        onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                        min="1"
                        max="120"
                        data-testid="input-timeout"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ipWhitelist">Белый список IP (по одному на строку)</Label>
                    <Textarea
                      id="ipWhitelist"
                      value={formData.ipWhitelist}
                      onChange={(e) => setFormData(prev => ({ ...prev, ipWhitelist: e.target.value }))}
                      placeholder="192.168.1.1&#10;10.0.0.1"
                      data-testid="input-ip-whitelist"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.retryEnabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, retryEnabled: checked }))}
                        data-testid="switch-retry-enabled"
                      />
                      <Label>Повторы при ошибках</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="maxRetries">Макс. повторов</Label>
                      <Input
                        id="maxRetries"
                        type="number"
                        value={formData.maxRetries}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxRetries: parseInt(e.target.value) }))}
                        min="0"
                        max="10"
                        disabled={!formData.retryEnabled}
                        data-testid="input-max-retries"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="retryDelay">Задержка (сек)</Label>
                      <Input
                        id="retryDelay"
                        type="number"
                        value={formData.retryDelay}
                        onChange={(e) => setFormData(prev => ({ ...prev, retryDelay: parseInt(e.target.value) }))}
                        min="1"
                        disabled={!formData.retryEnabled}
                        data-testid="input-retry-delay"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      data-testid="switch-is-active"
                    />
                    <Label>Активен</Label>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button type="submit" disabled={savePostbackMutation.isPending}>
                      {savePostbackMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Postbacks List */}
          <div className="grid gap-4">
            {postbacksLoading ? (
              <div className="text-center py-8">Загрузка постбеков...</div>
            ) : postbacks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">Постбеки не настроены</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Добавьте первый постбек для получения уведомлений о событиях
                  </p>
                </CardContent>
              </Card>
            ) : (
              postbacks.map((postback: Postback) => (
                <Card key={postback.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {postback.name}
                          {postback.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Активен</Badge>
                          ) : (
                            <Badge variant="secondary">Неактивен</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {postback.offerName ? `Оффер: ${postback.offerName}` : 'Глобальный постбек'}
                        </CardDescription>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(postback.url)}
                          title="Копировать URL"
                          data-testid={`button-copy-${postback.id}`}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => testPostbackMutation.mutate(postback.id)}
                          title="Тестовый запрос"
                          data-testid={`button-test-${postback.id}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(postback)}
                          title="Редактировать"
                          data-testid={`button-edit-${postback.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deletePostbackMutation.mutate(postback.id)}
                          title="Удалить"
                          data-testid={`button-delete-${postback.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm font-medium mb-1">URL:</div>
                      <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono break-all">
                        {postback.url}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{postback.method}</Badge>
                      {postback.events.map(event => (
                        <Badge key={event} variant="secondary">
                          {EVENT_TYPES.find(e => e.value === event)?.label || event}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>Таймаут: {postback.timeout}с</div>
                      <div>Повторы: {postback.retryEnabled ? `${postback.maxRetries} раз` : 'Отключены'}</div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {selectedTab === 'logs' && (
        <div className="space-y-6">
          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Журнал Постбеков</CardTitle>
              <CardDescription>
                История отправки постбеков и их статусы
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-8">Загрузка журнала...</div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Журнал постбеков пуст
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Постбек</th>
                        <th className="text-left p-2">Событие</th>
                        <th className="text-left p-2">URL</th>
                        <th className="text-left p-2">Статус</th>
                        <th className="text-left p-2">Ответ</th>
                        <th className="text-left p-2">Время</th>
                        <th className="text-left p-2">Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log: PostbackLog) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-2">
                            <div className="font-medium">{log.postbackName}</div>
                            {log.retryCount > 0 && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" />
                                Попытка {log.retryCount + 1}
                              </div>
                            )}
                          </td>
                          <td className="p-2">
                            <Badge variant="outline">
                              {EVENT_TYPES.find(e => e.value === log.eventType)?.label || log.eventType}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="max-w-xs truncate text-xs font-mono">
                              {log.url}
                            </div>
                          </td>
                          <td className="p-2">{getStatusBadge(log.status)}</td>
                          <td className="p-2">
                            {log.responseStatus && (
                              <div className="text-xs">
                                <div>HTTP {log.responseStatus}</div>
                                {log.responseTime && (
                                  <div className="text-gray-500">{log.responseTime}ms</div>
                                )}
                              </div>
                            )}
                            {log.errorMessage && (
                              <div className="text-xs text-red-600 max-w-xs truncate">
                                {log.errorMessage}
                              </div>
                            )}
                          </td>
                          <td className="p-2 text-xs">
                            {log.sentAt && new Date(log.sentAt).toLocaleString('ru-RU')}
                          </td>
                          <td className="p-2 text-xs">
                            {new Date(log.createdAt).toLocaleString('ru-RU')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'tracking' && (
        <TrackingUrlGenerator />
      )}
    </div>
  );
}