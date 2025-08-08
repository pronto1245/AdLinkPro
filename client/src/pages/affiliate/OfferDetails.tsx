import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Globe, MapPin, DollarSign, Target, Calendar, Building2, ExternalLink, ArrowLeft, Lock, FileText, Download } from "lucide-react";
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
  creatives?: string;
  creativesUrl?: string;
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

  // Загрузка актуальных данных оффера
  const { data: offer, isLoading: offerLoading, error: offerError } = useQuery({
    queryKey: ["/api/partner/offers", offerId],
    enabled: !!offerId,
    staleTime: 1 * 60 * 1000, // 1 минута
  });

  // Загрузка статуса запроса доступа для текущего оффера
  const { data: accessRequests = [] } = useQuery({
    queryKey: ["/api/partner/access-requests"],
    staleTime: 2 * 60 * 1000,
  });

  // Находим запрос для текущего оффера
  const currentRequest = accessRequests.find((req: any) => 
    req.offerId === offerId || req.offer_id === offerId
  );
  const requestStatus = currentRequest?.status || 'none';
  const isApproved = requestStatus === 'approved';

  // Отладка статуса  
  console.log('OfferDetails Debug:', {
    offerId,
    accessRequests: accessRequests.length,
    rawFirstRequest: accessRequests[0],
    allRequests: accessRequests.map((req: any) => ({ 
      id: req.id, 
      offerId: req.offerId || req.offer_id, 
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

  // Обработка загрузки данных
  if (offerLoading) {
    return (
      <div className="space-y-6">
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
          <h1 className="text-2xl font-bold">Загрузка...</h1>
        </div>
        <div className="text-center p-8">
          <p>Загружаем данные оффера...</p>
        </div>
      </div>
    );
  }

  if (offerError || !offer) {
    return (
      <div className="space-y-6">
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
          <h1 className="text-2xl font-bold">Ошибка</h1>
        </div>
        <div className="text-center p-8">
          <p>Оффер не найден или произошла ошибка при загрузке</p>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: `${label} скопировано в буфер обмена`,
    });
  };

  const downloadCreatives = async (creativesUrl: string) => {
    try {
      // Используем fetch с токеном авторизации для скачивания креативов
      const token = localStorage.getItem('auth_token');
      console.log('Download request - token available:', !!token);
      console.log('Making request to:', `/api/partner/offers/${offerId}/creatives/download`);
      
      if (!token) {
        toast({
          title: "Ошибка авторизации",
          description: "Токен не найден. Пожалуйста, войдите в систему заново",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/partner/offers/${offerId}/creatives/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast({
            title: "Доступ запрещен",
            description: "У вас нет доступа к креативам этого оффера",
            variant: "destructive",
          });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Получаем blob и создаем URL для скачивания
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `creatives-${offerId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Архив скачан",
        description: "ZIP-архив с креативами готов к использованию",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Ошибка скачивания",
        description: "Не удалось скачать креативы",
        variant: "destructive",
      });
    }
  };

  const categoryProps = getCategoryBadgeProps(offer?.category || 'other');
  
  // Дополняем страны Арменией если её нет в списке
  const countryNames: Record<string, string> = {
    'armenia': '🇦🇲 Армения',
    'RU': '🇷🇺 Россия', 'US': '🇺🇸 США', 'DE': '🇩🇪 Германия', 'FR': '🇫🇷 Франция', 'IT': '🇮🇹 Италия',
    'ES': '🇪🇸 Испания', 'UK': '🇬🇧 Великобритания', 'CA': '🇨🇦 Канада', 'AU': '🇦🇺 Австралия',
    'BR': '🇧🇷 Бразилия', 'MX': '🇲🇽 Мексика', 'IN': '🇮🇳 Индия', 'JP': '🇯🇵 Япония', 'KR': '🇰🇷 Южная Корея',
    'KZ': '🇰🇿 Казахстан', 'BY': '🇧🇾 Беларусь', 'UA': '🇺🇦 Украина', 'PL': '🇵🇱 Польша', 'TR': '🇹🇷 Турция'
  };
  
  // Получаем статус оффера
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="text-green-600 border-green-600">Активен</Badge>;
      case 'paused':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Приостановлен</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Архивирован</Badge>;
      default:
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Черновик</Badge>;
    }
  };

  // Проверяем, что у нас есть данные для отображения
  if (!offer) {
    return (
      <div className="space-y-6">
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
          <h1 className="text-2xl font-bold">Загрузка...</h1>
        </div>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загружаем данные оффера...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              {offer?.name ? offer.name.substring(0, 2).toUpperCase() : 'OF'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-xl">{offer?.name || 'Загрузка...'}</CardTitle>
                <Badge className={categoryProps.className}>
                  {categoryProps.label}
                </Badge>
                {getStatusBadge(offer?.status || 'draft')}
              </div>
              <p className="text-muted-foreground">
                {typeof offer?.description === 'object' 
                  ? (offer.description?.ru || offer.description?.en || 'Описание не указано')
                  : (offer?.description || 'Описание не указано')
                }
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-600">${offer?.payout || '0'} {offer?.currency || 'USD'}</p>
                <p className="text-sm text-muted-foreground">Выплата за {(offer?.payoutType || 'CPA').toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <Globe className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-600">{offer?.countries?.length || 0} стран</p>
                <p className="text-sm text-muted-foreground">Доступные гео</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg dark:bg-purple-900/20">
              <Building2 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-600">
                  {offer?.advertiserId ? `ID ${offer.advertiserId.substring(0, 8)}...` : 'Рекламодатель'}
                </p>
                <p className="text-sm text-muted-foreground">Рекламодатель</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg dark:bg-orange-900/20">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-600">
                  {offer?.createdAt ? new Date(offer.createdAt).toLocaleDateString('ru-RU') : ''}
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
              <code className="flex-1 text-sm font-mono">{offer.partnerLink || `https://track.platform.com/click/${offer.id}?partner=${currentRequest?.partnerId}&subid=YOUR_SUBID`}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(offer.partnerLink || `https://track.platform.com/click/${offer.id}?partner=${currentRequest?.partnerId}&subid=YOUR_SUBID`, "Трекинговая ссылка")}
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

      {/* Креативы - только для одобренных */}
      {isApproved && (offer.creatives || offer.creativesUrl) ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Креативы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium">Архив с креативами</h4>
                  <p className="text-sm text-muted-foreground">ZIP архив с рекламными материалами</p>
                </div>
              </div>
              <Button
                onClick={() => downloadCreatives(offer.creatives || offer.creativesUrl)}
                className="bg-green-600 hover:bg-green-700 text-white"
                title="Скачать креативы"
              >
                <Download className="w-4 h-4 mr-2" />
                Скачать
              </Button>
            </div>
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
            {(offer.countries || []).map((country: string) => (
              <div key={country} className="flex items-center gap-2 p-2 border rounded-lg">
                <span className="text-lg">{countryNames[country] ? countryNames[country].split(' ')[0] : getCountryFlag(country)}</span>
                <span className="font-medium">{countryNames[country] ? countryNames[country].split(' ')[1] : getCountryName(country)}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {country.toUpperCase()}
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
              Лендинг страницы ({(offer.landingPages || []).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(offer.landingPages || []).map((landing: any) => (
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
              {offer?.kpiConditions?.minDeposit && (
                <div className="p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
                  <p className="text-sm text-muted-foreground">Мин. депозит</p>
                  <p className="font-semibold text-green-600">${offer.kpiConditions.minDeposit}</p>
                </div>
              )}
              {offer?.kpiConditions?.minAge && (
                <div className="p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                  <p className="text-sm text-muted-foreground">Мин. возраст</p>
                  <p className="font-semibold text-blue-600">{offer.kpiConditions.minAge}+</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Разрешенные источники трафика</h4>
            <div className="flex flex-wrap gap-2">
              {offer?.kpiConditions?.allowedTrafficTypes?.map((type: string) => (
                <Badge key={type} variant="secondary">{type}</Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Запрещенные источники</h4>
            <div className="flex flex-wrap gap-2">
              {offer?.restrictions?.forbidden_sources?.map((source: string) => (
                <Badge key={source} variant="destructive">{source}</Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Разрешенные площадки</h4>
            <div className="flex flex-wrap gap-2">
              {offer?.restrictions?.allowed_sources?.map((source: string) => (
                <Badge key={source} variant="outline" className="border-green-600 text-green-600">{source}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}