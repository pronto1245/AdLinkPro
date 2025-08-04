import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Target,
  DollarSign,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function SuperAdminDashboard() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['/api/admin/recent-activity'],
    queryFn: async () => {
      const response = await fetch('/api/admin/recent-activity', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch recent activity');
      return response.json();
    },
  });

  const { data: systemAlerts } = useQuery({
    queryKey: ['/api/admin/system-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/admin/system-alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch system alerts');
      return response.json();
    },
  });

  const dashboardMetrics = [
    {
      title: 'total_users',
      value: metrics?.totalUsers?.toString() || '0',
      change: '+5.2%',
      changeType: 'increase' as const,
      icon: <Users className="w-6 h-6" />,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'active_offers',
      value: metrics?.activeOffers?.toString() || '0',
      change: '+2.1%',
      changeType: 'increase' as const,
      icon: <Target className="w-6 h-6" />,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'total_revenue',
      value: `$${metrics?.totalRevenue || '0'}`,
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: <DollarSign className="w-6 h-6" />,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'fraud_alerts',
      value: metrics?.fraudAlerts?.toString() || '0',
      change: '-15.3%',
      changeType: 'decrease' as const,
      icon: <Shield className="w-6 h-6" />,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <Header title={t('dashboard')} />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <Header title={t('dashboard')} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('welcome_back')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('super_admin_dashboard_subtitle')}
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dashboardMetrics.map((metric, index) => (
                <Card key={index} data-testid={`metric-card-${metric.title}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {t(metric.title)}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2" data-testid={`metric-value-${metric.title}`}>
                          {metric.value}
                        </p>
                        <div className={`flex items-center mt-2 text-sm ${
                          metric.changeType === 'increase' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {metric.changeType === 'increase' ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 mr-1" />
                          )}
                          {metric.change}
                        </div>
                      </div>
                      <div className={`${metric.iconBg} p-3 rounded-lg`}>
                        <div className={metric.iconColor}>
                          {metric.icon}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {t('recent_activity')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg" data-testid={`activity-${index}`}>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        {t('no_recent_activity')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {t('system_alerts')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemAlerts?.slice(0, 5).map((alert: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg" data-testid={`alert-${index}`}>
                        <div className={`p-1 rounded ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {alert.type === 'security' ? <Shield className="w-4 h-4" /> :
                           alert.type === 'performance' ? <Activity className="w-4 h-4" /> :
                           <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {alert.title}
                            </p>
                            <Badge variant={alert.resolved ? 'default' : 'destructive'}>
                              {alert.resolved ? t('resolved') : t('active')}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {alert.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        {t('no_system_alerts')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quick_actions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" data-testid="button-create-user">
                    <Users className="w-6 h-6" />
                    <span className="text-sm">{t('create_user')}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" data-testid="button-create-offer">
                    <Target className="w-6 h-6" />
                    <span className="text-sm">{t('create_offer')}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" data-testid="button-view-reports">
                    <Activity className="w-6 h-6" />
                    <span className="text-sm">{t('view_reports')}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2" 
                    data-testid="button-system-settings"
                    onClick={() => setLocation('/admin/fraud')}
                  >
                    <Shield className="w-6 h-6" />
                    <span className="text-sm">Антифрод</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}