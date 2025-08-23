import { useState } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Globe, MapPin, DollarSign, Target, Calendar, Building2, ExternalLink, ArrowLeft, FileText, Upload, Download, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreativeUploader } from '@/components/CreativeUploader';
import { getCountryFlag, getCountryName } from '@/utils/countries';

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
  // Статистика для рекламодателя
  stats: {
    totalPartners: number;
    activePartners: number;
    pendingRequests: number;
    totalClicks: number;
    conversions: number;
    revenue: number;
  };
}


// Функция для получения свойств бейджа категории
function getCategoryBadgeProps(category: string) {
  const categories: Record<string, { label: string; className: string }> = {
    gambling: { label: 'Гемблинг', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    dating: { label: 'Знакомства', className: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300' },
    finance: { label: 'Финансы', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    crypto: { label: 'Крипто', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    nutra: { label: 'Нутра', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    software: { label: 'ПО', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
  };

  return categories[category] || { label: category, className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' };
}

export default function AdvertiserOfferDetails() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const offerId = params.id;

  // Тестовые данные для детального оффера (рекламодатель видит больше информации)
  const offerDetails: OfferDetails = {
    id: offerId || '1',
    name: '1Win Казино - Premium',
    description: 'Топовое онлайн казино с высокой конверсией. Лицензированная платформа с широким выбором игр, слотов и живых дилеров. Привлекательные бонусы и мгновенные выплаты.',
    logo: 'https://via.placeholder.com/80x80/9333ea/ffffff?text=1W',
    category: 'gambling',
    payout: '150',
    payoutType: 'cpa',
    currency: 'USD',
    status: 'active',
    countries: ['RU', 'KZ', 'BY', 'UA'],
    creatives: '/creatives/1win-casino-pack.zip',
    creativesUrl: 'https://storage.googleapis.com/replit-objstore-test/creatives/1win-casino-pack.zip',
    landingPages: [
      {
        id: '1',
        name: 'Главная страница',
        url: 'https://1win-casino.com/main',
        type: 'main',
        isDefault: true
      },
      {
        id: '2',
        name: 'Страница регистрации',
        url: 'https://1win-casino.com/register',
        type: 'registration',
        isDefault: false
      },
      {
        id: '3',
        name: 'Промо-страница',
        url: 'https://1win-casino.com/promo-bonus',
        type: 'promo',
        isDefault: false
      }
    ],
    kpiConditions: {
      minDeposit: 50,
      minAge: 18,
      countries: ['RU', 'KZ', 'BY', 'UA'],
      allowedTrafficTypes: ['contextual', 'social', 'email']
    },
    restrictions: {
      forbidden_sources: ['adult', 'fraud', 'incentive'],
      allowed_sources: ['google', 'facebook', 'telegram', 'email'],
      geo_restrictions: []
    },
    trackingLink: `https://track.partner.com/${offerId}/{{subid}}`,
    createdAt: '2024-01-15T10:30:00Z',
    advertiserInfo: {
      name: '1Win Gaming',
      company: '1Win Entertainment Ltd'
    },
    stats: {
      totalPartners: 245,
      activePartners: 89,
      pendingRequests: 12,
      totalClicks: 15420,
      conversions: 892,
      revenue: 133800
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано',
      description: `${label} скопировано в буфер обмена`,
    });
  };

  const downloadCreatives = async (creativesUrl: string) => {
    try {
      // Рекламодатель может скачивать свои креативы напрямую
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/partner/offers/${offerId}/creatives/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
        title: 'Скачивание началось',
        description: 'ZIP архив с креативами успешно скачивается',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Ошибка скачивания',
        description: 'Не удалось скачать креативы',
        variant: 'destructive',
      });
    }
  };

  // Мутация для обновления креативов
  const updateCreativesMutation = useMutation({
    mutationFn: async (creativePath: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/offers/${offerId}/creatives`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ creativeUrl: creativePath }),
      });

      if (!response.ok) {
        throw new Error('Failed to update creatives');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Креативы обновлены',
        description: 'ZIP архив с креативами успешно загружен',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
    },
    onError: (error) => {
      console.error('Update creatives error:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить креативы',
        variant: 'destructive',
      });
    },
  });

  const categoryBadge = getCategoryBadgeProps(offerDetails.category);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/advertiser/offers')}
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
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src={offerDetails.logo}
                alt={offerDetails.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <CardTitle className="text-xl mb-2">{offerDetails.name}</CardTitle>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={categoryBadge.className}>
                    {categoryBadge.label}
                  </Badge>
                  <Badge variant={offerDetails.status === 'active' ? 'default' : 'secondary'}>
                    {offerDetails.status === 'active' ? 'Активен' : 'Неактивен'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{offerDetails.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {offerDetails.payout} {offerDetails.currency}
              </div>
              <div className="text-sm text-muted-foreground uppercase">
                {offerDetails.payoutType}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg dark:bg-green-900/20">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-600">${offerDetails.stats.revenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Доход</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <Globe className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-600">{offerDetails.stats.activePartners}</p>
                <p className="text-sm text-muted-foreground">Активных партнеров</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg dark:bg-purple-900/20">
              <Target className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-600">{offerDetails.stats.conversions}</p>
                <p className="text-sm text-muted-foreground">Конверсии</p>
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

      {/* Управление креативами - только для рекламодателя */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Управление креативами
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {offerDetails.creatives ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium">Текущий архив креативов</h4>
                  <p className="text-sm text-muted-foreground">ZIP архив с рекламными материалами</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => downloadCreatives(offerDetails.creatives!)}
                  title="Скачать текущие креативы"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Скачать
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Креативы не загружены</h4>
              <p className="text-sm text-muted-foreground">Загрузите ZIP архив с рекламными материалами</p>
            </div>
          )}

          {/* Загрузчик креативов */}
          <div className="border-t pt-4">
            <h5 className="font-medium mb-3">Загрузить новые креативы</h5>
            <CreativeUploader
              offerId={offerId!}
              onComplete={(creativePath) => {
                updateCreativesMutation.mutate(creativePath);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Трекинговая ссылка */}
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
              onClick={() => copyToClipboard(offerDetails.trackingLink, 'Трекинговая ссылка')}
              title="Копировать ссылку"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Партнеры заменят {'{{'}<code>subid</code>{'}'} на свой уникальный идентификатор трафика
          </p>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {offerDetails.countries.map((country) => (
              <div key={country} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" title={getCountryName(country)}>
                <span className="text-xl">{getCountryFlag(country)}</span>
                <span className="font-medium text-sm">{getCountryName(country)}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {country}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Лендинг страницы */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Лендинг страницы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {offerDetails.landingPages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{page.name}</h4>
                      {page.isDefault && (
                        <Badge variant="secondary" className="text-xs">По умолчанию</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {page.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{page.url}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(page.url, page.name)}
                    title="Копировать URL"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(page.url, '_blank')}
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
    </div>
  );
}
