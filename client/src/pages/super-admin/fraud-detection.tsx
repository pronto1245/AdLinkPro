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
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, AlertTriangle, Activity, Eye, Ban, Settings, Target, Globe, 
  Smartphone, Monitor, MapPin, Zap, TrendingUp, AlertCircle, CheckCircle, 
  XCircle, Clock, Search, Filter, Download, RefreshCw, Plus, Edit, Trash2,
  BarChart3, PieChart, Users, Flag, Lock, Unlock, FileText, Save, Wifi, WifiOff, Server
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';

interface FraudReport {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'confirmed' | 'rejected' | 'resolved';
  description: string;
  ipAddress: string;
  deviceFingerprint: string;
  country: string;
  autoBlocked: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  evidenceData?: any;
  detectionRules?: any;
}

interface FraudRule {
  id: string;
  name: string;
  type: string;
  scope: 'platform' | 'offer' | 'partner' | 'traffic_source';
  isActive: boolean;
  autoBlock: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: any;
  actions: any;
  thresholds: any;
  createdAt: string;
}

interface IpAnalysis {
  id: string;
  ipAddress: string;
  country: string;
  isp: string;
  isProxy: boolean;
  isVpn: boolean;
  isTor: boolean;
  riskScore: number;
  clickCount: number;
  conversionCount: number;
  threatTypes: string[];
  flaggedAt?: string;
  // Third-party service scores
  fraudScoreRating?: number;
  forensiqScore?: number;
  anuraScore?: number;
  botboxVerified?: boolean;
  lastServiceCheck?: string;
}

interface FraudServiceIntegration {
  id: string;
  serviceName: 'FraudScore' | 'Forensiq' | 'Anura' | 'Botbox';
  apiKey: string;
  isActive: boolean;
  endpoint: string;
  rateLimit: number;
  lastSync: string;
  successRate: number;
  averageResponseTime: number;
}

interface SmartAlert {
  id: string;
  type: 'fraud_spike' | 'cr_anomaly' | 'volume_surge' | 'geo_anomaly';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggeredAt: string;
  threshold: any;
  currentValue: any;
  affectedMetrics: string[];
  autoActions: string[];
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

const FraudDetectionPage = () => {
  const { user, token } = useAuth();
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // URL параметры для фильтрации
  const urlParams = new URLSearchParams(window.location.search);
  const offerParam = urlParams.get('offer');
  const userParam = urlParams.get('user');
  
  const [selectedTab, setSelectedTab] = useState('reports');
  
  // New queries for enhanced features
  const { data: fraudServices = [] } = useQuery<FraudServiceIntegration[]>({
    queryKey: ['/api/admin/fraud-services'],
    queryFn: async () => {
      const response = await fetch('/api/admin/fraud-services', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch fraud services');
      return response.json();
    },
  });

  const { data: smartAlerts = [] } = useQuery<SmartAlert[]>({
    queryKey: ['/api/admin/smart-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/admin/smart-alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch smart alerts');
      return response.json();
    },
  });
  const [reportFilters, setReportFilters] = useState({
    type: '',
    severity: '',
    status: '',
    search: offerParam || userParam || ''
  });
  const [selectedReport, setSelectedReport] = useState<FraudReport | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [createRuleDialogOpen, setCreateRuleDialogOpen] = useState(false);
  const [blockIpDialogOpen, setBlockIpDialogOpen] = useState(false);
  const [selectedIp, setSelectedIp] = useState<string>('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Fetch fraud reports
  const { data: fraudReports = [], isLoading: reportsLoading } = useQuery<FraudReport[]>({
    queryKey: ['/api/admin/fraud-reports', reportFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(reportFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/admin/fraud-reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch fraud reports');
      return response.json();
    },
  });

  // Fetch fraud statistics
  const { data: fraudStats = {} } = useQuery({
    queryKey: ['/api/admin/fraud-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/fraud-stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch fraud stats');
      return response.json();
    },
  });

  // Fetch IP analysis
  const { data: ipAnalysis = [] } = useQuery<IpAnalysis[]>({
    queryKey: ['/api/admin/ip-analysis'],
    queryFn: async () => {
      const response = await fetch('/api/admin/ip-analysis', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch IP analysis');
      return response.json();
    },
  });

  // Fetch fraud rules
  const { data: fraudRules = [] } = useQuery<FraudRule[]>({
    queryKey: ['/api/admin/fraud-rules'],
    queryFn: async () => {
      const response = await fetch('/api/admin/fraud-rules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch fraud rules');
      return response.json();
    },
  });

  // Review fraud report mutation
  const reviewReportMutation = useMutation({
    mutationFn: async (data: { reportId: string; status: string; notes: string; resolution?: string }) => {
      return await fetch('/api/admin/fraud-reports/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/fraud-reports'] });
      setReviewDialogOpen(false);
      setSelectedReport(null);
      toast({
        title: "Успешно",
        description: "Отчёт о фроде обновлён",
      });
    },
  });

  // Block IP mutation
  const blockIpMutation = useMutation({
    mutationFn: async (ipAddress: string) => {
      return await fetch('/api/admin/block-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ipAddress, reason: 'Fraud detection' }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ip-analysis'] });
      setBlockIpDialogOpen(false);
      setSelectedIp('');
      toast({
        title: "Успешно",
        description: "IP адрес заблокирован",
      });
    },
  });

  // Export reports function
  const handleExportReports = async () => {
    try {
      const response = await fetch('/api/admin/fraud-reports/export', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fraud-reports-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast({
          title: "Успешно",
          description: "Отчёты экспортированы",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать отчёты",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'reviewing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'rejected': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip_fraud': return <Globe className="w-4 h-4" />;
      case 'device_fraud': return <Smartphone className="w-4 h-4" />;
      case 'geo_fraud': return <MapPin className="w-4 h-4" />;
      case 'anomaly_ctr': 
      case 'anomaly_cr': 
      case 'anomaly_epc': return <TrendingUp className="w-4 h-4" />;
      case 'duplicate_actions': return <Target className="w-4 h-4" />;
      case 'click_speed': return <Zap className="w-4 h-4" />;
      case 'mass_registration': return <Users className="w-4 h-4" />;
      case 'device_spoofing': return <Monitor className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'ip_fraud': 'IP Фрод',
      'device_fraud': 'Фрод устройств',
      'geo_fraud': 'Геофрод',
      'anomaly_ctr': 'Аномальный CTR',
      'anomaly_cr': 'Аномальный CR',
      'anomaly_epc': 'Аномальный EPC',
      'duplicate_actions': 'Дублированные действия',
      'click_speed': 'Скорость кликов',
      'mass_registration': 'Массовые регистрации',
      'device_spoofing': 'Подмена устройств'
    };
    return labels[type] || type;
  };

  // Chart data for fraud analytics
  const chartData = [
    { name: 'Пн', fraudClicks: 45, totalClicks: 1200, fraudRate: 3.75 },
    { name: 'Вт', fraudClicks: 38, totalClicks: 1150, fraudRate: 3.30 },
    { name: 'Ср', fraudClicks: 52, totalClicks: 1300, fraudRate: 4.00 },
    { name: 'Чт', fraudClicks: 61, totalClicks: 1400, fraudRate: 4.36 },
    { name: 'Пт', fraudClicks: 29, totalClicks: 1100, fraudRate: 2.64 },
    { name: 'Сб', fraudClicks: 34, totalClicks: 950, fraudRate: 3.58 },
    { name: 'Вс', fraudClicks: 28, totalClicks: 850, fraudRate: 3.29 },
  ];

  const fraudTypeData = [
    { name: 'IP Фрод', value: 35, color: '#ef4444' },
    { name: 'Фрод устройств', value: 25, color: '#f97316' },
    { name: 'Геофрод', value: 20, color: '#eab308' },
    { name: 'Аномальные метрики', value: 15, color: '#22c55e' },
    { name: 'Прочее', value: 5, color: '#6b7280' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header title="Антифрод-система" />
        <main className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Shield className="w-8 h-8 mr-3 text-red-600" />
                  Антифрод-система
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Комплексная система защиты от мошенничества
                </p>
              </div>
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={handleExportReports}
                  data-testid="button-export-reports" 
                  title="Экспорт отчётов"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Экспорт
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700" 
                  onClick={() => setCreateRuleDialogOpen(true)}
                  data-testid="button-create-rule" 
                  title="Создать правило"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Новое правило
                </Button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего фрод-отчётов</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {fraudStats.totalReports || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-red-500 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  +{fraudStats.reportsGrowth || 0}% за неделю
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Фрод-rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {fraudStats.fraudRate || '0.00'}%
                    </p>
                  </div>
                  <div className="p-3 bg-orange-500 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  -{fraudStats.fraudRateChange || 0}% за месяц
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Заблокировано IP</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {fraudStats.blockedIps || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <Ban className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Активных блокировок
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Сэкономлено</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${fraudStats.savedAmount || '0.00'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Предотвращённые потери
                </p>
              </CardContent>
            </Card>
          </div>



          {/* Main Content Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8 h-12">
              <TabsTrigger value="reports" className="flex items-center justify-center space-x-1 text-xs">
                <FileText className="w-3 h-3" />
                <span className="hidden sm:inline">Фрод-отчёты</span>
                <span className="sm:hidden">Отчёты</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center justify-center space-x-1 text-xs">
                <BarChart3 className="w-3 h-3" />
                <span className="hidden sm:inline">Аналитика</span>
                <span className="sm:hidden">Данные</span>
              </TabsTrigger>
              <TabsTrigger value="ip-analysis" className="flex items-center justify-center space-x-1 text-xs">
                <Globe className="w-3 h-3" />
                <span className="hidden sm:inline">IP Анализ</span>
                <span className="sm:hidden">IP</span>
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center justify-center space-x-1 text-xs">
                <Settings className="w-3 h-3" />
                <span>Правила</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center justify-center space-x-1 text-xs">
                <Zap className="w-3 h-3" />
                <span className="hidden sm:inline">Интеграции</span>
                <span className="sm:hidden">API</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center justify-center space-x-1 text-xs">
                <AlertCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Smart-алерты</span>
                <span className="sm:hidden">Алерты</span>
              </TabsTrigger>
              <TabsTrigger value="blocks" className="flex items-center justify-center space-x-1 text-xs">
                <Ban className="w-3 h-3" />
                <span>Блокировки</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center justify-center space-x-1 text-xs">
                <Settings className="w-3 h-3" />
                <span>Настройки</span>
              </TabsTrigger>
              <TabsTrigger value="blocks" className="flex items-center space-x-2">
                <Ban className="w-4 h-4" />
                <span>Блокировки</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Настройки</span>
              </TabsTrigger>
            </TabsList>

            {/* Fraud Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              {/* Context Alert for External Navigation */}
              {(offerParam || userParam) && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          {offerParam ? 'Фрод-анализ по офферу' : 'Фрод-анализ по пользователю'}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Показана вся фрод-информация, связанная с {offerParam ? `оффером ${offerParam}` : `пользователем ${userParam}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Фрод-отчёты</span>
                      </CardTitle>
                      <CardDescription>
                        Все подозрительные действия и нарушения
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/fraud-reports'] })}
                      data-testid="button-refresh-reports"
                      title="Обновить"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Обновить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex space-x-4 mb-6">
                    <div className="flex-1">
                      <Input
                        placeholder="Поиск по IP, описанию..."
                        value={reportFilters.search}
                        onChange={(e) => setReportFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full"
                        data-testid="input-search-reports"
                      />
                    </div>
                    <Select value={reportFilters.type} onValueChange={(value) => setReportFilters(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Тип фрода" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все типы</SelectItem>
                        <SelectItem value="ip_fraud">IP Фрод</SelectItem>
                        <SelectItem value="device_fraud">Фрод устройств</SelectItem>
                        <SelectItem value="geo_fraud">Геофрод</SelectItem>
                        <SelectItem value="anomaly_ctr">Аномальный CTR</SelectItem>
                        <SelectItem value="click_speed">Скорость кликов</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={reportFilters.severity} onValueChange={(value) => setReportFilters(prev => ({ ...prev, severity: value }))}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Критичность" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все уровни</SelectItem>
                        <SelectItem value="critical">Критичный</SelectItem>
                        <SelectItem value="high">Высокий</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="low">Низкий</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={reportFilters.status} onValueChange={(value) => setReportFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="pending">В ожидании</SelectItem>
                        <SelectItem value="reviewing">На рассмотрении</SelectItem>
                        <SelectItem value="confirmed">Подтверждён</SelectItem>
                        <SelectItem value="rejected">Отклонён</SelectItem>
                        <SelectItem value="resolved">Решён</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reports Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Тип</TableHead>
                          <TableHead>Критичность</TableHead>
                          <TableHead>IP Адрес</TableHead>
                          <TableHead>Страна</TableHead>
                          <TableHead>Описание</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Автоблок</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fraudReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getTypeIcon(report.type)}
                                <span className="font-medium">{getTypeLabel(report.type)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getSeverityColor(report.severity)}>
                                {report.severity === 'critical' ? 'Критичный' :
                                 report.severity === 'high' ? 'Высокий' :
                                 report.severity === 'medium' ? 'Средний' : 'Низкий'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {report.ipAddress}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <span>{report.country}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {report.description}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status === 'pending' ? 'В ожидании' :
                                 report.status === 'reviewing' ? 'Рассматривается' :
                                 report.status === 'confirmed' ? 'Подтверждён' :
                                 report.status === 'rejected' ? 'Отклонён' : 'Решён'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {report.autoBlocked ? (
                                <Lock className="w-4 h-4 text-red-500" />
                              ) : (
                                <Unlock className="w-4 h-4 text-gray-400" />
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(report.createdAt).toLocaleDateString('ru-RU')}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setReviewDialogOpen(true);
                                  }}
                                  data-testid="button-review-report"
                                  title="Рассмотреть"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedIp(report.ipAddress);
                                    setBlockIpDialogOpen(true);
                                  }}
                                  data-testid="button-block-ip"
                                  title="Заблокировать IP"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Динамика фрода</CardTitle>
                    <CardDescription>Фрод-клики и общий трафик за неделю</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="fraudClicks" stroke="#ef4444" strokeWidth={2} name="Фрод-клики" />
                        <Line type="monotone" dataKey="totalClicks" stroke="#3b82f6" strokeWidth={2} name="Всего кликов" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Типы фрода</CardTitle>
                    <CardDescription>Распределение по типам нарушений</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={fraudTypeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {fraudTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Фрод-rate по дням</CardTitle>
                  <CardDescription>Процент мошеннического трафика</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="fraudRate" fill="#f59e0b" name="Фрод-rate %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* IP Analysis Tab */}
            <TabsContent value="ip-analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>IP Анализ</span>
                  </CardTitle>
                  <CardDescription>
                    Анализ подозрительных IP-адресов и их активности
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>IP Адрес</TableHead>
                          <TableHead>Страна</TableHead>
                          <TableHead>ISP</TableHead>
                          <TableHead>Типы угроз</TableHead>
                          <TableHead>Риск-скор</TableHead>
                          <TableHead>Клики</TableHead>
                          <TableHead>Конверсии</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ipAnalysis.map((ip) => (
                          <TableRow key={ip.id}>
                            <TableCell className="font-mono text-sm">
                              {ip.ipAddress}
                            </TableCell>
                            <TableCell>{ip.country}</TableCell>
                            <TableCell className="max-w-xs truncate">{ip.isp}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {ip.isProxy && <Badge variant="destructive" className="text-xs">Proxy</Badge>}
                                {ip.isVpn && <Badge variant="destructive" className="text-xs">VPN</Badge>}
                                {ip.isTor && <Badge variant="destructive" className="text-xs">TOR</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={ip.riskScore} className="w-16" />
                                <span className="text-sm font-medium">{ip.riskScore}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{ip.clickCount}</TableCell>
                            <TableCell>{ip.conversionCount}</TableCell>
                            <TableCell>
                              {ip.flaggedAt ? (
                                <Badge variant="destructive">Помечен</Badge>
                              ) : (
                                <Badge variant="secondary">Нормальный</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // Flag IP functionality
                                    toast({
                                      title: "IP помечен",
                                      description: `IP ${ip.ipAddress} помечен как подозрительный`,
                                    });
                                  }}
                                  data-testid="button-flag-ip"
                                  title="Пометить как подозрительный"
                                >
                                  <Flag className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedIp(ip.ipAddress);
                                    setBlockIpDialogOpen(true);
                                  }}
                                  data-testid="button-block-ip-analysis"
                                  title="Заблокировать"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="w-5 h-5" />
                        <span>Правила антифрода</span>
                      </CardTitle>
                      <CardDescription>
                        Настройка автоматических правил обнаружения фрода
                      </CardDescription>
                    </div>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setCreateRuleDialogOpen(true)}
                      data-testid="button-create-fraud-rule"
                      title="Создать правило"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Новое правило
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Название</TableHead>
                          <TableHead>Тип</TableHead>
                          <TableHead>Область</TableHead>
                          <TableHead>Критичность</TableHead>
                          <TableHead>Автоблок</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Создано</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fraudRules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell className="font-medium">{rule.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getTypeIcon(rule.type)}
                                <span>{getTypeLabel(rule.type)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {rule.scope === 'platform' ? 'Платформа' :
                                 rule.scope === 'offer' ? 'Оффер' :
                                 rule.scope === 'partner' ? 'Партнёр' : 'Источник'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getSeverityColor(rule.severity)}>
                                {rule.severity === 'critical' ? 'Критичный' :
                                 rule.severity === 'high' ? 'Высокий' :
                                 rule.severity === 'medium' ? 'Средний' : 'Низкий'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {rule.autoBlock ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-gray-400" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={rule.isActive ? "default" : "secondary"}>
                                {rule.isActive ? 'Активно' : 'Неактивно'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(rule.createdAt).toLocaleDateString('ru-RU')}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: "Редактирование правила",
                                      description: "Функция в разработке",
                                    });
                                  }}
                                  data-testid="button-edit-rule"
                                  title="Редактировать"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Удалить это правило?')) {
                                      toast({
                                        title: "Правило удалено",
                                        description: `Правило "${rule.name}" удалено`,
                                      });
                                    }
                                  }}
                                  data-testid="button-delete-rule"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Blocks Tab */}
            <TabsContent value="blocks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Ban className="w-5 h-5" />
                    <span>Активные блокировки</span>
                  </CardTitle>
                  <CardDescription>
                    Список заблокированных IP-адресов и других объектов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock blocks data for demonstration */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">IP: 192.168.1.100</p>
                          <p className="text-xs text-gray-600">Причина: Подозрительная активность</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive">Заблокирован</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Блокировка снята",
                                description: "IP-адрес разблокирован",
                              });
                            }}
                            data-testid="button-unblock-ip"
                            title="Разблокировать"
                          >
                            <Unlock className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">IP: 10.0.0.1</p>
                          <p className="text-xs text-gray-600">Причина: Автоматическая блокировка - превышен лимит кликов</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive">Заблокирован</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Блокировка снята",
                                description: "IP-адрес разблокирован",
                              });
                            }}
                            data-testid="button-unblock-ip-2"
                            title="Разблокировать"
                          >
                            <Unlock className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Настройки антифрода</span>
                  </CardTitle>
                  <CardDescription>
                    Общие настройки системы обнаружения фрода
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Автоматические действия</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Автоблокировка подозрительных IP</label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Уведомления в реальном времени</label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Проверка VPN/Proxy</label>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Пороговые значения</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Максимум кликов с одного IP (в час)</label>
                          <Input type="number" defaultValue="50" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Минимальный риск-скор для блокировки</label>
                          <Input type="number" defaultValue="80" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Время блокировки (часы)</label>
                          <Input type="number" defaultValue="24" className="mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Сохранить настройки
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Review Dialog */}
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Рассмотрение фрод-отчёта</DialogTitle>
                <DialogDescription>
                  Анализ и принятие решения по подозрительной активности
                </DialogDescription>
              </DialogHeader>
              {selectedReport && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Тип</Label>
                      <p className="font-medium">{getTypeLabel(selectedReport.type)}</p>
                    </div>
                    <div>
                      <Label>Критичность</Label>
                      <Badge className={getSeverityColor(selectedReport.severity)}>
                        {selectedReport.severity}
                      </Badge>
                    </div>
                    <div>
                      <Label>IP Адрес</Label>
                      <p className="font-mono text-sm">{selectedReport.ipAddress}</p>
                    </div>
                    <div>
                      <Label>Страна</Label>
                      <p>{selectedReport.country}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Описание</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedReport.description}
                    </p>
                  </div>
                  {selectedReport.evidenceData && (
                    <div>
                      <Label>Данные расследования</Label>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded mt-1 overflow-auto">
                        {JSON.stringify(selectedReport.evidenceData, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="review-status">Решение</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите решение" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed">Подтвердить фрод</SelectItem>
                          <SelectItem value="rejected">Отклонить как ложное срабатывание</SelectItem>
                          <SelectItem value="resolved">Решить проблему</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="review-notes">Комментарии</Label>
                      <Textarea
                        id="review-notes"
                        placeholder="Добавьте комментарии к решению..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  Отмена
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Сохранить решение
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Block IP Dialog */}
          <Dialog open={blockIpDialogOpen} onOpenChange={setBlockIpDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Блокировка IP адреса</DialogTitle>
                <DialogDescription>
                  Заблокировать IP адрес {selectedIp}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p>Вы уверены, что хотите заблокировать IP адрес <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{selectedIp}</code>?</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setBlockIpDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => blockIpMutation.mutate(selectedIp)}
                    disabled={blockIpMutation.isPending}
                  >
                    {blockIpMutation.isPending ? 'Блокировка...' : 'Заблокировать'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Rule Dialog */}
          <Dialog open={createRuleDialogOpen} onOpenChange={setCreateRuleDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Создание нового правила антифрода</DialogTitle>
                <DialogDescription>
                  Настройте автоматическое правило для обнаружения мошенничества
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Название правила</label>
                    <input
                      type="text"
                      placeholder="Введите название"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Тип фрода</label>
                    <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="ip_fraud">IP Фрод</option>
                      <option value="device_fraud">Фрод устройств</option>
                      <option value="geo_fraud">Геофрод</option>
                      <option value="click_speed">Скорость кликов</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Критичность</label>
                    <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="low">Низкая</option>
                      <option value="medium">Средняя</option>
                      <option value="high">Высокая</option>
                      <option value="critical">Критичная</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Автоблокировка</label>
                    <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="false">Нет</option>
                      <option value="true">Да</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Описание</label>
                  <textarea
                    placeholder="Опишите условия срабатывания правила"
                    rows={3}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateRuleDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/admin/fraud-rules', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            name: "Новое правило",
                            type: "ip_fraud",
                            severity: "medium",
                            autoBlock: false,
                            conditions: {},
                            actions: {},
                            thresholds: {}
                          }),
                        });
                        
                        if (response.ok) {
                          toast({
                            title: "Правило создано",
                            description: "Новое правило антифрода успешно создано",
                          });
                          queryClient.invalidateQueries({ queryKey: ['/api/admin/fraud-rules'] });
                          setCreateRuleDialogOpen(false);
                        } else {
                          throw new Error('Failed to create rule');
                        }
                      } catch (error) {
                        toast({
                          title: "Ошибка",
                          description: "Не удалось создать правило",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Создать правило
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Интеграции с антифрод-сервисами</span>
                </CardTitle>
                <CardDescription>
                  Подключение и настройка внешних сервисов для анализа трафика
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  {[
                    { 
                      name: 'FraudScore', 
                      description: 'API для проверки IP-адресов и анализа фрода',
                      status: 'active',
                      endpoint: 'https://api.fraudscore.com/v1/ip',
                      rateLimit: 1000,
                      successRate: 98.5
                    },
                    { 
                      name: 'Forensiq', 
                      description: 'Детекция ботов и фрод-трафика в реальном времени',
                      status: 'inactive',
                      endpoint: 'https://api.forensiq.com/v2/validate',
                      rateLimit: 500,
                      successRate: 97.2
                    },
                    { 
                      name: 'Anura', 
                      description: 'Мгновенная защита от фрод-трафика и ботов',
                      status: 'active',
                      endpoint: 'https://api.anura.io/v1/direct',
                      rateLimit: 2000,
                      successRate: 99.1
                    },
                    { 
                      name: 'Botbox', 
                      description: 'Защита от автоматизированного трафика',
                      status: 'inactive',
                      endpoint: 'https://api.botbox.io/v1/verify',
                      rateLimit: 800,
                      successRate: 96.8
                    }
                  ].map((service) => (
                    <Card key={service.name} className="border-2">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold">{service.name}</h3>
                              <Badge 
                                variant={service.status === 'active' ? 'default' : 'secondary'}
                                className={service.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {service.status === 'active' ? 'Активен' : 'Неактивен'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{service.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Rate Limit: {service.rateLimit}/мин</span>
                              <span>Success Rate: {service.successRate}%</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Тестирование подключения",
                                  description: `Проверка соединения с ${service.name}...`,
                                });
                              }}
                              data-testid={`button-test-${service.name.toLowerCase()}`}
                              title="Тестировать подключение"
                            >
                              <Activity className="w-4 h-4" />
                            </Button>
                            <Switch 
                              checked={service.status === 'active'}
                              onCheckedChange={() => {
                                toast({
                                  title: service.status === 'active' ? "Сервис отключён" : "Сервис подключён",
                                  description: `${service.name} ${service.status === 'active' ? 'деактивирован' : 'активирован'}`,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Smart Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Smart-алерты</h2>
                <p className="text-gray-600">Умные уведомления при аномалиях в трафике</p>
              </div>
              <Button 
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  toast({
                    title: "Настройка алертов",
                    description: "Открытие панели настройки умных алертов",
                  });
                }}
                data-testid="button-configure-alerts"
                title="Настроить алерты"
              >
                <Settings className="w-4 h-4 mr-2" />
                Настроить
              </Button>
            </div>

            {/* Alert Configuration Cards */}
            <div className="grid gap-4">
              {[
                {
                  type: 'fraud_spike',
                  title: 'Пик фрода',
                  description: 'Уведомление при резком увеличении фрод-трафика',
                  threshold: '20% за 15 минут',
                  status: 'active',
                  lastTriggered: '2 часа назад',
                  severity: 'high'
                },
                {
                  type: 'cr_anomaly', 
                  title: 'Аномалия CR',
                  description: 'Увеличение конверсии в 3-5 раз за короткое время',
                  threshold: '300% за 30 минут',
                  status: 'active',
                  lastTriggered: 'Никогда',
                  severity: 'critical'
                },
                {
                  type: 'volume_surge',
                  title: 'Всплеск трафика',
                  description: 'Необычный рост объёма трафика',
                  threshold: '500% за 1 час',
                  status: 'inactive',
                  lastTriggered: '1 день назад',
                  severity: 'medium'
                },
                {
                  type: 'geo_anomaly',
                  title: 'Географическая аномалия',
                  description: 'Трафик из необычных регионов',
                  threshold: 'Новые ГЕО > 10%',
                  status: 'active',
                  lastTriggered: '5 часов назад',
                  severity: 'low'
                }
              ].map((alert) => (
                <Card key={alert.type} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className={`w-5 h-5 ${
                            alert.severity === 'critical' ? 'text-red-500' :
                            alert.severity === 'high' ? 'text-orange-500' :
                            alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                          <h3 className="text-lg font-semibold">{alert.title}</h3>
                          <Badge 
                            variant={alert.status === 'active' ? 'default' : 'secondary'}
                            className={alert.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {alert.status === 'active' ? 'Активен' : 'Отключён'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Порог: {alert.threshold}</span>
                          <span>Последний: {alert.lastTriggered}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Настройка алерта",
                              description: `Открытие настроек для "${alert.title}"`,
                            });
                          }}
                          data-testid={`button-configure-${alert.type}`}
                          title="Настроить алерт"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Switch 
                          checked={alert.status === 'active'}
                          onCheckedChange={() => {
                            toast({
                              title: alert.status === 'active' ? "Алерт отключён" : "Алерт включён",
                              description: `"${alert.title}" ${alert.status === 'active' ? 'деактивирован' : 'активирован'}`,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Export Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Экспорт логов фрода</span>
                </CardTitle>
                <CardDescription>
                  Выгрузка данных о мошенничестве в различных форматах
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open('/api/admin/fraud-reports/export?format=excel', '_blank');
                      toast({
                        title: "Экспорт Excel",
                        description: "Загрузка файла с логами фрода в формате Excel",
                      });
                    }}
                    data-testid="button-export-excel"
                    title="Экспорт в Excel"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open('/api/admin/fraud-reports/export?format=json', '_blank');
                      toast({
                        title: "Экспорт JSON",
                        description: "Загрузка файла с логами фрода в формате JSON",
                      });
                    }}
                    data-testid="button-export-json"
                    title="Экспорт в JSON"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText('https://api.yourplatform.com/fraud-logs');
                      toast({
                        title: "API endpoint скопирован",
                        description: "Ссылка на API для получения логов фрода скопирована в буфер обмена",
                      });
                    }}
                    data-testid="button-copy-api"
                    title="Скопировать API endpoint"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    API
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blocks Tab */}
          <TabsContent value="blocks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Ban className="w-5 h-5" />
                  <span>Управление блокировками</span>
                </CardTitle>
                <CardDescription>
                  Просмотр и управление заблокированными IP-адресами и пользователями
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Активных блокировок: <span className="font-semibold">247</span></p>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить блокировку
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-center text-gray-500">Список блокировок будет здесь</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Настройки антифрода</span>
                </CardTitle>
                <CardDescription>
                  Глобальные настройки системы защиты от мошенничества
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Общий риск-порог</Label>
                      <div className="flex items-center space-x-2">
                        <input type="range" min="0" max="100" defaultValue="75" className="flex-1" />
                        <span className="text-sm font-medium">75%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Автоблокировка</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Сохранить настройки
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FraudDetectionPage;