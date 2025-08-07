import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Target, BarChart3, MousePointer, Zap } from "lucide-react";
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
  geoPricing?: Record<string, number>; // Выплаты по гео
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
  return categories[category?.toLowerCase()] || { label: category || "Другое", className: "bg-gray-100 text-gray-800" };
}

// Функция для форматирования CR
function formatCR(cr: number | undefined): string {
  if (cr === undefined || cr === null) return "0.00";
  return Math.ceil(cr * 100) / 100 + "";
}

// Функция для получения флага страны
function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    RU: "🇷🇺", // Россия
    KZ: "🇰🇿", // Казахстан
    BY: "🇧🇾", // Беларусь
    US: "🇺🇸", // США
    DE: "🇩🇪", // Германия
    FR: "🇫🇷", // Франция
    UA: "🇺🇦", // Украина
    EU: "🇪🇺", // Европейский союз
    GB: "🇬🇧", // Великобритания
    IN: "🇮🇳", // Индия
    BR: "🇧🇷", // Бразилия
    CA: "🇨🇦", // Канада
    AU: "🇦🇺", // Австралия
    JP: "🇯🇵", // Япония
    CN: "🇨🇳", // Китай
    IT: "🇮🇹", // Италия
    ES: "🇪🇸", // Испания
    NL: "🇳🇱", // Нидерланды
    SE: "🇸🇪", // Швеция
    NO: "🇳🇴", // Норвегия
    DK: "🇩🇰", // Дания
    FI: "🇫🇮", // Финляндия
    PL: "🇵🇱", // Польша
    CZ: "🇨🇿", // Чехия
    AT: "🇦🇹", // Австрия
    CH: "🇨🇭", // Швейцария
    BE: "🇧🇪", // Бельгия
    PT: "🇵🇹", // Португалия
    GR: "🇬🇷", // Греция
    TR: "🇹🇷", // Турция
    MX: "🇲🇽", // Мексика
    AR: "🇦🇷", // Аргентина
    CL: "🇨🇱", // Чили
    CO: "🇨🇴", // Колумбия
    PE: "🇵🇪", // Перу
    VE: "🇻🇪", // Венесуэла
    ZA: "🇿🇦", // Южная Африка
    EG: "🇪🇬", // Египет
    NG: "🇳🇬", // Нигерия
    KE: "🇰🇪", // Кения
    MA: "🇲🇦", // Марокко
    TH: "🇹🇭", // Таиланд
    VN: "🇻🇳", // Вьетнам
    ID: "🇮🇩", // Индонезия
    MY: "🇲🇾", // Малайзия
    SG: "🇸🇬", // Сингапур
    PH: "🇵🇭", // Филиппины
    KR: "🇰🇷", // Южная Корея
    TW: "🇹🇼", // Тайвань
    HK: "🇭🇰", // Гонконг
    AE: "🇦🇪", // ОАЭ
    SA: "🇸🇦", // Саудовская Аравия
    IL: "🇮🇱", // Израиль
    IR: "🇮🇷", // Иран
    IQ: "🇮🇶", // Ирак
    PK: "🇵🇰", // Пакистан
    BD: "🇧🇩", // Бангладеш
    LK: "🇱🇰", // Шри-Ланка
    NP: "🇳🇵", // Непал
    MM: "🇲🇲", // Мьянма
    UZ: "🇺🇿", // Узбекистан
    KG: "🇰🇬", // Киргизия
    TJ: "🇹🇯", // Таджикистан
    TM: "🇹🇲", // Туркменистан
    AM: "🇦🇲", // Армения
    AZ: "🇦🇿", // Азербайджан
    GE: "🇬🇪", // Грузия
    MD: "🇲🇩", // Молдова
    RO: "🇷🇴", // Румыния
    BG: "🇧🇬", // Болгария
    RS: "🇷🇸", // Сербия
    HR: "🇭🇷", // Хорватия
    SI: "🇸🇮", // Словения
    SK: "🇸🇰", // Словакия
    HU: "🇭🇺", // Венгрия
    LT: "🇱🇹", // Литва
    LV: "🇱🇻", // Латвия
    EE: "🇪🇪", // Эстония
    IS: "🇮🇸", // Исландия
    IE: "🇮🇪", // Ирландия
    LU: "🇱🇺", // Люксембург
    MT: "🇲🇹", // Мальта
    CY: "🇨🇾", // Кипр
    MK: "🇲🇰", // Македония
    AL: "🇦🇱", // Албания
    BA: "🇧🇦", // Босния и Герцеговина
    ME: "🇲🇪", // Черногория
    XK: "🇽🇰", // Косово
    GLOBAL: "🌍", // Глобально
    WORLD: "🌍", // Весь мир
    WW: "🌍"    // Весь мир (сокращение)
  };
  return flags[countryCode.toUpperCase()] || "🌍";
}

export default function PartnerOffers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

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

  // Состояние запросов офферов
  const [offerRequests, setOfferRequests] = useState<Record<string, 'none' | 'pending' | 'approved'>>({
    '1': 'approved', // Первый оффер уже одобрен
    '2': 'none',     // Второй не запрошен
    '3': 'pending',  // Третий в ожидании
  });

  const handleRequestOffer = (offerId: string) => {
    const currentStatus = offerRequests[offerId] || 'none';
    
    if (currentStatus === 'none') {
      // Отправляем запрос
      setOfferRequests(prev => ({
        ...prev,
        [offerId]: 'pending'
      }));
      toast({
        title: "Запрос отправлен",
        description: "Ваш запрос на доступ к офферу отправлен рекламодателю",
      });
    } else if (currentStatus === 'approved') {
      // Переходим на страницу деталей оффера
      navigate(`/affiliate/offers/${offerId}`);
    }
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

  // Тестовые данные для демонстрации
  const testOffers: PartnerOffer[] = [
    {
      id: "1",
      name: "1Win Казино",
      description: "Популярное онлайн казино с широким выбором игр",
      logo: "https://via.placeholder.com/40x40/9333ea/ffffff?text=1W",
      category: "gambling",
      payout: "150",
      payoutType: "cpa",
      currency: "USD",
      status: "active",
      isApproved: true,
      partnerLink: "",
      baseUrl: "",
      kpiConditions: { countries: ["RU", "KZ"], minAge: 18 },
      countries: ["RU", "KZ", "BY"],
      landingPages: [],
      createdAt: "2024-01-01",
      geoPricing: {
        "RU": 200,
        "KZ": 180,
        "BY": 150
      }
    },
    {
      id: "2", 
      name: "Crypto Exchange Pro",
      description: "Профессиональная криптобиржа",
      logo: "https://via.placeholder.com/40x40/f59e0b/ffffff?text=CE",
      category: "crypto",
      payout: "75",
      payoutType: "cpl", 
      currency: "USD",
      status: "active",
      isApproved: false,
      partnerLink: "",
      baseUrl: "",
      kpiConditions: { countries: ["US", "EU"], minDeposit: 100 },
      countries: ["US", "DE", "FR", "GB", "IT"],
      landingPages: [],
      createdAt: "2024-01-02",
      geoPricing: {
        "US": 100,
        "DE": 85,
        "FR": 80,
        "GB": 90,
        "IT": 70
      }
    },
    {
      id: "3",
      name: "Dating Premium",
      description: "Премиальный сервис знакомств",
      logo: "https://via.placeholder.com/40x40/ec4899/ffffff?text=DP",
      category: "dating",
      payout: "45",
      payoutType: "cps",
      currency: "USD", 
      status: "active",
      isApproved: false,
      partnerLink: "",
      baseUrl: "",
      kpiConditions: { countries: ["RU", "UA"], minAge: 21 },
      countries: ["RU", "UA", "KZ"],
      landingPages: [],
      createdAt: "2024-01-03"
    },
    {
      id: "4",
      name: "FinTech Mobile",
      description: "Мобильное финансовое приложение",
      logo: "https://via.placeholder.com/40x40/10b981/ffffff?text=FT",
      category: "finance",
      payout: "120",
      payoutType: "cpi",
      currency: "USD", 
      status: "active",
      isApproved: false,
      partnerLink: "",
      baseUrl: "",
      kpiConditions: { countries: ["IN", "BR", "MX"], minAge: 18 },
      countries: ["IN", "BR", "MX", "ID", "TH"],
      landingPages: [],
      createdAt: "2024-01-04",
      geoPricing: {
        "IN": 50,
        "BR": 80,
        "MX": 90,
        "ID": 45,
        "TH": 55
      }
    }
  ];

  // Используем тестовые данные если API не вернул данные
  const displayOffers = offers.length > 0 ? offers : testOffers;

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Партнерские офферы</h1>
          <p className="text-muted-foreground">
            Просматривайте доступные офферы и запрашивайте доступ
          </p>
        </div>
        <Badge variant="outline">{displayOffers.length} офферов</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Тип выплаты</TableHead>
                  <TableHead>Гео</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>CR</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayOffers.map((offer) => {
                  const categoryProps = getCategoryBadgeProps(offer.category);
                  const cr = Math.random() * 10; // Тестовый CR
                  
                  return (
                    <TableRow key={offer.id}>
                      {/* Название с лого */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {offer.logo ? (
                            <img 
                              src={offer.logo} 
                              alt={offer.name}
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                              <Target className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div 
                              className="font-medium cursor-pointer text-blue-600 underline hover:text-blue-800 hover:no-underline transition-colors"
                              onClick={() => navigate(`/affiliate/offers/${offer.id}`)}
                            >
                              {offer.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Категория */}
                      <TableCell>
                        <Badge className={categoryProps.className}>
                          {categoryProps.label}
                        </Badge>
                      </TableCell>

                      {/* Тип выплаты */}
                      <TableCell>
                        <Badge variant="outline" className="uppercase font-semibold">
                          {offer.payoutType || 'CPA'}
                        </Badge>
                      </TableCell>

                      {/* Гео с флагами */}
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap max-w-[100px]">
                          {Array.isArray(offer.countries) 
                            ? offer.countries.slice(0, 3).map((country: string) => (
                                <div key={country} className="flex items-center gap-0.5 bg-gray-50 rounded px-1 py-0.5">
                                  <span className="text-sm leading-none">{getCountryFlag(country)}</span>
                                  <span className="text-xs font-medium">{country}</span>
                                </div>
                              ))
                            : (
                                <div className="flex items-center gap-0.5 bg-gray-50 rounded px-1 py-0.5">
                                  <span className="text-sm leading-none">{getCountryFlag(offer.countries)}</span>
                                  <span className="text-xs font-medium">{offer.countries}</span>
                                </div>
                              )
                          }
                          {Array.isArray(offer.countries) && offer.countries.length > 3 && (
                            <span className="text-xs text-muted-foreground bg-gray-100 rounded px-1 py-0.5">
                              +{offer.countries.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Сумма с разбивкой по гео */}
                      <TableCell>
                        {offer.geoPricing ? (
                          <div className="space-y-1">
                            {Object.entries(offer.geoPricing).slice(0, 3).map(([geo, price]: [string, number]) => (
                              <div key={geo} className="flex items-center gap-2 text-sm">
                                <span className="text-xs">{getCountryFlag(geo)}</span>
                                <span className="font-mono font-medium">${price}</span>
                              </div>
                            ))}
                            {Object.keys(offer.geoPricing).length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{Object.keys(offer.geoPricing).length - 3} гео
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="font-mono font-medium">
                            ${offer.payout}
                          </div>
                        )}
                      </TableCell>

                      {/* CR */}
                      <TableCell>
                        <div className="font-mono text-green-600 font-medium">
                          {formatCR(cr)}%
                        </div>
                      </TableCell>

                      {/* Действия */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(() => {
                            const requestStatus = offerRequests[offer.id] || 'none';
                            
                            if (requestStatus === 'approved') {
                              return (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleRequestOffer(offer.id)}
                                >
                                  Забрать ссылку
                                </Button>
                              );
                            } else if (requestStatus === 'pending') {
                              return (
                                <Button
                                  size="sm"
                                  disabled
                                  className="bg-yellow-500 text-white cursor-not-allowed opacity-90"
                                >
                                  В ожидании
                                </Button>
                              );
                            } else {
                              return (
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => handleRequestOffer(offer.id)}
                                >
                                  Запросить
                                </Button>
                              );
                            }
                          })()}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Target className="h-4 w-4 mr-2" />
                                Детали
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Статистика
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MousePointer className="h-4 w-4 mr-2" />
                                Клики
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Zap className="h-4 w-4 mr-2" />
                                Конверсии
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}