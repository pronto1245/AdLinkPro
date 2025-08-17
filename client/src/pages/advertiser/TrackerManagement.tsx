import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Play, 
  Pause,
  Check,
  X,
  Clock,
  AlertCircle,
  Link,
  Zap,
  BarChart3,
  Globe,
  Code,
  FileText,
  Copy,
  ExternalLink,
  Webhook,
  TestTube,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface TrackerConfig {
  id: string;
  name: string;
  type: 'keitaro' | 'voluum' | 'binom' | 'thrive' | 'custom';
  baseUrl: string;
  apiKey?: string;
  webhookUrl: string;
  isActive: boolean;
  settings: {
    trackClicks: boolean;
    trackConversions: boolean;
    trackPostbacks: boolean;
    realTimeSync: boolean;
    customParams: Record<string, string>;
    eventMapping: Record<string, string>;
  };
  statistics: {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    lastSync: string | null;
    uptime: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface TrackerTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  logoUrl?: string;
  defaultSettings: Partial<TrackerConfig['settings']>;
  requiredFields: string[];
  documentationUrl?: string;
}

interface TrackerEvent {
  id: string;
  trackerId: string;
  eventType: string;
  status: 'success' | 'failed' | 'pending';
  data: Record<string, any>;
  response?: string;
  errorMessage?: string;
  timestamp: string;
  retryCount: number;
}

const TRACKER_TEMPLATES: TrackerTemplate[] = [
  {
    id: 'keitaro',
    name: 'Keitaro',
    type: 'keitaro',
    description: 'Professional tracking platform',
    defaultSettings: {
      trackClicks: true,
      trackConversions: true,
      trackPostbacks: true,
      realTimeSync: true,
      eventMapping: {
        'click': 'click',
        'lead': 'lead',
        'deposit': 'sale',
        'conversion': 'conversion'
      }
    },
    requiredFields: ['baseUrl', 'apiKey'],
    documentationUrl: 'https://doc.keitaro.io/'
  },
  {
    id: 'voluum',
    name: 'Voluum',
    type: 'voluum',
    description: 'Advanced performance marketing platform',
    defaultSettings: {
      trackClicks: true,
      trackConversions: true,
      trackPostbacks: true,
      realTimeSync: false,
      eventMapping: {
        'click': 'visit',
        'lead': 'conversion',
        'deposit': 'conversion',
        'conversion': 'conversion'
      }
    },
    requiredFields: ['baseUrl', 'apiKey'],
    documentationUrl: 'https://doc.voluum.com/'
  },
  {
    id: 'binom',
    name: 'Binom',
    type: 'binom',
    description: 'Self-hosted tracker solution',
    defaultSettings: {
      trackClicks: true,
      trackConversions: true,
      trackPostbacks: false,
      realTimeSync: true,
      eventMapping: {
        'click': 'click',
        'lead': 'conversion',
        'deposit': 'conversion',
        'conversion': 'conversion'
      }
    },
    requiredFields: ['baseUrl'],
    documentationUrl: 'https://docs.binom.org/'
  },
  {
    id: 'thrive',
    name: 'ThriveTracker',
    type: 'thrive',
    description: 'Comprehensive affiliate tracking',
    defaultSettings: {
      trackClicks: true,
      trackConversions: true,
      trackPostbacks: true,
      realTimeSync: false
    },
    requiredFields: ['baseUrl', 'apiKey'],
    documentationUrl: 'https://help.thrivetracker.com/'
  },
  {
    id: 'custom',
    name: 'Custom Tracker',
    type: 'custom',
    description: 'Custom integration setup',
    defaultSettings: {
      trackClicks: true,
      trackConversions: true,
      trackPostbacks: false,
      realTimeSync: false
    },
    requiredFields: ['baseUrl', 'webhookUrl']
  }
];

export default function TrackerManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('trackers');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEventsDialog, setShowEventsDialog] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<TrackerConfig | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Form state
  const [trackerForm, setTrackerForm] = useState({
    name: '',
    type: 'keitaro' as TrackerConfig['type'],
    baseUrl: '',
    apiKey: '',
    webhookUrl: '',
    isActive: true,
    settings: {
      trackClicks: true,
      trackConversions: true,
      trackPostbacks: true,
      realTimeSync: false,
      customParams: {} as Record<string, string>,
      eventMapping: {} as Record<string, string>
    }
  });

  const [customParamKey, setCustomParamKey] = useState('');
  const [customParamValue, setCustomParamValue] = useState('');

  // Fetch trackers
  const { data: trackers, isLoading, refetch } = useQuery({
    queryKey: ['/api/advertiser/trackers'],
    queryFn: async () => {
      const response = await apiRequest('/api/advertiser/trackers');
      return response as TrackerConfig[];
    }
  });

  // Fetch tracker events
  const { data: events } = useQuery({
    queryKey: ['/api/advertiser/tracker-events', selectedTracker?.id],
    queryFn: async () => {
      if (!selectedTracker) return [];
      const response = await apiRequest(`/api/advertiser/trackers/${selectedTracker.id}/events`);
      return response as TrackerEvent[];
    },
    enabled: !!selectedTracker && showEventsDialog
  });

  // Create tracker mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<TrackerConfig>) => {
      return apiRequest('/api/advertiser/trackers', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: 'Трекер создан',
        description: 'Трекер успешно добавлен и настроен'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/trackers'] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать трекер',
        variant: 'destructive'
      });
    }
  });

  // Update tracker mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TrackerConfig> }) => {
      return apiRequest(`/api/advertiser/trackers/${id}`, 'PATCH', data);
    },
    onSuccess: () => {
      toast({
        title: 'Трекер обновлен',
        description: 'Настройки трекера успешно сохранены'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/trackers'] });
      setShowEditDialog(false);
      resetForm();
    }
  });

  // Delete tracker mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/advertiser/trackers/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: 'Трекер удален',
        description: 'Трекер успешно удален'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/trackers'] });
    }
  });

  // Test tracker connection mutation
  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/advertiser/trackers/${id}/test`, 'POST');
    },
    onSuccess: (result: any) => {
      toast({
        title: result.success ? 'Соединение успешно' : 'Ошибка соединения',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
    }
  });

  // Sync tracker data mutation
  const syncMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/advertiser/trackers/${id}/sync`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: 'Синхронизация запущена',
        description: 'Данные будут обновлены в течение нескольких минут'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/trackers'] });
    }
  });

  const resetForm = () => {
    setTrackerForm({
      name: '',
      type: 'keitaro',
      baseUrl: '',
      apiKey: '',
      webhookUrl: '',
      isActive: true,
      settings: {
        trackClicks: true,
        trackConversions: true,
        trackPostbacks: true,
        realTimeSync: false,
        customParams: {},
        eventMapping: {}
      }
    });
    setSelectedTemplate('');
    setSelectedTracker(null);
    setCustomParamKey('');
    setCustomParamValue('');
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = TRACKER_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setTrackerForm(prev => ({
        ...prev,
        name: template.name,
        type: template.type as TrackerConfig['type'],
        settings: { ...prev.settings, ...template.defaultSettings }
      }));
    }
    setSelectedTemplate(templateId);
  };

  const handleAddCustomParam = () => {
    if (customParamKey && customParamValue) {
      setTrackerForm(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          customParams: {
            ...prev.settings.customParams,
            [customParamKey]: customParamValue
          }
        }
      }));
      setCustomParamKey('');
      setCustomParamValue('');
    }
  };

  const handleRemoveCustomParam = (key: string) => {
    setTrackerForm(prev => {
      const newParams = { ...prev.settings.customParams };
      delete newParams[key];
      return {
        ...prev,
        settings: { ...prev.settings, customParams: newParams }
      };
    });
  };

  const handleCreateTracker = () => {
    createMutation.mutate(trackerForm);
  };

  const handleUpdateTracker = () => {
    if (selectedTracker) {
      updateMutation.mutate({ id: selectedTracker.id, data: trackerForm });
    }
  };

  const handleEditTracker = (tracker: TrackerConfig) => {
    setSelectedTracker(tracker);
    setTrackerForm({
      name: tracker.name,
      type: tracker.type,
      baseUrl: tracker.baseUrl,
      apiKey: tracker.apiKey || '',
      webhookUrl: tracker.webhookUrl,
      isActive: tracker.isActive,
      settings: tracker.settings
    });
    setShowEditDialog(true);
  };

  const selectedTemplateInfo = TRACKER_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Управление трекерами</h1>
          <p className="text-muted-foreground">Интеграция с внешними системами трекинга</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить трекер
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Добавление трекера</DialogTitle>
              <DialogDescription>
                Настройте интеграцию с внешним трекинговым сервисом
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-3">
                <Label>Выберите тип трекера</Label>
                <div className="grid grid-cols-2 gap-3">
                  {TRACKER_TEMPLATES.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-colors ${selectedTemplate === template.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          {template.documentationUrl && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(template.documentationUrl, '_blank');
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {selectedTemplateInfo && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Требуемые поля:</strong> {selectedTemplateInfo.requiredFields.join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Basic Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    value={trackerForm.name}
                    onChange={(e) => setTrackerForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Название трекера"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Тип</Label>
                  <Select value={trackerForm.type} onValueChange={(value) => setTrackerForm(prev => ({ ...prev, type: value as TrackerConfig['type'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keitaro">Keitaro</SelectItem>
                      <SelectItem value="voluum">Voluum</SelectItem>
                      <SelectItem value="binom">Binom</SelectItem>
                      <SelectItem value="thrive">ThriveTracker</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseUrl">Base URL *</Label>
                  <Input
                    id="baseUrl"
                    value={trackerForm.baseUrl}
                    onChange={(e) => setTrackerForm(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="https://tracker.domain.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={trackerForm.apiKey}
                    onChange={(e) => setTrackerForm(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="API ключ трекера"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL *</Label>
                <Input
                  id="webhookUrl"
                  value={trackerForm.webhookUrl}
                  onChange={(e) => setTrackerForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://tracker.domain.com/webhook"
                />
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">Настройки трекинга</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trackClicks"
                      checked={trackerForm.settings.trackClicks}
                      onCheckedChange={(checked) => setTrackerForm(prev => ({
                        ...prev,
                        settings: { ...prev.settings, trackClicks: !!checked }
                      }))}
                    />
                    <Label htmlFor="trackClicks">Отслеживать клики</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trackConversions"
                      checked={trackerForm.settings.trackConversions}
                      onCheckedChange={(checked) => setTrackerForm(prev => ({
                        ...prev,
                        settings: { ...prev.settings, trackConversions: !!checked }
                      }))}
                    />
                    <Label htmlFor="trackConversions">Отслеживать конверсии</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trackPostbacks"
                      checked={trackerForm.settings.trackPostbacks}
                      onCheckedChange={(checked) => setTrackerForm(prev => ({
                        ...prev,
                        settings: { ...prev.settings, trackPostbacks: !!checked }
                      }))}
                    />
                    <Label htmlFor="trackPostbacks">Постбеки</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="realTimeSync"
                      checked={trackerForm.settings.realTimeSync}
                      onCheckedChange={(checked) => setTrackerForm(prev => ({
                        ...prev,
                        settings: { ...prev.settings, realTimeSync: !!checked }
                      }))}
                    />
                    <Label htmlFor="realTimeSync">Синхронизация в реальном времени</Label>
                  </div>
                </div>
              </div>

              {/* Custom Parameters */}
              <div className="space-y-3">
                <Label>Дополнительные параметры</Label>
                <div className="flex gap-2">
                  <Input
                    value={customParamKey}
                    onChange={(e) => setCustomParamKey(e.target.value)}
                    placeholder="Ключ"
                  />
                  <Input
                    value={customParamValue}
                    onChange={(e) => setCustomParamValue(e.target.value)}
                    placeholder="Значение"
                  />
                  <Button type="button" onClick={handleAddCustomParam} variant="outline">
                    Добавить
                  </Button>
                </div>
                {Object.entries(trackerForm.settings.customParams).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(trackerForm.settings.customParams).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">
                          <strong>{key}:</strong> {value}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveCustomParam(key)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Отмена
              </Button>
              <Button 
                onClick={handleCreateTracker} 
                disabled={createMutation.isPending || !trackerForm.name || !trackerForm.baseUrl}
              >
                {createMutation.isPending ? 'Создание...' : 'Создать трекер'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="trackers">Трекеры</TabsTrigger>
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          <TabsTrigger value="documentation">Документация</TabsTrigger>
        </TabsList>

        <TabsContent value="trackers">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">Загрузка трекеров...</div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {trackers?.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Трекеры не настроены</h3>
                    <p className="text-muted-foreground mb-4">
                      Добавьте интеграцию с внешними трекерами для расширенной аналитики
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить трекер
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {trackers?.map((tracker) => (
                    <Card key={tracker.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${tracker.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                {tracker.name}
                              </CardTitle>
                              <CardDescription>
                                {tracker.type.charAt(0).toUpperCase() + tracker.type.slice(1)} • {tracker.baseUrl}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {tracker.type}
                            </Badge>
                            {tracker.isActive ? (
                              <Badge variant="success">Активен</Badge>
                            ) : (
                              <Badge variant="secondary">Неактивен</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-6 mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{tracker.statistics.successfulEvents}</p>
                            <p className="text-sm text-muted-foreground">Успешных событий</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{tracker.statistics.failedEvents}</p>
                            <p className="text-sm text-muted-foreground">Ошибок</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{tracker.statistics.uptime}%</p>
                            <p className="text-sm text-muted-foreground">Uptime</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">
                              {tracker.statistics.lastSync 
                                ? new Date(tracker.statistics.lastSync).toLocaleDateString('ru-RU')
                                : 'Никогда'
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">Последняя синхронизация</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Создан: {new Date(tracker.createdAt).toLocaleDateString('ru-RU')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => testMutation.mutate(tracker.id)}
                              disabled={testMutation.isPending}
                            >
                              <TestTube className="h-4 w-4 mr-1" />
                              Тест
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => syncMutation.mutate(tracker.id)}
                              disabled={syncMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Синхр.
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedTracker(tracker);
                                setShowEventsDialog(true);
                              }}
                            >
                              <BarChart3 className="h-4 w-4 mr-1" />
                              События
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditTracker(tracker)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteMutation.mutate(tracker.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid gap-4">
            {TRACKER_TEMPLATES.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {template.name}
                    </div>
                    {template.documentationUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(template.documentationUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Документация
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Обязательные поля:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.requiredFields.map((field) => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Поддерживаемые функции:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(template.defaultSettings || {}).map(([key, value]) => 
                          value ? (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </Badge>
                          ) : null
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        handleTemplateSelect(template.id);
                        setShowCreateDialog(true);
                      }}
                      className="w-full"
                    >
                      Использовать шаблон
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documentation">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Документация по интеграции</CardTitle>
                <CardDescription>
                  Руководство по настройке внешних трекеров
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Общие принципы</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Все трекеры используют webhook'и для передачи данных</li>
                    <li>Поддерживается синхронизация в реальном времени</li>
                    <li>Автоматическая повторная отправка при ошибках</li>
                    <li>Детальное логирование всех событий</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Настройка Keitaro</h3>
                  <div className="p-4 bg-muted rounded text-sm">
                    <p className="mb-2">1. Получите API ключ в настройках Keitaro</p>
                    <p className="mb-2">2. Добавьте webhook URL: <code>{window.location.origin}/api/webhooks/tracker</code></p>
                    <p>3. Настройте маппинг событий согласно вашей кампании</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Настройка Voluum</h3>
                  <div className="p-4 bg-muted rounded text-sm">
                    <p className="mb-2">1. Создайте новый трекинг домен в Voluum</p>
                    <p className="mb-2">2. Настройте постбек URL в офферах</p>
                    <p>3. Используйте параметры {'{'}clickid{'}'} и {'{'}payout{'}'} в URL</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Events Dialog */}
      <Dialog open={showEventsDialog} onOpenChange={setShowEventsDialog}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>События трекера: {selectedTracker?.name}</DialogTitle>
            <DialogDescription>
              История событий и их статус
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Тип события</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Данные</TableHead>
                    <TableHead>Ошибка</TableHead>
                    <TableHead>Попытки</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-sm">
                        {new Date(event.timestamp).toLocaleString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.eventType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          event.status === 'success' ? 'success' :
                          event.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {event.status === 'success' ? 'Успех' :
                           event.status === 'failed' ? 'Ошибка' : 'Ожидание'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <details>
                          <summary className="cursor-pointer">Показать</summary>
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </details>
                      </TableCell>
                      <TableCell className="text-sm text-red-600">
                        {event.errorMessage || '-'}
                      </TableCell>
                      <TableCell>{event.retryCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventsDialog(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Similar structure to create dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирование трекера</DialogTitle>
            <DialogDescription>
              Измените настройки трекера
            </DialogDescription>
          </DialogHeader>
          
          {/* Same form content as create dialog */}
          <div className="space-y-6">
            {/* Active Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={trackerForm.isActive}
                onCheckedChange={(checked) => setTrackerForm(prev => ({ ...prev, isActive: !!checked }))}
              />
              <Label htmlFor="isActive">Активный трекер</Label>
            </div>
            
            {/* Rest of the form fields... */}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateTracker} 
              disabled={updateMutation.isPending || !trackerForm.name}
            >
              {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}