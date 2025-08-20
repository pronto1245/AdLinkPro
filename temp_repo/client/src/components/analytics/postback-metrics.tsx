import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { RefreshCw, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PostbackMetrics {
  summary: {
    totalPostbacks: number;
    successfulPostbacks: number;
    failedPostbacks: number;
    successRate: number;
    failureRate: number;
    avgResponseTime: number;
    activeTemplates: number;
  };
  errorFrequency: {
    errorType: string;
    count: number;
    percentage: number;
  }[];
  dateRange: {
    from: string;
    to: string;
  };
}

interface PostbackMetricsProps {
  dateFrom?: string;
  dateTo?: string;
  className?: string;
}

export default function PostbackMetrics({ dateFrom, dateTo, className = '' }: PostbackMetricsProps) {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: metrics, refetch, isLoading, error } = useQuery<PostbackMetrics>({
    queryKey: ['postback-analytics', dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      const response = await fetch(`/api/analytics/postback-analytics?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch postback analytics');
      }
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (rate: number) => {
    if (rate >= 95) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (rate >= 85) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Postback Analytics</CardTitle>
          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-red-600">Postback Analytics - Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load postback metrics</p>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Postback Analytics</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {metrics && (
          <div className="space-y-4">
            {/* Success Rate */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metrics.summary.successRate)}
                  <span className="text-sm font-medium">Success Rate</span>
                </div>
                <span className={`text-2xl font-bold ${getStatusColor(metrics.summary.successRate)}`}>
                  {metrics.summary.successRate}%
                </span>
              </div>
              <Progress value={metrics.summary.successRate} className="mt-1" />
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-muted-foreground">Successful</span>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {formatNumber(metrics.summary.successfulPostbacks)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-muted-foreground">Failed</span>
                </div>
                <div className="text-lg font-semibold text-red-600">
                  {formatNumber(metrics.summary.failedPostbacks)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-muted-foreground">Avg Response</span>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {metrics.summary.avgResponseTime}ms
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-muted-foreground">Templates</span>
                </div>
                <div className="text-lg font-semibold text-purple-600">
                  {metrics.summary.activeTemplates}
                </div>
              </div>
            </div>

            {/* Error Breakdown */}
            {metrics.errorFrequency.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Error Types</h4>
                {metrics.errorFrequency.map((error) => (
                  <div key={error.errorType} className="flex items-center justify-between">
                    <span className="text-xs">{error.errorType}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{error.count}</span>
                      <Badge variant="secondary" className="text-xs">
                        {error.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Date Range */}
            <div className="text-xs text-muted-foreground text-center border-t pt-2">
              {metrics.dateRange.from} to {metrics.dateRange.to}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}