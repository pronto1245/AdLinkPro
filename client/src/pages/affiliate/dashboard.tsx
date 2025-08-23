import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import { useAuth } from '@/contexts/auth-context';

export default function AffiliateDashboard() {
  const { user } = useAuth();

  const dashboardConfig = {
    role: 'affiliate' as const,
    apiEndpoint: '/api/affiliate/dashboard',
    title: 'affiliate_dashboard',
    metrics: ['total_clicks', 'total_conversions', 'total_revenue', 'active_offers', 'conversion_rate', 'epc'],
    charts: ['performance_trend', 'conversion_analytics', 'offer_performance'],
    realTimeUpdates: true
  };

  return (
    <div className="space-y-6">
      <UnifiedDashboard config={dashboardConfig} />
    </div>
  );
}
