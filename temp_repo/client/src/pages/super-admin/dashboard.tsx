import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import MetricsGrid from '@/components/dashboard/metrics-grid';
import LiveMetrics from '@/components/dashboard/live-metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/auth-context';
import { Link } from 'wouter';
import { 
  Users, 
  Target, 
  DollarSign, 
  AlertTriangle, 
  Shield, 
  Settings, 
  BarChart3, 
  Activity,
  Database,
  UserCheck,
  Globe
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const { token, user } = useAuth();

  // Fetch super admin metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/admin/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch admin metrics');
      return response.json();
    },
    enabled: !!token
  });

  // Fetch system stats
  const { data: systemStats } = useQuery({
    queryKey: ['/api/admin/system-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/system-stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch system stats');
      return response.json();
    },
    enabled: !!token
  });

  // Fetch recent activity
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['/api/admin/recent-activity'],
    queryFn: async () => {
      const response = await fetch('/api/admin/recent-activity', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch recent activity');
      return response.json();
    },
    enabled: !!token
  });

  const dashboardMetrics = [
    {
      label: 'total_users',
      value: systemStats?.totalUsers?.toString() || '0',
      change: '+8',
      changeType: 'increase' as const,
      icon: 'fas fa-users',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'active_offers',
      value: systemStats?.totalOffers?.toString() || '0', 
      change: '+12',
      changeType: 'increase' as const,
      icon: 'fas fa-bullseye',
      iconBg: 'bg-green-50',
    },
    {
      label: 'total_revenue',
      value: systemStats?.totalRevenue ? `$${systemStats.totalRevenue.toLocaleString()}` : '$0',
      change: '+18.2%',
      changeType: 'increase' as const,
      icon: 'fas fa-dollar-sign',
      iconBg: 'bg-purple-50',
    },
    {
      label: 'conversion_rate',
      value: `${systemStats?.avgConversionRate || '0'}%`,
      change: '+2.1%',
      changeType: 'increase' as const,
      icon: 'fas fa-chart-line',
      iconBg: 'bg-orange-50',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <Header 
          title="Super Admin Dashboard" 
          subtitle="System overview and management"
        />

        <div className="p-6 space-y-6">
          {/* Live Metrics */}
          <LiveMetrics title="Super Admin" userRole="super_admin" />

          {/* System Metrics */}
          {metricsLoading ? (
            <div className="text-center py-8">Loading system metrics...</div>
          ) : (
            <MetricsGrid metrics={dashboardMetrics} />
          )}

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* User Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/super-admin/users">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-manage-users">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline" data-testid="button-role-permissions">
                  <Shield className="w-4 h-4 mr-2" />
                  Role Permissions  
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-audit-logs">
                  <Activity className="w-4 h-4 mr-2" />
                  Audit Logs
                </Button>
              </CardContent>
            </Card>

            {/* Content Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-sm">
                  <Target className="w-4 h-4 mr-2" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/super-admin/offers">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-manage-offers">
                    <Target className="w-4 h-4 mr-2" />
                    Manage Offers
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline" data-testid="button-categories">
                  <Settings className="w-4 h-4 mr-2" />
                  Categories
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-content-moderation">
                  <Shield className="w-4 h-4 mr-2" />
                  Content Moderation
                </Button>
              </CardContent>
            </Card>

            {/* Analytics & Reports */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/super-admin/analytics">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-system-analytics">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    System Analytics
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline" data-testid="button-revenue-reports">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Revenue Reports
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-performance-reports">
                  <Activity className="w-4 h-4 mr-2" />
                  Performance Reports
                </Button>
              </CardContent>
            </Card>

            {/* System Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-sm">
                  <Database className="w-4 h-4 mr-2" />
                  System Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" data-testid="button-system-settings">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-api-management">
                  <Globe className="w-4 h-4 mr-2" />
                  API Management
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-system-health">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  System Health
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Overview and Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">API Server</span>
                    </div>
                    <Badge variant="default">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Database</span>
                    </div>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium">Queue System</span>
                    </div>
                    <Badge variant="secondary">Processing</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Cache</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent System Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border border-slate-100 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                          <p className="text-xs text-slate-500">
                            {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Statistics Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Total Users</h4>
                  <p className="text-2xl font-bold text-blue-600" data-testid="platform-total-users">
                    {systemStats?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-slate-500">All user types</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Active Campaigns</h4>
                  <p className="text-2xl font-bold text-green-600" data-testid="platform-active-campaigns">
                    {systemStats?.activeCampaigns || 0}
                  </p>
                  <p className="text-xs text-slate-500">Currently running</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Monthly Revenue</h4>
                  <p className="text-2xl font-bold text-purple-600" data-testid="platform-monthly-revenue">
                    ${systemStats?.monthlyRevenue?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-slate-500">This month</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-8 h-8 text-orange-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Avg Performance</h4>
                  <p className="text-2xl font-bold text-orange-600" data-testid="platform-avg-performance">
                    {systemStats?.avgPerformance || '0'}%
                  </p>
                  <p className="text-xs text-slate-500">Platform-wide CR</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
