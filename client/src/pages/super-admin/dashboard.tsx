import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import { useAuth } from '@/contexts/auth-context';

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  const dashboardConfig = {
    role: 'super_admin' as const,
    apiEndpoint: '/api/admin/metrics',
    title: 'admin_dashboard',
    metrics: ['total_users', 'total_offers', 'total_revenue', 'fraud_alerts', 'system_health'],
    charts: ['user_growth', 'revenue_trend', 'system_stats'],
    realTimeUpdates: true
  };

  return (
    <div className="space-y-6">
      <UnifiedDashboard config={dashboardConfig} />
    </div>
  );
}
