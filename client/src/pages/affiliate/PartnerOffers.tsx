import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, Settings, Eye, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';

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
  createdAt: string;
}

interface GeneratedLink {
  offerId: string;
  partnerLink: string;
  baseUrl: string;
  generatedAt: string;
}

export default function PartnerOffers() {
  const [customSubId, setCustomSubId] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch partner offers with auto-generated links
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["/api/partner/offers"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate custom partner link
  const generateLinkMutation = useMutation({
    mutationFn: async ({ offerId, subId }: { offerId: string; subId?: string }) => {
      return apiRequest<GeneratedLink>("/api/partner/generate-link", {
        method: "POST",
        body: { offerId, subId },
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Ссылка сгенерирована",
        description: "Партнерская ссылка успешно создана",
      });
      // Copy to clipboard
      navigator.clipboard.writeText(data.partnerLink);
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сгенерировать ссылку",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: `${label} скопирована в буфер обмена`,
    });
  };

  const handleGenerateLink = () => {
    if (!selectedOffer) {
      toast({
        title: "Ошибка",
        description: "Выберите оффер для генерации ссылки",
        variant: "destructive",
      });
      return;
    }
    generateLinkMutation.mutate({ 
      offerId: selectedOffer, 
      subId: customSubId || undefined 
    });
  };

  const approvedOffers = offers.filter((offer: PartnerOffer) => offer.isApproved);
  const publicOffers = offers.filter((offer: PartnerOffer) => !offer.isApproved);

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Партнерские офферы</h1>
          <p className="text-muted-foreground">
            Автоматическая генерация персональных ссылок для каждого оффера
          </p>
        </div>
        <Badge variant="outline">{offers.length} доступных офферов</Badge>
      </div>

      {/* Custom Link Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Генератор персональных ссылок
          </CardTitle>
          <CardDescription>
            Создавайте кастомные ссылки с собственными SubID для отслеживания кампаний
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <select
              className="flex-1 p-2 border rounded-md"
              value={selectedOffer}
              onChange={(e) => setSelectedOffer(e.target.value)}
              data-testid="select-offer"
            >
              <option value="">Выберите оффер</option>
              {offers.map((offer: PartnerOffer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.name} ({offer.payout} {offer.currency})
                </option>
              ))}
            </select>
            <Input
              placeholder="Кастомный SubID (опционально)"
              value={customSubId}
              onChange={(e) => setCustomSubId(e.target.value)}
              className="flex-1"
              data-testid="input-subid"
            />
            <Button 
              onClick={handleGenerateLink}
              disabled={generateLinkMutation.isPending || !selectedOffer}
              data-testid="button-generate-link"
            >
              {generateLinkMutation.isPending ? "Генерация..." : "Создать ссылку"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="approved" className="w-full">
        <TabsList>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Одобренные ({approvedOffers.length})
          </TabsTrigger>
          <TabsTrigger value="public" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Публичные ({publicOffers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedOffers.map((offer: PartnerOffer) => (
              <OfferCard key={offer.id} offer={offer} copyToClipboard={copyToClipboard} />
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
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicOffers.map((offer: PartnerOffer) => (
              <OfferCard key={offer.id} offer={offer} copyToClipboard={copyToClipboard} />
            ))}
          </div>
          {publicOffers.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Публичные офферы недоступны.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </RoleBasedLayout>
  );
}

interface OfferCardProps {
  offer: PartnerOffer;
  copyToClipboard: (text: string, label: string) => void;
}

function OfferCard({ offer, copyToClipboard }: OfferCardProps) {
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
            <CardTitle className="text-lg leading-tight">{offer.name}</CardTitle>
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

        {offer.partnerLink && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Автоматическая партнерская ссылка:</label>
            <div className="flex gap-2">
              <Input
                value={offer.partnerLink}
                readOnly
                className="text-xs"
                data-testid={`input-partner-link-${offer.id}`}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(offer.partnerLink, "Партнерская ссылка")}
                data-testid={`button-copy-link-${offer.id}`}
                title="Копировать ссылку"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(offer.partnerLink, '_blank')}
                data-testid={`button-open-link-${offer.id}`}
                title="Открыть ссылку"
              >
                <ExternalLink className="h-4 w-4" />
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

