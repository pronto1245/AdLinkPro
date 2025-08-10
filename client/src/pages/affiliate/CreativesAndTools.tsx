import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Download, 
  Eye, 
  Copy, 
  Filter, 
  Search, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Globe,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Creative {
  id: string;
  name: string;
  type: 'banner' | 'landing' | 'prelanding' | 'text' | 'video';
  format: string;
  size?: string;
  url: string;
  previewUrl?: string;
  content?: string;
  description?: string;
  language: string;
  downloadCount: number;
  offerName: string;
  offerId: string;
  isActive: boolean;
  createdAt: string;
}

export default function CreativesAndTools() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [offerFilter, setOfferFilter] = useState<string>("all");
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);
  const { toast } = useToast();

  // Fetch creatives
  const { data: creatives = [], isLoading } = useQuery<Creative[]>({
    queryKey: ['/api/affiliate/creatives'],
  });

  // Fetch available offers for filter
  const { data: offers = [] } = useQuery({
    queryKey: ['/api/affiliate/offers'],
  });

  const filteredCreatives = creatives.filter(creative => {
    const matchesSearch = creative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creative.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creative.offerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || creative.type === typeFilter;
    const matchesOffer = offerFilter === "all" || creative.offerId === offerFilter;
    
    return matchesSearch && matchesType && matchesOffer && creative.isActive;
  });

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Ссылка скопирована",
      description: "Ссылка на креатив скопирована в буфер обмена",
    });
  };

  const handleDownload = async (creative: Creative) => {
    try {
      const response = await fetch(`/api/affiliate/creatives/${creative.id}/download`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        // Track download
        window.open(creative.url, '_blank');
        toast({
          title: "Скачивание началось",
          description: `Креатив "${creative.name}" загружается`,
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скачать креатив",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'banner': return <ImageIcon className="h-4 w-4" />;
      case 'landing': case 'prelanding': return <Globe className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'banner': return 'bg-blue-100 text-blue-800';
      case 'landing': return 'bg-green-100 text-green-800';
      case 'prelanding': return 'bg-purple-100 text-purple-800';
      case 'text': return 'bg-orange-100 text-orange-800';
      case 'video': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('creatives.title', 'Креативы и материалы')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('creatives.subtitle', 'Рекламные материалы и промо-инструменты для ваших офферов')}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('creatives.searchPlaceholder', 'Поиск по названию, описанию или офферу...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-creatives"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                <SelectValue placeholder="Тип креатива" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('creatives.allTypes', 'Все типы')}</SelectItem>
                <SelectItem value="banner">{t('creatives.banner', 'Баннеры')}</SelectItem>
                <SelectItem value="landing">{t('creatives.landing', 'Лендинги')}</SelectItem>
                <SelectItem value="prelanding">{t('creatives.prelanding', 'Прелендинги')}</SelectItem>
                <SelectItem value="text">{t('creatives.text', 'Текст')}</SelectItem>
                <SelectItem value="video">{t('creatives.video', 'Видео')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={offerFilter} onValueChange={setOfferFilter}>
              <SelectTrigger className="w-[200px]" data-testid="select-offer-filter">
                <SelectValue placeholder="Оффер" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все офферы</SelectItem>
                {offers.map((offer: any) => (
                  <SelectItem key={offer.id} value={offer.id}>
                    {offer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего креативов</p>
                <p className="text-2xl font-bold">{creatives.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Скачиваний</p>
                <p className="text-2xl font-bold">
                  {creatives.reduce((sum, c) => sum + c.downloadCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Лендингов</p>
                <p className="text-2xl font-bold">
                  {creatives.filter(c => c.type === 'landing' || c.type === 'prelanding').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Баннеров</p>
                <p className="text-2xl font-bold">
                  {creatives.filter(c => c.type === 'banner').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Creatives Table */}
      <Card>
        <CardHeader>
          <CardTitle>Креативы ({filteredCreatives.length})</CardTitle>
          <CardDescription>
            Доступные материалы для продвижения офферов
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCreatives.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Креативы не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Оффер</TableHead>
                    <TableHead>Формат</TableHead>
                    <TableHead>Размер</TableHead>
                    <TableHead>Скачиваний</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCreatives.map((creative) => (
                    <TableRow key={creative.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getTypeIcon(creative.type)}
                          <div>
                            <p className="font-medium">{creative.name}</p>
                            {creative.description && (
                              <p className="text-sm text-muted-foreground">
                                {creative.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(creative.type)}>
                          {creative.type === 'banner' && t('creatives.bannerType', 'Баннер')}
                          {creative.type === 'landing' && t('creatives.landingType', 'Лендинг')}
                          {creative.type === 'prelanding' && t('creatives.prelandingType', 'Прелендинг')}
                          {creative.type === 'text' && t('creatives.textType', 'Текст')}
                          {creative.type === 'video' && t('creatives.videoType', 'Видео')}
                        </Badge>
                      </TableCell>
                      <TableCell>{creative.offerName}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {creative.format || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>{creative.size || 'N/A'}</TableCell>
                      <TableCell>{creative.downloadCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {creative.previewUrl && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Предпросмотр"
                                  data-testid={`button-preview-${creative.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>{creative.name}</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4">
                                  {(creative.type === 'banner' || creative.format?.includes('image')) && (
                                    <img 
                                      src={creative.previewUrl} 
                                      alt={creative.name}
                                      className="max-w-full h-auto"
                                    />
                                  )}
                                  {creative.type === 'text' && creative.content && (
                                    <div className="p-4 bg-gray-50 rounded">
                                      <pre className="whitespace-pre-wrap text-sm">
                                        {creative.content}
                                      </pre>
                                    </div>
                                  )}
                                  {(creative.type === 'landing' || creative.type === 'prelanding') && (
                                    <iframe
                                      src={creative.url}
                                      className="w-full h-96 border rounded"
                                      title={creative.name}
                                    />
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(creative.url)}
                            title="Копировать ссылку"
                            data-testid={`button-copy-${creative.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(creative)}
                            title="Скачать"
                            data-testid={`button-download-${creative.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          {(creative.type === 'landing' || creative.type === 'prelanding') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(creative.url, '_blank')}
                              title="Открыть в новой вкладке"
                              data-testid={`button-open-${creative.id}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}