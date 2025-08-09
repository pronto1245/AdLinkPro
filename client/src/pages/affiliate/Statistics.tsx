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
import { Label } from "@/components/ui/label";
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
  DollarSign,
  Eye,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatCR } from "@/utils/formatting";

export default function Statistics() {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    offerId: '',
    geo: '',
    device: ''
  });

  const [showSubParams, setShowSubParams] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

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
        clickid: "04b043297lz9a2b4",
        sub1: "facebook_campaign_01",
        sub2: "geo-IN|dev-mobile|src-fb",
        sub3: "adset_123",
        sub4: "creative_456",
        sub5: "tier1",
        sub6: "premium_users",
        sub7: "morning_traffic",
        sub8: "mobile_app",
        sub9: "retargeting",
        sub10: "lookalike_audience",
        sub11: "conversion_campaign",
        sub12: "brand_safety",
        sub13: "adult_18_35",
        sub14: "hindi_language",
        sub15: "gambling_allowed",
        sub16: "final_tracker",
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
        clickid: "5c8d92f4x7n9z3k1",
        sub1: "google_ads_crypto",
        sub2: "geo-US|dev-desktop|src-google",
        sub3: "campaign_789",
        sub4: "banner_321",
        sub5: "tier2",
        sub6: "abtest_A",
        sub7: "evening_peak",
        sub8: "desktop_web",
        sub9: "cold_traffic",
        sub10: "interest_targeting",
        sub11: "lead_generation",
        sub12: "financial_approved",
        sub13: "adult_25_55",
        sub14: "english_primary",
        sub15: "crypto_legal",
        sub16: "final_conversion",
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
        clickid: "7f2b15c8m4p6q9r2",
        sub1: "native_dating_de",
        sub2: "geo-DE|dev-mobile|src-native",
        sub3: "placement_555",
        sub4: "video_888",
        sub5: "tier3",
        sub6: "weekend_special",
        sub7: "premium",
        sub8: "mobile_optimized",
        sub9: "warm_audience",
        sub10: "behavioral_targeting",
        sub11: "dating_funnel",
        sub12: "content_verified",
        sub13: "adult_21_40",
        sub14: "german_native",
        sub15: "dating_legal",
        sub16: "premium_conversion",
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
        clickid: "9x1y4z7w8v5u3t6s",
        sub1: "telegram_vpn_uk",
        sub2: "geo-UK|dev-desktop|src-telegram",
        sub3: "channel_999",
        sub4: "post_777",
        sub5: "tier1",
        sub6: "privacy_focused",
        sub7: "night_hours",
        sub8: "security",
        sub9: "tech_savvy",
        sub10: "privacy_targeting",
        sub11: "vpn_funnel",
        sub12: "security_approved",
        sub13: "adult_18_45",
        sub14: "english_uk",
        sub15: "vpn_legal",
        sub16: "security_conversion",
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
                  <SelectItem value="all">Все офферы</SelectItem>
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
                  <SelectItem value="all">Все страны</SelectItem>
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
                  <SelectItem value="all">Все устройства</SelectItem>
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
                <TableHead>Click ID</TableHead>
                <TableHead>Клики</TableHead>
                <TableHead>Конверсии</TableHead>
                <TableHead>Доход</TableHead>
                <TableHead>CR</TableHead>
                <TableHead>EPC</TableHead>
                <TableHead>Sub-параметры</TableHead>
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
                  <TableCell className="font-mono text-xs text-blue-600">
                    {stat.clickid}
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
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRowId(stat.id);
                        setShowSubParams(true);
                      }}
                      data-testid={`button-sub-params-${stat.id}`}
                      title="Просмотр sub-параметров"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Sub1-16
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sub-параметры Dialog */}
      <Dialog open={showSubParams} onOpenChange={setShowSubParams}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Sub-параметры (Sub1-Sub16)
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSubParams(false)}
                data-testid="button-close-sub-params"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Детальная информация о sub-параметрах для выбранного клика
            </DialogDescription>
          </DialogHeader>
          
          {selectedRowId && (
            <div className="space-y-4">
              {(() => {
                const selectedStat = statsData.detailedStats.find(stat => stat.id === selectedRowId);
                if (!selectedStat) return null;
                
                return (
                  <>
                    {/* Основная информация */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Click ID</Label>
                        <div className="font-mono text-sm text-blue-600">{selectedStat.clickid}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Оффер</Label>
                        <div className="text-sm font-medium">{selectedStat.offerName}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Дата</Label>
                        <div className="text-sm">{selectedStat.date}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Гео</Label>
                        <Badge variant="outline">{selectedStat.geo}</Badge>
                      </div>
                    </div>

                    {/* Sub-параметры в сетке */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({ length: 16 }, (_, i) => {
                        const subKey = `sub${i + 1}` as keyof typeof selectedStat;
                        const subValue = selectedStat[subKey] as string;
                        
                        return (
                          <div key={`sub${i + 1}`} className="space-y-2">
                            <Label className="text-sm font-medium text-gray-500">
                              Sub{i + 1}
                            </Label>
                            <div className="p-2 border rounded-md bg-white dark:bg-gray-900 min-h-[40px] flex items-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300 break-all">
                                {subValue || '-'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Статистика */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Клики</Label>
                        <div className="text-lg font-bold text-blue-600">{selectedStat.clicks.toLocaleString()}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Конверсии</Label>
                        <div className="text-lg font-bold text-green-600">{selectedStat.conversions}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Доход</Label>
                        <div className="text-lg font-bold text-purple-600">{formatCurrency(selectedStat.revenue)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">CR</Label>
                        <div className="text-lg font-bold text-orange-600">{formatCR(selectedStat.cr / 100)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">EPC</Label>
                        <div className="text-lg font-bold text-teal-600">{formatCurrency(selectedStat.epc)}</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}