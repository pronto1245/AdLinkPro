import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  MousePointer,
  Eye,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react';

export default function Analytics() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock analytics data - in real app this would come from API
  const analyticsData = {
    revenue: [
      { name: 'Jan', value: 4500, growth: 12 },
      { name: 'Feb', value: 5200, growth: 15 },
      { name: 'Mar', value: 4800, growth: -8 },
      { name: 'Apr', value: 6100, growth: 27 },
      { name: 'May', value: 7300, growth: 20 },
      { name: 'Jun', value: 8900, growth: 22 },
    ],
    users: [
      { name: 'Advertisers', value: 45, color: '#3B82F6' },
      { name: 'Affiliates', value: 320, color: '#10B981' },
      { name: 'Staff', value: 12, color: '#F59E0B' },
    ],
    offers: [
      { name: 'Week 1', active: 120, paused: 25, pending: 8 },
      { name: 'Week 2', active: 135, paused: 30, pending: 12 },
      { name: 'Week 3', active: 142, paused: 18, pending: 15 },
      { name: 'Week 4', active: 158, paused: 22, pending: 10 },
    ],
  };

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$125,430',
      change: '+18.2%',
      changeType: 'increase' as const,
      icon: <DollarSign className="w-6 h-6" />,
      description: 'Platform revenue this month',
    },
    {
      title: 'Active Users',
      value: '377',
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: <Users className="w-6 h-6" />,
      description: 'Total active platform users',
    },
    {
      title: 'Total Offers',
      value: '158',
      change: '+8.3%',
      changeType: 'increase' as const,
      icon: <Target className="w-6 h-6" />,
      description: 'Active offers on platform',
    },
    {
      title: 'Click-through Rate',
      value: '3.24%',
      change: '-2.1%',
      changeType: 'decrease' as const,
      icon: <MousePointer className="w-6 h-6" />,
      description: 'Average CTR across all offers',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <Header title="Analytics & Reports" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Platform performance insights and metrics</p>
              </div>
              <div className="flex gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[140px]" data-testid="select-time-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 3 months</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" data-testid="button-refresh">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" data-testid="button-export">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {metrics.map((metric, index) => (
                <Card key={index} data-testid={`metric-card-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {metric.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {metric.value}
                        </p>
                        <p className={`text-sm flex items-center gap-1 mt-1 ${
                          metric.changeType === 'increase' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {metric.changeType === 'increase' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {metric.change}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                      </div>
                      <div className="text-blue-600">
                        {metric.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    Revenue Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.users}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {analyticsData.users.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Offers Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Offers Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.offers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="active" fill="#10B981" name="Active" />
                    <Bar dataKey="paused" fill="#F59E0B" name="Paused" />
                    <Bar dataKey="pending" fill="#EF4444" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}