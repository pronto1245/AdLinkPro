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
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Eye, MousePointer } from 'lucide-react';

export default function AffiliateDashboard() {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/affiliate/metrics'],
  });

  // Fetch available offers
  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ['/api/offers'],
  });

  // Fetch affiliate earnings
  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ['/api/affiliate/earnings'],
  });

  const dashboardMetrics = [
    {
      label: 'Total Earnings',
      value: metrics?.totalEarnings ? `$${metrics.totalEarnings.toLocaleString()}` : '$0',
      change: '+15.3%',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Active Links',
      value: metrics?.activeLinks || '0',
      change: '+5',
      changeType: 'increase' as const,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Total Clicks',
      value: metrics?.totalClicks ? metrics.totalClicks.toLocaleString() : '0',
      change: '+12.7%',
      changeType: 'increase' as const,
      icon: MousePointer,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Conversion Rate',
      value: metrics?.conversionRate ? `${metrics.conversionRate}%` : '0%',
      change: '+0.8%',
      changeType: 'increase' as const,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  if (metricsLoading || offersLoading || earningsLoading) {
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
              Welcome back, {user?.name || 'Affiliate'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your affiliate performance and earnings
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
            {/* Earnings Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart />
              </CardContent>
            </Card>

            {/* Recent Earnings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earnings && earnings.slice(0, 5).map((earning: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-sm">{earning.offerName || 'Commission'}</p>
                        <p className="text-xs text-gray-600">{new Date(earning.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="default">
                        +${earning.amount}
                      </Badge>
                    </div>
                  ))}
                  {(!earnings || earnings.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      No recent earnings
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Offers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Performing Offers</CardTitle>
                <Link href="/offers">
                  <Button variant="outline" size="sm">
                    Browse All
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
                    <div className="mt-2">
                      <Button size="sm" className="w-full text-xs">
                        Get Link
                      </Button>
                    </div>
                  </div>
                ))}
                {(!offers || offers.length === 0) && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No offers available</p>
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