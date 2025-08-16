import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Activity {
  id: string;
  type: 'user_registration' | 'offer_published' | 'fraud_alert' | 'payout_processed';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconBg: string;
}

interface RecentActivityProps {
  activities?: Activity[];
}

const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'user_registration',
    title: 'New partner registered',
    description: 'john.doe@example.com',
    timestamp: '2 minutes ago',
    icon: 'fas fa-user-plus',
    iconBg: 'bg-green-100',
  },
  {
    id: '2',
    type: 'offer_published',
    title: 'New offer published',
    description: 'Crypto Exchange - $150 CPA',
    timestamp: '15 minutes ago',
    icon: 'fas fa-bullseye',
    iconBg: 'bg-blue-100',
  },
  {
    id: '3',
    type: 'fraud_alert',
    title: 'Fraud alert triggered',
    description: 'Suspicious activity detected',
    timestamp: '1 hour ago',
    icon: 'fas fa-exclamation-triangle',
    iconBg: 'bg-yellow-100',
  },
  {
    id: '4',
    type: 'payout_processed',
    title: 'Payout processed',
    description: '$2,450 to affiliate #1248',
    timestamp: '3 hours ago',
    icon: 'fas fa-dollar-sign',
    iconBg: 'bg-green-100',
  },
];

export default function RecentActivity({ activities = defaultActivities }: RecentActivityProps) {
  const { t } = useTranslation();

  const getIconColor = (iconBg: string) => {
    if (iconBg.includes('green')) return 'text-green-600';
    if (iconBg.includes('blue')) return 'text-blue-600';
    if (iconBg.includes('yellow')) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('recent_activity')}</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" data-testid="button-view-all-activity">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
              <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center mt-1`}>
                <i className={`${activity.icon} ${getIconColor(activity.iconBg)} text-xs`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900">{activity.title}</p>
                <p className="text-xs text-slate-500">{activity.description}</p>
                <p className="text-xs text-slate-400 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
