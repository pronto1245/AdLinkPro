import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import MetricsGrid from '@/components/dashboard/metrics-grid';
import RevenueChart from '@/components/dashboard/revenue-chart';
import RecentActivity from '@/components/dashboard/recent-activity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';

export default function SuperAdminDashboard() {
  const { t } = useLanguage();
  const { token } = useAuth();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
  });

  const dashboardMetrics = [
    {
      label: 'total_revenue',
      value: metrics?.totalRevenue ? `$${metrics.totalRevenue}` : '$0',
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: 'fas fa-dollar-sign',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'active_partners',
      value: metrics?.activePartners?.toString() || '0',
      change: '+8.2%',
      changeType: 'increase' as const,
      icon: 'fas fa-users',
      iconBg: 'bg-green-50',
    },
    {
      label: 'conversion_rate',
      value: `${metrics?.conversionRate || '0'}%`,
      change: '-2.1%',
      changeType: 'decrease' as const,
      icon: 'fas fa-chart-line',
      iconBg: 'bg-purple-50',
    },
    {
      label: 'fraud_rate',
      value: `${metrics?.fraudRate || '0'}%`,
      change: '-0.05%',
      changeType: 'decrease' as const,
      icon: 'fas fa-shield-alt',
      iconBg: 'bg-red-50',
    },
  ];

  // Mock data for top performers
  const topPerformers = [
    {
      id: '1',
      name: 'John Doe',
      initials: 'JD',
      partnerId: '#1248',
      revenue: '$24,890',
      conversionRate: '4.2%',
      bgColor: 'bg-gradient-to-br from-blue-500 to-purple-600',
    },
    {
      id: '2',
      name: 'Alice Smith',
      initials: 'AS',
      partnerId: '#1156',
      revenue: '$18,750',
      conversionRate: '3.8%',
      bgColor: 'bg-gradient-to-br from-green-500 to-teal-600',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      initials: 'MJ',
      partnerId: '#1089',
      revenue: '$15,290',
      conversionRate: '3.1%',
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-600',
    },
  ];

  // Mock data for recent offers
  const recentOffers = [
    {
      id: '1',
      name: 'Crypto Exchange Pro',
      category: 'Finance',
      type: 'CPA',
      payout: '$150',
      status: 'Active',
      logo: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40',
    },
    {
      id: '2',
      name: 'FitLife Premium',
      category: 'Health',
      type: 'CPS',
      payout: '$75',
      status: 'Active',
      logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40',
    },
    {
      id: '3',
      name: 'ShopMaster',
      category: 'E-commerce',
      type: 'CPA',
      payout: '$45',
      status: 'Pending',
      logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <Header 
          title="dashboard" 
          subtitle="welcome"
        />

        <div className="p-6 space-y-6">
          {/* Metrics Grid */}
          {metricsLoading ? (
            <div className="text-center py-8">Loading metrics...</div>
          ) : (
            <MetricsGrid metrics={dashboardMetrics} />
          )}

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueChart />
            <RecentActivity />
          </div>

          {/* Data Tables Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Top Performing Partners */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('top_performers')}</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" data-testid="button-view-all-partners">
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Partner</th>
                        <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Revenue</th>
                        <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">CR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topPerformers.map((partner) => (
                        <tr key={partner.id} data-testid={`partner-row-${partner.id}`}>
                          <td className="py-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 ${partner.bgColor} rounded-full flex items-center justify-center`}>
                                <span className="text-white text-xs font-medium">{partner.initials}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{partner.name}</p>
                                <p className="text-xs text-slate-500">ID: {partner.partnerId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <p className="text-sm font-semibold text-slate-900">{partner.revenue}</p>
                          </td>
                          <td className="py-3">
                            <Badge variant="secondary" className="bg-green-100 text-green-600 hover:bg-green-100">
                              {partner.conversionRate}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Offers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('recent_offers')}</CardTitle>
                  <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-offer">
                    <i className="fas fa-plus mr-2"></i>
                    {t('create_offer')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                      data-testid={`offer-row-${offer.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={offer.logo}
                          alt={`${offer.name} Logo`}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{offer.name}</p>
                          <p className="text-xs text-slate-500">{offer.type} • {offer.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{offer.payout}</p>
                        <Badge 
                          variant={offer.status === 'Active' ? 'secondary' : 'outline'}
                          className={offer.status === 'Active' ? 'bg-green-100 text-green-600 hover:bg-green-100' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-100'}
                        >
                          {offer.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status & Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-heartbeat text-green-600 text-xl"></i>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">System Health</h4>
                  <p className="text-2xl font-bold text-green-600" data-testid="system-uptime">99.9%</p>
                  <p className="text-xs text-slate-500">Uptime</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-tachometer-alt text-blue-600 text-xl"></i>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">API Performance</h4>
                  <p className="text-2xl font-bold text-blue-600" data-testid="api-response-time">142ms</p>
                  <p className="text-xs text-slate-500">Avg Response</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Active Issues</h4>
                  <p className="text-2xl font-bold text-red-600" data-testid="active-issues">
                    {metrics?.fraudAlerts || 0}
                  </p>
                  <p className="text-xs text-slate-500">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
