import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Globe, MapPin, DollarSign, Target, Calendar, Building2, ExternalLink, ArrowLeft, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface OfferDetails {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: string;
  payout: string;
  payoutType: string;
  currency: string;
  status: string;
  countries: string[];
  landingPages: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    isDefault: boolean;
  }>;
  kpiConditions: {
    minDeposit?: number;
    minAge?: number;
    countries?: string[];
    allowedTrafficTypes?: string[];
  };
  restrictions: {
    forbidden_sources?: string[];
    allowed_sources?: string[];
    geo_restrictions?: string[];
  };
  trackingLink: string;
  createdAt: string;
  advertiserInfo: {
    name: string;
    company: string;
  };
}

// Функция для получения названий стран по кодам
function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    'RU': 'Россия', 'US': 'США', 'DE': 'Германия', 'FR': 'Франция', 'IT': 'Италия',
    'ES': 'Испания', 'UK': 'Великобритания', 'CA': 'Канада', 'AU': 'Австралия',
    'BR': 'Бразилия', 'MX': 'Мексика', 'IN': 'Индия', 'JP': 'Япония', 'KR': 'Южная Корея',
    'KZ': 'Казахстан', 'BY': 'Беларусь', 'UA': 'Украина', 'PL': 'Польша', 'TR': 'Турция'
  };
  return countries[code] || code;
}

// Функция для получения флага страны
function getCountryFlag(code: string): string {
  const flags: Record<string, string> = {
    'RU': '🇷🇺', 'US': '🇺🇸', 'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹',
    'ES': '🇪🇸', 'UK': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺', 'BR': '🇧🇷',
    'MX': '🇲🇽', 'IN': '🇮🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'KZ': '🇰🇿',
    'BY': '🇧🇾', 'UA': '🇺🇦', 'PL': '🇵🇱', 'TR': '🇹🇷'
  };
  return flags[code] || '🌍';
}

// Функция для получения свойств бейджа категории
function getCategoryBadgeProps(category: string) {
  const categories: Record<string, { label: string; className: string }> = {
    gambling: { label: "Гемблинг", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    dating: { label: "Знакомства", className: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300" },
    finance: { label: "Финансы", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    crypto: { label: "Крипто", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
    nutra: { label: "Нутра", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    software: { label: "ПО", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
  };
  
  return categories[category] || { label: category, className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" };
}

export default function OfferDetails() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const offerId = params.id;

  // Загрузка статуса запроса доступа для текущего оффера
  const { data: accessRequests = [] } = useQuery({
    queryKey: ["/api/partner/access-requests"],
    staleTime: 2 * 60 * 1000,
  });

  // Находим запрос для текущего оффера
  const currentRequest = accessRequests.find((req: any) => req.offerId === offerId);
  const requestStatus = currentRequest?.status || 'none';
  const isApproved = requestStatus === 'approved';

  // Отладка статуса  
  console.log('OfferDetails Debug:', {
    offerId,
    accessRequests: accessRequests.length,
    rawFirstRequest: accessRequests[0],
    allRequests: accessRequests.map((req: any) => ({ 
      id: req.id, 
      offerId: req.offerId, 
      status: req.status,
      offer: req.offer?.id 
    })),
    currentRequest,
    requestStatus,
    isApproved
  });

  const handleRequestAccess = async () => {
    if (offerId && requestStatus === 'none') {
      try {
        const response = await fetch("/api/partner/offer-access-request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          },
          body: JSON.stringify({
            offerId,
            message: "Запрос доступа к офферу"
          })
        });

        if (response.ok) {
          toast({
            title: "Запрос отправлен",
            description: "Ваш запрос на доступ к офферу отправлен рекламодателю",
          });
          // Обновляем кеш запросов
          window.location.reload();
        } else {
          throw new Error("Ошибка отправки запроса");
        }
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось отправить запрос. Попробуйте еще раз.",
          variant: "destructive"
        });
      }
    }
  };

  // Тестовые данные для детального оффера
  const offerDetails: OfferDetails = {
    id: offerId || "1",
    name: "1Win Казино",
    description: "Популярное онлайн казино с широким выбором игр, слотов и живых дилеров. Высокие выплаты и бонусы для новых игроков. Лицензированная платформа с мгновенными выводами средств.",
    logo: "https://via.placeholder.com/80x80/9333ea/ffffff?text=1W",
    category: "gambling",
    payout: "150",
    payoutType: "cpa",
    currency: "USD",
    status: "active",
    countries: ["RU", "KZ", "BY"],
    landingPages: [
      {
        id: "1",
        name: "Главная страница",
        url: "https://1win-casino.com/main",
        type: "main",
        isDefault: true
      },
      {
        id: "2", 
        name: "Страница регистрации",
        url: "https://1win-casino.com/register",
        type: "registration",
        isDefault: false
      },
      {
        id: "3",
        name: "Промо-страница",
        url: "https://1win-casino.com/promo-bonus",
        type: "promo",
        isDefault: false
      }
    ],
    kpiConditions: {
      minDeposit: 50,
      minAge: 18,
      countries: ["RU", "KZ", "BY"],
      allowedTrafficTypes: ["contextual", "social", "email"]
    },
    restrictions: {
      forbidden_sources: ["adult", "fraud", "incentive"],
      allowed_sources: ["google", "facebook", "telegram", "email"],
      geo_restrictions: []
    },
    trackingLink: `https://track.partner.com/${offerId}/{{subid}}`,
    createdAt: "2024-01-15T10:30:00Z",
    advertiserInfo: {
      name: "1Win Gaming",
      company: "1Win Entertainment Ltd"
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: `${label} скопировано в буфер обмена`,
    });
  };

  const categoryProps = getCategoryBadgeProps(offerDetails.category);

  return (
    <div className="space-y-6">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/affiliate/offers")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к офферам
        </Button>
        <h1 className="text-2xl font-bold">Детали оффера</h1>
      </div>

      {/* Основная информация об оффере */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <img 
              src={offerDetails.logo} 
              alt={offerDetails.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-xl">{offerDetails.name}</CardTitle>
                <Badge className={categoryProps.className}>
                  {categoryProps.label}
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Активен
                </Badge>
              </div>
              <p className="text-muted-foreground">{offerDetails.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-600">${offerDetails.payout}</p>
                <p className="text-sm text-muted-foreground">Выплата за {offerDetails.payoutType.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <Globe className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-600">{offerDetails.countries.length} стран</p>
                <p className="text-sm text-muted-foreground">Доступные гео</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg dark:bg-purple-900/20">
              <Building2 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-600">{offerDetails.advertiserInfo.name}</p>
                <p className="text-sm text-muted-foreground">Рекламодатель</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg dark:bg-orange-900/20">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-600">
                  {new Date(offerDetails.createdAt).toLocaleDateString('ru-RU')}
                </p>
                <p className="text-sm text-muted-foreground">Дата создания</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Трекинговая ссылка - только для одобренных офферов */}
      {isApproved ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Трекинговая ссылка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg dark:bg-gray-900/50">
              <code className="flex-1 text-sm font-mono">{offerDetails.trackingLink}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(offerDetails.trackingLink, "Трекинговая ссылка")}
                title="Копировать ссылку"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Замените {"{{"}<code>subid</code>{"}"} на ваш уникальный идентификатор трафика
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Гео-таргетинг */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Доступные страны
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {offerDetails.countries.map((country) => (
              <div key={country} className="flex items-center gap-2 p-2 border rounded-lg">
                <span className="text-lg">{getCountryFlag(country)}</span>
                <span className="font-medium">{getCountryName(country)}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {country}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Лендинг страницы - условно для одобренных или кнопка запроса */}
      {isApproved ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Лендинг страницы ({offerDetails.landingPages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {offerDetails.landingPages.map((landing) => (
                <div key={landing.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{landing.name}</h4>
                      {landing.isDefault && (
                        <Badge variant="default" className="text-xs">По умолчанию</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">{landing.type}</Badge>
                    </div>
                    <code className="text-sm text-muted-foreground">{landing.url}</code>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(landing.url, "URL лендинга")}
                      title="Копировать URL"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(landing.url, '_blank')}
                      title="Открыть в новой вкладке"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Доступ к лендингам
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4 py-12">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <div>
              <h3 className="text-lg font-medium mb-2">
                {requestStatus === 'pending' ? 'Запрос отправлен' : 'Требуется доступ'}
              </h3>
              <p className="text-muted-foreground">
                {requestStatus === 'pending' 
                  ? 'Ваш запрос на доступ к лендингам и ссылкам рассматривается рекламодателем'
                  : 'Для получения ссылок отслеживания и лендинг-страниц необходимо запросить доступ у рекламодателя'
                }
              </p>
            </div>
            {requestStatus === 'none' && (
              <Button 
                onClick={handleRequestAccess}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Запросить доступ
              </Button>
            )}
            {requestStatus === 'pending' && (
              <Button 
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 px-8"
                disabled
              >
                В ожидании одобрения
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* KPI условия */}
      <Card>
        <CardHeader>
          <CardTitle>Условия и требования</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">KPI условия</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {offerDetails.kpiConditions.minDeposit && (
                <div className="p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
                  <p className="text-sm text-muted-foreground">Мин. депозит</p>
                  <p className="font-semibold text-green-600">${offerDetails.kpiConditions.minDeposit}</p>
                </div>
              )}
              {offerDetails.kpiConditions.minAge && (
                <div className="p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                  <p className="text-sm text-muted-foreground">Мин. возраст</p>
                  <p className="font-semibold text-blue-600">{offerDetails.kpiConditions.minAge}+</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Разрешенные источники трафика</h4>
            <div className="flex flex-wrap gap-2">
              {offerDetails.kpiConditions.allowedTrafficTypes?.map((type) => (
                <Badge key={type} variant="secondary">{type}</Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Запрещенные источники</h4>
            <div className="flex flex-wrap gap-2">
              {offerDetails.restrictions.forbidden_sources?.map((source) => (
                <Badge key={source} variant="destructive">{source}</Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Разрешенные площадки</h4>
            <div className="flex flex-wrap gap-2">
              {offerDetails.restrictions.allowed_sources?.map((source) => (
                <Badge key={source} variant="outline" className="border-green-600 text-green-600">{source}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}