import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface LiveMetricsProps {
  title: string;
  userRole: string;
}

export default function LiveMetrics({ title, userRole }: LiveMetricsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    activeUsers: Math.floor(Math.random() * 500) + 100,
    liveTraffic: Math.floor(Math.random() * 50) + 10,
    realtimeRevenue: (Math.random() * 10000).toFixed(2),
    conversionRate: (Math.random() * 5 + 1).toFixed(2),
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMetrics({
        activeUsers: Math.floor(Math.random() * 500) + 100,
        liveTraffic: Math.floor(Math.random() * 50) + 10,
        realtimeRevenue: (Math.random() * 10000).toFixed(2),
        conversionRate: (Math.random() * 5 + 1).toFixed(2),
      });
      setIsRefreshing(false);
    }, 1000);
  };

  // Auto refresh every 30 seconds
  useState(() => {
    const interval = setInterval(() => {
      if (!isRefreshing) {
        handleRefresh();
      }
    }, 30000);
    return () => clearInterval(interval);
  });

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            {title} - Live Metrics
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 dark:text-green-400">Live</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="refresh-metrics"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Active Users</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100" data-testid="active-users">
              {metrics.activeUsers}
            </p>
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +5.2%
            </Badge>
          </div>

          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Live Traffic</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100" data-testid="live-traffic">
              {metrics.liveTraffic}
            </p>
            <Badge variant="outline" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
          </div>

          {(userRole === 'super_admin' || userRole === 'owner' || userRole === 'advertiser') && (
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xs">$</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Live Revenue</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100" data-testid="live-revenue">
                ${metrics.realtimeRevenue}
              </p>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.8%
              </Badge>
            </div>
          )}

          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xs">%</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Conversion Rate</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100" data-testid="conversion-rate">
              {metrics.conversionRate}%
            </p>
            <Badge variant="outline" className="text-xs">
              <TrendingDown className="w-3 h-3 mr-1" />
              -0.3%
            </Badge>
          </div>
        </div>

        {/* Role-specific quick actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          {userRole === 'super_admin' && (
            <>
              <Button size="sm" variant="outline" data-testid="system-health">
                System Health
              </Button>
              <Button size="sm" variant="outline" data-testid="user-activity">
                User Activity
              </Button>
            </>
          )}
          {userRole === 'advertiser' && (
            <>
              <Button size="sm" variant="outline" data-testid="campaign-performance">
                Campaign Performance
              </Button>
              <Button size="sm" variant="outline" data-testid="partner-activity">
                Partner Activity
              </Button>
            </>
          )}
          {(userRole === 'affiliate' || userRole === 'partner') && (
            <>
              <Button size="sm" variant="outline" data-testid="offer-performance">
                Offer Performance
              </Button>
              <Button size="sm" variant="outline" data-testid="earnings-tracker">
                Earnings Tracker
              </Button>
            </>
          )}
          {userRole === 'staff' && (
            <>
              <Button size="sm" variant="outline" data-testid="ticket-queue">
                Ticket Queue
              </Button>
              <Button size="sm" variant="outline" data-testid="user-support">
                User Support
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}