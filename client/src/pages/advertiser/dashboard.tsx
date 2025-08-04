import { useQuery } from '@tanstack/react-query';
import { useSidebar } from '@/contexts/sidebar-context';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import MetricsGrid from '@/components/dashboard/metrics-grid';
import RevenueChart from '@/components/dashboard/revenue-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { Link } from 'wouter';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Eye } from 'lucide-react';

export default function AdvertiserDashboard() {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
  });

  // Fetch user's offers
  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ['/api/offers'],
  });

  // Fetch recent transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  const dashboardMetrics = [
    {
      label: 'Total Revenue',
      value: metrics?.totalRevenue ? `$${metrics.totalRevenue.toLocaleString()}` : '$0',
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Active Campaigns',
      value: metrics?.activeCampaigns || '0',
      change: '+3',
      changeType: 'increase' as const,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Total Clicks',
      value: metrics?.totalClicks ? metrics.totalClicks.toLocaleString() : '0',
      change: '+8.2%',
      changeType: 'increase' as const,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Conversion Rate',
      value: metrics?.conversionRate ? `${metrics.conversionRate}%` : '0%',
      change: '-0.3%',
      changeType: 'decrease' as const,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  if (metricsLoading || offersLoading || transactionsLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header title="Dashboard" />
          <main className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading dashboard...</p>
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
        <Header title="Dashboard" />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name || 'Advertiser'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's an overview of your campaign performance
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {dashboardMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <Card key={index} data-testid={`metric-card-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {metric.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {metric.value}
                        </p>
                        <p className={`text-sm flex items-center gap-1 mt-1 ${
                          metric.changeType === 'increase' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {metric.changeType === 'increase' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {metric.change}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                        <IconComponent className={`w-6 h-6 ${metric.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions && transactions.slice(0, 5).map((transaction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-sm">{transaction.description || 'Campaign Activity'}</p>
                        <p className="text-xs text-gray-600">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={transaction.type === 'credit' ? 'default' : 'secondary'}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount}
                      </Badge>
                    </div>
                  ))}
                  {(!transactions || transactions.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Offers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Offers</CardTitle>
                <Link href="/offers">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers && offers.slice(0, 6).map((offer: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm truncate">{offer.name}</h3>
                      <Badge 
                        variant={offer.status === 'active' ? 'default' : 'secondary'}
                        className="ml-2 text-xs"
                      >
                        {offer.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {offer.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Payout: ${offer.payout}</span>
                      <span className="text-green-600 font-medium">
                        {offer.conversionRate || 0}% CR
                      </span>
                    </div>
                  </div>
                ))}
                {(!offers || offers.length === 0) && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No active offers</p>
                    <Link href="/offers">
                      <Button variant="outline" size="sm" className="mt-2">
                        Browse Offers
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}