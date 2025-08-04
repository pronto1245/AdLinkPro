import { useParams, useLocation } from 'wouter';
import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../../contexts/language-context';
import Sidebar from '../../components/layout/sidebar';
import { useSidebar } from '../../contexts/sidebar-context';
import Header from '../../components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Globe, Eye, DollarSign, Target, Users, BarChart3, Calendar, MapPin, Shield, Image, Activity, Clock } from 'lucide-react';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useToast } from '../../hooks/use-toast';
import { Upload, X, Download } from 'lucide-react';

export default function OfferDetails() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { t, language } = useLanguage();
  const { isCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState('details');
  const [uploadedCreatives, setUploadedCreatives] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const offerId = params.id;

  // Fetch all offers and find the specific one
  const { data: allOffers = [], isLoading } = useQuery({
    queryKey: ['/api/admin/offers'],
    enabled: !!offerId
  });

  const offer = (allOffers as any[]).find((o: any) => o.id === offerId);

  // Fetch offer stats  
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/offer-stats', offerId],
    enabled: !!offerId
  });

  // Type safety check  
  const statsData = stats as any;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Оффер не найден</p>
          <Button onClick={() => setLocation('/admin/offers')} className="mt-4">
            Вернуться к списку офферов
          </Button>
        </div>
      </div>
    );
  }

  // Category colors
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'gambling': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'finance': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'nutra': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      'dating': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      'lottery': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'crypto': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'ecommerce': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'mobile': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'gaming': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      'software': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  // Status colors
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      'blocked': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'archived': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  // Format geo pricing with fallback to basic payout
  const formatGeoPricing = (geoPricing: any, fallbackPayout?: any, currency?: string) => {
    // Сначала пробуем geoPricing
    if (geoPricing && Array.isArray(geoPricing) && geoPricing.length > 0) {
      const countryFlags: { [key: string]: string } = {
        'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹',
        'CA': '🇨🇦', 'AU': '🇦🇺', 'BR': '🇧🇷', 'MX': '🇲🇽', 'RU': '🇷🇺', 'UA': '🇺🇦',
        'PL': '🇵🇱', 'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮',
        'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳', 'IN': '🇮🇳', 'TH': '🇹🇭', 'VN': '🇻🇳',
        'SG': '🇸🇬', 'MY': '🇲🇾', 'ID': '🇮🇩', 'PH': '🇵🇭'
      };

      return geoPricing.map((geo: any) => {
        const flag = countryFlags[geo.country] || '🌍';
        return `${flag}${geo.country}-${geo.payout}`;
      }).join(' ');
    }
    
    // Резервный вариант - базовая выплата
    if (fallbackPayout && fallbackPayout !== '0.00') {
      const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'RUB' ? '₽' : currency || '';
      return `${currencySymbol}${fallbackPayout}`;
    }
    
    return 'Не указано';
  };

  // Format traffic sources with colors
  const formatTrafficSources = (sources: any) => {
    if (!sources || !Array.isArray(sources)) return [];
    
    const sourceColors: { [key: string]: string } = {
      'Facebook': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Instagram': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Google': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'YouTube': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'TikTok': 'bg-gray-900 text-white dark:bg-gray-800 dark:text-gray-200',
      'Twitter': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      'LinkedIn': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      'Push': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'Pop': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'Email': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'SMS': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Native': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'SEO': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      'Organic': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      'Influencer': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      'Teaser': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
    };

    return sources.map((source: string, index: number) => ({
      name: source,
      color: sourceColors[source] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }));
  };

  // Format applications with colors
  const formatApplications = (apps: any) => {
    if (!apps || !Array.isArray(apps)) return [];
    
    const appNames: { [key: string]: string } = {
      'web': 'Веб-сайты',
      'mobile_app': 'Мобильные приложения', 
      'social_media': 'Социальные сети',
      'email': 'Email рассылки',
      'sms': 'SMS рассылки',
      'telegram_bots': 'Telegram боты',
      'browser_extensions': 'Браузерные расширения',
      'push_notifications': 'Push уведомления',
      'popup_ads': 'Popup реклама',
      'banner_ads': 'Баннерная реклама',
      'video_ads': 'Видео реклама',
      'native_ads': 'Нативная реклама'
    };

    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    ];

    return apps.map((app: string, index: number) => ({
      name: appNames[app] || app,
      color: colors[index % colors.length]
    }));
  };

  // Функции для работы с креативами
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append(`creative_${index}`, file);
      });
      formData.append('offerId', offer.id);

      // Симуляция загрузки (в реальном проекте здесь будет API вызов)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Добавляем загруженные файлы в состояние
      const newCreatives = Array.from(files).map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      }));

      setUploadedCreatives(prev => [...prev, ...newCreatives]);

      toast({
        title: "Успех",
        description: `Загружено ${files.length} файлов`,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить файлы",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeCreative = (id: number) => {
    setUploadedCreatives(prev => prev.filter(creative => creative.id !== id));
    toast({
      title: "Удалено",
      description: "Креатив удален",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header title="offer_details" subtitle="detailed_offer_information" />
        <main className="flex-1 p-6">
          <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/admin/offers')}
            className="mb-4 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к списку офферов
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {offer.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(offer.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(offer.status)}>
                  {offer.status === 'active' ? 'Активен' :
                   offer.status === 'pending' ? 'Ожидает' :
                   offer.status === 'draft' ? 'Черновик' :
                   offer.status === 'blocked' ? 'Заблокирован' :
                   offer.status === 'archived' ? 'Архивный' : offer.status}
                </Badge>
                <Badge className={getCategoryColor(offer.category)}>
                  {offer.category === 'gambling' ? 'Гемблинг' :
                   offer.category === 'finance' ? 'Финансы' :
                   offer.category === 'nutra' ? 'Нутра' :
                   offer.category === 'dating' ? 'Знакомства' :
                   offer.category === 'lottery' ? 'Лотереи' :
                   offer.category === 'crypto' ? 'Криптовалюты' :
                   offer.category === 'ecommerce' ? 'E-commerce' :
                   offer.category === 'mobile' ? 'Мобильные' :
                   offer.category === 'gaming' ? 'Игры' :
                   offer.category === 'software' ? 'ПО' : offer.category}
                </Badge>
              </div>
            </div>
            {offer.logoUrl && (
              <img 
                src={offer.logoUrl} 
                alt={offer.name}
                className="w-20 h-20 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
              />
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger 
              value="details" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <Target className="w-4 h-4" />
              Детали
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <BarChart3 className="w-4 h-4" />
              Аналитика
            </TabsTrigger>
            <TabsTrigger 
              value="creatives" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <Image className="w-4 h-4" />
              Креативы
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <Clock className="w-4 h-4" />
              История
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <label className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Базовая выплата</label>
                    <div className="mt-1">
                      {offer.payout && offer.payout !== '0.00' ? (
                        <div className="text-lg font-bold text-green-700 dark:text-green-300">
                          {offer.currency === 'USD' ? '$' : offer.currency === 'EUR' ? '€' : offer.currency === 'RUB' ? '₽' : ''}{offer.payout}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {offer.logoUrl ? (
                            <img 
                              src={offer.logoUrl} 
                              alt={offer.name}
                              className="w-8 h-8 object-contain rounded"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                              <Target className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="text-sm font-semibold text-green-700 dark:text-green-300 truncate">
                            {offer.name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <label className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Тип выплат</label>
                    <div className="mt-1 text-lg font-bold text-blue-700 dark:text-blue-300">
                      {offer.payoutType === 'cpa' ? 'CPA' :
                       offer.payoutType === 'cps' ? 'CPS' :
                       offer.payoutType === 'cpm' ? 'CPM' :
                       offer.payoutType === 'cpc' ? 'CPC' :
                       offer.payoutType === 'cpl' ? 'CPL' :
                       offer.payoutType === 'revshare' ? 'RevShare' : 
                       offer.payoutType ? offer.payoutType.toUpperCase() : 'Не указано'}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <label className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Валюта</label>
                    <div className="mt-1 text-lg font-bold text-purple-700 dark:text-purple-300">
                      {offer.currency || 'USD'}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Описание</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{offer.description || 'Не указано'}</p>
                </div>
                
                {offer.number && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Номер оффера</label>
                    <div className="mt-1 font-mono text-sm">{offer.number}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Landing Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Лендинги и выплаты
                </CardTitle>
              </CardHeader>
              <CardContent>
                {offer.landingPages && offer.landingPages.length > 0 ? (
                  <div className="space-y-4">
                    {offer.landingPages.map((landing: any, index: number) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        {/* Верхняя строка: Название + Ссылка + Кнопка */}
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {landing.name || `Лендинг ${index + 1}`}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 truncate">
                              <Globe className="w-4 h-4 flex-shrink-0" />
                              <span className="font-mono truncate">{landing.url}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={landing.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4 mr-2" />
                              Открыть лендинг
                            </a>
                          </Button>
                        </div>
                        
                        {/* Зеленый прямоугольник с выплатой и информацией */}
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            {/* Выплата */}
                            <div className="text-center">
                              <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                                Выплата
                              </div>
                              <div className="text-xl font-bold text-green-700 dark:text-green-300">
                                {offer.payout && offer.payout !== '0.00' 
                                  ? `${offer.currency === 'USD' ? '$' : offer.currency === 'EUR' ? '€' : offer.currency === 'RUB' ? '₽' : ''}${offer.payout}`
                                  : (offer.geoPricing && Array.isArray(offer.geoPricing) && offer.geoPricing.length > 0 
                                     ? `${offer.currency === 'USD' ? '$' : offer.currency === 'EUR' ? '€' : offer.currency === 'RUB' ? '₽' : ''}${offer.geoPricing[0].payout}` 
                                     : (
                                       <div className="flex items-center gap-2 justify-center">
                                         {offer.logoUrl ? (
                                           <img 
                                             src={offer.logoUrl} 
                                             alt={offer.name}
                                             className="w-6 h-6 object-contain rounded"
                                           />
                                         ) : (
                                           <Target className="w-4 h-4" />
                                         )}
                                         <span className="text-sm">{offer.name}</span>
                                       </div>
                                     ))}
                              </div>
                            </div>
                            
                            {/* Валюта */}
                            <div className="text-center">
                              <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                                Валюта
                              </div>
                              <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                                {offer.currency || 'USD'}
                              </div>
                            </div>
                            
                            {/* Тип */}
                            <div className="text-center">
                              <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                                Тип
                              </div>
                              <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                                {offer.payoutType?.toUpperCase() || 'CPA'}
                              </div>
                            </div>
                            
                            {/* Гео с флагами */}
                            <div className="text-center">
                              <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                                Гео
                              </div>
                              <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                                {landing.countries && landing.countries.length > 0 ? (
                                  <div className="flex flex-wrap justify-center gap-1">
                                    {landing.countries.slice(0, 3).map((country: string, idx: number) => {
                                      const countryFlags: { [key: string]: string } = {
                                        'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹',
                                        'CA': '🇨🇦', 'AU': '🇦🇺', 'BR': '🇧🇷', 'MX': '🇲🇽', 'RU': '🇷🇺', 'UA': '🇺🇦'
                                      };
                                      return (
                                        <span key={idx} className="text-sm">
                                          {countryFlags[country] || '🌍'}{country}
                                        </span>
                                      );
                                    })}
                                    {landing.countries.length > 3 && (
                                      <span className="text-sm">+{landing.countries.length - 3}</span>
                                    )}
                                  </div>
                                ) : (
                                  offer.countries && Array.isArray(offer.countries) && offer.countries.length > 0 ? (
                                    <div className="flex flex-wrap justify-center gap-1">
                                      {offer.countries.slice(0, 3).map((country: string, idx: number) => {
                                        const countryFlags: { [key: string]: string } = {
                                          'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹',
                                          'CA': '🇨🇦', 'AU': '🇦🇺', 'BR': '🇧🇷', 'MX': '🇲🇽', 'RU': '🇷🇺', 'UA': '🇺🇦'
                                        };
                                        return (
                                          <span key={idx} className="text-sm">
                                            {countryFlags[country] || '🌍'}{country}
                                          </span>
                                        );
                                      })}
                                      {offer.countries.length > 3 && (
                                        <span className="text-sm">+{offer.countries.length - 3}</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span>🌍 Все</span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Если лендингов нет - показываем основную информацию о выплатах */
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-center">
                      {/* Выплата */}
                      <div>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                          Выплата
                        </div>
                        <div className="text-xl font-bold text-green-700 dark:text-green-300">
                          {offer.payout && offer.payout !== '0.00' 
                            ? `${offer.currency === 'USD' ? '$' : offer.currency === 'EUR' ? '€' : offer.currency === 'RUB' ? '₽' : ''}${offer.payout}`
                            : (offer.geoPricing && Array.isArray(offer.geoPricing) && offer.geoPricing.length > 0 
                               ? `${offer.currency === 'USD' ? '$' : offer.currency === 'EUR' ? '€' : offer.currency === 'RUB' ? '₽' : ''}${offer.geoPricing[0].payout}` 
                               : (
                                 <div className="flex items-center gap-2 justify-center">
                                   {offer.logoUrl ? (
                                     <img 
                                       src={offer.logoUrl} 
                                       alt={offer.name}
                                       className="w-6 h-6 object-contain rounded"
                                     />
                                   ) : (
                                     <Target className="w-4 h-4" />
                                   )}
                                   <span className="text-sm">{offer.name}</span>
                                 </div>
                               ))}
                        </div>
                      </div>
                      
                      {/* Валюта */}
                      <div>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                          Валюта
                        </div>
                        <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                          {offer.currency || 'USD'}
                        </div>
                      </div>
                      
                      {/* Тип */}
                      <div>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                          Тип
                        </div>
                        <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                          {offer.payoutType?.toUpperCase() || 'CPA'}
                        </div>
                      </div>
                      
                      {/* Гео */}
                      <div>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                          Гео
                        </div>
                        <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                          {offer.countries && Array.isArray(offer.countries) && offer.countries.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-1">
                              {offer.countries.slice(0, 3).map((country: string, idx: number) => {
                                const countryFlags: { [key: string]: string } = {
                                  'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹',
                                  'CA': '🇨🇦', 'AU': '🇦🇺', 'BR': '🇧🇷', 'MX': '🇲🇽', 'RU': '🇷🇺', 'UA': '🇺🇦'
                                };
                                return (
                                  <span key={idx} className="text-sm">
                                    {countryFlags[country] || '🌍'}{country}
                                  </span>
                                );
                              })}
                              {offer.countries.length > 3 && (
                                <span className="text-sm">+{offer.countries.length - 3}</span>
                              )}
                            </div>
                          ) : (
                            <span>🌍 Все</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Источники трафика
                </CardTitle>
              </CardHeader>
              <CardContent>
                {offer.trafficSources && Array.isArray(offer.trafficSources) && offer.trafficSources.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formatTrafficSources(offer.trafficSources).map((source, index) => (
                      <Badge key={index} className={source.color}>
                        {source.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Источники трафика не указаны</p>
                )}
              </CardContent>
            </Card>

            {/* Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Разрешенные приложения
                </CardTitle>
              </CardHeader>
              <CardContent>
                {offer.allowedApps && Array.isArray(offer.allowedApps) && offer.allowedApps.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {formatApplications(offer.allowedApps).map((app, index) => (
                      <Badge key={index} className={app.color}>
                        {app.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Разрешенные приложения не указаны</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {statsData?.clicks || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Клики</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {statsData?.conversions || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Конверсии</div>
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {statsData?.cr ? `${statsData.cr}%` : '0%'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">CR</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ${statsData?.revenue || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Доход</div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Дополнительно
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {offer.dailyLimit && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Дневной лимит</span>
                    <Badge variant="secondary">
                      {offer.dailyLimit} конверсий
                    </Badge>
                  </div>
                )}
                {offer.currency && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Валюта</span>
                    <Badge variant="secondary">
                      {offer.currency}
                    </Badge>
                  </div>
                )}
                {offer.vertical && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Вертикаль</span>
                    <Badge variant="secondary">
                      {offer.vertical}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals */}
            {offer.goals && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Цели оффера
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{offer.goals}</p>
                </CardContent>
              </Card>
            )}

            {/* KPI Conditions */}
            {offer.kpiConditions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    KPI условия
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{offer.kpiConditions}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Просмотры</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {statsData?.views || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Конверсии</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {statsData?.conversions || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CR %</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {statsData?.conversionRate || '0.00'}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Доход</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${statsData?.revenue || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Creatives Tab */}
          <TabsContent value="creatives" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Рекламные материалы
                  </div>
                  <Button 
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Загрузить файлы
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.zip,.rar"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {uploadedCreatives.length === 0 ? (
                  <div className="text-center py-12">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Креативы не загружены
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Загрузите баннеры, изображения, видео и другие рекламные материалы
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Поддерживаются форматы: JPG, PNG, GIF, MP4, PDF, ZIP, RAR
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Загружено файлов: {uploadedCreatives.length}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uploadedCreatives.map((creative) => (
                        <div 
                          key={creative.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {creative.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(creative.size)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCreative(creative.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {creative.type.startsWith('image/') ? (
                            <div className="mb-3">
                              <img 
                                src={creative.url} 
                                alt={creative.name}
                                className="w-full h-32 object-cover rounded border"
                              />
                            </div>
                          ) : (
                            <div className="mb-3 h-32 bg-gray-100 dark:bg-gray-700 rounded border flex items-center justify-center">
                              <div className="text-center">
                                <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {creative.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(creative.uploadedAt).toLocaleDateString('ru-RU')}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = creative.url;
                                link.download = creative.name;
                                link.click();
                              }}
                              className="h-7 px-2 text-xs"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Скачать
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  История изменений
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Оффер создан</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(offer.createdAt).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      Дополнительная история изменений будет отображаться здесь
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}