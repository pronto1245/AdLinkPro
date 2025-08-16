import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useTranslation } from 'react-i18next';

interface RevenueChartProps {
  data?: any[];
}

export default function RevenueChart({ data = [] }: RevenueChartProps) {
  const { t } = useTranslation();

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('revenue_overview')}</CardTitle>
            <p className="text-sm text-slate-600">Last 7 days performance</p>
          </div>
          <Select defaultValue="7days">
            <SelectTrigger className="w-[140px]" data-testid="chart-period-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart placeholder - In a real app, you'd use a charting library like Chart.js or Recharts */}
        <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-end justify-center space-x-2 p-4" data-testid="revenue-chart">
          <div className="bg-white bg-opacity-20 rounded-t w-8 h-16"></div>
          <div className="bg-white bg-opacity-30 rounded-t w-8 h-24"></div>
          <div className="bg-white bg-opacity-40 rounded-t w-8 h-32"></div>
          <div className="bg-white bg-opacity-60 rounded-t w-8 h-40"></div>
          <div className="bg-white bg-opacity-80 rounded-t w-8 h-48"></div>
          <div className="bg-white bg-opacity-50 rounded-t w-8 h-36"></div>
          <div className="bg-white bg-opacity-70 rounded-t w-8 h-44"></div>
        </div>
      </CardContent>
    </Card>
  );
}
