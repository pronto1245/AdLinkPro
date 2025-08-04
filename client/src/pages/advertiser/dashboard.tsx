import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import MetricsGrid from '@/components/dashboard/metrics-grid';
import RevenueChart from '@/components/dashboard/revenue-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import { Link } from 'wouter';

export default function AdvertiserDashboard() {
  const { t } = useLanguage();
  const { token, user } = useAuth();

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

  const { data: offers = [] } = useQuery({
    queryKey: ['/api/offers'],
    queryFn: async () => {
      const response = await fetch('/api/offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json();
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
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
      label: 'active_offers',
      value: offers.filter((offer: any) => offer.status === 'active').length.toString(),
      change: '+3',
      changeType: 'increase' as const,
      icon: 'fas fa-bullseye',
      iconBg: 'bg-green-50',
    },
    {
      label: 'total_partners',
      value: '0', // This would need to be calculated from partner assignments
      change: '+5.2%',
      changeType: 'increase' as const,
      icon: 'fas fa-users',
      iconBg: 'bg-purple-50',
    },
    {
      label: 'conversion_rate',
      value: `${metrics?.conversionRate || '0'}%`,
      change: '-1.1%',
      changeType: 'decrease' as const,
      icon: 'fas fa-chart-line',
      iconBg: 'bg-orange-50',
    },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTransactionStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

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

          {/* Charts and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueChart />
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/offers">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-manage-offers">
                    <i className="fas fa-bullseye mr-2"></i>
                    Manage Offers
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline" data-testid="button-view-partners">
                  <i className="fas fa-users mr-2"></i>
                  View Partners
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-analytics">
                  <i className="fas fa-chart-bar mr-2"></i>
                  View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-postbacks">
                  <i className="fas fa-link mr-2"></i>
                  Configure Postbacks
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* My Offers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Offers</CardTitle>
                  <Link href="/admin/offers">
                    <Button size="sm" data-testid="button-create-new-offer">
                      <i className="fas fa-plus mr-2"></i>
                      Create New
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {offers.length > 0 ? (
                    offers.slice(0, 5).map((offer: any) => (
                      <div
                        key={offer.id}
                        className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                        data-testid={`offer-${offer.id}`}
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{offer.name}</p>
                          <p className="text-xs text-slate-500">{offer.category} • {offer.payoutType.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {offer.currency} {offer.payout}
                          </p>
                          <Badge variant={getStatusBadgeVariant(offer.status)}>
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-bullseye text-4xl text-slate-300 mb-4"></i>
                      <p className="text-slate-500">No offers created yet</p>
                      <Link href="/admin/offers">
                        <Button className="mt-2" size="sm">Create Your First Offer</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" data-testid="button-view-all-transactions">
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length > 0 ? (
                    transactions.slice(0, 5).map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border border-slate-100 rounded-lg"
                        data-testid={`transaction-${transaction.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-100' : 
                            transaction.type === 'withdrawal' ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            <i className={`fas ${
                              transaction.type === 'deposit' ? 'fa-arrow-down text-green-600' :
                              transaction.type === 'withdrawal' ? 'fa-arrow-up text-red-600' :
                              'fa-exchange-alt text-blue-600'
                            } text-xs`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 capitalize">{transaction.type}</p>
                            <p className="text-xs text-slate-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {transaction.type === 'withdrawal' ? '-' : '+'}
                            {transaction.currency} {transaction.amount}
                          </p>
                          <Badge variant={getTransactionStatusVariant(transaction.status)}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-receipt text-4xl text-slate-300 mb-4"></i>
                      <p className="text-slate-500">No transactions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-mouse-pointer text-blue-600 text-xl"></i>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Total Clicks</h4>
                  <p className="text-2xl font-bold text-blue-600" data-testid="total-clicks">0</p>
                  <p className="text-xs text-slate-500">Last 30 days</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-check-circle text-green-600 text-xl"></i>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Conversions</h4>
                  <p className="text-2xl font-bold text-green-600" data-testid="total-conversions">0</p>
                  <p className="text-xs text-slate-500">Last 30 days</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-percentage text-purple-600 text-xl"></i>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Average CR</h4>
                  <p className="text-2xl font-bold text-purple-600" data-testid="average-cr">0%</p>
                  <p className="text-xs text-slate-500">All time</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-dollar-sign text-orange-600 text-xl"></i>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">Total Payout</h4>
                  <p className="text-2xl font-bold text-orange-600" data-testid="total-payout">$0</p>
                  <p className="text-xs text-slate-500">All time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
