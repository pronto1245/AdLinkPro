import { Card, CardContent } from '@/components/ui/card';

interface Metric {
  label: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: string;
  iconBg: string;
}

interface MetricsGridProps {
  metrics: Metric[];
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="metric-card transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{t(metric.label)}</p>
                <p className="text-2xl font-bold text-slate-900" data-testid={`metric-${metric.label}-value`}>
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  <i className={`fas fa-arrow-${metric.changeType === 'increase' ? 'up' : 'down'} text-${metric.changeType === 'increase' ? 'green' : 'red'}-500 text-xs`}></i>
                  <span className={`text-xs text-${metric.changeType === 'increase' ? 'green' : 'red'}-600 ml-1`}>
                    {metric.change}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                <i className={`${metric.icon} text-${metric.iconBg.includes('blue') ? 'blue' : metric.iconBg.includes('green') ? 'green' : metric.iconBg.includes('purple') ? 'purple' : 'red'}-500`}></i>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
