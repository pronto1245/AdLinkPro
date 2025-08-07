import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
    RU: "🇷🇺",
    KZ: "🇰🇿", 
    BY: "🇧🇾",
    US: "🇺🇸",
    DE: "🇩🇪",
    FR: "🇫🇷",
    UA: "🇺🇦",
    EU: "🇪🇺"
  };
  return flags[countryCode] || "🌍";
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

  const handleRequestOffer = (offerId: string) => {
    toast({
      title: "Запрос отправлен",
      description: "Ваш запрос на доступ к офферу отправлен рекламодателю",
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
      createdAt: "2024-01-01"
    },
    {
      id: "2", 
      name: "Crypto Exchange Pro",
      description: "Профессиональная криптобиржа",
      logo: "https://via.placeholder.com/40x40/f59e0b/ffffff?text=CE",
      category: "crypto",
      payout: "200",
      payoutType: "cpa", 
      currency: "USD",
      status: "active",
      isApproved: false,
      partnerLink: "",
      baseUrl: "",
      kpiConditions: { countries: ["US", "EU"], minDeposit: 100 },
      countries: ["US", "DE", "FR"],
      landingPages: [],
      createdAt: "2024-01-02"
    },
    {
      id: "3",
      name: "Dating Premium",
      description: "Премиальный сервис знакомств",
      logo: "https://via.placeholder.com/40x40/ec4899/ffffff?text=DP",
      category: "dating",
      payout: "80",
      payoutType: "cpa",
      currency: "USD", 
      status: "active",
      isApproved: false,
      partnerLink: "",
      baseUrl: "",
      kpiConditions: { countries: ["RU", "UA"], minAge: 21 },
      countries: ["RU", "UA", "KZ"],
      landingPages: [],
      createdAt: "2024-01-03"
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
                            <div className="font-medium">{offer.name}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Категория */}
                      <TableCell>
                        <Badge className={categoryProps.className}>
                          {categoryProps.label}
                        </Badge>
                      </TableCell>

                      {/* Гео с флагами */}
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {offer.countries?.slice(0, 3).map((country: string) => (
                            <div key={country} className="flex items-center gap-1">
                              <span className="text-lg">{getCountryFlag(country)}</span>
                              <span className="text-xs">{country}</span>
                            </div>
                          ))}
                          {offer.countries?.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{offer.countries.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Сумма */}
                      <TableCell>
                        <div className="font-mono font-medium">
                          ${offer.payout} {offer.payoutType?.toUpperCase()}
                        </div>
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
                          <Button
                            size="sm"
                            onClick={() => handleRequestOffer(offer.id)}
                            disabled={offer.isApproved}
                          >
                            {offer.isApproved ? "Одобрен" : "Запросить"}
                          </Button>
                          
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