import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import MetricsGrid from '@/components/dashboard/metrics-grid';
import RevenueChart from '@/components/dashboard/revenue-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/auth-context';
import { Link } from 'wouter';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Settings, 
  BarChart3, 
  Activity,
  Building,
  UserCheck,
  Globe,
  PieChart
} from 'lucide-react';

export default function OwnerDashboard() {
  const { t } = useTranslation();
  const { token, user } = useAuth();

  // Fetch owner metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/owner/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/owner/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch owner metrics');
      return response.json();
    },
    enabled: !!token
  });

  // Fetch business overview
  const { data: businessOverview } = useQuery({
    queryKey: ['/api/owner/business-overview'],
    queryFn: async () => {
      const response = await fetch('/api/owner/business-overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch business overview');
      return response.json();
    },
    enabled: !!token
  });

  // Fetch top performers
  const { data: topPerformers = [] } = useQuery({
    queryKey: ['/api/owner/top-performers'],
    queryFn: async () => {
      const response = await fetch('/api/owner/top-performers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch top performers');
      return response.json();
    },
    enabled: !!token
  });

  const dashboardMetrics = [
    {
      label: 'total_revenue',
      value: businessOverview?.totalRevenue ? `$${businessOverview.totalRevenue.toLocaleString()}` : '$0',
      change: '+24.8%',
      changeType: 'increase' as const,
      icon: 'fas fa-dollar-sign',
      iconBg: 'bg-green-50',
    },
    {
      label: 'active_advertisers',
      value: businessOverview?.activeAdvertisers?.toString() || '0',
      change: '+15',
      changeType: 'increase' as const,
      icon: 'fas fa-building',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'active_partners',
      value: businessOverview?.activePartners?.toString() || '0',
      change: '+42',
      changeType: 'increase' as const,
      icon: 'fas fa-users',
      iconBg: 'bg-purple-50',
    },
    {
      label: 'platform_growth',
      value: `${businessOverview?.platformGrowth || '0'}%`,
      change: '+8.2%',
      changeType: 'increase' as const,
      icon: 'fas fa-chart-line',
      iconBg: 'bg-orange-50',
    },
  ];

  const getPerformanceBadgeVariant = (performance: string) => {
    switch (performance.toLowerCase()) {
      case 'excellent':
        return 'default';
      case 'good':
        return 'secondary';
      case 'average':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <Header 
          title="Business Dashboard" 
          subtitle="Platform overview and strategic insights"
        />

        <div className="p-6 space-y-6">
          {/* Business Metrics */}
          {metricsLoading ? (
            <div className="text-center py-8">Loading business metrics...</div>
          ) : (
            <MetricsGrid metrics={dashboardMetrics} />
          )}

          {/* Executive Summary and Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueChart />
            
            {/* Strategic Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Strategic Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/owner/users">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-manage-users">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline" data-testid="button-business-settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Business Settings
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-platform-analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Platform Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-growth-insights">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Growth Insights
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Business Performance Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Top Performing Advertisers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Top Advertisers</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" data-testid="button-view-all-advertisers">
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.filter((p: any) => p.type === 'advertiser').length > 0 ? (
                    topPerformers.filter((p: any) => p.type === 'advertiser').slice(0, 5).map((advertiser: any) => (
                      <div
                        key={advertiser.id}
                        className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                        data-testid={`advertiser-${advertiser.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{advertiser.name}</p>
                            <p className="text-xs text-slate-500">{advertiser.activeOffers || 0} active offers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            ${advertiser.revenue?.toLocaleString() || '0'}
                          </p>
                          <Badge variant={getPerformanceBadgeVariant(advertiser.performance || 'average')}>
                            {advertiser.performance || 'Average'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No advertisers found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Partners */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Top Partners</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" data-testid="button-view-all-partners">
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.filter((p: any) => p.type === 'partner').length > 0 ? (
                    topPerformers.filter((p: any) => p.type === 'partner').slice(0, 5).map((partner: any) => (
                      <div
                        key={partner.id}
                        className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                        data-testid={`partner-${partner.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{partner.name}</p>
                            <p className="text-xs text-slate-500">{partner.conversions || 0} conversions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            ${partner.earnings?.toLocaleString() || '0'}
                          </p>
                          <Badge variant={getPerformanceBadgeVariant(partner.performance || 'average')}>
                            {partner.performance || 'Average'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No partners found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Intelligence Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>Business Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Revenue Growth</h4>
                  <p className="text-2xl font-bold text-green-600" data-testid="revenue-growth">
                    {businessOverview?.revenueGrowth || '+0'}%
                  </p>
                  <p className="text-xs text-slate-500">vs. last month</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">User Acquisition</h4>
                  <p className="text-2xl font-bold text-blue-600" data-testid="user-acquisition">
                    {businessOverview?.newUsers || 0}
                  </p>
                  <p className="text-xs text-slate-500">new users this month</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Platform Efficiency</h4>
                  <p className="text-2xl font-bold text-purple-600" data-testid="platform-efficiency">
                    {businessOverview?.platformEfficiency || '0'}%
                  </p>
                  <p className="text-xs text-slate-500">overall performance</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-8 h-8 text-orange-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Market Reach</h4>
                  <p className="text-2xl font-bold text-orange-600" data-testid="market-reach">
                    {businessOverview?.marketReach || 0}
                  </p>
                  <p className="text-xs text-slate-500">countries reached</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
