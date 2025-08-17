import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Webhook, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Code,
  Settings,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TooltipButton } from '@/components/ui/tooltip-button';
import { EmptyState } from '@/components/ui/empty-state';

interface Postback {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST';
  events: string[];
  macros: Record<string, string>;
  signatureKey?: string;
  ipWhitelist: string[];
  isActive: boolean;
  retryEnabled: boolean;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  offerId?: string;
  offerName?: string;
  createdAt: string;
  updatedAt: string;
}

interface PostbackLog {
  id: string;
  postbackId: string;
  eventType: string;
  url: string;
  method: string;
  responseStatus?: number;
  responseBody?: string;
  responseTime?: number;
  retryCount: number;
  status: 'pending' | 'sent' | 'failed' | 'retry';
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

const AVAILABLE_EVENTS = [
  { id: 'click', name: 'Клик', description: 'Переход по трекинговой ссылке' },
  { id: 'lead', name: 'Лид', description: 'Регистрация или заполнение формы' },
  { id: 'deposit', name: 'Депозит', description: 'Первый депозит пользователя' },
  { id: 'ftd', name: 'FTD', description: 'First Time Deposit' },
  { id: 'approve', name: 'Подтверждение', description: 'Подтверждение конверсии' },
  { id: 'reject', name: 'Отклонение', description: 'Отклонение конверсии' },
  { id: 'hold', name: 'Холд', description: 'Постановка конверсии на холд' }
];

const AVAILABLE_MACROS = [
  { id: '{clickid}', name: 'Click ID', description: 'Уникальный идентификатор клика' },
  { id: '{goal}', name: 'Цель', description: 'Тип конверсии (lead, deposit, etc.)' },
  { id: '{payout}', name: 'Выплата', description: 'Размер выплаты за конверсию' },
  { id: '{status}', name: 'Статус', description: 'Статус конверсии (approve, reject, etc.)' },
  { id: '{sub1}', name: 'SubID 1', description: 'Первый дополнительный параметр' },
  { id: '{sub2}', name: 'SubID 2', description: 'Второй дополнительный параметр' },
  { id: '{sub3}', name: 'SubID 3', description: 'Третий дополнительный параметр' },
  { id: '{sub4}', name: 'SubID 4', description: 'Четвёртый дополнительный параметр' },
  { id: '{sub5}', name: 'SubID 5', description: 'Пятый дополнительный параметр' },
  { id: '{offer_id}', name: 'ID оффера', description: 'Идентификатор оффера' },
  { id: '{partner_id}', name: 'ID партнёра', description: 'Идентификатор партнёра' },
  { id: '{timestamp}', name: 'Время', description: 'Unix timestamp события' },
];

export default function PostbackManagement() {
  const [activeTab, setActiveTab] = useState("postbacks");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPostback, setEditingPostback] = useState<Postback | null>(null);
  const [testingPostback, setTestingPostback] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Fetch postbacks
  const { data: postbacks = [], isLoading } = useQuery<Postback[]>({
    queryKey: ['/api/affiliate/postbacks'],
  });

  // Fetch postback logs
  const { data: logs = [] } = useQuery<PostbackLog[]>({
    queryKey: ['/api/affiliate/postbacks/logs'],
  });

  // Fetch available offers
  const { data: offers = [] } = useQuery({
    queryKey: ['/api/affiliate/offers'],
  });

  // Create/Update postback mutation
  const savePostbackMutation = useMutation({
    mutationFn: (data: Partial<Postback>) => {
      const url = data.id ? `/api/affiliate/postbacks/${data.id}` : '/api/affiliate/postbacks';
      const method = data.id ? 'PATCH' : 'POST';
      return apiRequest(url, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/postbacks'] });
      setIsCreateDialogOpen(false);
      setEditingPostback(null);
      toast({
        title: "Постбек сохранён",
        description: "Настройки постбека успешно сохранены",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить постбек",
        variant: "destructive",
      });
    }
  });

  // Delete postback mutation
  const deletePostbackMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/affiliate/postbacks/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/postbacks'] });
      toast({
        title: "Постбек удалён",
        description: "Постбек удалён из системы",
      });
    }
  });

  // Test postback mutation
  const testPostbackMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/affiliate/postbacks/${id}/test`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/postbacks/logs'] });
      toast({
        title: "Тест отправлен",
        description: "Тестовый постбек отправлен, проверьте логи",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка теста",
        description: "Не удалось отправить тестовый постбек",
        variant: "destructive",
      });
    }
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL скопирован",
      description: "URL постбека скопирован в буфер обмена",
    });
  };

  const handleDeletePostback = (postback: Postback) => {
    if (confirm(`Вы уверены, что хотите удалить постбек "${postback.name}"?`)) {
      deletePostbackMutation.mutate(postback.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Отправлен</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Ошибка</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Ожидание</Badge>;
      case 'retry':
        return <Badge className="bg-blue-100 text-blue-800"><Activity className="h-3 w-3 mr-1" />Повтор</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('postbacks.title')}</h1>
          <p className="text-muted-foreground mt-2">
            Настройка уведомлений о конверсиях для трекеров
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-postback">
              <Plus className="h-4 w-4 mr-2" />
              Создать постбек
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPostback ? 'Редактировать постбек' : 'Создать постбек'}
              </DialogTitle>
            </DialogHeader>
            <PostbackForm
              postback={editingPostback}
              offers={offers}
              onSave={(data) => savePostbackMutation.mutate(data)}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                setEditingPostback(null);
              }}
              isLoading={savePostbackMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="postbacks" data-testid="tab-postbacks">
            <Webhook className="h-4 w-4 mr-2" />
            Постбеки ({postbacks.length})
          </TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-logs">
            <Activity className="h-4 w-4 mr-2" />
            Логи ({logs.length})
          </TabsTrigger>
          <TabsTrigger value="help" data-testid="tab-help">
            <Code className="h-4 w-4 mr-2" />
            Помощь
          </TabsTrigger>
        </TabsList>

        <TabsContent value="postbacks" className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Всего постбеков</p>
                    <p className="text-2xl font-bold">{postbacks.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Активных</p>
                    <p className="text-2xl font-bold">
                      {postbacks.filter(p => p.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Успешных сегодня</p>
                    <p className="text-2xl font-bold">
                      {logs.filter(l => l.status === 'sent' && 
                        new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ошибок сегодня</p>
                    <p className="text-2xl font-bold">
                      {logs.filter(l => l.status === 'failed' && 
                        new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Postbacks Table */}
          <Card>
            <CardHeader>
              <CardTitle>Настроенные постбеки</CardTitle>
              <CardDescription>
                Управление постбеками для уведомления трекеров о конверсиях
              </CardDescription>
            </CardHeader>
            <CardContent>
              {postbacks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Webhook className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>У вас нет настроенных постбеков</p>
                  <p className="text-sm">Создайте постбек для получения уведомлений о конверсиях</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>События</TableHead>
                        <TableHead>Оффер</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Создан</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {postbacks.map((postback) => (
                        <TableRow key={postback.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{postback.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {postback.method} • {postback.timeout}s timeout
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate">
                                {postback.url}
                              </code>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {postback.events.slice(0, 3).map(event => (
                                <Badge key={event} variant="outline" className="text-xs">
                                  {AVAILABLE_EVENTS.find(e => e.id === event)?.name || event}
                                </Badge>
                              ))}
                              {postback.events.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{postback.events.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {postback.offerName ? (
                              <Badge variant="secondary">{postback.offerName}</Badge>
                            ) : (
                              <Badge variant="outline">Все офферы</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={postback.isActive ? "default" : "secondary"}>
                              {postback.isActive ? 'Активен' : 'Неактивен'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(postback.createdAt).toLocaleDateString('ru-RU')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyUrl(postback.url)}
                                title="Копировать URL"
                                data-testid={`button-copy-url-${postback.id}`}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              
                              <TooltipButton
                                variant="outline"
                                size="sm"
                                onClick={() => testPostbackMutation.mutate(postback.id)}
                                disabled={testPostbackMutation.isPending}
                                tooltip={testPostbackMutation.isPending ? "Выполняется тестирование постбека..." : "Отправить тестовый постбек"}
                                data-testid={`button-test-${postback.id}`}
                              >
                                <TestTube className="h-4 w-4" />
                              </TooltipButton>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingPostback(postback);
                                  setIsCreateDialogOpen(true);
                                }}
                                title="Редактировать"
                                data-testid={`button-edit-${postback.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePostback(postback)}
                                title="Удалить"
                                className="text-red-600 hover:text-red-700"
                                data-testid={`button-delete-${postback.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История отправки постбеков</CardTitle>
              <CardDescription>
                Логи всех отправленных постбеков с кодами ответа
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Пока нет логов отправки</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Время</TableHead>
                        <TableHead>Событие</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Ответ</TableHead>
                        <TableHead>Время ответа</TableHead>
                        <TableHead>Попытки</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.slice(0, 50).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.createdAt).toLocaleString('ru-RU')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.eventType}</Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded max-w-xs block truncate">
                              {log.url}
                            </code>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(log.status)}
                          </TableCell>
                          <TableCell>
                            {log.responseStatus && (
                              <Badge 
                                variant={log.responseStatus < 400 ? "default" : "destructive"}
                              >
                                {log.responseStatus}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {log.responseTime ? `${log.responseTime}ms` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {log.retryCount > 0 ? (
                              <Badge variant="secondary">{log.retryCount}</Badge>
                            ) : (
                              '0'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Доступные макросы
                </CardTitle>
                <CardDescription>
                  Используйте эти макросы в URL постбека
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {AVAILABLE_MACROS.map(macro => (
                    <div key={macro.id} className="flex items-start gap-3">
                      <code className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                        {macro.id}
                      </code>
                      <div>
                        <p className="text-sm font-medium">{macro.name}</p>
                        <p className="text-xs text-muted-foreground">{macro.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Интеграция с трекерами
                </CardTitle>
                <CardDescription>
                  Примеры настройки для популярных трекеров
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Keitaro</h4>
                    <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                      https://your-tracker.com/postback?clickid={"{clickid}"}&status={"{status}"}&payout={"{payout}"}
                    </code>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Binom</h4>
                    <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                      https://your-binom.com/click.php?cnv_id={"{clickid}"}&payout={"{payout}"}
                    </code>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">RedTrack</h4>
                    <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                      https://your-redtrack.com/postback?clickid={"{clickid}"}&event_type={"{goal}"}&revenue={"{payout}"}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Рекомендации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Безопасность</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Используйте HTTPS URL для постбеков</li>
                      <li>• Настройте IP whitelist если возможно</li>
                      <li>• Используйте подпись для проверки подлинности</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Надёжность</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Включите повторные попытки отправки</li>
                      <li>• Установите разумный timeout (10-30 сек)</li>
                      <li>• Мониторьте логи для выявления проблем</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Separate component for the postback form
function PostbackForm({ 
  postback, 
  offers, 
  onSave, 
  onCancel, 
  isLoading 
}: { 
  postback: Postback | null;
  offers: any[];
  onSave: (data: Partial<Postback>) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Postback>>({
    name: postback?.name || '',
    url: postback?.url || '',
    method: postback?.method || 'GET',
    events: postback?.events || ['lead'],
    macros: postback?.macros || {},
    signatureKey: postback?.signatureKey || '',
    ipWhitelist: postback?.ipWhitelist || [],
    isActive: postback?.isActive ?? true,
    retryEnabled: postback?.retryEnabled ?? true,
    maxRetries: postback?.maxRetries || 3,
    retryDelay: postback?.retryDelay || 60,
    timeout: postback?.timeout || 30,
    offerId: postback?.offerId || undefined
  });

  const handleEventChange = (eventId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      events: checked
        ? [...(prev.events || []), eventId]
        : (prev.events || []).filter(e => e !== eventId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(postback?.id ? { ...formData, id: postback.id } : formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Название постбека</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Мой постбек"
            required
            data-testid="input-postback-name"
          />
        </div>

        <div>
          <Label htmlFor="method">HTTP метод</Label>
          <Select value={formData.method} onValueChange={(value: 'GET' | 'POST') => 
            setFormData(prev => ({ ...prev, method: value }))
          }>
            <SelectTrigger data-testid="select-postback-method">
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
        <Label htmlFor="url">URL постбека</Label>
        <Textarea
          id="url"
          value={formData.url}
          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
          placeholder="https://your-tracker.com/postback?clickid={clickid}&status={status}&payout={payout}"
          required
          rows={3}
          data-testid="input-postback-url"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Используйте макросы в фигурных скобках, например {"{clickid}"}
        </p>
      </div>

      <div>
        <Label htmlFor="offer">Оффер (опционально)</Label>
        <Select value={formData.offerId || "all"} onValueChange={(value) => 
          setFormData(prev => ({ ...prev, offerId: value === "all" ? undefined : value }))
        }>
          <SelectTrigger data-testid="select-postback-offer">
            <SelectValue placeholder="Выберите оффер" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все офферы</SelectItem>
            {offers.map((offer: any) => (
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
          {AVAILABLE_EVENTS.map(event => (
            <div key={event.id} className="flex items-center space-x-2">
              <Checkbox
                id={event.id}
                checked={formData.events?.includes(event.id)}
                onCheckedChange={(checked) => 
                  handleEventChange(event.id, checked as boolean)
                }
                data-testid={`checkbox-event-${event.id}`}
              />
              <label htmlFor={event.id} className="text-sm">
                {event.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="timeout">Timeout (сек)</Label>
          <Input
            id="timeout"
            type="number"
            value={formData.timeout}
            onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
            min="5"
            max="120"
            data-testid="input-postback-timeout"
          />
        </div>

        <div>
          <Label htmlFor="maxRetries">Макс. попыток</Label>
          <Input
            id="maxRetries"
            type="number"
            value={formData.maxRetries}
            onChange={(e) => setFormData(prev => ({ ...prev, maxRetries: parseInt(e.target.value) }))}
            min="0"
            max="10"
            data-testid="input-postback-retries"
          />
        </div>

        <div>
          <Label htmlFor="retryDelay">Задержка (сек)</Label>
          <Input
            id="retryDelay"
            type="number"
            value={formData.retryDelay}
            onChange={(e) => setFormData(prev => ({ ...prev, retryDelay: parseInt(e.target.value) }))}
            min="10"
            max="3600"
            data-testid="input-postback-delay"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, isActive: checked as boolean }))
            }
            data-testid="checkbox-postback-active"
          />
          <label htmlFor="isActive" className="text-sm">
            Активен
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="retryEnabled"
            checked={formData.retryEnabled}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, retryEnabled: checked as boolean }))
            }
            data-testid="checkbox-postback-retry"
          />
          <label htmlFor="retryEnabled" className="text-sm">
            Повторные попытки
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel-postback"
        >
          Отмена
        </Button>
        <TooltipButton
          type="submit"
          disabled={isLoading}
          tooltip={isLoading ? "Сохранение настроек постбека..." : undefined}
          data-testid="button-save-postback"
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </TooltipButton>
      </div>
    </form>
  );
}