import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, ArrowLeft, Globe, Calendar, Target, CreditCard, Users, Eye, BarChart3, Activity, Shield, TrendingUp, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useLocation, Link } from "wouter";
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';

interface OfferDetails {
  id: string;
  name: string;
  description: any;
  logo: string;
  category: string;
  payout: string;
  payoutType: string;
  currency: string;
  status: string;
  isApproved: boolean;
  kpiConditions: any;
  countries: any;
  landingPages: any[];
  createdAt: string;
  advertiser?: {
    id: string;
    name: string;
  };
  conversionRate?: string;
  averageOrderValue?: string;
  cookieLifetime?: number;
}

export default function OfferDetails() {
  const [location] = useLocation();
  const offerId = location.split('/')[3]; // Extract offer ID from URL
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch specific offer details
  const { data: offer, isLoading } = useQuery({
    queryKey: [`/api/partner/offers/${offerId}`],
    enabled: !!offerId,
    staleTime: 5 * 60 * 1000,
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: `${label} скопирована в буфер обмена`,
    });
  };

  const getPayoutTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      cpa: "CPA",
      cps: "CPS", 
      cpl: "CPL",
      cpm: "CPM",
      cpc: "CPC",
      revshare: "RevShare",
    };
    return types[type] || type.toUpperCase();
  };

  const getDescription = (desc: any) => {
    if (typeof desc === 'object' && desc) {
      return desc.ru || desc.en || '';
    }
    return desc || '';
  };

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка деталей оффера...</p>
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  if (!offer) {
    return (
      <RoleBasedLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-4 p-6">
            <Link href="/affiliate/offers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад к офферам
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Оффер не найден</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/affiliate/offers">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад к офферам
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{offer.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">Детальная информация об оффере</p>
              </div>
            </div>
            <Badge variant={offer.isApproved ? "default" : "secondary"} className="text-sm">
              {offer.isApproved ? "Одобрен" : "Публичный"}
            </Badge>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Payout Card */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Выплата</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {offer.payout} {offer.currency}
                    </p>
                    <p className="text-sm text-green-600">{getPayoutTypeLabel(offer.payoutType)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Категория</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{offer.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geography Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">География</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {Array.isArray(offer.countries) ? offer.countries.length + ' стран' : 'Все страны'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Статус</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {offer.isApproved ? "Одобрен" : "Публичный"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <TabsTrigger 
                value="details" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 data-[state=active]:bg-blue-500 data-[state=active]:text-white font-semibold transition-all duration-200"
              >
                📋 Детали оффера
              </TabsTrigger>
              <TabsTrigger 
                value="links" 
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 data-[state=active]:bg-green-500 data-[state=active]:text-white font-semibold transition-all duration-200"
              >
                🔗 Трек-ссылки
              </TabsTrigger>
              <TabsTrigger 
                value="info" 
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 data-[state=active]:bg-purple-500 data-[state=active]:text-white font-semibold transition-all duration-200"
              >
                ℹ️ Информация
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2">
                  <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                      <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                        <Eye className="h-5 w-5" />
                        📋 Описание оффера
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-4">
                        {offer.logo && (
                          <img 
                            src={offer.logo} 
                            alt={offer.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{offer.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {getDescription(offer.description)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* KPI Requirements */}
                  {offer.kpiConditions && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-orange-600" />
                          Требования и KPI
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <p className="text-sm">{getDescription(offer.kpiConditions)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Side Info */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Быстрая информация
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Тип выплаты:</span>
                        <Badge variant="outline">{getPayoutTypeLabel(offer.payoutType)}</Badge>
                      </div>
                      
                      {offer.advertiser && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Рекламодатель:</span>
                          <span className="text-sm font-medium">{offer.advertiser.name}</span>
                        </div>
                      )}
                      
                      {offer.conversionRate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">CR:</span>
                          <span className="text-sm font-medium text-green-600">{offer.conversionRate}%</span>
                        </div>
                      )}
                      
                      {offer.cookieLifetime && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Cookie:</span>
                          <span className="text-sm font-medium">{offer.cookieLifetime} дней</span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Создан:
                        </span>
                        <span className="text-sm">
                          {new Date(offer.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Geography */}
                  {offer.countries && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          Доступные страны
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm">
                            {Array.isArray(offer.countries) ? offer.countries.join(', ') : offer.countries}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Links Tab */}
            <TabsContent value="links" className="space-y-6">
              <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                  <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <ExternalLink className="h-5 w-5" />
                    🔗 Готовые трек-ссылки
                  </CardTitle>
                  <CardDescription className="text-green-700 dark:text-green-300">
                    Готовые ссылки для каждого лендинга. Просто скопируйте и используйте.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {offer.landingPages && Array.isArray(offer.landingPages) && offer.landingPages.length > 0 ? (
                    offer.landingPages.map((landing: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{landing.name || `Лендинг ${index + 1}`}</span>
                          </div>
                          {landing.payout && (
                            <Badge variant="secondary">
                              {landing.payout} {offer.currency}
                            </Badge>
                          )}
                        </div>
                        
                        {landing.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{landing.description}</p>
                        )}
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Готовая трек-ссылка:
                          </label>
                          <div className="flex gap-2">
                            <Input
                              value={`https://track.platform.com/click/${offer.id}/${index}?partner=${user?.id || 'PARTNER_ID'}&subid=YOUR_SUBID`}
                              readOnly
                              className="text-sm"
                              data-testid={`input-landing-link-${offer.id}-${index}`}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(
                                `https://track.platform.com/click/${offer.id}/${index}?partner=${user?.id || 'PARTNER_ID'}&subid=YOUR_SUBID`,
                                "Трек-ссылка"
                              )}
                              data-testid={`button-copy-landing-link-${offer.id}-${index}`}
                              title="Копировать трек-ссылку"
                            >
                              <Copy className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(landing.url || `https://track.platform.com/click/${offer.id}/${index}?partner=${user?.id || 'PARTNER_ID'}`, '_blank')}
                              data-testid={`button-open-landing-${offer.id}-${index}`}
                              title="Открыть лендинг"
                            >
                              <ExternalLink className="h-4 w-4 text-green-600" />
                            </Button>
                          </div>
                        </div>
                        
                        {landing.geo && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Гео:</strong> {Array.isArray(landing.geo) ? landing.geo.join(', ') : landing.geo}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Основная трек-ссылка:
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={`https://track.platform.com/click/${offer.id}?partner=${user?.id || 'PARTNER_ID'}&subid=YOUR_SUBID`}
                          readOnly
                          className="text-sm"
                          data-testid={`input-main-link-${offer.id}`}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(
                            `https://track.platform.com/click/${offer.id}?partner=${user?.id || 'PARTNER_ID'}&subid=YOUR_SUBID`,
                            "Основная ссылка"
                          )}
                          data-testid={`button-copy-main-link-${offer.id}`}
                          title="Копировать ссылку"
                        >
                          <Copy className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://track.platform.com/click/${offer.id}?partner=${user?.id || 'PARTNER_ID'}`, '_blank')}
                          data-testid={`button-open-main-link-${offer.id}`}
                          title="Открыть ссылку"
                        >
                          <ExternalLink className="h-4 w-4 text-green-600" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                      <Activity className="h-5 w-5" />
                      📊 Статистика
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                        <p className="text-sm text-purple-700 dark:text-purple-300">Статистика недоступна</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Данные появятся после первых переходов</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                      <TrendingUp className="h-5 w-5" />
                      📈 Производительность
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                        <p className="text-sm text-purple-700 dark:text-purple-300">Данные о производительности</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Аналитика будет доступна после активности</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleBasedLayout>
  );
}