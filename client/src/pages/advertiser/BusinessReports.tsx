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
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Play, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Settings,
  Clock,
  Mail,
  Share
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface BusinessReport {
  id: string;
  name: string;
  description?: string;
  type: 'analytics' | 'financial' | 'performance' | 'custom';
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  metrics: string[];
  filters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  isActive: boolean;
  lastGenerated?: string;
  nextScheduled?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  defaultMetrics: string[];
  defaultFilters: Record<string, any>;
}

const AVAILABLE_METRICS = [
  { id: 'clicks', name: 'Клики', group: 'traffic' },
  { id: 'conversions', name: 'Конверсии', group: 'performance' },
  { id: 'revenue', name: 'Доходы', group: 'financial' },
  { id: 'cr', name: 'CR (%)', group: 'performance' },
  { id: 'epc', name: 'EPC', group: 'financial' },
  { id: 'roi', name: 'ROI', group: 'financial' },
  { id: 'partners', name: 'Партнеры', group: 'partnership' },
  { id: 'offers', name: 'Офферы', group: 'catalog' },
  { id: 'countries', name: 'География', group: 'geo' },
  { id: 'devices', name: 'Устройства', group: 'traffic' },
  { id: 'fraud_rate', name: 'Fraud Rate', group: 'security' },
  { id: 'postbacks', name: 'Постбеки', group: 'technical' }
];

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'daily_performance',
    name: 'Ежедневная производительность',
    description: 'Основные метрики производительности за день',
    type: 'performance',
    defaultMetrics: ['clicks', 'conversions', 'cr', 'revenue'],
    defaultFilters: { period: '24h' }
  },
  {
    id: 'weekly_summary',
    name: 'Еженедельная сводка',
    description: 'Полная сводка за неделю',
    type: 'analytics',
    defaultMetrics: ['clicks', 'conversions', 'revenue', 'partners', 'countries'],
    defaultFilters: { period: '7d' }
  },
  {
    id: 'financial_report',
    name: 'Финансовый отчет',
    description: 'Детальный финансовый анализ',
    type: 'financial',
    defaultMetrics: ['revenue', 'epc', 'roi'],
    defaultFilters: { period: '30d' }
  },
  {
    id: 'security_audit',
    name: 'Аудит безопасности',
    description: 'Отчет по мошенническому трафику',
    type: 'custom',
    defaultMetrics: ['fraud_rate', 'clicks', 'conversions'],
    defaultFilters: { include_fraud: true }
  }
];

export default function BusinessReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('reports');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<BusinessReport | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Form state
  const [reportForm, setReportForm] = useState({
    name: '',
    description: '',
    type: 'analytics' as BusinessReport['type'],
    schedule: 'manual' as BusinessReport['schedule'],
    recipients: [] as string[],
    metrics: [] as string[],
    filters: {},
    format: 'pdf' as BusinessReport['format'],
    isActive: true
  });
  const [recipientEmail, setRecipientEmail] = useState('');

  // Fetch reports
  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['/api/advertiser/business-reports'],
    queryFn: async () => {
      const response = await apiRequest('/api/advertiser/business-reports');
      return response as BusinessReport[];
    }
  });

  // Create report mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<BusinessReport>) => {
      return apiRequest('/api/advertiser/business-reports', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: 'Отчет создан',
        description: 'Бизнес-отчет успешно создан'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/business-reports'] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось создать отчет',
        variant: 'destructive'
      });
    }
  });

  // Update report mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BusinessReport> }) => {
      return apiRequest(`/api/advertiser/business-reports/${id}`, 'PATCH', data);
    },
    onSuccess: () => {
      toast({
        title: 'Отчет обновлен',
        description: 'Бизнес-отчет успешно обновлен'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/business-reports'] });
      setShowEditDialog(false);
      resetForm();
    }
  });

  // Delete report mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/advertiser/business-reports/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: 'Отчет удален',
        description: 'Бизнес-отчет успешно удален'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/business-reports'] });
    }
  });

  // Generate report mutation
  const generateMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/advertiser/business-reports/${id}/generate`, 'POST');
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Отчет генерируется',
        description: 'Отчет будет готов через несколько минут'
      });
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/business-reports'] });
    }
  });

  const resetForm = () => {
    setReportForm({
      name: '',
      description: '',
      type: 'analytics',
      schedule: 'manual',
      recipients: [],
      metrics: [],
      filters: {},
      format: 'pdf',
      isActive: true
    });
    setRecipientEmail('');
    setSelectedTemplate('');
    setSelectedReport(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = REPORT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setReportForm(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        type: template.type as BusinessReport['type'],
        metrics: template.defaultMetrics,
        filters: template.defaultFilters
      }));
    }
    setSelectedTemplate(templateId);
  };

  const handleAddRecipient = () => {
    if (recipientEmail && !reportForm.recipients.includes(recipientEmail)) {
      setReportForm(prev => ({
        ...prev,
        recipients: [...prev.recipients, recipientEmail]
      }));
      setRecipientEmail('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setReportForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const handleMetricToggle = (metricId: string) => {
    setReportForm(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const handleCreateReport = () => {
    createMutation.mutate(reportForm);
  };

  const handleUpdateReport = () => {
    if (selectedReport) {
      updateMutation.mutate({ id: selectedReport.id, data: reportForm });
    }
  };

  const handleEditReport = (report: BusinessReport) => {
    setSelectedReport(report);
    setReportForm({
      name: report.name,
      description: report.description || '',
      type: report.type,
      schedule: report.schedule,
      recipients: report.recipients,
      metrics: report.metrics,
      filters: report.filters,
      format: report.format,
      isActive: report.isActive
    });
    setShowEditDialog(true);
  };

  const metricsByGroup = AVAILABLE_METRICS.reduce((acc, metric) => {
    if (!acc[metric.group]) acc[metric.group] = [];
    acc[metric.group].push(metric);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_METRICS>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Бизнес-отчеты</h1>
          <p className="text-muted-foreground">Создание и управление автоматизированными отчетами</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Создать отчет
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Создание бизнес-отчета</DialogTitle>
              <DialogDescription>
                Настройте параметры автоматизированного отчета
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-3">
                <Label>Выберите шаблон (опционально)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {REPORT_TEMPLATES.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-colors ${selectedTemplate === template.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название отчета *</Label>
                  <Input
                    id="name"
                    value={reportForm.name}
                    onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Название отчета"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Тип отчета</Label>
                  <Select value={reportForm.type} onValueChange={(value) => setReportForm(prev => ({ ...prev, type: value as BusinessReport['type'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analytics">Аналитический</SelectItem>
                      <SelectItem value="financial">Финансовый</SelectItem>
                      <SelectItem value="performance">Производительность</SelectItem>
                      <SelectItem value="custom">Пользовательский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={reportForm.description}
                  onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Описание отчета"
                  rows={2}
                />
              </div>

              {/* Schedule & Format */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Расписание</Label>
                  <Select value={reportForm.schedule} onValueChange={(value) => setReportForm(prev => ({ ...prev, schedule: value as BusinessReport['schedule'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Вручную</SelectItem>
                      <SelectItem value="daily">Ежедневно</SelectItem>
                      <SelectItem value="weekly">Еженедельно</SelectItem>
                      <SelectItem value="monthly">Ежемесячно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="format">Формат</Label>
                  <Select value={reportForm.format} onValueChange={(value) => setReportForm(prev => ({ ...prev, format: value as BusinessReport['format'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Recipients */}
              <div className="space-y-3">
                <Label>Получатели</Label>
                <div className="flex gap-2">
                  <Input
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Email получателя"
                    type="email"
                  />
                  <Button type="button" onClick={handleAddRecipient} variant="outline">
                    Добавить
                  </Button>
                </div>
                {reportForm.recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {reportForm.recipients.map((email) => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-1">
                        {email}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => handleRemoveRecipient(email)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Metrics Selection */}
              <div className="space-y-3">
                <Label>Метрики</Label>
                <div className="space-y-4">
                  {Object.entries(metricsByGroup).map(([group, metrics]) => (
                    <div key={group} className="space-y-2">
                      <h4 className="text-sm font-medium capitalize">{group}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {metrics.map((metric) => (
                          <div key={metric.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={metric.id}
                              checked={reportForm.metrics.includes(metric.id)}
                              onCheckedChange={() => handleMetricToggle(metric.id)}
                            />
                            <Label htmlFor={metric.id} className="text-sm">
                              {metric.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Отмена
              </Button>
              <Button 
                onClick={handleCreateReport} 
                disabled={createMutation.isPending || !reportForm.name || reportForm.metrics.length === 0}
              >
                {createMutation.isPending ? 'Создание...' : 'Создать отчет'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Отчеты</TabsTrigger>
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">Загрузка отчетов...</div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports?.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Отчеты не найдены</h3>
                    <p className="text-muted-foreground mb-4">
                      Создайте первый автоматизированный отчет
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Создать отчет
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {reports?.map((report) => (
                    <Card key={report.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {report.name}
                                {!report.isActive && (
                                  <Badge variant="secondary">Неактивен</Badge>
                                )}
                              </CardTitle>
                              <CardDescription>{report.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {report.type}
                            </Badge>
                            <Badge variant="outline">
                              {report.schedule === 'manual' ? 'Вручную' : 
                               report.schedule === 'daily' ? 'Ежедневно' :
                               report.schedule === 'weekly' ? 'Еженедельно' : 'Ежемесячно'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="grid grid-cols-3 gap-6 text-sm">
                            <div>
                              <p className="text-muted-foreground">Формат</p>
                              <p className="font-medium uppercase">{report.format}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Получатели</p>
                              <p className="font-medium">{report.recipients.length}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Последний запуск</p>
                              <p className="font-medium">
                                {report.lastGenerated 
                                  ? new Date(report.lastGenerated).toLocaleDateString('ru-RU')
                                  : 'Никогда'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => generateMutation.mutate(report.id)}
                              disabled={generateMutation.isPending}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Запустить
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditReport(report)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteMutation.mutate(report.id)}
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
            {REPORT_TEMPLATES.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Метрики по умолчанию:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.defaultMetrics.map((metric) => (
                          <Badge key={metric} variant="outline" className="text-xs">
                            {AVAILABLE_METRICS.find(m => m.id === metric)?.name || metric}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        handleTemplateSelect(template.id);
                        setShowCreateDialog(true);
                      }}
                    >
                      Использовать шаблон
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирование отчета</DialogTitle>
            <DialogDescription>
              Измените параметры бизнес-отчета
            </DialogDescription>
          </DialogHeader>
          
          {/* Same form content as create dialog */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Название отчета *</Label>
                <Input
                  id="edit-name"
                  value={reportForm.name}
                  onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Название отчета"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Тип отчета</Label>
                <Select value={reportForm.type} onValueChange={(value) => setReportForm(prev => ({ ...prev, type: value as BusinessReport['type'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analytics">Аналитический</SelectItem>
                    <SelectItem value="financial">Финансовый</SelectItem>
                    <SelectItem value="performance">Производительность</SelectItem>
                    <SelectItem value="custom">Пользовательский</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={reportForm.isActive}
                onCheckedChange={(checked) => setReportForm(prev => ({ ...prev, isActive: !!checked }))}
              />
              <Label htmlFor="isActive">Активный отчет</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateReport} 
              disabled={updateMutation.isPending || !reportForm.name}
            >
              {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}