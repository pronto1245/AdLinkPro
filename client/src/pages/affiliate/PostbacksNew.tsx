import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  endpoint_url: string;
  method: 'GET' | 'POST';
  tracker_type: string;
  status: string;
  last_delivery?: string;
  delivery_stats?: {
    total_sent: number;
    success_rate: number;
    avg_response_time: number;
  };
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
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: postback?.name || '',
    endpoint_url: postback?.endpoint_url || '',
    method: postback?.method || 'GET' as const,
    tracker_type: postback?.tracker_type || 'custom',
    enabled: postback?.enabled ?? true,
    priority: postback?.priority || 100,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">{t('postbacks.basicTab', 'Основные')}</TabsTrigger>
          <TabsTrigger value="settings">{t('postbacks.settingsTab', 'Настройки')}</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('postbacks.name', 'Название')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('postbacks.placeholderName', 'Keitaro Tracker')}
                required
                data-testid="input-name"
              />
            </div>
            <div>
              <Label htmlFor="priority">{t('postbacks.priority', 'Приоритет')}</Label>
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
            <Label htmlFor="endpoint_url">{t('postbacks.endpointUrl', 'URL эндпоинта')}</Label>
            <Input
              id="endpoint_url"
              type="url"
              value={formData.endpoint_url}
              onChange={(e) => setFormData(prev => ({ ...prev, endpoint_url: e.target.value }))}
              placeholder={t('postbacks.placeholderEndpoint', 'https://your-tracker.com/postback')}
              required
              data-testid="input-endpoint-url"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="method">{t('postbacks.method', 'HTTP метод')}</Label>
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
              <Label htmlFor="tracker_type">{t('postbacks.trackerType', 'Тип трекера')}</Label>
              <Select 
                value={formData.tracker_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tracker_type: value }))}
              >
                <SelectTrigger data-testid="select-tracker-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">{t('postbacks.custom', 'Пользовательский')}</SelectItem>
                  <SelectItem value="keitaro">Keitaro</SelectItem>
                  <SelectItem value="binom">Binom</SelectItem>
                  <SelectItem value="voluum">Voluum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
              data-testid="switch-enabled"
            />
            <Label htmlFor="enabled">{t('common.active', 'Включен')}</Label>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">{t('postbacks.advancedSettings', 'Дополнительные настройки')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('postbacks.comingSoon', 'Расширенные параметры конфигурации будут добавлены в следующих версиях.')}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
          {t('common.cancel', 'Отмена')}
        </Button>
        <Button type="submit" data-testid="button-submit">
          {postback ? t('common.update', 'Обновить') : t('common.create', 'Создать')}
        </Button>
      </div>
    </form>
  );
}

export default function PostbacksNewPage() {
  const [selectedPostback, setSelectedPostback] = useState<PostbackProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Fetch postback profiles
  const { data: postbacks = [], isLoading } = useQuery({
    queryKey: ['/api/postback/profiles'],
    queryFn: () => apiRequest('/api/postback/profiles')
  });

  // Create postback mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/postback/profiles', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postback/profiles'] });
      setShowForm(false);
      toast({ title: t('postbacks.postbackSaved', 'Профиль постбека создан'), description: t('postbacks.createSuccessDesc', 'Новый профиль постбека успешно создан') });
    },
    onError: () => {
      toast({ title: t('postbacks.error', 'Ошибка'), description: t('postbacks.createErrorDesc', 'Не удалось создать профиль постбека'), variant: "destructive" });
    }
  });

  // Update postback mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/postback/profiles/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postback/profiles'] });
      setShowForm(false);
      setSelectedPostback(null);
      toast({ title: t('postbacks.postbackSaved', 'Профиль обновлен'), description: t('postbacks.updateSuccessDesc', 'Изменения сохранены') });
    }
  });

  // Delete postback mutation - РАБОЧАЯ ВЕРСИЯ ИЗ РЕКЛАМОДАТЕЛЯ
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/postback/profiles/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/postback/profiles'] });
      toast({ title: t('postbacks.postbackDeleted', 'Профиль удален'), description: t('postbacks.deleteSuccessDesc', 'Профиль постбека успешно удален') });
    },
    onError: (_error) => {
      toast({ 
        title: "Ошибка удаления", 
        description: `Не удалось удалить профиль: ${error.message}`, 
        variant: "destructive" 
      });
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

  // РАБОЧАЯ ФУНКЦИЯ УДАЛЕНИЯ ИЗ РЕКЛАМОДАТЕЛЯ
  const handleDelete = (id: string) => {
    if (confirm(t('common.confirmDelete', 'Вы уверены, что хотите удалить этот профиль постбека?'))) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8" data-testid="loading-indicator">{t('common.loading', 'Загрузка...')}</div>;
  }

  return (
    <div className="space-y-6" data-testid="postback-profiles-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('postbacks.configuredPostbacks')}</h1>
          <p className="text-muted-foreground">
            {t('postbacks.subtitle')}
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          data-testid="button-create-postback"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('postbacks.createPostbackProfile')}
        </Button>
      </div>

      <div className="grid gap-4">
        {postbacks.map((postback: PostbackProfile) => (
          <Card key={postback.id} data-testid={`card-postback-${postback.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-lg">{postback.name}</CardTitle>
                  <Badge variant="outline" data-testid={`badge-tracker-type-${postback.id}`}>
                    {postback.tracker_type}
                  </Badge>
                  <Badge 
                    variant={postback.enabled ? "default" : "secondary"}
                    data-testid={`badge-status-${postback.id}`}
                  >
                    {postback.enabled ? t('common.active', 'Включен') : t('common.disabled', 'Отключен')}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(postback)}
                    data-testid={`button-edit-${postback.id}`}
                    title={t('common.edit', 'Редактировать')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {/* РАБОЧАЯ КНОПКА УДАЛЕНИЯ ИЗ РЕКЛАМОДАТЕЛЯ */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(postback.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${postback.id}`}
                    title={t('common.delete', 'Удалить')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Эндпоинт</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {postback.method} {postback.endpoint_url}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Последняя доставка</p>
                  <p className="text-sm text-muted-foreground">
                    {postback.last_delivery 
                      ? new Date(postback.last_delivery).toLocaleString('ru-RU')
                      : 'Не было'
                    }
                  </p>
                </div>
                {postback.delivery_stats && (
                  <>
                    <div>
                      <p className="text-sm font-medium">Отправлено</p>
                      <p className="text-sm text-muted-foreground">
                        {postback.delivery_stats.total_sent.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Успешность</p>
                      <p className="text-sm text-muted-foreground">
                        {postback.delivery_stats.success_rate}%
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {postbacks.length === 0 && (
          <Card data-testid="empty-state">
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет профилей постбеков</h3>
              <p className="text-muted-foreground mb-4">
                Создайте первый профиль для начала работы с постбеками
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Создать профиль
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Форма создания/редактирования */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPostback ? 'Редактировать профиль' : 'Создать новый профиль'}
            </DialogTitle>
            <DialogDescription>
              Настройте параметры отправки постбеков во внешние системы
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
    </div>
  );
}