import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  MousePointer,
  Target,
  DollarSign
} from "lucide-react";
import { formatCurrency, formatCR } from "@/utils/formatting";

export default function Statistics() {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    offerId: '',
    geo: '',
    device: ''
  });

  // Mock data для демонстрации
  const mockStats = {
    summary: {
      totalClicks: 8450,
      totalConversions: 324,
      totalRevenue: 18650.50,
      conversionRate: 3.83,
      epc: 2.21
    },
    detailedStats: [
      {
        id: 1,
        date: "2025-08-05",
        offerName: "4RaBet India",
        geo: "IN",
        clicks: 420,
        conversions: 18,
        revenue: 1080.00,
        cr: 4.29,
        epc: 2.57
      },
      {
        id: 2,
        date: "2025-08-05",
        offerName: "Crypto Trading Pro",
        geo: "US",
        clicks: 380,
        conversions: 12,
        revenue: 1440.00,
        cr: 3.16,
        epc: 3.79
      },
      {
        id: 3,
        date: "2025-08-04",
        offerName: "Dating VIP",
        geo: "DE",
        clicks: 250,
        conversions: 7,
        revenue: 350.00,
        cr: 2.80,
        epc: 1.40
      },
      {
        id: 4,
        date: "2025-08-04",
        offerName: "VPN Service",
        geo: "UK",
        clicks: 190,
        conversions: 3,
        revenue: 180.00,
        cr: 1.58,
        epc: 0.95
      }
    ]
  };

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['/api/partner/statistics', filters],
    initialData: mockStats
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Статистика</h1>
          <p className="text-muted-foreground">
            Детальная аналитика по кликам и конверсиям
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Экспорт CSV
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="text-sm font-medium">От</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">До</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Оффер</label>
              <Select
                value={filters.offerId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, offerId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все офферы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все офферы</SelectItem>
                  <SelectItem value="1">4RaBet India</SelectItem>
                  <SelectItem value="2">Crypto Trading Pro</SelectItem>
                  <SelectItem value="3">Dating VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Гео</label>
              <Select
                value={filters.geo}
                onValueChange={(value) => setFilters(prev => ({ ...prev, geo: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все страны" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все страны</SelectItem>
                  <SelectItem value="IN">Индия</SelectItem>
                  <SelectItem value="US">США</SelectItem>
                  <SelectItem value="DE">Германия</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Устройство</label>
              <Select
                value={filters.device}
                onValueChange={(value) => setFilters(prev => ({ ...prev, device: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все устройства" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все устройства</SelectItem>
                  <SelectItem value="mobile">Мобильные</SelectItem>
                  <SelectItem value="desktop">Десктоп</SelectItem>
                  <SelectItem value="tablet">Планшеты</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего кликов</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statsData.summary.totalClicks.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конверсии</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statsData.summary.totalConversions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Доход</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(statsData.summary.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCR(statsData.summary.conversionRate / 100)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EPC</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {formatCurrency(statsData.summary.epc)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Детальная статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Оффер</TableHead>
                <TableHead>Гео</TableHead>
                <TableHead>Клики</TableHead>
                <TableHead>Конверсии</TableHead>
                <TableHead>Доход</TableHead>
                <TableHead>CR</TableHead>
                <TableHead>EPC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statsData.detailedStats.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium">{stat.date}</TableCell>
                  <TableCell>{stat.offerName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{stat.geo}</Badge>
                  </TableCell>
                  <TableCell className="text-blue-600 font-medium">
                    {stat.clicks.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {stat.conversions}
                  </TableCell>
                  <TableCell className="text-purple-600 font-medium">
                    {formatCurrency(stat.revenue)}
                  </TableCell>
                  <TableCell className="text-orange-600 font-medium">
                    {formatCR(stat.cr / 100)}
                  </TableCell>
                  <TableCell className="text-teal-600 font-medium">
                    {formatCurrency(stat.epc)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}