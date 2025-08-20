import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import { useAuth } from '@/contexts/auth-context';

export default function AdvertiserDashboard() {
  const { user } = useAuth();

  const dashboardConfig = {
    role: 'advertiser' as const,
    apiEndpoint: '/api/advertiser/dashboard',
    title: 'advertiser_dashboard',
    metrics: ['total_revenue', 'total_clicks', 'total_conversions', 'active_offers'],
    charts: ['revenue_trend', 'conversion_metrics', 'performance_overview'],
    realTimeUpdates: true
  };

  return (
    <div className="space-y-6">
      <UnifiedDashboard config={dashboardConfig} />
    </div>
  );
}