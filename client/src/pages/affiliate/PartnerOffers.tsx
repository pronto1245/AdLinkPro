import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { MoreHorizontal, Target, BarChart3, MousePointer, Zap, Send, Clock, CheckCircle, Copy } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/auth-context";
import { apiRequest } from "../../lib/queryClient";
import { OfferLogo } from "../components/ui/offer-logo";
import { getCountryFlag } from "../../utils/countries";


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
  isApproved?: boolean;
  partnerLink?: string;
  baseUrl?: string;
  kpiConditions?: any;
  countries: any;
  landingPages?: any[];
  createdAt: string;
  geoPricing?: Record<string, number>;
  // Новые поля для системы запросов доступа
  accessStatus: 'available' | 'pending' | 'approved' | 'rejected';
  hasFullAccess: boolean;
  advertiserName?: string;
  rejectReason?: string;
}

// Функция для получения свойств бейджа категории
function getCategoryBadgeProps(category: string, t: any) {
  const categories: Record<string, { label: string; className: string }> = {
    gambling: { label: t('offers.gambling'), className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    dating: { label: t('offers.dating'), className: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300" },
    finance: { label: t('offers.finance'), className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    crypto: { label: t('offers.crypto'), className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
    nutra: { label: t('offers.health'), className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    software: { label: t('offers.software'), className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
  };
  return categories[category?.toLowerCase()] || { label: category || t('offers.default'), className: "bg-gray-100 text-gray-800" };
}

function getPayoutTypeBadgeProps(payoutType: string, t: any) {
  const types: Record<string, { label: string; className: string }> = {
    cpa: { label: t('offers.cpa'), className: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300" },
    cpl: { label: t('offers.cpl'), className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300" },
    cps: { label: t('offers.cps'), className: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-300" },
    cpi: { label: "CPI", className: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-300" },
    cpm: { label: t('offers.cpm'), className: "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900 dark:text-pink-300" },
  };
  return types[payoutType?.toLowerCase()] || { label: payoutType?.toUpperCase() || "CPA", className: "bg-gray-100 text-gray-800 border-gray-300" };
}

// Функция для форматирования CR
function formatCR(cr: number | undefined): string {
  if (cr === undefined || cr === null) return "0.00";
  return Math.ceil(cr * 100) / 100 + "";
}



export default function PartnerOffers() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Fetch partner offers with auto-generated links  
  const { data: offers = [], isLoading } = useQuery<PartnerOffer[]>({
    queryKey: ["/api/partner/offers"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation для запроса доступа к офферу
  const requestAccessMutation = useMutation({
    mutationFn: async (data: { offerId: string; message?: string }) => {
      return await apiRequest("/api/partner/offer-access-request", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: t('offers.requestSent', 'Запрос отправлен'),
        description: t('offers.requestSentDesc', 'Ваш запрос на доступ к офферу был отправлен рекламодателю'),
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/offers"] });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Ошибка'),
        description: error.message || t('offers.requestError', 'Не удалось отправить запрос'),
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('common.copied'),
      description: t('common.copiedDesc', { item: label }),
    });
  };

  // Обработка запроса доступа к офферу
  const handleRequestOffer = (offerId: string, currentStatus: string) => {
    if (currentStatus === 'approved') {
      // Если доступ уже одобрен, копируем ссылку или переходим к получению ссылки
      const offer = offers.find(o => o.id === offerId);
      if (offer?.partnerLink) {
        copyToClipboard(offer.partnerLink, "Партнерская ссылка");
      } else {
        // Переходим на страницу деталей оффера для получения ссылки
        navigate(`/affiliate/offers/${offerId}`);
      }
    } else if (currentStatus !== 'pending') {
      // Отправляем запрос на доступ
      requestAccessMutation.mutate({ offerId });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
          <p>{t('offers.loading', 'Загрузка офферов...')}</p>
        </div>
      </div>
    );
  }

  // Используем реальные данные из API
  const displayOffers = offers;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('offers.partnerOffers')}</h1>
          <p className="text-muted-foreground">
            {t('offers.subtitle')}
          </p>
        </div>
        <Badge variant="outline">{displayOffers.length} {t('offers.title').toLowerCase()}</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name', 'Название')}</TableHead>
                  <TableHead>{t('offers.category')}</TableHead>
                  <TableHead>{t('common.payoutType', 'Тип выплаты')}</TableHead>
                  <TableHead>{t('offers.countries', 'Гео')}</TableHead>
                  <TableHead>{t('common.amount')}</TableHead>
                  <TableHead>CR</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayOffers.map((offer) => {
                  const categoryProps = getCategoryBadgeProps(offer.category, t);
                  const payoutTypeProps = getPayoutTypeBadgeProps(offer.payoutType, t);
                  const cr = 0; // CR будет добавлен позже из реальной статистики
                  const requestStatus = offer.accessStatus || (offer.hasFullAccess ? 'approved' : 'none');
                  
                  // Если есть geoPricing, создаем строку для каждого гео
                  if (offer.geoPricing && Object.keys(offer.geoPricing).length > 0) {
                    return Object.entries(offer.geoPricing).map(([geo, price]: [string, number], index) => (
                      <TableRow key={`${offer.id}-${geo}`} className="hover:bg-gray-50/50">
                        {/* Название - показываем только в первой строке */}
                        <TableCell>
                          {index === 0 ? (
                            <div className="flex items-center gap-3">
                              <OfferLogo 
                                name={offer.name}
                                logo={offer.logo}
                                size="md"
                                showTooltip={true}
                              />
                              <div>
                                <div 
                                  className="font-medium cursor-pointer text-blue-600 underline hover:text-blue-800 hover:no-underline transition-colors"
                                  onClick={() => navigate(`/affiliate/offers/${offer.id}`)}
                                >
                                  {offer.name}
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </TableCell>

                        {/* Категория - показываем только в первой строке */}
                        <TableCell>
                          {index === 0 ? (
                            <Badge className={categoryProps.className}>
                              {categoryProps.label}
                            </Badge>
                          ) : null}
                        </TableCell>

                        {/* Тип выплаты - показываем только в первой строке */}
                        <TableCell>
                          {index === 0 ? (
                            <Badge variant="outline" className={`uppercase font-semibold ${payoutTypeProps.className}`}>
                              {payoutTypeProps.label}
                            </Badge>
                          ) : null}
                        </TableCell>

                        {/* Гео - показываем конкретное гео для каждой строки */}
                        <TableCell>
                          <div className="flex items-center gap-0.5 bg-gray-50 rounded px-1 py-0.5 w-fit">
                            <span className="text-sm leading-none">{getCountryFlag(geo)}</span>
                            <span className="text-xs font-medium">{geo}</span>
                          </div>
                        </TableCell>

                        {/* Сумма - показываем сумму для конкретного гео */}
                        <TableCell>
                          <div className="font-mono font-medium">
                            ${price}
                          </div>
                        </TableCell>

                        {/* CR - показываем только в первой строке */}
                        <TableCell>
                          {index === 0 ? (
                            <div className="font-mono text-green-600 font-medium">
                              {formatCR(cr)}%
                            </div>
                          ) : null}
                        </TableCell>

                        {/* Действия - показываем только в первой строке */}
                        <TableCell className="text-right">
                          {index === 0 ? (
                            <div className="flex items-center justify-end gap-2">
                              {(() => {
                                if (requestStatus === 'approved') {
                                  return (
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => handleRequestOffer(offer.id, requestStatus)}
                                      title={t('offers.accessApprovedTooltip', 'Доступ одобрен - получить ссылку')}
                                    >
                                      {t('offers.getLink', 'Забрать ссылку')}
                                    </Button>
                                  );
                                } else if (requestStatus === 'pending') {
                                  return (
                                    <Button
                                      size="sm"
                                      disabled
                                      className="bg-yellow-500 text-white cursor-not-allowed opacity-90"
                                      title={t('offers.requestPendingTooltip', 'Запрос отправлен, ожидает рассмотрения рекламодателем')}
                                    >
                                      {t('offers.pending', 'В ожидании')}
                                    </Button>
                                  );
                                } else if (requestStatus === 'rejected') {
                                  return (
                                    <Button
                                      size="sm"
                                      disabled
                                      className="bg-red-500 text-white cursor-not-allowed opacity-90"
                                      title={`${t('offers.accessRejected', 'Доступ отклонен')}${offer.rejectReason ? `: ${offer.rejectReason}` : ''}`}
                                    >
                                      {t('offers.rejected', 'Отклонен')}
                                    </Button>
                                  );
                                } else {
                                  return (
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                      onClick={() => handleRequestOffer(offer.id, requestStatus)}
                                      title={t('offers.requestAccessTooltip', 'Запросить доступ к офферу')}
                                    >
                                      {t('offers.requestAccess', 'Запросить')}
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
                                  <DropdownMenuItem
                                    onClick={() => navigate(`/affiliate/offers/${offer.id}`)}
                                  >
                                    <Target className="h-4 w-4 mr-2" />
                                    {t('offers.details', 'Детали')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => navigate(`/affiliate/statistics?offer=${offer.id}`)}
                                  >
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    {t('offers.statistics', 'Статистика')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ));
                  } else {
                    // Обычная строка для офферов без geoPricing
                    return (
                      <TableRow key={offer.id} className="hover:bg-gray-50/50">
                        {/* Название с лого */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <OfferLogo 
                              name={offer.name}
                              logo={offer.logo}
                              size="md"
                              showTooltip={true}
                            />
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
                          <Badge variant="outline" className={`uppercase font-semibold ${payoutTypeProps.className}`}>
                            {payoutTypeProps.label}
                          </Badge>
                        </TableCell>

                        {/* Гео */}
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

                        {/* Сумма */}
                        <TableCell>
                          <div className="font-mono font-medium">
                            ${offer.payout}
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
                            {(() => {
                              if (requestStatus === 'approved') {
                                return (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => navigate(`/affiliate/offers/${offer.id}`)}
                                    title={t('offers.accessApprovedTooltip', 'Доступ одобрен - получить ссылку')}
                                  >
                                    {t('offers.getLink', 'Забрать ссылку')}
                                  </Button>
                                );
                              } else if (requestStatus === 'pending') {
                                return (
                                  <Button
                                    size="sm"
                                    disabled
                                    className="bg-yellow-500 text-white cursor-not-allowed opacity-90"
                                    title={t('offers.requestPendingTooltip', 'Запрос отправлен, ожидает рассмотрения рекламодателем')}
                                  >
                                    {t('offers.pending', 'В ожидании')}
                                  </Button>
                                );
                              } else if (requestStatus === 'rejected') {
                                return (
                                  <Button
                                    size="sm"
                                    disabled
                                    className="bg-red-500 text-white cursor-not-allowed opacity-90"
                                    title={`${t('offers.accessRejected', 'Доступ отклонен')}${offer.rejectReason ? `: ${offer.rejectReason}` : ''}`}
                                  >
                                    {t('offers.rejected', 'Отклонен')}
                                  </Button>
                                );
                              } else {
                                return (
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => handleRequestOffer(offer.id, requestStatus)}
                                    title={t('offers.requestAccessTooltip', 'Запросить доступ к офферу')}
                                  >
                                    {t('offers.requestAccess', 'Запросить')}
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
                                <DropdownMenuItem
                                  onClick={() => navigate(`/affiliate/offers/${offer.id}`)}
                                >
                                  <Target className="h-4 w-4 mr-2" />
                                  {t('offers.details', 'Детали')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/affiliate/statistics?offer=${offer.id}`)}
                                >
                                  <BarChart3 className="h-4 w-4 mr-2" />
                                  {t('offers.statistics', 'Статистика')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }
                }).flat()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}