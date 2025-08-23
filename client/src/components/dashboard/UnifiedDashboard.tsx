import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/theme-context';
import { useTranslation } from 'react-i18next';
import { useWebSocket } from '@/hooks/useWebSocket';
import { NotificationToast } from '@/components/ui/notification-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  MousePointer, 
  Target, 
  Activity,
  RefreshCw,
  Bell
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MetricCard {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface DashboardConfig {
  role: 'owner' | 'advertiser' | 'partner' | 'affiliate' | 'super_admin' | 'staff';
  apiEndpoint: string;
  title: string;
  metrics: string[];
  charts: string[];
  realTimeUpdates: boolean;
}

interface UnifiedDashboardProps {
  config: DashboardConfig;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function UnifiedDashboard({ config }: UnifiedDashboardProps) {
  const { t } = useTranslation();
  const { theme } = useTheme() || { theme: 'light' };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket(
    config.realTimeUpdates ? 'wss://localhost:8080' : null,
    {
      onMessage: (message) => {
        if (message.type === 'dashboard_update') {
          queryClient.invalidateQueries({ queryKey: [config.apiEndpoint] });
          
          // Show notification for significant changes
          if (message.data.change > 10) {
            setNotifications(prev => [
              ...prev,
              {
                id: Date.now(),
                type: 'info',
                title: 'Dashboard Update',
                message: `${message.data.metric} changed by ${message.data.change}%`,
                timestamp: new Date()
              }
            ]);
          }
        }
      }
    }
  );

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: [config.apiEndpoint, refreshKey],
    queryFn: async () => {
      const response = await fetch(config.apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }
      
      return response.json();
    },
    refetchInterval: config.realTimeUpdates ? 30000 : 60000, // Auto-refresh
    refetchOnWindowFocus: true
  });

  // Handle errors separately
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Dashboard Error',
        description: (error as Error).message || 'Failed to load dashboard data',
        variant: 'destructive'
      });
    }
  }, [error, toast]);

  // Manual refresh handler
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
    
    toast({
      title: 'Dashboard Refreshed',
      description: 'Data has been updated',
      variant: 'default'
    });
  };

  // Generate metric cards based on role and data
  const generateMetricCards = (): MetricCard[] => {
    if (!dashboardData) {return [];}

    const baseMetrics: MetricCard[] = [];

    // Common metrics for all roles
    if (dashboardData.totalRevenue !== undefined) {
      baseMetrics.push({
        label: 'total_revenue',
        value: `$${Number(dashboardData.totalRevenue).toLocaleString()}`,
        change: '+12.5%',
        changeType: 'positive',
        icon: DollarSign,
        color: 'text-green-600'
      });
    }

    if (dashboardData.totalClicks !== undefined) {
      baseMetrics.push({
        label: 'total_clicks',
        value: Number(dashboardData.totalClicks).toLocaleString(),
        change: '+8.2%',
        changeType: 'positive',
        icon: MousePointer,
        color: 'text-blue-600'
      });
    }

    if (dashboardData.totalConversions !== undefined) {
      baseMetrics.push({
        label: 'total_conversions',
        value: Number(dashboardData.totalConversions).toLocaleString(),
        change: '+15.3%',
        changeType: 'positive',
        icon: Target,
        color: 'text-purple-600'
      });
    }

    // Role-specific metrics
    switch (config.role) {
      case 'owner':
        if (dashboardData.activeAdvertisers !== undefined) {
          baseMetrics.push({
            label: 'active_advertisers',
            value: dashboardData.activeAdvertisers,
            change: '+3',
            changeType: 'positive',
            icon: Users,
            color: 'text-indigo-600'
          });
        }
        if (dashboardData.activePartners !== undefined) {
          baseMetrics.push({
            label: 'active_partners',
            value: dashboardData.activePartners,
            change: '+7',
            changeType: 'positive',
            icon: Users,
            color: 'text-pink-600'
          });
        }
        break;

      case 'super_admin':
        if (dashboardData.totalUsers !== undefined) {
          baseMetrics.push({
            label: 'total_users',
            value: dashboardData.totalUsers,
            change: '+5',
            changeType: 'positive',
            icon: Users,
            color: 'text-cyan-600'
          });
        }
        if (dashboardData.fraudAlerts !== undefined) {
          baseMetrics.push({
            label: 'fraud_alerts',
            value: dashboardData.fraudAlerts,
            change: '-2',
            changeType: 'positive',
            icon: Activity,
            color: 'text-red-600'
          });
        }
        break;

      case 'partner':
      case 'affiliate':
        if (dashboardData.activeOffers !== undefined) {
          baseMetrics.push({
            label: 'active_offers',
            value: dashboardData.activeOffers,
            change: '+2',
            changeType: 'positive',
            icon: Target,
            color: 'text-orange-600'
          });
        }
        if (dashboardData.conversionRate !== undefined) {
          baseMetrics.push({
            label: 'conversion_rate',
            value: `${Number(dashboardData.conversionRate).toFixed(2)}%`,
            change: '+0.5%',
            changeType: 'positive',
            icon: TrendingUp,
            color: 'text-green-600'
          });
        }
        break;
    }

    return baseMetrics;
  };

  // Generate chart data
  const generateChartData = () => {
    if (!dashboardData?.chartData) {
      // Generate mock data for demonstration
      return Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 1000) + 500,
        conversions: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 5000) + 1000
      }));
    }
    return dashboardData.chartData;
  };

  const metricCards = generateMetricCards();
  const chartData = generateChartData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">
            {t('dashboard_error_title')}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('dashboard_error_message')}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('retry')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t(config.title)}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard_welcome')} - {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Real-time status indicator */}
          {config.realTimeUpdates && (
            <div className="flex items-center space-x-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-gray-600">
                {isConnected ? t('live') : t('disconnected')}
              </span>
            </div>
          )}
          
          {/* Notification bell */}
          <Button
            variant="outline"
            size="sm"
            className="relative"
            onClick={() => {/* Show notifications */}}
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </Button>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <Card 
            key={index} 
            className="transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t(metric.label)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {metric.value}
                  </p>
                  {metric.change && (
                    <div className="flex items-center mt-2">
                      {metric.changeType === 'positive' ? (
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${
                        metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        {t('vs_last_month')}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('revenue_trend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('conversion_metrics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Conversions', value: dashboardData?.totalConversions || 0 },
                    { name: 'Clicks', value: (dashboardData?.totalClicks || 0) - (dashboardData?.totalConversions || 0) }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {(chartData as any[]).map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
          }}
        />
      ))}
    </div>
  );
}