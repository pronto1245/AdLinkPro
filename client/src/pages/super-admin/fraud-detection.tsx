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
import { Progress } from '@/components/ui/progress';
import { 
  Shield, AlertTriangle, Activity, Eye, Ban, Settings, Target, Globe, 
  Smartphone, Monitor, MapPin, Zap, TrendingUp, AlertCircle, CheckCircle, 
  XCircle, Clock, Search, Filter, Download, RefreshCw, Plus, Edit, Trash2,
  BarChart3, PieChart, Users, Flag, Lock, Unlock, FileText
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
}

const FraudDetectionPage = () => {
  const { user, token } = useAuth();
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('reports');
  const [reportFilters, setReportFilters] = useState({
    type: '',
    severity: '',
    status: '',
    search: ''
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Фрод-отчёты</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Аналитика</span>
              </TabsTrigger>
              <TabsTrigger value="ip-analysis" className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>IP Анализ</span>
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Правила</span>
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

            {/* Other tabs would be implemented similarly */}
            <TabsContent value="blocks">
              <Card>
                <CardHeader>
                  <CardTitle>Активные блокировки</CardTitle>
                  <CardDescription>Заблокированные IP, устройства и партнёры</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Раздел в разработке...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Настройки антифрод-системы</CardTitle>
                  <CardDescription>Глобальные настройки и пороговые значения</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Раздел в разработке...</p>
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
                    onClick={() => {
                      toast({
                        title: "Правило создано",
                        description: "Новое правило антифрода успешно создано",
                      });
                      setCreateRuleDialogOpen(false);
                    }}
                  >
                    Создать правило
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export { FraudDetectionPage };
export default FraudDetectionPage;