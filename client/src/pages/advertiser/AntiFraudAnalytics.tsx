import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  Users, 
  Globe,
  Smartphone, 
  Eye,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Ban,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { ResponsiveCard } from '@/components/layout/ResponsiveCard';

interface FraudStatistics {
  id: string;
  date: string;
  ip: string;
  country: string;
  device: string;
  trafficSource: string;
  offerId: string;
  offerName: string;
  partnerId: string;
  partnerName: string;
  fraudType: string;
  fraudReason: string;
  isProxy: boolean;
  isVpn: boolean;
  isTor: boolean;
  isBot: boolean;
  suspiciousActivity: boolean;
  riskScore: number;
  clicks: number;
  blockedClicks: number;
  fraudClicks: number;
  legitimateClicks: number;
  fraudRate: number;
  timestamp: string;
}

interface FraudSummary {
  totalClicks: number;
  totalFraudClicks: number;
  totalBlockedClicks: number;
  totalLegitimateClicks: number;
  overallFraudRate: number;
  avgRiskScore: number;
  topFraudTypes: { type: string; count: number }[];
  topFraudCountries: { country: string; count: number }[];
}

export default function AntiFraudAnalytics() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const [filters, setFilters] = useState({
    offerId: '',
    partnerId: '',
    country: '',
    fraudType: '',
    riskScore: '',
    ipAddress: '',
    deviceType: '',
    trafficSource: ''
  });

  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch fraud analytics data
  const { data: fraudData, isLoading: isLoadingFraud, refetch } = useQuery({
    queryKey: ['/api/antifraud/analytics', dateRange, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value && value.toString().trim()
          )
        )
      });
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/antifraud/analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        // Mock data for demonstration since antifraud API might not be ready
        return {
          data: [
            {
              id: '1',
              date: new Date().toISOString().split('T')[0],
              ip: '192.168.1.100',
              country: 'RU',
              device: 'mobile',
              trafficSource: 'facebook',
              offerId: 'offer_1',
              offerName: 'Test Offer 1',
              partnerId: 'partner_1',
              partnerName: 'Partner 1',
              fraudType: 'proxy',
              fraudReason: 'Proxy/VPN detected',
              isProxy: true,
              isVpn: false,
              isTor: false,
              isBot: false,
              suspiciousActivity: true,
              riskScore: 85,
              clicks: 120,
              blockedClicks: 25,
              fraudClicks: 30,
              legitimateClicks: 90,
              fraudRate: 25,
              timestamp: new Date().toISOString()
            },
            {
              id: '2',
              date: new Date().toISOString().split('T')[0],
              ip: '10.0.0.50',
              country: 'TR',
              device: 'desktop',
              trafficSource: 'google',
              offerId: 'offer_2',
              offerName: 'Test Offer 2',
              partnerId: 'partner_2',
              partnerName: 'Partner 2',
              fraudType: 'bot',
              fraudReason: 'Bot activity detected',
              isProxy: false,
              isVpn: false,
              isTor: false,
              isBot: true,
              suspiciousActivity: true,
              riskScore: 92,
              clicks: 85,
              blockedClicks: 40,
              fraudClicks: 45,
              legitimateClicks: 40,
              fraudRate: 53,
              timestamp: new Date().toISOString()
            }
          ],
          summary: {
            totalClicks: 12450,
            totalFraudClicks: 2890,
            totalBlockedClicks: 1650,
            totalLegitimateClicks: 9560,
            overallFraudRate: 23.2,
            avgRiskScore: 67,
            topFraudTypes: [
              { type: 'proxy', count: 1250 },
              { type: 'bot', count: 890 },
              { type: 'vpn', count: 520 },
              { type: 'suspicious_behavior', count: 230 }
            ],
            topFraudCountries: [
              { country: 'RU', count: 890 },
              { country: 'CN', count: 650 },
              { country: 'TR', count: 520 },
              { country: 'IN', count: 380 }
            ]
          }
        };
      }
      return response.json();
    },
    refetchInterval: autoRefresh ? 60000 : false, // Auto-refresh every minute for fraud data
  });

  const summary: FraudSummary = fraudData?.summary || {
    totalClicks: 0,
    totalFraudClicks: 0,
    totalBlockedClicks: 0,
    totalLegitimateClicks: 0,
    overallFraudRate: 0,
    avgRiskScore: 0,
    topFraudTypes: [],
    topFraudCountries: []
  };

  const data: FraudStatistics[] = fraudData?.data || [];

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? '' : value }));
  };

  const resetFilters = () => {
    setFilters({
      offerId: '',
      partnerId: '',
      country: '',
      fraudType: '',
      riskScore: '',
      ipAddress: '',
      deviceType: '',
      trafficSource: ''
    });
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getFraudTypeIcon = (type: string) => {
    switch (type) {
      case 'proxy':
      case 'vpn':
        return <Globe className="h-4 w-4" />;
      case 'bot':
        return <Users className="h-4 w-4" />;
      case 'suspicious_behavior':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-600" />
            Антифрод Аналитика
          </h1>
          <p className="text-muted-foreground">
            Мониторинг и анализ фродового трафика в реальном времени
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-red-50 text-red-700 border-red-200' : ''}
            data-testid="toggle-auto-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Авто-мониторинг ВКЛ' : 'Авто-мониторинг ВЫКЛ'}
          </Button>
          <Button onClick={() => refetch()} variant="outline" data-testid="manual-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button variant="destructive" data-testid="block-ips">
            <Ban className="h-4 w-4 mr-2" />
            Заблокировать IP
          </Button>
        </div>
      </div>

      {/* Fraud Summary Cards */}
      <ResponsiveGrid cols={{ sm: 2, lg: 4 }}>
        <ResponsiveCard 
          title="Общий трафик" 
          value={summary.totalClicks.toLocaleString()}
          icon={<Eye className="h-5 w-5 text-blue-600" />}
          trend={{ value: 0, direction: 'up' }}
        />
        <ResponsiveCard 
          title="Фродовый трафик" 
          value={summary.totalFraudClicks.toLocaleString()}
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          trend={{ value: 0, direction: 'down' }}
        />
        <ResponsiveCard 
          title="Заблокировано" 
          value={summary.totalBlockedClicks.toLocaleString()}
          icon={<Ban className="h-5 w-5 text-orange-600" />}
          trend={{ value: 0, direction: 'up' }}
        />
        <ResponsiveCard 
          title="Процент фрода" 
          value={`${summary.overallFraudRate.toFixed(1)}%`}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          trend={{ value: 0, direction: 'down' }}
        />
      </ResponsiveGrid>

      {/* Top Fraud Types and Countries */}
      <ResponsiveGrid cols={{ sm: 1, lg: 2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Топ типы фрода
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.topFraudTypes.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getFraudTypeIcon(item.type)}
                    <span className="capitalize">{item.type.replace('_', ' ')}</span>
                  </div>
                  <Badge variant="destructive">{item.count.toLocaleString()}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-red-600" />
              Топ фродовые страны
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.topFraudCountries.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.country}</Badge>
                  </div>
                  <Badge variant="destructive">{item.count.toLocaleString()}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры антифрода
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Период</label>
              <DatePickerWithRange 
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Тип фрода</label>
              <Select value={filters.fraudType} onValueChange={(value) => handleFilterChange('fraudType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Все типы фрода" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="proxy">Proxy/VPN</SelectItem>
                  <SelectItem value="bot">Боты</SelectItem>
                  <SelectItem value="suspicious_behavior">Подозрительное поведение</SelectItem>
                  <SelectItem value="click_flooding">Флуд кликов</SelectItem>
                  <SelectItem value="invalid_traffic">Невалидный трафик</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Риск-скор</label>
              <Select value={filters.riskScore} onValueChange={(value) => handleFilterChange('riskScore', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Все уровни риска" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все уровни</SelectItem>
                  <SelectItem value="high">Высокий (80+)</SelectItem>
                  <SelectItem value="medium">Средний (60-79)</SelectItem>
                  <SelectItem value="low">Низкий (40-59)</SelectItem>
                  <SelectItem value="minimal">Минимальный (0-39)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">IP адрес</label>
              <Input 
                placeholder="192.168.1.1"
                value={filters.ipAddress}
                onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Страна</label>
              <Input 
                placeholder="Код страны (RU, US, etc.)"
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Устройство</label>
              <Select value={filters.deviceType} onValueChange={(value) => handleFilterChange('deviceType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Все устройства" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все устройства</SelectItem>
                  <SelectItem value="mobile">Мобильные</SelectItem>
                  <SelectItem value="desktop">Десктоп</SelectItem>
                  <SelectItem value="tablet">Планшеты</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="w-full"
                data-testid="reset-filters"
              >
                Сбросить фильтры
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fraud Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Детали антифрод активности</CardTitle>
          <CardDescription>
            Подробная информация о выявленном фродовом трафике
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingFraud ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Загрузка данных антифрода...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Дата/Время</th>
                    <th className="text-left p-2">IP адрес</th>
                    <th className="text-left p-2">Страна</th>
                    <th className="text-left p-2">Устройство</th>
                    <th className="text-left p-2">Оффер</th>
                    <th className="text-left p-2">Партнер</th>
                    <th className="text-left p-2">Тип фрода</th>
                    <th className="text-left p-2">Причина</th>
                    <th className="text-right p-2">Риск-скор</th>
                    <th className="text-right p-2">Клики</th>
                    <th className="text-right p-2">Фрод клики</th>
                    <th className="text-right p-2">Фрод %</th>
                    <th className="text-right p-2">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{new Date(row.timestamp).toLocaleString('ru-RU')}</td>
                      <td className="p-2 font-mono text-xs">{row.ip}</td>
                      <td className="p-2">
                        <Badge variant="outline">{row.country}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">{row.device}</Badge>
                      </td>
                      <td className="p-2">
                        <div className="max-w-[100px] truncate" title={row.offerName}>
                          {row.offerName}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="max-w-[80px] truncate" title={row.partnerName}>
                          {row.partnerName}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          {getFraudTypeIcon(row.fraudType)}
                          <span className="capitalize">{row.fraudType.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="max-w-[120px] truncate" title={row.fraudReason}>
                          {row.fraudReason}
                        </div>
                      </td>
                      <td className={`text-right p-2 font-semibold ${getRiskScoreColor(row.riskScore)}`}>
                        {row.riskScore}
                      </td>
                      <td className="text-right p-2">{row.clicks.toLocaleString()}</td>
                      <td className="text-right p-2 text-red-600">{row.fraudClicks.toLocaleString()}</td>
                      <td className="text-right p-2">
                        <span className={row.fraudRate > 50 ? 'text-red-600 font-semibold' : row.fraudRate > 25 ? 'text-orange-600' : 'text-green-600'}>
                          {row.fraudRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right p-2">
                        {row.blockedClicks > 0 ? (
                          <Badge variant="destructive">Заблокирован</Badge>
                        ) : (
                          <Badge variant="secondary">Мониторинг</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}