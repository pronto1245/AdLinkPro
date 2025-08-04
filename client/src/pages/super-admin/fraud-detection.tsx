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
  createdAt: string;
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

// Helper functions
const getFraudTypeLabel = (type: string) => {
  const labels = {
    'ip_fraud': 'IP Фрод',
    'device_fraud': 'Фрод устройств',
    'geo_fraud': 'Геофрод',
    'anomaly_ctr': 'Аномальный CTR',
    'click_fraud': 'Фрод кликов',
    'conversion_fraud': 'Фрод конверсий'
  };
  return labels[type as keyof typeof labels] || type;
};

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
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<FraudServiceIntegration | null>(null);
  const [testingService, setTestingService] = useState<string | null>(null);

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

  // Test service connection
  const testServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await fetch(`/api/admin/fraud-services/${serviceId}/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Тест подключения не удался');
      return response.json();
    },
    onSuccess: (data, serviceId) => {
      const service = fraudServices.find(s => s.id === serviceId);
      toast({
        title: "Тест успешен",
        description: `Сервис ${service?.serviceName} работает корректно. Время отклика: ${data.responseTime}ms`,
      });
      setTestingService(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/fraud-services'] });
    },
    onError: (error: any, serviceId) => {
      const service = fraudServices.find(s => s.id === serviceId);
      toast({
        title: "Тест не удался",
        description: `Ошибка подключения к ${service?.serviceName}: ${error.message}`,
        variant: "destructive",
      });
      setTestingService(null);
    }
  });

  // Toggle service status
  const toggleServiceMutation = useMutation({
    mutationFn: async ({ serviceId, isActive }: { serviceId: string, isActive: boolean }) => {
      const response = await fetch(`/api/admin/fraud-services/${serviceId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('Не удалось изменить статус сервиса');
      return response.json();
    },
    onSuccess: (data, { serviceId, isActive }) => {
      const service = fraudServices.find(s => s.id === serviceId);
      toast({
        title: isActive ? "Сервис активирован" : "Сервис деактивирован",
        description: `${service?.serviceName} ${isActive ? 'включен' : 'отключен'}`,
      });
      // Update cache with server response to ensure consistency
      queryClient.setQueryData(['/api/admin/fraud-services'], (oldServices: FraudServiceIntegration[]) => {
        return oldServices?.map(s => 
          s.id === serviceId ? { ...s, ...data } : s
        ) || [];
      });
    },
    onError: (error: any, { serviceId, isActive }) => {
      // Revert optimistic update on error
      queryClient.setQueryData(['/api/admin/fraud-services'], (oldServices: FraudServiceIntegration[]) => {
        return oldServices?.map(s => 
          s.id === serviceId ? { ...s, isActive: !isActive } : s
        ) || [];
      });
      
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle test service
  const handleTestService = (service: FraudServiceIntegration) => {
    setTestingService(service.id);
    testServiceMutation.mutate(service.id);
  };

  // Handle configure service
  const handleConfigureService = (service: FraudServiceIntegration) => {
    setSelectedService(service);
    setConfigureDialogOpen(true);
  };

  // Handle toggle service
  const handleToggleService = (service: FraudServiceIntegration, isActive: boolean) => {
    // Optimistic update - immediately update UI
    queryClient.setQueryData(['/api/admin/fraud-services'], (oldServices: FraudServiceIntegration[]) => {
      return oldServices?.map(s => 
        s.id === service.id ? { ...s, isActive, lastSync: new Date().toISOString() } : s
      ) || [];
    });

    // Then send to server
    toggleServiceMutation.mutate({ serviceId: service.id, isActive });
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
            <TabsList className="grid w-full grid-cols-8 h-14 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <TabsTrigger 
                value="reports" 
                className="flex items-center justify-center space-x-2 text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 hover:bg-white hover:shadow-sm dark:hover:bg-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-600 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400"
                title="Фрод-отчёты"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Фрод-отчёты</span>
                <span className="sm:hidden">Отчёты</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center justify-center space-x-2 text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 hover:bg-white hover:shadow-sm dark:hover:bg-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                title="Аналитика"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Аналитика</span>
                <span className="sm:hidden">Данные</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ip-analysis" 
                className="flex items-center justify-center space-x-2 text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 hover:bg-white hover:shadow-sm dark:hover:bg-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-600 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400"
                title="IP Анализ"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">IP Анализ</span>
                <span className="sm:hidden">IP</span>
              </TabsTrigger>
              <TabsTrigger 
                value="rules" 
                className="flex items-center justify-center space-x-2 text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 hover:bg-white hover:shadow-sm dark:hover:bg-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-600 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400"
                title="Правила"
              >
                <Settings className="w-4 h-4" />
                <span>Правила</span>
              </TabsTrigger>
              <TabsTrigger 
                value="integrations" 
                className="flex items-center justify-center space-x-2 text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 hover:bg-white hover:shadow-sm dark:hover:bg-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-600 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400"
                title="Интеграции"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Интеграции</span>
                <span className="sm:hidden">API</span>
              </TabsTrigger>
              <TabsTrigger 
                value="alerts" 
                className="flex items-center justify-center space-x-2 text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 hover:bg-white hover:shadow-sm dark:hover:bg-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-600 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-yellow-400"
                title="Smart-алерты"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Smart-алерты</span>
                <span className="sm:hidden">Алерты</span>
              </TabsTrigger>
              <TabsTrigger 
                value="blocks" 
                className="flex items-center justify-center space-x-2 text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 hover:bg-white hover:shadow-sm dark:hover:bg-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"
                title="Блокировки"
              >
                <Ban className="w-4 h-4" />
                <span className="hidden sm:inline">Блокировки</span>
                <span className="sm:hidden">Блоки</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex items-center justify-center space-x-2 text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 hover:bg-white hover:shadow-sm dark:hover:bg-gray-600 data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-600 dark:data-[state=active]:text-gray-400"
                title="Настройки"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Настройки</span>
                <span className="sm:hidden">Опции</span>
              </TabsTrigger>
            </TabsList>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              {/* Context Alert for External Navigation */}
              {(offerParam || userParam) && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Фильтрация по {offerParam ? 'офферу' : 'пользователю'}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-300">
                          Показаны отчёты для: {offerParam || userParam}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Фрод-отчёты</span>
                  </CardTitle>
                  <CardDescription>
                    Анализ подозрительной активности и мошеннических действий
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1 min-w-[200px]">
                      <Input
                        placeholder="Поиск по IP, ID..."
                        value={reportFilters.search}
                        onChange={(e) => setReportFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full"
                        data-testid="search-reports"
                      />
                    </div>
                    <Select value={reportFilters.type} onValueChange={(value) => setReportFilters(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="w-[150px]" data-testid="filter-type">
                        <SelectValue placeholder="Тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все типы</SelectItem>
                        <SelectItem value="ip_fraud">IP Фрод</SelectItem>
                        <SelectItem value="device_fraud">Фрод устройств</SelectItem>
                        <SelectItem value="geo_fraud">Геофрод</SelectItem>
                        <SelectItem value="anomaly_ctr">Аномальный CTR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={reportFilters.severity} onValueChange={(value) => setReportFilters(prev => ({ ...prev, severity: value }))}>
                      <SelectTrigger className="w-[150px]" data-testid="filter-severity">
                        <SelectValue placeholder="Риск" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все уровни</SelectItem>
                        <SelectItem value="low">Низкий</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="high">Высокий</SelectItem>
                        <SelectItem value="critical">Критический</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={reportFilters.status} onValueChange={(value) => setReportFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="w-[150px]" data-testid="filter-status">
                        <SelectValue placeholder="Статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="pending">На рассмотрении</SelectItem>
                        <SelectItem value="reviewing">В обработке</SelectItem>
                        <SelectItem value="confirmed">Подтверждён</SelectItem>
                        <SelectItem value="rejected">Отклонён</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reports Table */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Тип</TableHead>
                          <TableHead>Серьёзность</TableHead>
                          <TableHead>IP Адрес</TableHead>
                          <TableHead>Страна</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fraudReports?.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.id}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {getFraudTypeLabel(report.type)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                report.severity === 'critical' ? 'destructive' :
                                report.severity === 'high' ? 'destructive' :
                                report.severity === 'medium' ? 'default' : 'secondary'
                              } className="text-xs">
                                {report.severity === 'low' && 'Низкий'}
                                {report.severity === 'medium' && 'Средний'}
                                {report.severity === 'high' && 'Высокий'}
                                {report.severity === 'critical' && 'Критический'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{report.ipAddress}</TableCell>
                            <TableCell>{report.country}</TableCell>
                            <TableCell>
                              <Badge variant={
                                report.status === 'confirmed' ? 'destructive' :
                                report.status === 'rejected' ? 'secondary' :
                                report.status === 'resolved' ? 'default' : 'outline'
                              } className="text-xs">
                                {report.status === 'pending' && 'Ожидает'}
                                {report.status === 'reviewing' && 'Проверка'}
                                {report.status === 'confirmed' && 'Подтверждён'}
                                {report.status === 'rejected' && 'Отклонён'}
                                {report.status === 'resolved' && 'Решён'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {new Date(report.createdAt).toLocaleDateString('ru-RU', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setReviewDialogOpen(true);
                                  }}
                                  data-testid={`review-report-${report.id}`}
                                  title="Рассмотреть отчёт"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setBlockIpDialogOpen(true);
                                  }}
                                  data-testid={`block-ip-${report.id}`}
                                  title="Заблокировать IP"
                                >
                                  <Ban className="w-3 h-3" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Блокировано сегодня</p>
                        <p className="text-2xl font-bold">127</p>
                      </div>
                      <Shield className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">+12% за сутки</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Точность детекции</p>
                        <p className="text-2xl font-bold">94.2%</p>
                      </div>
                      <Target className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">+0.3% за неделю</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Средний риск-скор</p>
                        <p className="text-2xl font-bold">2.8</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">-0.1 за сутки</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Активные правила</p>
                        <p className="text-2xl font-bold">{fraudRules?.length || 0}</p>
                      </div>
                      <Settings className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Всего правил</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Топ стран по фроду</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['Россия', 'Украина', 'Беларусь', 'Казахстан', 'Германия'].map((country, index) => (
                        <div key={country} className="flex items-center justify-between">
                          <span className="text-sm">{country}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-600 h-2 rounded-full" 
                                style={{ width: `${85 - index * 15}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 w-8">{85 - index * 15}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Распределение по типам фрода</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { type: 'IP Фрод', count: 45, color: 'bg-red-500' },
                        { type: 'Фрод устройств', count: 32, color: 'bg-orange-500' },
                        { type: 'Геофрод', count: 28, color: 'bg-yellow-500' },
                        { type: 'Аномальный CTR', count: 18, color: 'bg-blue-500' },
                        { type: 'Фрод кликов', count: 12, color: 'bg-purple-500' }
                      ].map((item) => (
                        <div key={item.type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                            <span className="text-sm">{item.type}</span>
                          </div>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                    Анализ IP-адресов и определение подозрительной активности
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* IP Search */}
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Введите IP адрес для анализа (например: 192.168.1.1)"
                          className="w-full"
                          data-testid="ip-search-input"
                        />
                      </div>
                      <Button data-testid="analyze-ip-btn" title="Анализировать IP">
                        <Search className="w-4 h-4 mr-2" />
                        Анализировать
                      </Button>
                    </div>

                    {/* IP Analysis Results */}
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>IP Адрес</TableHead>
                            <TableHead>Страна</TableHead>
                            <TableHead>Провайдер</TableHead>
                            <TableHead>Риск-скор</TableHead>
                            <TableHead>Тип угрозы</TableHead>
                            <TableHead>Последняя активность</TableHead>
                            <TableHead>Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ipAnalysis?.map((ip) => (
                            <TableRow key={ip.id}>
                              <TableCell className="font-mono text-sm">{ip.ipAddress}</TableCell>
                              <TableCell>{ip.country}</TableCell>
                              <TableCell className="text-sm">{ip.isp || 'Неизвестно'}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-sm font-medium ${
                                    ip.riskScore >= 8 ? 'text-red-600' :
                                    ip.riskScore >= 6 ? 'text-orange-600' :
                                    ip.riskScore >= 4 ? 'text-yellow-600' : 'text-green-600'
                                  }`}>
                                    {ip.riskScore}/10
                                  </span>
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        ip.riskScore >= 8 ? 'bg-red-600' :
                                        ip.riskScore >= 6 ? 'bg-orange-600' :
                                        ip.riskScore >= 4 ? 'bg-yellow-600' : 'bg-green-600'
                                      }`}
                                      style={{ width: `${ip.riskScore * 10}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  ip.threatTypes?.includes('proxy') || ip.threatTypes?.includes('vpn') ? 'destructive' :
                                  ip.threatTypes?.includes('suspicious') ? 'default' : 'secondary'
                                } className="text-xs">
                                  {ip.threatTypes?.includes('clean') && 'Чистый'}
                                  {ip.threatTypes?.includes('proxy') && 'Прокси'}
                                  {ip.threatTypes?.includes('vpn') && 'VPN'}
                                  {ip.threatTypes?.includes('suspicious') && 'Подозрительный'}
                                  {ip.threatTypes?.includes('datacenter') && 'Дата-центр'}
                                  {!ip.threatTypes?.length && 'Неизвестно'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {new Date(ip.createdAt).toLocaleDateString('ru-RU', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      toast({
                                        title: "Подробности IP",
                                        description: `Просмотр детальной информации для IP: ${ip.ipAddress}`,
                                      });
                                    }}
                                    data-testid={`view-ip-${ip.id}`}
                                    title="Подробности IP"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedIp(ip.ipAddress);
                                      setBlockIpDialogOpen(true);
                                    }}
                                    data-testid={`block-ip-${ip.id}`}
                                    title="Заблокировать IP"
                                  >
                                    <Ban className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Правила антифрода</span>
                    </div>
                    <Button 
                      onClick={() => setCreateRuleDialogOpen(true)}
                      data-testid="create-rule-btn"
                      title="Создать правило"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Создать правило
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Управление правилами автоматического определения и блокировки фрода
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fraudRules?.map((rule) => (
                      <div key={rule.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <Switch 
                                checked={rule.isActive}
                                onCheckedChange={(checked) => {
                                  // Handle rule toggle - for now just show toast, later add API call
                                  toast({
                                    title: checked ? "Правило активировано" : "Правило деактивировано",
                                    description: `Правило "${rule.name}" ${checked ? 'включено' : 'отключено'}`,
                                  });
                                  // Update the rule state locally for immediate visual feedback
                                  queryClient.setQueryData(['/api/admin/fraud-rules'], (oldRules: FraudRule[]) => {
                                    return oldRules?.map(r => 
                                      r.id === rule.id ? { ...r, isActive: checked } : r
                                    ) || [];
                                  });
                                }}
                                data-testid={`toggle-rule-${rule.id}`}
                              />
                              <div>
                                <h4 className="font-medium">{rule.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {typeof rule.conditions === 'string' 
                                    ? rule.conditions 
                                    : rule.conditions 
                                    ? JSON.stringify(rule.conditions).replace(/[{}]/g, '').replace(/"/g, '').replace(/,/g, ', ')
                                    : 'Условия не указаны'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant={rule.isActive ? 'default' : 'secondary'} className="text-xs">
                                {rule.isActive ? 'Активно' : 'Неактивно'}
                              </Badge>
                              <Badge variant={
                                rule.severity === 'critical' ? 'destructive' :
                                rule.severity === 'high' ? 'destructive' :
                                rule.severity === 'medium' ? 'default' : 'secondary'
                              } className="text-xs">
                                {rule.severity === 'low' && 'Низкий риск'}
                                {rule.severity === 'medium' && 'Средний риск'}
                                {rule.severity === 'high' && 'Высокий риск'}
                                {rule.severity === 'critical' && 'Критический риск'}
                              </Badge>
                              {rule.autoBlock && (
                                <Badge variant="destructive" className="text-xs">
                                  Автоблокировка
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Редактирование правила",
                                  description: `Открываем редактор для правила "${rule.name}"`,
                                });
                              }}
                              data-testid={`edit-rule-${rule.id}`}
                              title="Редактировать правило"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Удаление правила",
                                  description: `Правило "${rule.name}" будет удалено`,
                                  variant: "destructive",
                                });
                              }}
                              data-testid={`delete-rule-${rule.id}`}
                              title="Удалить правило"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Интеграции третьих сторон</span>
                  </CardTitle>
                  <CardDescription>
                    Управление внешними сервисами антифрод-детекции
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {fraudServices?.map((service) => (
                      <div key={service.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${service.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <h4 className="font-medium">{service.serviceName}</h4>
                          </div>
                          <Switch 
                            checked={service.isActive}
                            onCheckedChange={(checked) => handleToggleService(service, checked)}
                            data-testid={`toggle-service-${service.id}`}
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Успешность:</span>
                            <span className={`font-medium ${service.successRate >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
                              {service.successRate}%
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Время отклика:</span>
                            <span className={`font-medium ${service.averageResponseTime <= 1000 ? 'text-green-600' : 'text-orange-600'}`}>
                              {service.averageResponseTime}ms
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Лимит запросов:</span>
                            <span className="font-medium">{service.rateLimit}/мин</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Последняя синхронизация:</span>
                            <span className="font-medium">
                              {new Date(service.lastSync).toLocaleDateString('ru-RU', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleTestService(service)}
                            disabled={testingService === service.id}
                            data-testid={`test-service-${service.id}`}
                            title="Тестировать подключение"
                          >
                            <Zap className="w-3 h-3 mr-2" />
                            {testingService === service.id ? 'Тестирую...' : 'Тест'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleConfigureService(service)}
                            data-testid={`configure-service-${service.id}`}
                            title="Настроить сервис"
                          >
                            <Settings className="w-3 h-3 mr-2" />
                            Настройка
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Smart Alerts Tab */}
            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>Smart-алерты</span>
                  </CardTitle>
                  <CardDescription>
                    Умные уведомления о подозрительной активности и аномалиях
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {smartAlerts?.map((alert) => (
                      <div key={alert.id} className={`border rounded-lg p-4 ${
                        alert.severity === 'critical' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
                        alert.severity === 'high' ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/20' :
                        alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
                        'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`w-3 h-3 rounded-full ${
                                alert.severity === 'critical' ? 'bg-red-500' :
                                alert.severity === 'high' ? 'bg-orange-500' :
                                alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}></div>
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge variant={
                                alert.severity === 'critical' ? 'destructive' :
                                alert.severity === 'high' ? 'destructive' :
                                alert.severity === 'medium' ? 'default' : 'secondary'
                              } className="text-xs">
                                {alert.severity === 'low' && 'Низкий'}
                                {alert.severity === 'medium' && 'Средний'}
                                {alert.severity === 'high' && 'Высокий'}
                                {alert.severity === 'critical' && 'Критический'}
                              </Badge>
                              {!alert.isResolved && (
                                <Badge variant="destructive" className="text-xs">
                                  Активный
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                              {alert.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Порог: {JSON.stringify(alert.threshold)}</span>
                              <span>Текущее: {JSON.stringify(alert.currentValue)}</span>
                              <span>
                                {new Date(alert.triggeredAt).toLocaleDateString('ru-RU', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            {alert.autoActions.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-500">Автодействия: </span>
                                {alert.autoActions.map((action, index) => (
                                  <Badge key={index} variant="outline" className="text-xs mr-1">
                                    {action}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            {!alert.isResolved && (
                              <Button
                                variant="outline"
                                size="sm"
                                data-testid={`resolve-alert-${alert.id}`}
                                title="Отметить как решённый"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`view-alert-${alert.id}`}
                              title="Подробности алерта"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Blocks Tab */}
            <TabsContent value="blocks" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Ban className="w-5 h-5" />
                      <span>IP Блокировки</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Input 
                          placeholder="IP адрес для блокировки"
                          className="flex-1"
                          data-testid="block-ip-input"
                        />
                        <Button 
                          size="sm"
                          data-testid="add-ip-block"
                          title="Заблокировать IP"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Активных блокировок: <span className="font-medium">45</span>
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.15'].map((ip, index) => (
                          <div key={ip} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-mono text-sm">{ip}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`unblock-ip-${index}`}
                              title="Разблокировать IP"
                            >
                              <Unlock className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Smartphone className="w-5 h-5" />
                      <span>Блокировки устройств</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-500">
                        Заблокированных устройств: <span className="font-medium">23</span>
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {['Device-ABC123', 'Device-XYZ789', 'Device-DEF456'].map((device, index) => (
                          <div key={device} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{device}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`unblock-device-${index}`}
                              title="Разблокировать устройство"
                            >
                              <Unlock className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Flag className="w-5 h-5" />
                    <span>Геоблокировки</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['США', 'Германия', 'Китай', 'Иран', 'КНДР', 'Турция'].map((country, index) => (
                      <div key={country} className="flex items-center justify-between p-3 border rounded">
                        <span className="text-sm">{country}</span>
                        <Switch 
                          defaultChecked={index < 3}
                          data-testid={`toggle-geo-${country}`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Основные настройки</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Автоматические блокировки</Label>
                        <p className="text-xs text-gray-500">Блокировать IP автоматически при высоком риске</p>
                      </div>
                      <Switch defaultChecked data-testid="auto-block-toggle" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Email уведомления</Label>
                        <p className="text-xs text-gray-500">Отправлять уведомления о фроде на email</p>
                      </div>
                      <Switch defaultChecked data-testid="email-notifications-toggle" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Real-time мониторинг</Label>
                        <p className="text-xs text-gray-500">Мониторинг в реальном времени</p>
                      </div>
                      <Switch defaultChecked data-testid="realtime-monitoring-toggle" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Пороговый риск-скор</Label>
                      <Input 
                        type="number" 
                        defaultValue="7" 
                        min="1" 
                        max="10"
                        data-testid="risk-threshold-input"
                      />
                      <p className="text-xs text-gray-500">Автоблокировка при превышении этого значения</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Настройки интеграций</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Таймаут запросов (мс)</Label>
                      <Input 
                        type="number" 
                        defaultValue="5000"
                        data-testid="request-timeout-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Повторные попытки</Label>
                      <Input 
                        type="number" 
                        defaultValue="3"
                        data-testid="retry-attempts-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Интервал обновления (сек)</Label>
                      <Input 
                        type="number" 
                        defaultValue="60"
                        data-testid="refresh-interval-input"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button className="w-full" data-testid="save-settings-btn" title="Сохранить настройки">
                        <Save className="w-4 h-4 mr-2" />
                        Сохранить настройки
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Экспорт данных</CardTitle>
                  <CardDescription>Экспорт фрод-данных в различных форматах</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" data-testid="export-excel-btn" title="Экспорт в Excel">
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                    <Button variant="outline" data-testid="export-json-btn" title="Экспорт в JSON">
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </Button>
                    <Button variant="outline" data-testid="export-csv-btn" title="Экспорт в CSV">
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                    <Button variant="outline" data-testid="api-docs-btn" title="API документация">
                      <FileText className="w-4 h-4 mr-2" />
                      API Docs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Create Rule Dialog */}
      <Dialog open={createRuleDialogOpen} onOpenChange={setCreateRuleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Создать новое правило антифрода</DialogTitle>
            <DialogDescription>
              Настройте параметры автоматического обнаружения и блокировки мошенничества
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Название правила</Label>
                <Input
                  id="rule-name"
                  placeholder="Например: Блокировка VPN трафика"
                  data-testid="rule-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-type">Тип правила</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ip_blocking">Блокировка IP</SelectItem>
                    <SelectItem value="device_fingerprint">Отпечаток устройства</SelectItem>
                    <SelectItem value="geo_blocking">Гео-блокировка</SelectItem>
                    <SelectItem value="rate_limiting">Ограничение частоты</SelectItem>
                    <SelectItem value="pattern_detection">Обнаружение паттернов</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-conditions">Условия срабатывания</Label>
              <Textarea
                id="rule-conditions"
                placeholder="Опишите условия, при которых должно срабатывать правило..."
                className="min-h-[100px]"
                data-testid="rule-conditions-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-severity">Уровень угрозы</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите уровень" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="critical">Критический</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-action">Действие</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите действие" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flag">Пометить для проверки</SelectItem>
                    <SelectItem value="block">Заблокировать</SelectItem>
                    <SelectItem value="redirect">Перенаправить</SelectItem>
                    <SelectItem value="rate_limit">Ограничить</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-block" data-testid="auto-block-toggle" />
              <Label htmlFor="auto-block">Автоматическая блокировка</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRuleDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "Правило создано",
                  description: "Новое правило антифрода успешно добавлено",
                });
                setCreateRuleDialogOpen(false);
              }}
              data-testid="save-rule-btn"
            >
              Создать правило
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block IP Dialog */}
      <Dialog open={blockIpDialogOpen} onOpenChange={setBlockIpDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Заблокировать IP адрес</DialogTitle>
            <DialogDescription>
              Блокировка IP адреса {selectedIp} для предотвращения мошенничества
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="block-reason">Причина блокировки</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите причину" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fraud_detected">Обнаружено мошенничество</SelectItem>
                  <SelectItem value="suspicious_activity">Подозрительная активность</SelectItem>
                  <SelectItem value="proxy_vpn">Прокси/VPN</SelectItem>
                  <SelectItem value="bot_activity">Активность ботов</SelectItem>
                  <SelectItem value="manual_review">Ручная проверка</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="block-duration">Длительность блокировки</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 час</SelectItem>
                  <SelectItem value="24h">24 часа</SelectItem>
                  <SelectItem value="7d">7 дней</SelectItem>
                  <SelectItem value="30d">30 дней</SelectItem>
                  <SelectItem value="permanent">Навсегда</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="block-notes">Дополнительные заметки</Label>
              <Textarea
                id="block-notes"
                placeholder="Дополнительная информация о блокировке..."
                className="min-h-[80px]"
                data-testid="block-notes-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockIpDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                toast({
                  title: "IP заблокирован",
                  description: `IP адрес ${selectedIp} успешно заблокирован`,
                  variant: "destructive",
                });
                setBlockIpDialogOpen(false);
                setSelectedIp('');
              }}
              data-testid="confirm-block-btn"
            >
              Заблокировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Service Dialog */}
      <Dialog open={configureDialogOpen} onOpenChange={setConfigureDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Настройка сервиса {selectedService?.serviceName}</DialogTitle>
            <DialogDescription>
              Конфигурация параметров подключения к внешнему сервису
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Ключ</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Введите API ключ"
                defaultValue={selectedService?.apiKey ? '••••••••••••' : ''}
                data-testid="api-key-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input
                id="endpoint"
                placeholder="https://api.service.com"
                defaultValue={selectedService?.endpoint}
                data-testid="endpoint-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate-limit">Лимит запросов (в минуту)</Label>
              <Input
                id="rate-limit"
                type="number"
                placeholder="100"
                defaultValue={selectedService?.rateLimit}
                data-testid="rate-limit-input"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="service-active"
                checked={selectedService?.isActive || false}
                onCheckedChange={(checked) => selectedService && handleToggleService(selectedService, checked)}
                data-testid="service-active-toggle"
              />
              <Label htmlFor="service-active">Активировать сервис</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigureDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "Настройки сохранены",
                  description: `Конфигурация ${selectedService?.serviceName} обновлена`,
                });
                setConfigureDialogOpen(false);
              }}
              data-testid="save-config-btn"
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FraudDetectionPage;
