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
                <span className="hidden sm:inline">Блокировки</span>
                <span className="sm:hidden">Блоки</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center justify-center space-x-1 text-xs">
                <Settings className="w-3 h-3" />
                <span className="hidden sm:inline">Настройки</span>
                <span className="sm:hidden">Опции</span>
              </TabsTrigger>
            </TabsList>

            {/* Simple placeholder for all tabs */}
            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Фрод-отчёты</CardTitle>
                  <CardDescription>Анализ подозрительной активности</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Загрузка данных...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Аналитика</CardTitle>
                  <CardDescription>Статистика и метрики</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Загрузка данных...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ip-analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>IP Анализ</CardTitle>
                  <CardDescription>Анализ IP-адресов</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Загрузка данных...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Правила</CardTitle>
                  <CardDescription>Управление правилами антифрода</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Загрузка данных...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Интеграции</CardTitle>
                  <CardDescription>Внешние сервисы</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Загрузка данных...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Smart-алерты</CardTitle>
                  <CardDescription>Умные уведомления</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Загрузка данных...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blocks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Блокировки</CardTitle>
                  <CardDescription>Управление блокировками</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Загрузка данных...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Настройки</CardTitle>
                  <CardDescription>Конфигурация системы</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Загрузка данных...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default FraudDetectionPage;
