import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSidebar } from '@/contexts/sidebar-context';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function FraudAlerts() {
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  // Fetch fraud alerts
  const { data: allFraudAlerts, isLoading } = useQuery({
    queryKey: ['/api/admin/fraud-alerts'],
  });

  // Fetch fraud metrics
  const { data: fraudMetrics } = useQuery({
    queryKey: ['/api/admin/fraud-metrics'],
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

  const resolveAlertMutation = useMutation({
    mutationFn: async ({ alertId, isResolved }: { alertId: string; isResolved: boolean }) => {
      const response = await apiRequest('PATCH', `/api/admin/fraud-alerts/${alertId}`, { isResolved });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/fraud-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/fraud-metrics'] });
      toast({
        title: 'Success',
        description: 'Alert status updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header title="Fraud Alerts" />
          <main className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading fraud alerts...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header title="Fraud Alerts" />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Shield className="w-8 h-8" />
              Fraud Detection
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage fraud alerts and suspicious activities
            </p>
          </div>

          {/* Metrics Cards */}
          {fraudMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Alerts</p>
                      <p className="text-2xl font-bold text-gray-900">{fraudMetrics.totalAlerts || 0}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Alerts</p>
                      <p className="text-2xl font-bold text-orange-600">{fraudMetrics.activeAlerts || 0}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Activity className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Blocked Users</p>
                      <p className="text-2xl font-bold text-red-600">{fraudMetrics.blockedUsers || 0}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Users className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Prevented Loss</p>
                      <p className="text-2xl font-bold text-green-600">${fraudMetrics.preventedLoss || 0}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-alerts"
                  />
                </div>

                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger data-testid="select-severity-filter">
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
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
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fraud Alerts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Fraud Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fraudAlerts && fraudAlerts.length > 0 ? (
                    fraudAlerts.map((alert: any) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{alert.type}</p>
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              {alert.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{alert.user?.username || 'Unknown'}</p>
                            <p className="text-sm text-gray-600">{alert.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{alert.offer?.name || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={alert.isResolved ? 'default' : 'secondary'}>
                            {alert.isResolved ? 'Resolved' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedAlert(alert)}
                                  data-testid={`button-view-alert-${alert.id}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Alert Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Type</label>
                                    <p>{selectedAlert?.type}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <p>{selectedAlert?.description}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Severity</label>
                                    <Badge variant={getSeverityBadgeVariant(selectedAlert?.severity)}>
                                      {selectedAlert?.severity}
                                    </Badge>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">User</label>
                                    <p>{selectedAlert?.user?.email}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {!alert.isResolved && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => resolveAlertMutation.mutate({ 
                                  alertId: alert.id, 
                                  isResolved: true 
                                })}
                                disabled={resolveAlertMutation.isPending}
                                data-testid={`button-resolve-alert-${alert.id}`}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-gray-500">
                          <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No fraud alerts found</p>
                          <p className="text-sm">Your system is secure</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}