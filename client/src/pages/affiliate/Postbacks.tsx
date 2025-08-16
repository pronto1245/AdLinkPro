import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
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
import { useToast } from '../../hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface PostbackProfile {
  id: string;
  name: string;
  tracker_type: 'keitaro' | 'custom';
  scope_type: 'global' | 'offer';
  scope_id?: string;
  priority?: number;
  enabled: boolean;
  endpoint_url: string;
  method: 'GET' | 'POST';
  id_param: 'subid' | 'clickid';
  auth_query_key?: string;
  auth_query_val?: string;
  auth_header_name?: string;
  auth_header_val?: string;
  status_map?: Record<string, string>;
  params_template?: Record<string, string>;
  url_encode?: boolean;
  hmac_enabled?: boolean;
  hmac_secret?: string;
  hmac_payload_tpl?: string;
  hmac_param_name?: string;
  retries?: number;
  timeout_ms?: number;
  backoff_base_sec?: number;
  filter_revenue_gt0?: boolean;
  filter_country_whitelist?: string[];
  filter_country_blacklist?: string[];
  filter_exclude_bots?: boolean;
  last_delivery?: string;
  created_at: string;
  updated_at?: string;
}

// Предварительно настроенные шаблоны для популярных трекеров
const trackerTemplates = {
  keitaro: {
    name: 'Keitaro Tracker',
    tracker_type: 'keitaro' as const,
    endpoint_url: 'https://your-keitaro-domain.com/api/v1/postback',
    method: 'GET' as const,
    params_template: {
      'token': '{{auth_token}}',
      'clickid': '{{clickid}}',
      'status': '{{status}}',
      'payout': '{{revenue}}',
      'currency': '{{currency}}',
      'country': '{{country_iso}}'
    },
    status_map: {
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
    tracker_type: 'custom' as const,
    endpoint_url: 'https://your-binom-domain.com/click.php',
    method: 'GET' as const,
    params_template: {
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
  tracker_type: 'custom',
  scope_type: 'global',
  priority: 100,
  enabled: true,
  endpoint_url: '',
  method: 'GET',
  id_param: 'clickid',
  status_map: {
    open: 'open',
    reg: 'lead',
    deposit: 'sale',
    lp_click: 'click'
  },
  params_template: {
    clickid: '{{clickid}}',
    status: '{{status}}',
    revenue: '{{revenue}}',
    currency: '{{currency}}',
    country: '{{country_iso}}'
  },
  url_encode: true,
  hmac_enabled: false,
  retries: 5,
  timeout_ms: 4000,
  backoff_base_sec: 2,
  filter_revenue_gt0: false,
  filter_country_whitelist: [],
  filter_country_blacklist: [],
  filter_exclude_bots: true
};

export function AffiliatePostbacks() {
  const { t } = useTranslation();
  
  // Убрано для чистой консоли продакшена
  // Убрано для чистой консоли продакшена

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

  // Fetch postback profiles using apiRequest directly
  const { data: profiles = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/postback/profiles'],
    queryFn: async () => {
      // Убрано для чистой консоли продакшена
      const result = await apiRequest('/api/postback/profiles', 'GET');
      // Убрано для чистой консоли продакшена
      return result || [];
    },
    refetchInterval: 1000, // Автообновление каждую секунду
    refetchOnWindowFocus: true,
    staleTime: 0, // Всегда считать данные устаревшими
    gcTime: 0 // Не кешировать
  });

  // Fetch delivery logs using default queryFn
  const { data: deliveries = [] } = useQuery({
    queryKey: ['/api/postback/logs']
  });

  // Create profile mutation
  const createMutation = useMutation({
    mutationFn: async (profile: Partial<PostbackProfile>) => {
      console.log('Creating profile via apiRequest:', profile);
      return await apiRequest('/api/postback/profiles', 'POST', profile);
    },
    onSuccess: () => {
      // Принудительно очищаем весь кеш и перезагружаем
      queryClient.removeQueries({ queryKey: ['/api/postback/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/postback/profiles'] });
      queryClient.refetchQueries({ queryKey: ['/api/postback/profiles'] });
      setIsCreateModalOpen(false);
      setFormData(defaultProfile);
      toast({ title: 'Профиль создан', description: 'Постбек профиль успешно создан' });
      // Принудительно перезагружаем через таймаут
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/postback/profiles'] });
      }, 100);
    },
    onError: (error) => {
      // Тихо обрабатываем ошибки создания
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
      console.log('🔄 Updating profile via apiRequest:', profileData);
      
      if (!profileData || typeof profileData !== 'object') {
        throw new Error('Invalid profile data');
      }
      
      const { id, ...profile } = profileData;
      
      if (!id) {
        throw new Error('Profile ID is required');
      }
      
      const result = await apiRequest(`/api/postback/profiles/${id}`, 'PUT', profile);
      console.log('🔄 Update result:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['/api/postback/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/postback/profiles'] });
      queryClient.refetchQueries({ queryKey: ['/api/postback/profiles'] });
      setIsEditModalOpen(false);
      setSelectedProfile(null);
      toast({ title: 'Профиль обновлен', description: 'Постбек профиль успешно обновлен' });
    },
    onError: (error) => {
      // Тихо обрабатываем ошибки обновления
      toast({ 
        title: 'Ошибка обновления', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Delete profile mutation with enhanced error handling
  const deleteMutation = useMutation({
    mutationFn: async (profileId: string) => {
      console.log('🗑️ DELETE MUTATION - Starting deletion for:', profileId);
      
      if (!profileId) {
        throw new Error('ID профиля не указан');
      }
      
      try {
        const result = await apiRequest(`/api/postback/profiles/${profileId}`, 'DELETE');
        console.log('🗑️ DELETE MUTATION - apiRequest result:', result);
        
        if (!result || !result.success) {
          throw new Error(result?.message || 'Неизвестная ошибка при удалении');
        }
        
        return result;
      } catch (error) {
        // Тихо обрабатываем ошибки удаления
        throw new Error(`Ошибка удаления: ${(error as any).message}`);
      }
    },
    onSuccess: (data) => {
      console.log('🗑️ DELETE MUTATION - Success:', data);
      queryClient.removeQueries({ queryKey: ['/api/postback/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/postback/profiles'] });
      queryClient.refetchQueries({ queryKey: ['/api/postback/profiles'] });
      toast({ 
        title: 'Успешно удалено', 
        description: 'Профиль постбека успешно удален из системы' 
      });
      
      // Принудительная перезагрузка через небольшую задержку
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/postback/profiles'] });
      }, 500);
    },
    onError: (error: any) => {
      // Тихо обрабатываем ошибки удаления
      toast({ 
        title: t('postbacks.deleteError', 'Ошибка удаления профиля'), 
        description: `Не удалось удалить профиль: ${error.message}`,
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
        title: data.success ? t('postbacks.testSuccess', 'Тест успешен') : t('postbacks.testFailed', 'Тест неудачен'), 
        description: data.message || t('postbacks.postbackSent', 'Постбек отправлен')
      });
      setIsTestModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/postback/logs'] });
    },
    onError: (error) => {
      // Тихо обрабатываем ошибки тестирования
      toast({ 
        title: t('postbacks.testError', 'Ошибка тестирования'), 
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
      scope_type: 'global'
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
            {t('postbacks.quickSetup', 'Быстрая настройка по шаблону')}
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
                    scope_type: 'global' as const
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
            {t('postbacks.templateHelp', 'Выберите шаблон для автоматического заполнения настроек популярных трекеров')}
          </p>
        </div>

        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('postbacks.name', 'Название')}</Label>
            <Input
              value={localFormData.name || ''}
              onChange={(e) => setLocalFormData({ ...localFormData, name: e.target.value })}
              placeholder={t('postbacks.placeholderName', 'Мой трекер')}
              data-testid="input-profile-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('postbacks.trackerType', 'Тип трекера')}</Label>
            <Select value={localFormData.tracker_type} onValueChange={(value) => setLocalFormData({ ...localFormData, tracker_type: value as 'keitaro' | 'custom' })}>
              <SelectTrigger data-testid="select-tracker-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keitaro">Keitaro</SelectItem>
                <SelectItem value="custom">{t('postbacks.custom', 'Пользовательский')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('postbacks.scope', 'Область применения')}</Label>
            <Select value={localFormData.scope_type} onValueChange={(value) => setLocalFormData({ ...localFormData, scope_type: value as any })}>
              <SelectTrigger data-testid="select-scope-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">{t('postbacks.global', 'Глобально')}</SelectItem>
                <SelectItem value="offer">{t('postbacks.offer', 'Оффер')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('postbacks.priority', 'Приоритет')}</Label>
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
          <h3 className="font-medium">{t('postbacks.endpointSettings', 'Настройки эндпоинта')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label>{t('postbacks.endpointUrl', 'URL эндпоинта')}</Label>
              <Input
                value={localFormData.endpoint_url || ''}
                onChange={(e) => setLocalFormData({ ...localFormData, endpoint_url: e.target.value })}
                placeholder={t('postbacks.placeholderEndpoint', 'https://mytracker.com/postback')}
                data-testid="input-endpoint-url"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('postbacks.method', 'Метод')}</Label>
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
          <h3 className="font-medium">{t('postbacks.statusMapping', 'Маппинг статусов')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(localFormData.status_map || {}).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label>{key}</Label>
                <Input
                  value={value}
                  onChange={(e) => setLocalFormData({
                    ...localFormData,
                    status_map: { ...localFormData.status_map, [key]: e.target.value }
                  })}
                  data-testid={`input-status-${key}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Parameters Template */}
        <div className="space-y-4">
          <h3 className="font-medium">{t('postbacks.paramsTemplate', 'Шаблон параметров')}</h3>
          <Textarea
            value={JSON.stringify(localFormData.params_template || {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setLocalFormData({ ...localFormData, params_template: parsed });
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
{t('common.cancel', 'Отмена')}
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
            disabled={!localFormData.name || !localFormData.endpoint_url}
            data-testid="button-save"
          >
{t('common.save', 'Сохранить')}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('postbacks.title', 'Постбеки')}</h1>
          <p className="text-muted-foreground">
            {t('postbacks.subtitle', 'Настройка интеграции с внешними трекерами')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => {
              console.log('🧪 MANUAL TEST CREATE PROFILE');
              const testProfile = {
                name: `INTERFACE TEST ${Date.now()}`,
                tracker_type: 'custom' as const,
                endpoint_url: `http://test-interface.com/${Date.now()}`,
                method: 'GET' as const,
                enabled: true
              };
              console.log('🧪 Creating profile:', testProfile);
              createMutation.mutate(testProfile);
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
            data-testid="button-test-create"
          >
🧪 {t('postbacks.testProfile', 'ТЕСТ СОЗДАНИЯ')}
          </Button>
          <div className="ml-4 p-3 bg-red-100 border-2 border-red-400 rounded text-sm font-bold">
⚠️ {t('postbacks.refreshWarning', 'ЕСЛИ КНОПКИ БЕЛЫЕ: Обновите страницу (Ctrl+F5) или очистите кеш!')}
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create-profile">
            <Plus className="h-4 w-4 mr-2" />
            {t('postbacks.createProfile', 'Создать профиль')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profiles">{t('postbacks.profiles', 'Профили')}</TabsTrigger>
          <TabsTrigger value="logs">{t('postbacks.deliveryLogs', 'Логи доставок')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">{t('postbacks.loading', 'Загрузка профилей...')}</span>
            </div>
          ) : (
            <div className="grid gap-4">
              {console.log('🎨 RENDERING PROFILES:', profiles)}
              {console.log('🎨 PROFILES LENGTH:', profiles?.length)}
              {console.log('🎨 PROFILES TYPE:', typeof profiles)}
              {console.log('🎨 PROFILES ARRAY CHECK:', Array.isArray(profiles))}
              {console.log('🎨 MUTATIONS STATE:', {
                createPending: createMutation.isPending,
                updatePending: updateMutation.isPending,
                deletePending: deleteMutation.isPending,
                testPending: testMutation.isPending
              })}
              
              {profiles?.length > 0 ? (
                profiles.map((profile: PostbackProfile, index: number) => {
                console.log(`🎨 RENDERING PROFILE #${index}:`, profile);
                console.log(`🎨 BUTTON STATES FOR ${profile.id}:`, {
                  deletePending: deleteMutation.isPending,
                  updatePending: updateMutation.isPending,
                  testPending: testMutation.isPending
                });
                return (
                <Card key={profile.id} className="hover:shadow-md transition-shadow border-4 border-green-500 bg-green-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <Badge variant="outline">{profile.tracker_type}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={profile.enabled ? "default" : "secondary"}>
                          {profile.enabled ? t('common.active', 'Включен') : t('common.disabled', 'Отключен')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">{t('postbacks.endpoint', 'Эндпоинт')}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {profile.method} {profile.endpoint_url}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t('postbacks.lastDelivery', 'Последняя доставка')}</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.last_delivery 
                            ? new Date(profile.last_delivery).toLocaleString('ru-RU')
                            : t('postbacks.never', 'Не было')
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
                        <span className="text-sm">{t('common.enabled')}</span>
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
                          className={testMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                          data-testid={`button-test-${profile.id}`}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          {testMutation.isPending ? t('postbacks.testing') : t('postbacks.test')}
                        </Button>
                        
                        {/* ПОЛНОСТЬЮ НОВАЯ КНОПКА РЕДАКТИРОВАНИЯ */}
                        <div
                          onClick={() => {
                            console.log('🔥 НОВАЯ КНОПКА РЕДАКТИРОВАНИЯ НАЖАТА:', profile.id);
                            setSelectedProfile(profile);
                            setIsEditModalOpen(true);
                          }}
                          style={{
                            background: 'linear-gradient(45deg, #2563eb, #3b82f6)',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            border: '3px solid #2563eb',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                          }}
                          title="Редактировать профиль"
                        >
                          <Settings size={16} />
                          {updateMutation.isPending ? t('postbacks.updating') : t('postbacks.edit')}
                        </div>

                        {/* ПРОСТЕЙШАЯ КНОПКА УДАЛЕНИЯ */}
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            console.log('🚨🚨🚨 ПРОСТЕЙШАЯ КНОПКА НАЖАТА!');
                            console.log('🚨 ID профиля:', profile.id);
                            console.log('🚨 Название профиля:', profile.name);
                            
                            const userConfirmed = window.confirm(`${t('postbacks.confirmDelete')} "${profile.name}"?`);
                            console.log('🚨 Подтверждение пользователя:', userConfirmed);
                            
                            if (!userConfirmed) {
                              console.log('🚨 Отменено пользователем');
                              return;
                            }
                            
                            console.log('🚨 Начинаем удаление...');
                            
                            try {
                              // Получаем токен
                              const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
                              console.log('🚨 Токен найден:', token ? 'ДА' : 'НЕТ');
                              console.log('🚨 Длина токена:', token?.length || 0);
                              
                              if (!token) {
                                alert('Ошибка: токен авторизации не найден!');
                                return;
                              }
                              
                              console.log('🚨 Отправляем DELETE запрос...');
                              
                              const deleteResponse = await fetch(`/api/postback/profiles/${profile.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                                }
                              });
                              
                              console.log('🚨 Статус ответа:', deleteResponse.status);
                              console.log('🚨 OK:', deleteResponse.ok);
                              
                              if (deleteResponse.ok) {
                                const jsonResult = await deleteResponse.json();
                                console.log('🚨 JSON результат:', jsonResult);
                                
                                alert(`✅ Удаление выполнено: ${jsonResult.message}`);
                                
                                // Обновляем страницу
                                console.log('🚨 Перезагружаем страницу...');
                                window.location.reload();
                              } else {
                                const errorText = await deleteResponse.text();
                                // Тихо обрабатываем ошибки сервера
                                alert(`❌ Ошибка ${deleteResponse.status}: ${errorText}`);
                              }
                              
                            } catch (error) {
                              // Тихо обрабатываем исключения при удалении
                              alert(`❌ Ошибка сети: ${(error as any).message}`);
                            }
                          }}
                          style={{
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            border: '3px solid #dc2626',
                            padding: '15px 30px',
                            borderRadius: '10px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
                            textTransform: 'uppercase'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title={t('postbacks.deleteProfile')}
                        >
                          <Trash2 size={20} />
                          {t('common.delete', 'УДАЛИТЬ')}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })
              ) : (
                <div className="text-center py-8 bg-red-50 border-4 border-red-500 rounded">
                  <h2 className="text-red-800 font-bold text-xl mb-4">{t('postbacks.noProfilesFound', 'ПРОФИЛИ НЕ НАЙДЕНЫ!')}</h2>
                  <p className="text-red-600 mb-2">Всего профилей: {Array.isArray(profiles) ? profiles.length : 0}</p>
                  <p className="text-red-600 mb-2">Тип данных: {typeof profiles}</p>
                  <p className="text-red-600 mb-4">Это массив: {Array.isArray(profiles) ? 'Да' : 'Нет'}</p>
                  <Button 
                    onClick={() => {
                      console.log('🔄 FORCE REFETCH clicked');
                      refetch();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {t('common.refresh', 'ПРИНУДИТЕЛЬНАЯ ПЕРЕЗАГРУЗКА')}
                  </Button>
                </div>
              )}

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-bold text-yellow-800 mb-2">{t('postbacks.debugInfo', 'ОТЛАДКА - ПОЛНАЯ ИНФОРМАЦИЯ')}</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Количество профилей:</strong> {Array.isArray(profiles) ? profiles.length : 0}</p>
                  <p><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</p>
                  <p><strong>deleteMutation.isPending:</strong> {deleteMutation.isPending ? 'true' : 'false'}</p>
                  <p><strong>updateMutation.isPending:</strong> {updateMutation.isPending ? 'true' : 'false'}</p>
                  <p><strong>createMutation.isPending:</strong> {createMutation.isPending ? 'true' : 'false'}</p>
                  {profiles?.map((profile: PostbackProfile, index: number) => (
                    <div key={profile.id} className="p-2 bg-white border rounded mt-2">
                      <p><strong>Профиль #{index + 1}:</strong></p>
                      <p>ID: {profile.id}</p>
                      <p>Название: {profile.name}</p>
                      <p>Включен: {profile.enabled ? 'Да' : 'Нет'}</p>
                      <p>Тип: {profile.tracker_type}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('postbacks.deliveryLogs', 'Логи доставок')}</CardTitle>
              <CardDescription>
                {t('postbacks.deliveryHistory', 'История отправки постбеков в трекеры')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('postbacks.time', 'Время')}</TableHead>
                      <TableHead>{t('postbacks.profile', 'Профиль')}</TableHead>
                      <TableHead>ClickID</TableHead>
                      <TableHead>{t('postbacks.status', 'Статус')}</TableHead>
                      <TableHead>{t('postbacks.responseCode', 'Код ответа')}</TableHead>
                      <TableHead>{t('postbacks.attempt', 'Попытка')}</TableHead>
                      <TableHead>{t('postbacks.responseTime', 'Время ответа')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(deliveries) && deliveries.map((delivery: any) => (
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
                              <><CheckCircle className="h-3 w-3 mr-1" />{t('postbacks.success', 'Успех')}</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" />{t('postbacks.error', 'Ошибка')}</>
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
                    {(!deliveries || !Array.isArray(deliveries) || deliveries.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <Clock className="h-8 w-8 mx-auto mb-2" />
                          {t('postbacks.noLogsYet', 'Пока нет логов доставок')}
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
            <DialogTitle>{t('postbacks.createProfileTitle', 'Создать новый профиль')}</DialogTitle>
            <DialogDescription>
              {t('postbacks.createProfileDescription', 'Настройте интеграцию с вашим трекером для автоматической отправки данных о конверсиях')}
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
            <DialogTitle>{t('postbacks.editProfileTitle', 'Редактировать профиль')}</DialogTitle>
            <DialogDescription>
              {t('postbacks.editProfileDescription', 'Изменить настройки интеграции с трекером')}
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
            <DialogTitle>{t('postbacks.testTitle', 'Тестирование постбека')}</DialogTitle>
            <DialogDescription>
              {t('postbacks.testDescription', 'Отправить тестовый постбек для проверки настроек')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('postbacks.clickId', 'Click ID')}</Label>
                <Input
                  value={testData.clickid}
                  onChange={(e) => setTestData({ ...testData, clickid: e.target.value })}
                  placeholder="test123456"
                  data-testid="input-test-clickid"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('postbacks.eventType', 'Тип события')}</Label>
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
                <Label>{t('postbacks.amount', 'Сумма')}</Label>
                <Input
                  value={testData.revenue}
                  onChange={(e) => setTestData({ ...testData, revenue: e.target.value })}
                  placeholder="100"
                  data-testid="input-test-revenue"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('postbacks.currency', 'Валюта')}</Label>
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
                {t('common.cancel', 'Отмена')}
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
                {t('postbacks.sendTest', 'Отправить тест')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AffiliatePostbacks;