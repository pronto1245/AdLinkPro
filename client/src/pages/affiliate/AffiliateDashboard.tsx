import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import { useAuth } from '@/contexts/auth-context';

export default function AffiliateDashboard() {
  const { user } = useAuth();

  const dashboardConfig = {
    role: 'affiliate' as const,
    apiEndpoint: '/api/affiliate/dashboard',
    title: 'affiliate_dashboard',
    metrics: ['clicks', 'conversions', 'revenue', 'conversion_rate', 'approved_offers'],
    charts: ['performance_trend', 'offer_performance', 'daily_stats'],
    realTimeUpdates: true
  };

  return (
    <div className="space-y-6">
      <UnifiedDashboard config={dashboardConfig} />
    </div>
  );
}