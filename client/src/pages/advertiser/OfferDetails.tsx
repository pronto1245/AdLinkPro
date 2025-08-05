import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, ArrowLeft, Globe, Calendar, Target, CreditCard, Users, Eye, BarChart3, Activity, Shield, TrendingUp, MapPin, Edit } from "lucide-react";
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

export default function AdvertiserOfferDetails() {
  const [location] = useLocation();
  const offerId = location.split('/')[3]; // Extract offer ID from URL
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch specific offer details
  const { data: offer, isLoading } = useQuery({
    queryKey: [`/api/admin/offers/${offerId}`],
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
            <Link href="/advertiser/offers">
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
              <Link href="/advertiser/offers">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад к офферам
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{offer.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">Управление оффером</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={offer.status === 'active' ? "default" : "secondary"} className="text-sm">
                {offer.status === 'active' ? "Активен" : "Неактивен"}
              </Badge>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
            </div>
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

            {/* Partners Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Партнеры</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    <p className="text-sm text-blue-600">Активных</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clicks Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Клики</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    <p className="text-sm text-purple-600">За все время</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversions Card */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Конверсии</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    <p className="text-sm text-orange-600">За все время</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Детали оффера</TabsTrigger>
              <TabsTrigger value="partners">Партнеры</TabsTrigger>
              <TabsTrigger value="analytics">Аналитика</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Описание оффера
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

                  {/* Landing Pages */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        Лендинги
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {offer.landingPages && Array.isArray(offer.landingPages) && offer.landingPages.length > 0 ? (
                        offer.landingPages.map((landing: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{landing.name || `Лендинг ${index + 1}`}</span>
                              {landing.payout && (
                                <Badge variant="secondary">
                                  {landing.payout} {offer.currency}
                                </Badge>
                              )}
                            </div>
                            
                            {landing.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{landing.description}</p>
                            )}
                            
                            <div className="flex gap-2">
                              <Input
                                value={landing.url || `https://example.com/landing/${index + 1}`}
                                readOnly
                                className="text-sm"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(landing.url || `https://example.com/landing/${index + 1}`, "URL лендинга")}
                                title="Копировать URL"
                              >
                                <Copy className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(landing.url || `https://example.com/landing/${index + 1}`, '_blank')}
                                title="Открыть лендинг"
                              >
                                <ExternalLink className="h-4 w-4 text-green-600" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Лендинги не настроены</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Side Info */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Информация
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Категория:</span>
                        <Badge variant="outline">{offer.category}</Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Тип выплаты:</span>
                        <Badge variant="outline">{getPayoutTypeLabel(offer.payoutType)}</Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Статус:</span>
                        <Badge variant={offer.status === 'active' ? "default" : "secondary"}>
                          {offer.status === 'active' ? "Активен" : "Неактивен"}
                        </Badge>
                      </div>
                      
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
                          География
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

            {/* Partners Tab */}
            <TabsContent value="partners" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Партнеры оффера
                  </CardTitle>
                  <CardDescription>
                    Управление партнерами, имеющими доступ к офферу
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">Пока нет партнеров</p>
                    <p className="text-sm text-gray-500 mt-2">Добавьте партнеров для продвижения этого оффера</p>
                    <Button className="mt-4" size="sm">
                      Добавить партнера
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Статистика переходов
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400">Нет данных</p>
                      <p className="text-sm text-gray-500 mt-2">Статистика появится после первых переходов</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Конверсии
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400">Нет конверсий</p>
                      <p className="text-sm text-gray-500 mt-2">Данные о конверсиях появятся после настройки постбеков</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Настройки оффера
                  </CardTitle>
                  <CardDescription>
                    Основные параметры и доступ к офферу
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Приватный оффер</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Только одобренные партнеры имеют доступ</p>
                      </div>
                      <Badge variant="outline">Настраивается</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Автоодобрение</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Партнеры получают доступ автоматически</p>
                      </div>
                      <Badge variant="outline">Настраивается</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Лимиты трафика</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ограничения по объему трафика</p>
                      </div>
                      <Badge variant="outline">Настраивается</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleBasedLayout>
  );
}