import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Globe, Plus, Edit, Trash2, Eye, RotateCcw, Send, AlertCircle, CheckCircle, 
  Clock, XCircle, Filter, Search, Download, Settings, Target, Link, 
  Activity, BarChart3, Wifi, WifiOff, RefreshCw, Copy, ExternalLink,
  Server, Database, FileText, Calendar, Hash, Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';

interface PostbackTemplate {
  id: string;
  name: string;
  level: 'global' | 'offer';
  url: string;
  events: string[];
  parameters: Record<string, string>;
  headers: Record<string, string>;
  retryAttempts: number;
  timeout: number;
  isActive: boolean;
  offerId?: string;
  offerName?: string;
  advertiserId?: string;
  advertiserName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PostbackLog {
  id: string;
  postbackId: string;
  postbackName: string;
  conversionId?: string;
  offerId?: string;
  offerName?: string;
  partnerId?: string;
  partnerName?: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  payload: Record<string, any>;
  responseCode?: number;
  responseBody?: string;
  responseTime?: number;
  status: 'success' | 'failed' | 'pending' | 'retry';
  errorMessage?: string;
  attempt: number;
  maxAttempts: number;
  nextRetryAt?: string;
  completedAt?: string;
  createdAt: string;
}

export default function PostbacksPage() {
  const { user, token } = useAuth();
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedTab, setSelectedTab] = useState('templates');
  const [addPostbackDialogOpen, setAddPostbackDialogOpen] = useState(false);
  const [editPostbackDialogOpen, setEditPostbackDialogOpen] = useState(false);
  const [viewLogDialogOpen, setViewLogDialogOpen] = useState(false);
  const [selectedPostback, setSelectedPostback] = useState<PostbackTemplate | null>(null);
  const [selectedLog, setSelectedLog] = useState<PostbackLog | null>(null);
  const [postbackFilters, setPostbackFilters] = useState({
    level: 'all',
    status: 'all',
    search: ''
  });
  const [logFilters, setLogFilters] = useState({
    status: 'all',
    offerId: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Fetch postback templates
  const { data: postbackTemplates = [], isLoading: templatesLoading } = useQuery<PostbackTemplate[]>({
    queryKey: ['/api/admin/postback-templates', postbackFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (postbackFilters.level !== 'all') params.append('level', postbackFilters.level);
      if (postbackFilters.status !== 'all') params.append('status', postbackFilters.status);
      if (postbackFilters.search) params.append('search', postbackFilters.search);
      
      const response = await fetch(`/api/admin/postback-templates?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch postback templates');
      return response.json();
    },
  });

  // Fetch postback logs
  const { data: postbackLogs = [], isLoading: logsLoading } = useQuery<PostbackLog[]>({
    queryKey: ['/api/admin/postback-logs', logFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (logFilters.status !== 'all') params.append('status', logFilters.status);
      if (logFilters.offerId !== 'all') params.append('offerId', logFilters.offerId);
      if (logFilters.dateFrom) params.append('dateFrom', logFilters.dateFrom);
      if (logFilters.dateTo) params.append('dateTo', logFilters.dateTo);
      if (logFilters.search) params.append('search', logFilters.search);
      
      const response = await fetch(`/api/admin/postback-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch postback logs');
      return response.json();
    },
  });

  // Fetch offers for dropdown
  const { data: offers = [] } = useQuery({
    queryKey: ['/api/admin/offers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json();
    },
  });

  // Create postback mutation
  const createPostbackMutation = useMutation({
    mutationFn: async (data: Partial<PostbackTemplate>) => {
      return apiRequest('/api/admin/postback-templates', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === '/api/admin/postback-templates'
      });
      setAddPostbackDialogOpen(false);
      toast({
        title: "Постбек создан",
        description: "Новый постбек успешно добавлен в систему",
      });
    }
  });

  // Update postback mutation
  const updatePostbackMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<PostbackTemplate> }) => {
      return apiRequest(`/api/admin/postback-templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === '/api/admin/postback-templates'
      });
      setEditPostbackDialogOpen(false);
      toast({
        title: "Постбек обновлён",
        description: "Настройки постбека успешно сохранены",
      });
    }
  });

  // Delete postback mutation
  const deletePostbackMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/postback-templates/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === '/api/admin/postback-templates'
      });
      toast({
        title: "Постбек удалён",
        description: "Постбек успешно удалён из системы",
        variant: "destructive",
      });
    }
  });

  // Retry postback mutation
  const retryPostbackMutation = useMutation({
    mutationFn: async (logId: string) => {
      return apiRequest(`/api/admin/postback-logs/${logId}/retry`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/postback-logs'] });
      toast({
        title: "Постбек отправлен",
        description: "Постбек поставлен в очередь на повторную отправку",
      });
    }
  });

  // Helper functions
  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      failed: 'destructive',
      pending: 'secondary',
      retry: 'outline'
    };
    const colors = {
      success: 'text-green-700 bg-green-50 border-green-200',
      failed: 'text-red-700 bg-red-50 border-red-200',
      pending: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      retry: 'text-blue-700 bg-blue-50 border-blue-200'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || 'text-gray-700 bg-gray-50 border-gray-200'}>
        {status === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
        {status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'retry' && <RotateCcw className="w-3 h-3 mr-1" />}
        {status === 'success' ? 'Успешно' : 
         status === 'failed' ? 'Ошибка' : 
         status === 'pending' ? 'Ожидание' : 'Повтор'}
      </Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    return (
      <Badge variant={level === 'global' ? 'default' : 'secondary'}>
        {level === 'global' && <Globe className="w-3 h-3 mr-1" />}
        {level === 'offer' && <Target className="w-3 h-3 mr-1" />}
        {level === 'global' ? 'Глобальный' : 'Оффер'}
      </Badge>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "URL скопирован в буфер обмена",
    });
  };

  // Mock data for analytics
  const analyticsData = [
    { date: '01.08', sent: 145, successful: 134, failed: 11 },
    { date: '02.08', sent: 167, successful: 159, failed: 8 },
    { date: '03.08', sent: 189, successful: 175, failed: 14 },
    { date: '04.08', sent: 156, successful: 144, failed: 12 },
  ];

  const statusData = [
    { name: 'Успешно', value: 412, color: '#10b981' },
    { name: 'Ошибка', value: 45, color: '#ef4444' },
    { name: 'Ожидание', value: 23, color: '#f59e0b' },
    { name: 'Повтор', value: 15, color: '#3b82f6' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Постбеки</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Управление постбеками и отслеживание доставки
            </p>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Настройки постбеков
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                История отправки
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Аналитика
              </TabsTrigger>
            </TabsList>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Поиск постбеков..."
                      value={postbackFilters.search}
                      onChange={(e) => setPostbackFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-64"
                      data-testid="search-postbacks-input"
                    />
                    <Button variant="outline" size="icon" title="Фильтровать">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={postbackFilters.level} 
                      onValueChange={(value) => setPostbackFilters(prev => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger className="w-40" data-testid="level-filter-select">
                        <SelectValue placeholder="Уровень" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все уровни</SelectItem>
                        <SelectItem value="global">Глобальный</SelectItem>
                        <SelectItem value="offer">Оффер</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={postbackFilters.status} 
                      onValueChange={(value) => setPostbackFilters(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="w-40" data-testid="status-filter-select">
                        <SelectValue placeholder="Статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="active">Активный</SelectItem>
                        <SelectItem value="inactive">Неактивный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setAddPostbackDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="add-postback-btn"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить постбек
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Постбеки ({postbackTemplates.length})
                  </CardTitle>
                  <CardDescription>
                    Настройка и управление URL для отправки постбеков
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Название</TableHead>
                          <TableHead>Уровень</TableHead>
                          <TableHead>События</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {templatesLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="flex items-center justify-center">
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                Загрузка постбеков...
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : postbackTemplates.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <Settings className="w-8 h-8 text-gray-400" />
                                <p className="text-gray-500">Постбеки не найдены</p>
                                <Button 
                                  onClick={() => setAddPostbackDialogOpen(true)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Добавить первый постбек
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          postbackTemplates.map((postback) => (
                            <TableRow key={postback.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{postback.name}</div>
                                  {postback.level === 'offer' && postback.offerName && (
                                    <div className="text-sm text-gray-500">
                                      Оффер: {postback.offerName}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getLevelBadge(postback.level)}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {postback.events.map((event) => (
                                    <Badge key={event} variant="outline" className="text-xs">
                                      {event === 'lead' ? 'Лид' : 
                                       event === 'sale' ? 'Продажа' : 
                                       event === 'rejected' ? 'Отказ' : 
                                       event === 'hold' ? 'Холд' : event}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 max-w-xs">
                                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate flex-1">
                                    {postback.url}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(postback.url)}
                                    title="Копировать URL"
                                    data-testid={`copy-url-${postback.id}`}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={postback.isActive ? 'default' : 'secondary'}
                                  className={postback.isActive ? 'text-green-700 bg-green-50 border-green-200' : 'text-gray-700 bg-gray-50 border-gray-200'}
                                >
                                  {postback.isActive ? (
                                    <>
                                      <Wifi className="w-3 h-3 mr-1" />
                                      Активный
                                    </>
                                  ) : (
                                    <>
                                      <WifiOff className="w-3 h-3 mr-1" />
                                      Неактивный
                                    </>
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPostback(postback);
                                      setEditPostbackDialogOpen(true);
                                    }}
                                    title="Редактировать постбек"
                                    data-testid={`edit-postback-${postback.id}`}
                                    className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deletePostbackMutation.mutate(postback.id)}
                                    title="Удалить постбек"
                                    data-testid={`delete-postback-${postback.id}`}
                                    className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Поиск в логах..."
                      value={logFilters.search}
                      onChange={(e) => setLogFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-64"
                      data-testid="search-logs-input"
                    />
                    <Button variant="outline" size="icon" title="Фильтровать">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={logFilters.status} 
                      onValueChange={(value) => setLogFilters(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="w-40" data-testid="log-status-filter-select">
                        <SelectValue placeholder="Статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="success">Успешно</SelectItem>
                        <SelectItem value="failed">Ошибка</SelectItem>
                        <SelectItem value="pending">Ожидание</SelectItem>
                        <SelectItem value="retry">Повтор</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={logFilters.offerId} 
                      onValueChange={(value) => setLogFilters(prev => ({ ...prev, offerId: value }))}
                    >
                      <SelectTrigger className="w-48" data-testid="offer-filter-select">
                        <SelectValue placeholder="Оффер" />
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
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" title="Экспорт логов" data-testid="export-logs-btn">
                    <Download className="w-4 h-4 mr-2" />
                    Экспорт
                  </Button>
                  <Button variant="outline" title="Обновить" data-testid="refresh-logs-btn">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    История постбеков ({postbackLogs.length})
                  </CardTitle>
                  <CardDescription>
                    Детальная информация о доставке постбеков
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Постбек</TableHead>
                          <TableHead>Оффер/Партнёр</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Ответ</TableHead>
                          <TableHead>Время</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logsLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex items-center justify-center">
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                Загрузка логов...
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : postbackLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <Activity className="w-8 h-8 text-gray-400" />
                                <p className="text-gray-500">Логи не найдены</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          postbackLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>
                                <div className="font-medium">{log.postbackName}</div>
                                <div className="text-sm text-gray-500">
                                  {log.method} • Попытка {log.attempt}/{log.maxAttempts}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  {log.offerName && (
                                    <div className="font-medium">{log.offerName}</div>
                                  )}
                                  {log.partnerName && (
                                    <div className="text-sm text-gray-500">{log.partnerName}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(log.status)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {log.responseCode && (
                                    <Badge 
                                      variant={log.responseCode < 300 ? 'default' : 'destructive'}
                                      className="text-xs"
                                    >
                                      {log.responseCode}
                                    </Badge>
                                  )}
                                  {log.responseTime && (
                                    <span className="text-xs text-gray-500">
                                      {log.responseTime}ms
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {log.responseTime ? `${log.responseTime}ms` : '—'}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {new Date(log.createdAt).toLocaleDateString('ru-RU', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedLog(log);
                                      setViewLogDialogOpen(true);
                                    }}
                                    title="Просмотреть детали"
                                    data-testid={`view-log-${log.id}`}
                                    className="hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  {log.status === 'failed' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => retryPostbackMutation.mutate(log.id)}
                                      title="Повторить отправку"
                                      data-testid={`retry-log-${log.id}`}
                                      className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Отправлено сегодня</p>
                        <p className="text-2xl font-bold">156</p>
                      </div>
                      <Send className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">+12% за сутки</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Успешность</p>
                        <p className="text-2xl font-bold">92.3%</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">+1.2% за неделю</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Среднее время</p>
                        <p className="text-2xl font-bold">247ms</p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">-15ms за сутки</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Активных постбеков</p>
                        <p className="text-2xl font-bold">{postbackTemplates.filter(p => p.isActive).length}</p>
                      </div>
                      <Settings className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">из {postbackTemplates.length} общих</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Статистика отправки</CardTitle>
                    <CardDescription>Динамика отправки постбеков за последние дни</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} name="Отправлено" />
                          <Line type="monotone" dataKey="successful" stroke="#10b981" strokeWidth={2} name="Успешно" />
                          <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Ошибки" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Распределение статусов</CardTitle>
                    <CardDescription>Соотношение успешных и неуспешных отправок</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Add Postback Dialog */}
          <Dialog open={addPostbackDialogOpen} onOpenChange={setAddPostbackDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Добавить постбек</DialogTitle>
                <DialogDescription>
                  Создайте новый постбек для отправки уведомлений о конверсиях
                </DialogDescription>
              </DialogHeader>
              <PostbackForm 
                onSubmit={(data) => createPostbackMutation.mutate(data)}
                offers={offers}
                isLoading={createPostbackMutation.isPending}
              />
            </DialogContent>
          </Dialog>

          {/* Edit Postback Dialog */}
          <Dialog open={editPostbackDialogOpen} onOpenChange={setEditPostbackDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Редактировать постбек</DialogTitle>
                <DialogDescription>
                  Изменить настройки постбека "{selectedPostback?.name}"
                </DialogDescription>
              </DialogHeader>
              {selectedPostback && (
                <PostbackForm 
                  postback={selectedPostback}
                  onSubmit={(data) => updatePostbackMutation.mutate({ id: selectedPostback.id, data })}
                  offers={offers}
                  isLoading={updatePostbackMutation.isPending}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* View Log Dialog */}
          <Dialog open={viewLogDialogOpen} onOpenChange={setViewLogDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Детали постбека</DialogTitle>
                <DialogDescription>
                  Подробная информация о доставке постбека
                </DialogDescription>
              </DialogHeader>
              {selectedLog && (
                <LogDetails log={selectedLog} />
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}

// Postback Form Component
function PostbackForm({ 
  postback, 
  onSubmit, 
  offers, 
  isLoading 
}: { 
  postback?: PostbackTemplate;
  onSubmit: (data: any) => void;
  offers: any[];
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: postback?.name || '',
    level: postback?.level || 'global',
    url: postback?.url || '',
    events: postback?.events || ['sale'],
    offerId: postback?.offerId || '',
    retryAttempts: postback?.retryAttempts || 3,
    timeout: postback?.timeout || 30,
    isActive: postback?.isActive ?? true,
  });

  const availableEvents = [
    { value: 'lead', label: 'Лид (Lead)' },
    { value: 'sale', label: 'Продажа (Sale)' },
    { value: 'rejected', label: 'Отказ (Rejected)' },
    { value: 'hold', label: 'Холд (Hold)' },
  ];

  const availableParameters = [
    '{click_id}', '{status}', '{payout}', '{offer_id}', '{geo}', 
    '{device}', '{sub1}', '{sub2}', '{sub3}', '{sub4}', '{sub5}', '{time}'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postback-name">Название постбека</Label>
          <Input
            id="postback-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Например: Основной трекер"
            required
            data-testid="postback-name-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postback-level">Уровень</Label>
          <Select 
            value={formData.level} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
          >
            <SelectTrigger id="postback-level" data-testid="postback-level-select">
              <SelectValue placeholder="Выберите уровень" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Глобальный</SelectItem>
              <SelectItem value="offer">Оффер</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.level === 'offer' && (
        <div className="space-y-2">
          <Label htmlFor="postback-offer">Оффер</Label>
          <Select 
            value={formData.offerId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, offerId: value }))}
          >
            <SelectTrigger id="postback-offer" data-testid="postback-offer-select">
              <SelectValue placeholder="Выберите оффер" />
            </SelectTrigger>
            <SelectContent>
              {offers.map((offer) => (
                <SelectItem key={offer.id} value={offer.id}>
                  {offer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="postback-url">URL постбека</Label>
        <Input
          id="postback-url"
          value={formData.url}
          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
          placeholder="https://tracker.com/postback?click_id={click_id}&status={status}&payout={payout}"
          required
          data-testid="postback-url-input"
        />
        <div className="text-xs text-gray-500">
          Доступные параметры: {availableParameters.join(', ')}
        </div>
      </div>

      <div className="space-y-2">
        <Label>События для отправки</Label>
        <div className="grid grid-cols-2 gap-4">
          {availableEvents.map((event) => (
            <div key={event.value} className="flex items-center space-x-2">
              <Checkbox
                id={`event-${event.value}`}
                checked={formData.events.includes(event.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData(prev => ({ 
                      ...prev, 
                      events: [...prev.events, event.value] 
                    }));
                  } else {
                    setFormData(prev => ({ 
                      ...prev, 
                      events: prev.events.filter(e => e !== event.value) 
                    }));
                  }
                }}
                data-testid={`event-${event.value}-checkbox`}
              />
              <Label htmlFor={`event-${event.value}`}>{event.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="retry-attempts">Попытки повтора</Label>
          <Input
            id="retry-attempts"
            type="number"
            min="1"
            max="10"
            value={formData.retryAttempts}
            onChange={(e) => setFormData(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
            data-testid="retry-attempts-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeout">Таймаут (сек)</Label>
          <Input
            id="timeout"
            type="number"
            min="5"
            max="120"
            value={formData.timeout}
            onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
            data-testid="timeout-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="is-active">Статус</Label>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="is-active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
              data-testid="is-active-checkbox"
            />
            <Label htmlFor="is-active">Активный</Label>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading} data-testid="save-postback-btn">
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Log Details Component
function LogDetails({ log }: { log: PostbackLog }) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-600">Постбек</Label>
          <p className="text-sm font-medium">{log.postbackName}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-600">Статус</Label>
          <div className="flex items-center gap-2">
            {log.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
            {log.status === 'failed' && <XCircle className="w-4 h-4 text-red-600" />}
            {log.status === 'pending' && <Clock className="w-4 h-4 text-yellow-600" />}
            {log.status === 'retry' && <RotateCcw className="w-4 h-4 text-blue-600" />}
            <span className="text-sm capitalize">{log.status}</span>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-600">Время выполнения</Label>
          <p className="text-sm">{log.responseTime ? `${log.responseTime}ms` : '—'}</p>
        </div>
      </div>

      {/* Request Details */}
      <div>
        <Label className="text-sm font-medium text-gray-600">URL запроса</Label>
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="flex items-center justify-between">
            <code className="text-sm break-all">{log.url}</code>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(log.url)}
              title="Копировать URL"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Response Details */}
      {log.responseCode && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Код ответа</Label>
            <div className="mt-2">
              <Badge 
                variant={log.responseCode < 300 ? 'default' : 'destructive'}
                className="text-sm"
              >
                {log.responseCode}
              </Badge>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Попытка</Label>
            <p className="text-sm mt-2">{log.attempt} из {log.maxAttempts}</p>
          </div>
        </div>
      )}

      {/* Response Body */}
      {log.responseBody && (
        <div>
          <Label className="text-sm font-medium text-gray-600">Тело ответа</Label>
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <pre className="text-xs whitespace-pre-wrap break-words">
              {log.responseBody}
            </pre>
          </div>
        </div>
      )}

      {/* Error Message */}
      {log.errorMessage && (
        <div>
          <Label className="text-sm font-medium text-gray-600">Сообщение об ошибке</Label>
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-400">{log.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Headers */}
      {log.headers && Object.keys(log.headers).length > 0 && (
        <div>
          <Label className="text-sm font-medium text-gray-600">Заголовки запроса</Label>
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="space-y-1">
              {Object.entries(log.headers).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="font-medium">{key}:</span> {value}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-600">Создан</Label>
          <p className="text-sm">
            {new Date(log.createdAt).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
        </div>
        {log.completedAt && (
          <div>
            <Label className="text-sm font-medium text-gray-600">Завершён</Label>
            <p className="text-sm">
              {new Date(log.completedAt).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}