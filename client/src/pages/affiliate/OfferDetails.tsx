import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Copy, Globe, MapPin, DollarSign, Target, Calendar, Building2, ExternalLink, ArrowLeft, Lock, FileText, Download, Link, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { OfferLogo } from "@/components/ui/offer-logo";
import { getCountryFlag, getCountryName } from '@/utils/countries';

import { transformLandingUrl } from "@/lib/queryClient";

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
  payoutByGeo?: Record<string, number>; // Выплаты по странам
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

const countryNames: Record<string, string> = {
  'US': '🇺🇸 США',
  'RU': '🇷🇺 Россия',
  'DE': '🇩🇪 Германия',
  'FR': '🇫🇷 Франция',
  'IT': '🇮🇹 Италия',
  'ES': '🇪🇸 Испания',
  'PT': '🇵🇹 Португалия',
  'BR': '🇧🇷 Бразилия',
  'IN': '🇮🇳 Индия',
  'ID': '🇮🇩 Индонезия',
  'MY': '🇲🇾 Малайзия',
  'TH': '🇹🇭 Таиланд',
  'VN': '🇻🇳 Вьетнам',
  'PH': '🇵🇭 Филиппины',
  'KR': '🇰🇷 Южная Корея',
  'JP': '🇯🇵 Япония',
  'CN': '🇨🇳 Китай',
  'AU': '🇦🇺 Австралия',
  'CA': '🇨🇦 Канада',
  'GB': '🇬🇧 Великобритания',
  'UA': '🇺🇦 Украина',
  'PL': '🇵🇱 Польша',
  'TR': '🇹🇷 Турция',
  'MX': '🇲🇽 Мексика',
  'AR': '🇦🇷 Аргентина',
  'CL': '🇨🇱 Чили',
  'CO': '🇨🇴 Колумбия',
  'PE': '🇵🇪 Перу'
};

// Component for displaying landing pages with custom domain transformation
const LandingPagesCard = ({ 
  landingPages, 
  offerId, 
  onCopyUrl 
}: { 
  landingPages: any[];
  offerId: string;
  onCopyUrl: (url: string, type: string) => void;
}) => {
  const [transformedUrls, setTransformedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [expandedLanding, setExpandedLanding] = useState<string | null>(null);
  const [subParams, setSubParams] = useState<Record<string, {
    sub1: string;
    sub2: string;
    sub3: string;
    sub4: string;
    sub5: string;
    sub6: string;
    sub7: string;
    sub8: string;
    sub9: string;
    sub10: string;
    sub11: string;
    sub12: string;
    sub13: string;
    sub14: string;
    sub15: string;
    sub16: string;
  }>>({});

  const getTransformedUrl = async (landing: any) => {
    if (transformedUrls[landing.id]) {
      return transformedUrls[landing.id];
    }

    if (loading[landing.id]) {
      return landing.url; // Return original while loading
    }

    try {
      setLoading(prev => ({ ...prev, [landing.id]: true }));
      const transformedUrl = await transformLandingUrl({
        originalUrl: landing.url,
        offerId
      });
      setTransformedUrls(prev => ({ ...prev, [landing.id]: transformedUrl }));
      return transformedUrl;
    } catch (error) {
      console.error('Failed to transform landing URL:', error);
      return landing.url; // Fallback to original
    } finally {
      setLoading(prev => ({ ...prev, [landing.id]: false }));
    }
  };

  const getUrlWithSubParams = async (landing: any) => {
    const baseUrl = await getTransformedUrl(landing);
    const landingSubParams = subParams[landing.id];
    
    if (!landingSubParams) {
      return baseUrl;
    }

    const url = new URL(baseUrl);
    
    if (landingSubParams.sub1) url.searchParams.set('sub1', landingSubParams.sub1);
    if (landingSubParams.sub2) url.searchParams.set('sub2', landingSubParams.sub2);
    if (landingSubParams.sub3) url.searchParams.set('sub3', landingSubParams.sub3);
    if (landingSubParams.sub4) url.searchParams.set('sub4', landingSubParams.sub4);
    if (landingSubParams.sub5) url.searchParams.set('sub5', landingSubParams.sub5);
    if (landingSubParams.sub6) url.searchParams.set('sub6', landingSubParams.sub6);
    if (landingSubParams.sub7) url.searchParams.set('sub7', landingSubParams.sub7);
    if (landingSubParams.sub8) url.searchParams.set('sub8', landingSubParams.sub8);
    if (landingSubParams.sub9) url.searchParams.set('sub9', landingSubParams.sub9);
    if (landingSubParams.sub10) url.searchParams.set('sub10', landingSubParams.sub10);
    if (landingSubParams.sub11) url.searchParams.set('sub11', landingSubParams.sub11);
    if (landingSubParams.sub12) url.searchParams.set('sub12', landingSubParams.sub12);
    if (landingSubParams.sub13) url.searchParams.set('sub13', landingSubParams.sub13);
    if (landingSubParams.sub14) url.searchParams.set('sub14', landingSubParams.sub14);
    if (landingSubParams.sub15) url.searchParams.set('sub15', landingSubParams.sub15);
    if (landingSubParams.sub16) url.searchParams.set('sub16', landingSubParams.sub16);
    
    return url.toString();
  };

  const handleCopyUrl = async (landing: any) => {
    const url = await getUrlWithSubParams(landing);
    onCopyUrl(url, "URL лендинга с параметрами");
  };

  const handleOpenUrl = async (landing: any) => {
    const url = await getUrlWithSubParams(landing);
    window.open(url, '_blank');
  };

  const handleSubParamChange = (landingId: string, param: string, value: string) => {
    setSubParams(prev => ({
      ...prev,
      [landingId]: {
        ...prev[landingId],
        [param]: value
      }
    }));
  };

  const toggleExpanded = (landingId: string) => {
    setExpandedLanding(expandedLanding === landingId ? null : landingId);
  };

  useEffect(() => {
    // Pre-transform URLs for better UX
    landingPages.forEach(landing => {
      getTransformedUrl(landing);
      // Initialize sub params for each landing
      if (!subParams[landing.id]) {
        setSubParams(prev => ({
          ...prev,
          [landing.id]: { 
            sub1: '', sub2: '', sub3: '', sub4: '', sub5: '', sub6: '', sub7: '', sub8: '',
            sub9: '', sub10: '', sub11: '', sub12: '', sub13: '', sub14: '', sub15: '', sub16: ''
          }
        }));
      }
    });
  }, [landingPages, offerId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5" />
          Готовые трекинговые ссылки ({landingPages.length})
        </CardTitle>
        <CardDescription>
          Готовые ссылки с кастомными доменами и автоматическим tracking. Никаких настроек не требуется - просто копируйте и используйте.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {landingPages.map((landing: any) => (
            <div key={landing.id} className="border rounded-lg">
              <div className="flex items-start justify-between p-3 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-medium">{landing.name}</h4>
                    {landing.isDefault && (
                      <Badge variant="default" className="text-xs">По умолчанию</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">{landing.type}</Badge>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      ✓ С трекингом
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {transformedUrls[landing.id] ? (
                      <code className="text-sm text-green-600 dark:text-green-400 block font-medium break-all overflow-hidden">
                        {subParams[landing.id] && Object.values(subParams[landing.id]).some(val => val) ? 
                          (() => {
                            const url = new URL(transformedUrls[landing.id]);
                            Object.entries(subParams[landing.id]).forEach(([key, value]) => {
                              if (value) url.searchParams.set(key, value);
                            });
                            return url.toString();
                          })() : 
                          transformedUrls[landing.id]
                        }
                      </code>
                    ) : loading[landing.id] ? (
                      <span className="text-xs text-muted-foreground">⏳ Подготавливаем ссылку...</span>
                    ) : (
                      <code className="text-sm text-muted-foreground">
                        Ссылка будет готова через секунду...
                      </code>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyUrl(landing)}
                    title="Копировать URL"
                    disabled={loading[landing.id]}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenUrl(landing)}
                    title="Открыть в новой вкладке"
                    disabled={loading[landing.id]}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleExpanded(landing.id)}
                    title="Дополнительные параметры"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Дополнительно
                  </Button>
                </div>
              </div>
              
              {/* Выпадающая секция с sub-параметрами */}
              {expandedLanding === landing.id && (
                <div className="border-t bg-gray-50 dark:bg-gray-900/50 p-4">
                  <h5 className="font-medium text-sm mb-3 text-gray-700 dark:text-gray-300">
                    Дополнительные параметры трекинга (sub1-sub16)
                  </h5>
                  
                  {/* Основные параметры */}
                  <div className="mb-4">
                    <h6 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                      Основные параметры
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          sub1 - источник
                        </label>
                        <Input
                          placeholder="facebook, google..."
                          value={subParams[landing.id]?.sub1 || ''}
                          onChange={(e) => handleSubParamChange(landing.id, 'sub1', e.target.value)}
                          className="text-sm h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          sub2 - кампания
                        </label>
                        <Input
                          placeholder="campaign_name..."
                          value={subParams[landing.id]?.sub2 || ''}
                          onChange={(e) => handleSubParamChange(landing.id, 'sub2', e.target.value)}
                          className="text-sm h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          sub3 - креатив
                        </label>
                        <Input
                          placeholder="banner_1..."
                          value={subParams[landing.id]?.sub3 || ''}
                          onChange={(e) => handleSubParamChange(landing.id, 'sub3', e.target.value)}
                          className="text-sm h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          sub4 - аудитория
                        </label>
                        <Input
                          placeholder="audience_18+"
                          value={subParams[landing.id]?.sub4 || ''}
                          onChange={(e) => handleSubParamChange(landing.id, 'sub4', e.target.value)}
                          className="text-sm h-8"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Дополнительные параметры */}
                  <div className="mb-4">
                    <h6 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                      Дополнительные параметры
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                        <div key={num} className="space-y-1">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            sub{num}
                          </label>
                          <Input
                            placeholder={`параметр ${num}`}
                            value={subParams[landing.id]?.[`sub${num}` as keyof typeof subParams[typeof landing.id]] || ''}
                            onChange={(e) => handleSubParamChange(landing.id, `sub${num}`, e.target.value)}
                            className="text-sm h-8"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Расширенные параметры */}
                  <div>
                    <h6 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                      Расширенные параметры
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[13, 14, 15, 16].map(num => (
                        <div key={num} className="space-y-1">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            sub{num}
                          </label>
                          <Input
                            placeholder={`параметр ${num}`}
                            value={subParams[landing.id]?.[`sub${num}` as keyof typeof subParams[typeof landing.id]] || ''}
                            onChange={(e) => handleSubParamChange(landing.id, `sub${num}`, e.target.value)}
                            className="text-sm h-8"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>💡</span>
                    <span>Параметры автоматически добавляются в ссылку при заполнении. Поддерживается до 16 sub-параметров.</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
};

export default function OfferDetails() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const offerId = params.id;

  // Загрузка актуальных данных оффера
  const { data: offer, isLoading: offerLoading, error: offerError } = useQuery<any>({
    queryKey: [`/api/partner/offers/${offerId}`],
    enabled: !!offerId,
    staleTime: 1 * 60 * 1000, // 1 минута
  });

  // Загрузка статуса запроса доступа для текущего оффера
  const { data: accessRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/partner/access-requests"],
    staleTime: 2 * 60 * 1000,
  });

  // Находим запрос для текущего оффера
  const currentRequest = accessRequests.find((req: any) => {
    const reqOfferId = req.offerId || req.offer_id;
    return reqOfferId === offerId;
  });
  
  // КРИТИЧНО: Доступ только после одобрения запроса рекламодателем
  const requestStatus = currentRequest?.status || 'none';
  const isApproved = requestStatus === 'approved';

  // Отладка статуса  
  console.log('OfferDetails Debug:', {
    offerId,
    accessRequests: accessRequests.length,
    currentRequest,
    requestStatus,
    isApproved,
    offerIsApproved: offer?.isApproved,
    offerIsPrivate: offer?.isPrivate,
    offerCreatives: offer?.creatives,
    offerCreativesUrl: offer?.creativesUrl,
    hasCreatives: !!(offer?.creatives || offer?.creativesUrl),
    allMatchingRequests: accessRequests.filter((req: any) => {
      const reqOfferId = req.offerId || req.offer_id;
      return reqOfferId === offerId;
    }).map((req: any) => ({ 
      id: req.id, 
      offerId: req.offerId || req.offer_id, 
      status: req.status 
    }))
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
            <OfferLogo 
              name={offer?.name || 'Оффер'}
              logo={offer?.logo}
              size="xl"
              showTooltip={true}
            />
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
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-600">
                  {offer?.createdAt ? new Date(offer.createdAt).toLocaleDateString('ru-RU') : ''}
                </p>
                <p className="text-sm text-muted-foreground">Дата создания оффера</p>
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
              <FileText className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-semibold text-orange-600">Креативы</p>
                <p className="text-sm text-muted-foreground">Архив с материалами</p>
              </div>
              {isApproved && (
                <Button
                  onClick={() => downloadCreatives(offer.creatives || offer.creativesUrl)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  title="Скачать креативы"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>





      {/* Гео-таргетинг */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Доступные страны
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(offer.countries || []).map((country: string) => {
              const countryPayout = offer.payoutByGeo?.[country.toLowerCase()] || offer.payoutByGeo?.[country.toUpperCase()] || parseFloat(offer.payout);
              return (
                <div key={country} className="flex items-center justify-between gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" title={getCountryName(country)}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xl">{getCountryFlag(country)}</span>
                    <span className="font-medium text-sm">{getCountryName(country)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:text-white dark:border-blue-500 font-bold text-sm px-2 py-1">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {countryPayout}{offer.currency}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {country.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Готовые трекинговые ссылки - условно для одобренных или кнопка запроса */}
      {isApproved ? (
        <LandingPagesCard 
          landingPages={offer.landingPages || []} 
          offerId={offer.id}
          onCopyUrl={copyToClipboard}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Готовые трекинговые ссылки
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
                  ? 'Ваш запрос на доступ к готовым трекинговым ссылкам рассматривается рекламодателем'
                  : 'Для получения готовых трекинговых ссылок с кастомными доменами необходимо запросить доступ у рекламодателя'
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