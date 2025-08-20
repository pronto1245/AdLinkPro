import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import { useAuth } from '@/contexts/auth-context';

export default function OwnerDashboard() {
  const { user } = useAuth();

  const dashboardConfig = {
    role: 'owner' as const,
    apiEndpoint: '/api/owner/metrics',
    title: 'owner_dashboard',
    metrics: ['total_revenue', 'active_advertisers', 'active_partners', 'platform_growth'],
    charts: ['revenue_trend', 'business_overview', 'top_performers'],
    realTimeUpdates: true
  };

  return (
    <div className="space-y-6">
      <UnifiedDashboard config={dashboardConfig} />
    </div>
  );
}