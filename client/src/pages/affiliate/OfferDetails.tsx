import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, ExternalLink, ArrowLeft, Globe, Calendar, Target, CreditCard, Users } from "lucide-react";
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
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
            <p>Загрузка деталей оффера...</p>
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  if (!offer) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/affiliate/offers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад к офферам
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Оффер не найден</p>
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/affiliate/offers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад к офферам
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{offer.name}</h1>
              <p className="text-muted-foreground">Детальная информация об оффере</p>
            </div>
          </div>
          <Badge variant={offer.isApproved ? "default" : "secondary"} className="text-sm">
            {offer.isApproved ? "Одобрен" : "Публичный"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main offer info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Offer Overview Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{offer.name}</CardTitle>
                    <CardDescription className="text-base">
                      {getDescription(offer.description)}
                    </CardDescription>
                  </div>
                  {offer.logo && (
                    <img 
                      src={offer.logo} 
                      alt={offer.name}
                      className="w-16 h-16 rounded-lg object-cover ml-4"
                    />
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{offer.category}</Badge>
                  <Badge variant="outline">{getPayoutTypeLabel(offer.payoutType)}</Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Landing Pages with Track Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-blue-600" />
                  Лендинги и готовые трек-ссылки
                </CardTitle>
                <CardDescription>
                  Готовые ссылки для каждого лендинга. Просто скопируйте и используйте.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {offer.landingPages && Array.isArray(offer.landingPages) && offer.landingPages.length > 0 ? (
                  offer.landingPages.map((landing: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
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
                        <p className="text-sm text-muted-foreground">{landing.description}</p>
                      )}
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
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
                        <div className="text-sm text-muted-foreground">
                          <strong>Гео:</strong> {Array.isArray(landing.geo) ? landing.geo.join(', ') : landing.geo}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
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

            {/* KPI Requirements */}
            {offer.kpiConditions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    Требования и KPI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm">{getDescription(offer.kpiConditions)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - Stats and Info */}
          <div className="space-y-6">
            {/* Payout Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Выплата
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {offer.payout} {offer.currency}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {getPayoutTypeLabel(offer.payoutType)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Категория:</span>
                  <Badge variant="outline">{offer.category}</Badge>
                </div>
                
                {offer.advertiser && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Рекламодатель:</span>
                    <span className="text-sm font-medium">{offer.advertiser.name}</span>
                  </div>
                )}
                
                {offer.conversionRate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">CR:</span>
                    <span className="text-sm font-medium">{offer.conversionRate}%</span>
                  </div>
                )}
                
                {offer.averageOrderValue && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">AOV:</span>
                    <span className="text-sm font-medium">{offer.averageOrderValue} {offer.currency}</span>
                  </div>
                )}
                
                {offer.cookieLifetime && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cookie:</span>
                    <span className="text-sm font-medium">{offer.cookieLifetime} дней</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
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
                    <Globe className="h-5 w-5 text-blue-600" />
                    География
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      {Array.isArray(offer.countries) ? offer.countries.join(', ') : offer.countries}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}