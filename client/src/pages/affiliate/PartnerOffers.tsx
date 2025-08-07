import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";


interface PartnerOffer {
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
  partnerLink: string;
  baseUrl: string;
  kpiConditions: any;
  countries: any;
  landingPages: any[];
  createdAt: string;
}

export default function PartnerOffers() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch partner offers with auto-generated links
  const { data: offers = [], isLoading } = useQuery<PartnerOffer[]>({
    queryKey: ["/api/partner/offers"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: `${label} скопирована в буфер обмена`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
          <p>Загрузка офферов...</p>
        </div>
      </div>
    );
  }

  const approvedOffers = offers.filter((offer: PartnerOffer) => offer.isApproved);

  if (!offers || offers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Партнерские офферы</h1>
            <p className="text-muted-foreground">
              Просматривайте доступные офферы и получайте трек-ссылки
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Пока нет доступных офферов. Обратитесь к рекламодателю для получения доступа.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Партнерские офферы</h1>
            <p className="text-muted-foreground">
              Готовые трек-ссылки под каждым лендингом оффера
            </p>
          </div>
          <Badge variant="outline">{offers.length} доступных офферов</Badge>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedOffers.map((offer: PartnerOffer) => (
              <OfferCard key={offer.id} offer={offer} copyToClipboard={copyToClipboard} user={user} />
            ))}
          </div>
          {approvedOffers.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  У вас пока нет одобренных офферов. Обратитесь к рекламодателю для получения доступа.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
  );
}

interface OfferCardProps {
  offer: PartnerOffer;
  copyToClipboard: (text: string, label: string) => void;
  user: any;
}

function OfferCard({ offer, copyToClipboard, user }: OfferCardProps) {
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

  return (
    <Card className={`transition-all hover:shadow-md ${offer.isApproved ? 'border-green-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">
              <Link href={`/affiliate/offers/${offer.id}`} className="hover:text-blue-600 transition-colors">
                {offer.name}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1">
              {getDescription(offer.description).slice(0, 100)}
              {getDescription(offer.description).length > 100 && '...'}
            </CardDescription>
          </div>
          {offer.logo && (
            <img 
              src={offer.logo} 
              alt={offer.name}
              className="w-12 h-12 rounded-lg object-cover ml-3"
            />
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Badge variant={offer.isApproved ? "default" : "secondary"}>
            {offer.isApproved ? "Одобрен" : "Публичный"}
          </Badge>
          <Badge variant="outline">{offer.category}</Badge>
          <Badge variant="outline">
            {getPayoutTypeLabel(offer.payoutType)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <span className="text-sm font-medium">Выплата:</span>
          <span className="text-lg font-bold text-green-600">
            {offer.payout} {offer.currency}
          </span>
        </div>

        {/* Лендинги с готовыми трек-ссылками */}
        {offer.landingPages && Array.isArray(offer.landingPages) && offer.landingPages.length > 0 ? (
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-blue-600" />
              Лендинги с готовыми трек-ссылками:
            </label>
            <div className="space-y-3">
              {offer.landingPages.map((landing: any, index: number) => (
                <div key={index} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{landing.name || `Лендинг ${index + 1}`}</span>
                    {landing.payout && (
                      <Badge variant="secondary" className="text-xs">
                        {landing.payout} {offer.currency}
                      </Badge>
                    )}
                  </div>
                  
                  {landing.description && (
                    <p className="text-xs text-muted-foreground">{landing.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Готовая трек-ссылка:</div>
                    <div className="flex gap-2">
                      <Input
                        value={`https://track.platform.com/click/${offer.id}/${index}?partner=${user?.id || 'PARTNER_ID'}&subid=YOUR_SUBID`}
                        readOnly
                        className="text-xs"
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
                    <div className="text-xs text-muted-foreground">
                      <strong>Гео:</strong> {Array.isArray(landing.geo) ? landing.geo.join(', ') : landing.geo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Основная трек-ссылка если нет лендингов */
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-blue-600" />
              Основная трек-ссылка:
            </label>
            <div className="flex gap-2">
              <Input
                value={`https://track.platform.com/click/${offer.id}?partner=${user?.id || 'PARTNER_ID'}&subid=YOUR_SUBID`}
                readOnly
                className="text-xs"
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

        {offer.kpiConditions && (
          <div className="text-xs text-muted-foreground p-2 bg-gray-50 rounded">
            <strong>KPI:</strong> {getDescription(offer.kpiConditions).slice(0, 150)}
          </div>
        )}

        {offer.countries && (
          <div className="text-xs text-muted-foreground">
            <strong>Гео:</strong> {Array.isArray(offer.countries) ? offer.countries.join(', ') : offer.countries}
          </div>
        )}
      </CardContent>
    </Card>
  );
}