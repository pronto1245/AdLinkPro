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
import { ArrowLeft, Globe, Eye, DollarSign, Target, Users, BarChart3, Calendar, MapPin, Shield, Image, Activity, Clock, FileText, TrendingUp, Filter, Smartphone, Building2, UserCheck, Edit } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { z } from 'zod';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useToast } from '../../hooks/use-toast';
import { Upload, X, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

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
  
  // Analytics filters state
  const [dateFilter, setDateFilter] = useState('7');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [geoFilter, setGeoFilter] = useState('all');
  const [geoSearchTerm, setGeoSearchTerm] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [deviceSearchTerm, setDeviceSearchTerm] = useState('');
  const [advertiserFilter, setAdvertiserFilter] = useState('all');
  const [advertiserSearchTerm, setAdvertiserSearchTerm] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
  
  // Edit offer state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
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
              <div className="mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {offer.name}
                </h1>
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
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(offer.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Редактировать оффер
              </Button>
              {offer.logo && (
                <img 
                  src={offer.logo} 
                  alt={offer.name}
                  className="w-20 h-20 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                />
              )}
            </div>
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
                                {(() => {
                                  const currencySymbol = offer.currency === 'USD' ? '$' : offer.currency === 'EUR' ? '€' : offer.currency === 'RUB' ? '₽' : '';
                                  
                                  // Приоритет: payoutAmount -> payout -> базовая выплата оффера
                                  if (landing.payoutAmount) {
                                    return `${currencySymbol}${landing.payoutAmount}`;
                                  }
                                  if (landing.payout && landing.payout !== '0.00') {
                                    return `${currencySymbol}${landing.payout}`;
                                  }
                                  if (offer.payout && offer.payout !== '0.00') {
                                    return `${currencySymbol}${offer.payout}`;
                                  }
                                  return `${currencySymbol}0`;
                                })()}
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
                                {(() => {
                                  const countryFlags: { [key: string]: string } = {
                                    'us': '🇺🇸', 'gb': '🇬🇧', 'de': '🇩🇪', 'fr': '🇫🇷', 'es': '🇪🇸', 'it': '🇮🇹',
                                    'ca': '🇨🇦', 'au': '🇦🇺', 'br': '🇧🇷', 'mx': '🇲🇽', 'ru': '🇷🇺', 'ua': '🇺🇦',
                                    'pl': '🇵🇱', 'nl': '🇳🇱', 'se': '🇸🇪', 'no': '🇳🇴', 'dk': '🇩🇰', 'fi': '🇫🇮',
                                    'jp': '🇯🇵', 'kr': '🇰🇷', 'cn': '🇨🇳', 'in': '🇮🇳', 'th': '🇹🇭', 'vn': '🇻🇳'
                                  };
                                  
                                  if (landing.geo) {
                                    const geo = landing.geo.toLowerCase();
                                    const flag = countryFlags[geo] || '🌍';
                                    return (
                                      <span className="text-sm">
                                        {flag}{geo.toUpperCase()}-{landing.payoutAmount || 0}$
                                      </span>
                                    );
                                  }
                                  
                                  return <span className="text-sm">Не указано</span>;
                                })()}
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
                          {(() => {
                            // Проверяем базовую выплату оффера
                            if (offer.payout && offer.payout !== '0.00') {
                              const currencySymbol = offer.currency === 'USD' ? '$' : offer.currency === 'EUR' ? '€' : offer.currency === 'RUB' ? '₽' : '';
                              return `${currencySymbol}${offer.payout}`;
                            }
                            // Проверяем geo-pricing
                            if (offer.geoPricing && Array.isArray(offer.geoPricing) && offer.geoPricing.length > 0) {
                              const currencySymbol = offer.currency === 'USD' ? '$' : offer.currency === 'EUR' ? '€' : offer.currency === 'RUB' ? '₽' : '';
                              return `${currencySymbol}${offer.geoPricing[0].payout}`;
                            }
                            // Резервный вариант
                            return `${offer.currency === 'USD' ? '$' : offer.currency === 'EUR' ? '€' : offer.currency === 'RUB' ? '₽' : '$'}0`;
                          })()}
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
                          {(() => {
                            // Приоритет: geo-pricing -> общие страны оффера
                            let countries = [];
                            
                            if (offer.geoPricing && Array.isArray(offer.geoPricing) && offer.geoPricing.length > 0) {
                              countries = offer.geoPricing.map((geo: any) => geo.country).filter(Boolean);
                            } else if (offer.countries && Array.isArray(offer.countries) && offer.countries.length > 0) {
                              countries = offer.countries;
                            }
                            
                            if (countries.length === 0) {
                              return <span className="text-sm">Не указано</span>;
                            }
                            
                            const countryFlags: { [key: string]: string } = {
                              'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹',
                              'CA': '🇨🇦', 'AU': '🇦🇺', 'BR': '🇧🇷', 'MX': '🇲🇽', 'RU': '🇷🇺', 'UA': '🇺🇦',
                              'PL': '🇵🇱', 'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮',
                              'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳', 'IN': '🇮🇳', 'TH': '🇹🇭', 'VN': '🇻🇳'
                            };
                            
                            return (
                              <div className="flex flex-wrap justify-center gap-1">
                                {countries.slice(0, 3).map((country: string, idx: number) => (
                                  <span key={idx} className="text-sm">
                                    {countryFlags[country] || '🌍'}{country}
                                  </span>
                                ))}
                                {countries.length > 3 && (
                                  <span className="text-sm">+{countries.length - 3}</span>
                                )}
                              </div>
                            );
                          })()}
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
                  <div className="text-sm text-gray-600 dark:text-gray-400 break-words overflow-hidden">
                    {offer.goals}
                  </div>
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
                  <div className="text-sm text-gray-600 dark:text-gray-400 break-words overflow-hidden max-h-32 overflow-y-auto">
                    {offer.kpiConditions}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {offer.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Описание
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 dark:text-gray-400 break-words overflow-hidden max-h-32 overflow-y-auto">
                    {offer.description}
                  </div>
                </CardContent>
              </Card>
            )}


          </div>
        </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Фильтры аналитики
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Date Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Период
                    </label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите период" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Сегодня</SelectItem>
                        <SelectItem value="7">7 дней</SelectItem>
                        <SelectItem value="30">30 дней</SelectItem>
                        <SelectItem value="90">90 дней</SelectItem>
                        <SelectItem value="365">Год</SelectItem>
                        <SelectItem value="all">Все время</SelectItem>
                        <SelectItem value="custom">Пользовательский</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Custom Date Range */}
                    {dateFilter === 'custom' && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="text-xs text-gray-500">От</label>
                          <Input
                            type="date"
                            value={customDateFrom}
                            onChange={(e) => setCustomDateFrom(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">До</label>
                          <Input
                            type="date"
                            value={customDateTo}
                            onChange={(e) => setCustomDateTo(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Geo Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      География
                    </label>
                    <div className="space-y-1">
                      <Input
                        placeholder="Поиск стран..."
                        value={geoSearchTerm}
                        onChange={(e) => setGeoSearchTerm(e.target.value)}
                        className="text-sm"
                      />
                      <Select value={geoFilter} onValueChange={setGeoFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите страну" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все страны</SelectItem>
                          {(() => {
                            const countries = [
                              { code: 'US', name: 'США', flag: '🇺🇸' },
                              { code: 'GB', name: 'Великобритания', flag: '🇬🇧' },
                              { code: 'DE', name: 'Германия', flag: '🇩🇪' },
                              { code: 'FR', name: 'Франция', flag: '🇫🇷' },
                              { code: 'CA', name: 'Канада', flag: '🇨🇦' },
                              { code: 'AU', name: 'Австралия', flag: '🇦🇺' },
                              { code: 'RU', name: 'Россия', flag: '🇷🇺' },
                              { code: 'BR', name: 'Бразилия', flag: '🇧🇷' },
                              { code: 'IT', name: 'Италия', flag: '🇮🇹' },
                              { code: 'ES', name: 'Испания', flag: '🇪🇸' },
                              { code: 'PL', name: 'Польша', flag: '🇵🇱' },
                              { code: 'NL', name: 'Нидерланды', flag: '🇳🇱' },
                              { code: 'SE', name: 'Швеция', flag: '🇸🇪' },
                              { code: 'NO', name: 'Норвегия', flag: '🇳🇴' },
                              { code: 'DK', name: 'Дания', flag: '🇩🇰' },
                              { code: 'FI', name: 'Финляндия', flag: '🇫🇮' },
                              { code: 'CH', name: 'Швейцария', flag: '🇨🇭' },
                              { code: 'AT', name: 'Австрия', flag: '🇦🇹' },
                              { code: 'BE', name: 'Бельгия', flag: '🇧🇪' },
                              { code: 'PT', name: 'Португалия', flag: '🇵🇹' },
                              { code: 'IE', name: 'Ирландия', flag: '🇮🇪' },
                              { code: 'CZ', name: 'Чехия', flag: '🇨🇿' },
                              { code: 'HU', name: 'Венгрия', flag: '🇭🇺' },
                              { code: 'GR', name: 'Греция', flag: '🇬🇷' },
                              { code: 'JP', name: 'Япония', flag: '🇯🇵' },
                              { code: 'KR', name: 'Корея', flag: '🇰🇷' },
                              { code: 'CN', name: 'Китай', flag: '🇨🇳' },
                              { code: 'IN', name: 'Индия', flag: '🇮🇳' },
                              { code: 'SG', name: 'Сингапур', flag: '🇸🇬' },
                              { code: 'HK', name: 'Гонконг', flag: '🇭🇰' },
                              { code: 'TW', name: 'Тайвань', flag: '🇹🇼' },
                              { code: 'TH', name: 'Таиланд', flag: '🇹🇭' },
                              { code: 'MY', name: 'Малайзия', flag: '🇲🇾' },
                              { code: 'ID', name: 'Индонезия', flag: '🇮🇩' },
                              { code: 'PH', name: 'Филиппины', flag: '🇵🇭' },
                              { code: 'VN', name: 'Вьетнам', flag: '🇻🇳' },
                              { code: 'MX', name: 'Мексика', flag: '🇲🇽' },
                              { code: 'AR', name: 'Аргентина', flag: '🇦🇷' },
                              { code: 'CL', name: 'Чили', flag: '🇨🇱' },
                              { code: 'CO', name: 'Колумбия', flag: '🇨🇴' },
                              { code: 'PE', name: 'Перу', flag: '🇵🇪' },
                              { code: 'ZA', name: 'ЮАР', flag: '🇿🇦' },
                              { code: 'EG', name: 'Египет', flag: '🇪🇬' },
                              { code: 'NG', name: 'Нигерия', flag: '🇳🇬' },
                              { code: 'KE', name: 'Кения', flag: '🇰🇪' },
                              { code: 'IL', name: 'Израиль', flag: '🇮🇱' },
                              { code: 'AE', name: 'ОАЭ', flag: '🇦🇪' },
                              { code: 'SA', name: 'Саудовская Аравия', flag: '🇸🇦' },
                              { code: 'TR', name: 'Турция', flag: '🇹🇷' },
                              { code: 'UA', name: 'Украина', flag: '🇺🇦' },
                              { code: 'BY', name: 'Беларусь', flag: '🇧🇾' },
                              { code: 'KZ', name: 'Казахстан', flag: '🇰🇿' },
                              { code: 'UZ', name: 'Узбекистан', flag: '🇺🇿' }
                            ];
                            
                            return countries
                              .filter(country => 
                                geoSearchTerm === '' || 
                                country.name.toLowerCase().includes(geoSearchTerm.toLowerCase()) ||
                                country.code.toLowerCase().includes(geoSearchTerm.toLowerCase())
                              )
                              .map(country => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.flag} {country.name}
                                </SelectItem>
                              ));
                          })()}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Device Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Устройства
                    </label>
                    <div className="space-y-1">
                      <Input
                        placeholder="Поиск устройств..."
                        value={deviceSearchTerm}
                        onChange={(e) => setDeviceSearchTerm(e.target.value)}
                        className="text-sm"
                      />
                      <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите устройство" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все устройства</SelectItem>
                          {(() => {
                            const devices = [
                              { value: 'desktop', name: 'Десктоп', icon: '🖥️' },
                              { value: 'mobile', name: 'Мобильные', icon: '📱' },
                              { value: 'tablet', name: 'Планшеты', icon: '📲' },
                              { value: 'ios', name: 'iOS', icon: '🍎' },
                              { value: 'android', name: 'Android', icon: '🤖' },
                              { value: 'windows', name: 'Windows', icon: '🪟' },
                              { value: 'macos', name: 'macOS', icon: '🍎' },
                              { value: 'linux', name: 'Linux', icon: '🐧' },
                              { value: 'smart-tv', name: 'Smart TV', icon: '📺' },
                              { value: 'console', name: 'Игровые консоли', icon: '🎮' }
                            ];
                            
                            return devices
                              .filter(device => 
                                deviceSearchTerm === '' || 
                                device.name.toLowerCase().includes(deviceSearchTerm.toLowerCase()) ||
                                device.value.toLowerCase().includes(deviceSearchTerm.toLowerCase())
                              )
                              .map(device => (
                                <SelectItem key={device.value} value={device.value}>
                                  {device.icon} {device.name}
                                </SelectItem>
                              ));
                          })()}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advertiser Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Рекламодатель
                    </label>
                    <div className="space-y-1">
                      <Input
                        placeholder="Поиск рекламодателей..."
                        value={advertiserSearchTerm}
                        onChange={(e) => setAdvertiserSearchTerm(e.target.value)}
                        className="text-sm"
                      />
                      <Select value={advertiserFilter} onValueChange={setAdvertiserFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите рекламодателя" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все рекламодатели</SelectItem>
                          {(() => {
                            const advertisers = [
                              { id: 'advertiser1', name: 'Advertiser Corp' },
                              { id: 'advertiser2', name: 'Global Marketing Ltd' },
                              { id: 'advertiser3', name: 'Digital Ads Inc' },
                              { id: 'advertiser4', name: 'Performance Media' },
                              { id: 'advertiser5', name: 'MediaMax Solutions' },
                              { id: 'advertiser6', name: 'AdTech Partners' },
                              { id: 'advertiser7', name: 'Revenue Network' },
                              { id: 'advertiser8', name: 'Conversion Masters' },
                              { id: 'advertiser9', name: 'Traffic Universe' },
                              { id: 'advertiser10', name: 'Lead Generation Pro' }
                            ];
                            
                            return advertisers
                              .filter(advertiser => 
                                advertiserSearchTerm === '' || 
                                advertiser.name.toLowerCase().includes(advertiserSearchTerm.toLowerCase()) ||
                                advertiser.id.toLowerCase().includes(advertiserSearchTerm.toLowerCase())
                              )
                              .map(advertiser => (
                                <SelectItem key={advertiser.id} value={advertiser.id}>
                                  {advertiser.name}
                                </SelectItem>
                              ));
                          })()}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Partner Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Партнер
                    </label>
                    <div className="space-y-1">
                      <Input
                        placeholder="Поиск партнеров..."
                        value={partnerSearchTerm}
                        onChange={(e) => setPartnerSearchTerm(e.target.value)}
                        className="text-sm"
                      />
                      <Select value={partnerFilter} onValueChange={setPartnerFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите партнера" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все партнеры</SelectItem>
                          {(() => {
                            const partners = [
                              { id: 'partner1', name: 'TopAffiliates Pro' },
                              { id: 'partner2', name: 'Performance Partners' },
                              { id: 'partner3', name: 'Digital Media Network' },
                              { id: 'partner4', name: 'Elite Affiliates' },
                              { id: 'partner5', name: 'Global Traffic Hub' },
                              { id: 'partner6', name: 'MediaBuyers United' },
                              { id: 'partner7', name: 'Conversion Leaders' },
                              { id: 'partner8', name: 'Traffic Masters' },
                              { id: 'partner9', name: 'Revenue Rockets' },
                              { id: 'partner10', name: 'Lead Champions' },
                              { id: 'partner11', name: 'AdVantage Group' },
                              { id: 'partner12', name: 'Performance Elite' },
                              { id: 'partner13', name: 'Digital Success' },
                              { id: 'partner14', name: 'Growth Partners' },
                              { id: 'partner15', name: 'Media Professionals' }
                            ];
                            
                            return partners
                              .filter(partner => 
                                partnerSearchTerm === '' || 
                                partner.name.toLowerCase().includes(partnerSearchTerm.toLowerCase()) ||
                                partner.id.toLowerCase().includes(partnerSearchTerm.toLowerCase())
                              )
                              .map(partner => (
                                <SelectItem key={partner.id} value={partner.id}>
                                  {partner.name}
                                </SelectItem>
                              ));
                          })()}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Applied Filters Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Активные фильтры:</span>
                    {dateFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {dateFilter === '1' ? 'Сегодня' : 
                         dateFilter === '7' ? '7 дней' :
                         dateFilter === '30' ? '30 дней' :
                         dateFilter === '90' ? '90 дней' :
                         dateFilter === '365' ? 'Год' : 'Все время'}
                      </Badge>
                    )}
                    {geoFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {geoFilter === 'US' ? '🇺🇸 США' :
                         geoFilter === 'GB' ? '🇬🇧 Великобритания' :
                         geoFilter === 'DE' ? '🇩🇪 Германия' :
                         geoFilter === 'FR' ? '🇫🇷 Франция' :
                         geoFilter === 'CA' ? '🇨🇦 Канада' :
                         geoFilter === 'AU' ? '🇦🇺 Австралия' :
                         geoFilter === 'RU' ? '🇷🇺 Россия' :
                         geoFilter === 'BR' ? '🇧🇷 Бразилия' : geoFilter}
                      </Badge>
                    )}
                    {deviceFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                        {deviceFilter === 'desktop' ? '🖥️ Десктоп' :
                         deviceFilter === 'mobile' ? '📱 Мобильные' :
                         deviceFilter === 'tablet' ? '📱 Планшеты' :
                         deviceFilter === 'ios' ? '🍎 iOS' :
                         deviceFilter === 'android' ? '🤖 Android' : deviceFilter}
                      </Badge>
                    )}
                    {advertiserFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                        {advertiserFilter === 'advertiser1' ? 'Advertiser Corp' :
                         advertiserFilter === 'advertiser2' ? 'Global Marketing Ltd' :
                         advertiserFilter === 'advertiser3' ? 'Digital Ads Inc' :
                         advertiserFilter === 'advertiser4' ? 'Performance Media' : advertiserFilter}
                      </Badge>
                    )}
                    {partnerFilter !== 'all' && (
                      <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400">
                        {partnerFilter === 'partner1' ? 'TopAffiliates Pro' :
                         partnerFilter === 'partner2' ? 'Performance Partners' :
                         partnerFilter === 'partner3' ? 'Digital Media Network' :
                         partnerFilter === 'partner4' ? 'Elite Affiliates' :
                         partnerFilter === 'partner5' ? 'Global Traffic Hub' : partnerFilter}
                      </Badge>
                    )}
                    {dateFilter === 'all' && geoFilter === 'all' && deviceFilter === 'all' && 
                     advertiserFilter === 'all' && partnerFilter === 'all' && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Нет активных фильтров</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Клики</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {statsData?.clicks || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Всего переходов</p>
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">Целевые действия</p>
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
                        {statsData?.cr ? `${statsData.cr}%` : '0%'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Конверсия</p>
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
                        ${statsData?.revenue || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Общая выручка</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5" />
                    Эффективность
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">CTR</span>
                    <span className="text-sm font-medium">
                      {statsData?.clicks && statsData?.clicks > 0 ? 
                        `${((statsData.conversions || 0) / statsData.clicks * 100).toFixed(2)}%` : 
                        '0%'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">ARPU</span>
                    <span className="text-sm font-medium">
                      ${statsData?.conversions && statsData.conversions > 0 ? 
                        ((statsData.revenue || 0) / statsData.conversions).toFixed(2) : 
                        '0'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">EPC</span>
                    <span className="text-sm font-medium">
                      ${statsData?.clicks && statsData.clicks > 0 ? 
                        ((statsData.revenue || 0) / statsData.clicks).toFixed(3) : 
                        '0'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5" />
                    Активность
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Сегодня</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      +{Math.floor((statsData?.clicks || 0) * 0.1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Вчера</span>
                    <span className="text-sm font-medium">
                      {Math.floor((statsData?.clicks || 0) * 0.15)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">7 дней</span>
                    <span className="text-sm font-medium">
                      {Math.floor((statsData?.clicks || 0) * 0.8)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5" />
                    Качество
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Рейтинг</span>
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">★ 4.2</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Отказы</span>
                    <span className="text-sm font-medium">12%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Время на сайте</span>
                    <span className="text-sm font-medium">2:34</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart Placeholder */}
            <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
              <CardContent className="pt-6">
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">График аналитики</h3>
                  <p className="text-sm max-w-md mx-auto">
                    Детальные графики трафика, конверсий и доходности по времени будут добавлены в следующих обновлениях
                  </p>
                </div>
              </CardContent>
            </Card>
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
      
      {/* Edit Offer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать оффер: {offer.name}</DialogTitle>
          </DialogHeader>
          <EditOfferForm 
            offer={offer} 
            onSuccess={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Edit Offer Form Component
function EditOfferForm({ offer, onSuccess }: { offer: any; onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Schema для редактирования оффера (упрощенная версия)
  const editOfferSchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    description: z.string().min(1, 'Описание обязательно'),
    category: z.string().min(1, 'Категория обязательна'),
    status: z.string().min(1, 'Статус обязателен'),
    payoutType: z.string().min(1, 'Тип выплаты обязателен'),
    currency: z.string().min(1, 'Валюта обязательна'),
    logo: z.string().optional(),
    kpiConditions: z.string().optional(),
    allowedTrafficSources: z.array(z.string()).optional(),
    allowedApps: z.array(z.string()).optional(),
    antifraudEnabled: z.boolean().optional(),
    autoApprovePartners: z.boolean().optional(),
    dailyLimit: z.number().optional(),
    monthlyLimit: z.number().optional(),
    landingPages: z.array(z.object({
      name: z.string(),
      url: z.string(),
      payoutAmount: z.number(),
      currency: z.string(),
      geo: z.string().optional()
    })).optional()
  });

  type EditOfferFormData = z.infer<typeof editOfferSchema>;

  const form = useForm<EditOfferFormData>({
    resolver: zodResolver(editOfferSchema),
    defaultValues: {
      name: offer.name || '',
      description: offer.description || '',
      category: offer.category || '',
      status: offer.status || 'draft',
      payoutType: offer.payoutType || 'cpa',
      currency: offer.currency || 'USD',
      logo: offer.logo || '',
      kpiConditions: offer.kpiConditions || '',
      allowedTrafficSources: offer.trafficSources || [],
      allowedApps: offer.allowedApps || [],
      antifraudEnabled: offer.antifraudEnabled || true,
      autoApprovePartners: offer.autoApprovePartners || false,
      dailyLimit: offer.dailyLimit || undefined,
      monthlyLimit: offer.monthlyLimit || undefined,
      landingPages: offer.landingPages || [{ name: 'Основная страница', url: '', payoutAmount: 0, currency: 'USD', geo: '' }]
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: async (data: EditOfferFormData) => {
      const transformedData = {
        ...data,
        trafficSources: data.allowedTrafficSources || [],
        allowedApps: data.allowedApps || [],
      };
      return await apiRequest('PUT', `/api/admin/offers/${offer.id}`, transformedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/offer-stats/${offer.id}`] });
      toast({
        title: "Успех",
        description: "Оффер успешно обновлен",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить оффер",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditOfferFormData) => {
    updateOfferMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название оффера</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Введите название оффера" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Категория</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gambling">Гемблинг</SelectItem>
                    <SelectItem value="finance">Финансы</SelectItem>
                    <SelectItem value="nutra">Нутра</SelectItem>
                    <SelectItem value="dating">Знакомства</SelectItem>
                    <SelectItem value="lottery">Лотереи</SelectItem>
                    <SelectItem value="crypto">Криптовалюты</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="mobile">Мобильные</SelectItem>
                    <SelectItem value="gaming">Игры</SelectItem>
                    <SelectItem value="software">ПО</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Подробное описание оффера" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Статус</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="pending">Ожидает</SelectItem>
                    <SelectItem value="blocked">Заблокирован</SelectItem>
                    <SelectItem value="archived">Архивный</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="payoutType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип выплаты</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cpa">CPA (за действие)</SelectItem>
                    <SelectItem value="cps">CPS (от продажи)</SelectItem>
                    <SelectItem value="crl">CRL (RevShare)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Валюта</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите валюту" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="RUB">RUB</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Логотип (URL)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com/logo.png" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kpiConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KPI условия</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Условия достижения KPI" rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Разрешенные источники трафика */}
        <FormField
          control={form.control}
          name="allowedTrafficSources"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Разрешенные источники трафика</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {['Facebook', 'Instagram', 'Google', 'YouTube', 'TikTok', 'Twitter', 'LinkedIn', 'Push', 'Pop', 'Email', 'SMS', 'Native', 'SEO', 'Organic', 'Influencer', 'Teaser'].map((source) => {
                      const isSelected = (field.value || []).includes(source);
                      return (
                        <Button
                          key={source}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const current = field.value || [];
                            if (isSelected) {
                              field.onChange(current.filter((s: string) => s !== source));
                            } else {
                              field.onChange([...current, source]);
                            }
                          }}
                        >
                          {source}
                        </Button>
                      );
                    })}
                  </div>
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {field.value.map((source: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {source}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                            onClick={() => {
                              const current = field.value || [];
                              field.onChange(current.filter((_: string, i: number) => i !== index));
                            }}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Разрешенные приложения */}
        <FormField
          control={form.control}
          name="allowedApps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Разрешенные приложения</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'web', label: 'Веб-сайты' },
                      { value: 'mobile_app', label: 'Мобильные приложения' },
                      { value: 'social_media', label: 'Социальные сети' },
                      { value: 'email', label: 'Email рассылки' },
                      { value: 'sms', label: 'SMS рассылки' },
                      { value: 'telegram_bots', label: 'Telegram боты' },
                      { value: 'browser_extensions', label: 'Браузерные расширения' },
                      { value: 'push_notifications', label: 'Push уведомления' },
                      { value: 'popup_ads', label: 'Popup реклама' },
                      { value: 'banner_ads', label: 'Баннерная реклама' },
                      { value: 'video_ads', label: 'Видео реклама' },
                      { value: 'native_ads', label: 'Нативная реклама' }
                    ].map((app) => {
                      const isSelected = (field.value || []).includes(app.value);
                      return (
                        <Button
                          key={app.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const current = field.value || [];
                            if (isSelected) {
                              field.onChange(current.filter((s: string) => s !== app.value));
                            } else {
                              field.onChange([...current, app.value]);
                            }
                          }}
                        >
                          {app.label}
                        </Button>
                      );
                    })}
                  </div>
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {field.value.map((appValue: string, index: number) => {
                        const app = [
                          { value: 'web', label: 'Веб-сайты' },
                          { value: 'mobile_app', label: 'Мобильные приложения' },
                          { value: 'social_media', label: 'Социальные сети' },
                          { value: 'email', label: 'Email рассылки' },
                          { value: 'sms', label: 'SMS рассылки' },
                          { value: 'telegram_bots', label: 'Telegram боты' },
                          { value: 'browser_extensions', label: 'Браузерные расширения' },
                          { value: 'push_notifications', label: 'Push уведомления' },
                          { value: 'popup_ads', label: 'Popup реклама' },
                          { value: 'banner_ads', label: 'Баннерная реклама' },
                          { value: 'video_ads', label: 'Видео реклама' },
                          { value: 'native_ads', label: 'Нативная реклама' }
                        ].find(a => a.value === appValue);
                        return (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {app?.label || appValue}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                              onClick={() => {
                                const current = field.value || [];
                                field.onChange(current.filter((_: string, i: number) => i !== index));
                              }}
                            >
                              ×
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dailyLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Дневной лимит</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Без ограничений" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="monthlyLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Месячный лимит</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Без ограничений" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Landing Pages Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Landing Pages</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const current = form.getValues('landingPages') || [];
                form.setValue('landingPages', [...current, { 
                  name: `Landing ${current.length + 1}`, 
                  url: '', 
                  payoutAmount: 0, 
                  currency: 'USD', 
                  geo: '' 
                }]);
              }}
            >
              Добавить Landing Page
            </Button>
          </div>
          
          <FormField
            control={form.control}
            name="landingPages"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="space-y-4">
                    {(field.value || []).map((landing: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Landing Page {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const current = field.value || [];
                              field.onChange(current.filter((_: any, i: number) => i !== index));
                            }}
                          >
                            Удалить
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium">Название</label>
                            <Input
                              value={landing.name || ''}
                              onChange={(e) => {
                                const current = field.value || [];
                                current[index] = { ...current[index], name: e.target.value };
                                field.onChange([...current]);
                              }}
                              placeholder="Название landing page"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">GEO</label>
                            <Input
                              value={landing.geo || ''}
                              onChange={(e) => {
                                const current = field.value || [];
                                current[index] = { ...current[index], geo: e.target.value };
                                field.onChange([...current]);
                              }}
                              placeholder="US, GB, RU..."
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">URL</label>
                          <Input
                            value={landing.url || ''}
                            onChange={(e) => {
                              const current = field.value || [];
                              current[index] = { ...current[index], url: e.target.value };
                              field.onChange([...current]);
                            }}
                            placeholder="https://example.com/landing"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium">Выплата</label>
                            <Input
                              type="number"
                              value={landing.payoutAmount || ''}
                              onChange={(e) => {
                                const current = field.value || [];
                                current[index] = { ...current[index], payoutAmount: parseFloat(e.target.value) || 0 };
                                field.onChange([...current]);
                              }}
                              placeholder="0.00"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Валюта</label>
                            <Select
                              value={landing.currency || 'USD'}
                              onValueChange={(value) => {
                                const current = field.value || [];
                                current[index] = { ...current[index], currency: value };
                                field.onChange([...current]);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="RUB">RUB</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!field.value || field.value.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        Нет добавленных landing pages. Нажмите "Добавить Landing Page" чтобы создать первую.
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="antifraudEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Антифрод включен</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="autoApprovePartners"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Автоодобрение партнеров</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Отмена
          </Button>
          <Button 
            type="submit" 
            disabled={updateOfferMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {updateOfferMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
      </form>
    </Form>
  );
}