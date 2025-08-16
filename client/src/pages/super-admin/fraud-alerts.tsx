import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/auth-context';
import { useTranslation } from 'react-i18next';

import { queryClient } from '../../lib/queryClient';
import Sidebar from '../../components/layout/sidebar';
import Header from '../../components/layout/header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Check, 
  X,
  Activity,
  Users,
  DollarSign,
  Globe,
  Search
} from 'lucide-react';

export default function FraudAlertsManagement() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const { data: allFraudAlerts, isLoading } = useQuery({
    queryKey: ['/api/admin/fraud-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/admin/fraud-alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch fraud alerts');
      return response.json();
    },
  });

  // Filter alerts based on search term and filters
  const fraudAlerts = allFraudAlerts?.filter((alert: any) => {
    const matchesSearch = searchTerm === '' || 
      alert.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.offer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || (alert.isResolved ? 'resolved' : 'pending') === filterStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  }) || [];

  const { data: fraudMetrics } = useQuery({
    queryKey: ['/api/admin/fraud-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/fraud-metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch fraud metrics');
      return response.json();
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async ({ alertId, isResolved }: { alertId: string; isResolved: boolean }) => {
      const response = await fetch(`/api/admin/fraud-alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isResolved }),
      });
      if (!response.ok) throw new Error('Failed to update fraud alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/fraud-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/fraud-metrics'] });
    },
  });

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suspicious_activity': return <Activity className="w-4 h-4" />;
      case 'high_velocity': return <DollarSign className="w-4 h-4" />;
      case 'duplicate_conversion': return <Users className="w-4 h-4" />;
      case 'geo_mismatch': return <Globe className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const metrics = [
    {
      label: 'active_alerts',
      value: fraudMetrics?.activeAlerts?.toString() || '0',
      change: '+5',
      changeType: 'increase' as const,
      icon: <AlertTriangle className="w-5 h-5" />,
      iconBg: 'bg-red-50',
    },
    {
      label: 'fraud_rate',
      value: `${fraudMetrics?.fraudRate || '0'}%`,
      change: '-0.5%',
      changeType: 'decrease' as const,
      icon: <Shield className="w-5 h-5" />,
      iconBg: 'bg-blue-50',
    },
    {
      label: 'blocked_revenue',
      value: `$${fraudMetrics?.blockedRevenue || '0'}`,
      change: '+$1,250',
      changeType: 'increase' as const,
      icon: <DollarSign className="w-5 h-5" />,
      iconBg: 'bg-green-50',
    },
    {
      label: 'resolved_today',
      value: fraudMetrics?.resolvedToday?.toString() || '0',
      change: '+3',
      changeType: 'increase' as const,
      icon: <Check className="w-5 h-5" />,
      iconBg: 'bg-purple-50',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <Header title={t('fraud_alerts')} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('fraud_detection_management')}</h1>
              <p className="text-gray-600 dark:text-gray-400">{t('monitor_investigate_fraud_alerts')}</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {metrics.map((metric, index) => (
                <Card key={index} data-testid={`metric-card-${metric.label}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t(metric.label)}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid={`metric-value-${metric.label}`}>
                          {metric.value}
                        </p>
                        <p className={`text-sm mt-1 ${
                          metric.changeType === 'increase' 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {metric.change}
                        </p>
                      </div>
                      <div className={`${metric.iconBg} p-3 rounded-lg`}>
                        {metric.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Поиск по пользователю, офферу или описанию..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-alerts"
                      title="Поиск алертов"
                    />
                  </div>
                  
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-[180px]" data-testid="select-filter-severity" title="Фильтр по важности">
                      <SelectValue placeholder={t('filter_by_severity')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all_severities')}</SelectItem>
                      <SelectItem value="high">{t('high')}</SelectItem>
                      <SelectItem value="medium">{t('medium')}</SelectItem>
                      <SelectItem value="low">{t('low')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]" data-testid="select-filter-status" title="Фильтр по статусу">
                      <SelectValue placeholder={t('filter_by_status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all_statuses')}</SelectItem>
                      <SelectItem value="pending">{t('pending')}</SelectItem>
                      <SelectItem value="resolved">{t('resolved')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterSeverity('all');
                      setFilterStatus('all');
                    }}
                    data-testid="button-clear-filters"
                    title="Очистить фильтры"
                  >
                    {t('clear_filters')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Fraud Alerts Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t('fraud_alerts')} ({fraudAlerts?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('type')}</TableHead>
                        <TableHead>{t('user')}</TableHead>
                        <TableHead>{t('offer')}</TableHead>
                        <TableHead>{t('severity')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('date')}</TableHead>
                        <TableHead className="text-right">{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fraudAlerts?.map((alert: any) => (
                        <TableRow key={alert.id} data-testid={`row-alert-${alert.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(alert.type)}
                              <span className="capitalize" data-testid={`text-type-${alert.id}`}>
                                {t(alert.type)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-sm font-semibold">
                                {alert.user?.firstName?.charAt(0) || alert.user?.username?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white" data-testid={`text-username-${alert.id}`}>
                                  {alert.user?.username || 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {alert.user?.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div data-testid={`text-offer-${alert.id}`}>
                              {alert.offer?.name || 'Unknown Offer'}
                              <div className="text-sm text-gray-500">
                                {alert.offer?.category}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getSeverityBadgeColor(alert.severity)} data-testid={`severity-${alert.id}`}>
                              {t(alert.severity)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={alert.isResolved ? 'default' : 'secondary'} data-testid={`status-${alert.id}`}>
                              {alert.isResolved ? t('resolved') : t('pending')}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-date-${alert.id}`}>
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => setSelectedAlert(alert)}
                                    data-testid={`button-view-${alert.id}`}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>{t('fraud_alert_details')}</DialogTitle>
                                  </DialogHeader>
                                  {selectedAlert && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">{t('type')}</label>
                                          <p className="font-medium">{t(selectedAlert.type)}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">{t('severity')}</label>
                                          <Badge className={getSeverityBadgeColor(selectedAlert.severity)}>
                                            {t(selectedAlert.severity)}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-600">{t('description')}</label>
                                        <p className="mt-1">{selectedAlert.description}</p>
                                      </div>
                                      {selectedAlert.data && (
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">{t('additional_data')}</label>
                                          <pre className="mt-1 p-3 bg-gray-100 rounded text-sm overflow-auto">
                                            {JSON.stringify(selectedAlert.data, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              {!alert.isResolved && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => resolveAlertMutation.mutate({
                                    alertId: alert.id,
                                    isResolved: true
                                  })}
                                  disabled={resolveAlertMutation.isPending}
                                  data-testid={`button-resolve-${alert.id}`}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}