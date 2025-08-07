import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Eye, 
  Copy, 
  ExternalLink, 
  Lock,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import { formatCountries } from "@/utils/countries";
import { formatCR } from "@/utils/formatting";
import { getCategoryBadgeProps } from "@/utils/categories";
import { RequestAccessModal } from "@/components/modals/RequestAccessModal";
import { useToast } from "@/hooks/use-toast";

interface PartnerOffer {
  id: string;
  name: string;
  description?: any;
  logo?: string;
  category: string;
  countries: string[];
  payout: string;
  currency: string;
  cr?: number;
  status: string;
  advertiserId: string;
  advertiser_name?: string;
  advertiser_company?: string;
  accessStatus: 'available' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'auto_approved';
  hasFullAccess: boolean;
  customPayout?: string;
  partnerLink?: string;
  previewUrl?: string;
  partnerApprovalType?: string;
}

export default function PartnerOffers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all-categories");
  const [filterAccess, setFilterAccess] = useState("all");
  const [selectedOffer, setSelectedOffer] = useState<PartnerOffer | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: offers = [], isLoading } = useQuery<PartnerOffer[]>({
    queryKey: ["/api/partner/offers"],
  });

  const filteredOffers = offers.filter((offer) => {
    const searchMatch = !searchQuery || 
      offer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.advertiser_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const categoryMatch = filterCategory === 'all-categories' || 
      offer.category?.toLowerCase().includes(filterCategory.toLowerCase());
    
    const accessMatch = filterAccess === 'all' || 
      (filterAccess === 'approved' && offer.hasFullAccess) ||
      (filterAccess === 'pending' && offer.accessStatus === 'pending') ||
      (filterAccess === 'available' && offer.accessStatus === 'available') ||
      (filterAccess === 'rejected' && offer.accessStatus === 'rejected');

    return searchMatch && categoryMatch && accessMatch;
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: `${label} скопирована в буфер обмена`,
    });
  };

  const handleRequestAccess = (offer: PartnerOffer) => {
    setSelectedOffer(offer);
    setIsRequestModalOpen(true);
  };

  const getAccessStatusBadge = (accessStatus: string, hasFullAccess: boolean) => {
    switch (accessStatus) {
      case 'approved':
      case 'auto_approved':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Доступ открыт
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Ожидание
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            <XCircle className="w-3 h-3 mr-1" />
            Отклонено
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Отменено
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-blue-200 text-blue-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Требует запрос
          </Badge>
        );
    }
  };

  const getActionButton = (offer: PartnerOffer) => {
    if (offer.hasFullAccess && offer.partnerLink) {
      return (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(offer.partnerLink!, "Ссылка партнера")}
            data-testid={`button-copy-link-${offer.id}`}
            title="Копировать партнерскую ссылку"
          >
            <Copy className="w-4 h-4" />
          </Button>
          {offer.previewUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(offer.previewUrl, '_blank')}
              data-testid={`button-preview-${offer.id}`}
              title="Просмотр лендинга"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      );
    }

    if (offer.accessStatus === 'pending') {
      return (
        <Button size="sm" variant="outline" disabled>
          <Clock className="w-4 h-4 mr-2" />
          Ожидание ответа
        </Button>
      );
    }

    if (offer.accessStatus === 'rejected') {
      return (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleRequestAccess(offer)}
          data-testid={`button-retry-request-${offer.id}`}
        >
          Запросить повторно
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        variant="default"
        className="bg-blue-500 hover:bg-blue-600 text-white"
        onClick={() => handleRequestAccess(offer)}
        data-testid={`button-request-access-${offer.id}`}
      >
        <Lock className="w-4 h-4 mr-2" />
        Запросить доступ
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка офферов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-partner-offers">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Доступные офферы</h1>
          <p className="text-muted-foreground mt-2">
            Просматривайте офферы и запрашивайте доступ к ссылкам лендингов
          </p>
        </div>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Фильтры поиска</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Поиск по названию или рекламодателю..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                data-testid="input-search-offers"
              />
            </div>
            <div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger data-testid="select-category-filter">
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">Все категории</SelectItem>
                  <SelectItem value="gaming">Игры</SelectItem>
                  <SelectItem value="finance">Финансы</SelectItem>
                  <SelectItem value="dating">Знакомства</SelectItem>
                  <SelectItem value="crypto">Криптовалюты</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="health">Здоровье</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filterAccess} onValueChange={setFilterAccess}>
                <SelectTrigger data-testid="select-access-filter">
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="approved">Доступ открыт</SelectItem>
                  <SelectItem value="pending">Ожидание одобрения</SelectItem>
                  <SelectItem value="available">Можно запросить</SelectItem>
                  <SelectItem value="rejected">Отклонено</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {offers.filter(o => o.hasFullAccess).length}
            </div>
            <p className="text-sm text-muted-foreground">Офферы с доступом</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {offers.filter(o => o.accessStatus === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">Ожидают ответа</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {offers.filter(o => o.accessStatus === 'available').length}
            </div>
            <p className="text-sm text-muted-foreground">Доступны для запроса</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {offers.length}
            </div>
            <p className="text-sm text-muted-foreground">Всего офферов</p>
          </CardContent>
        </Card>
      </div>

      {/* Таблица офферов */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Оффер</TableHead>
                <TableHead>Рекламодатель</TableHead>
                <TableHead>GEO</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>CR%</TableHead>
                <TableHead>Выплата</TableHead>
                <TableHead>Статус доступа</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOffers.map((offer) => (
                <TableRow key={offer.id} data-testid={`row-offer-${offer.id}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {offer.logo && (
                        <img 
                          src={offer.logo} 
                          alt={offer.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium" data-testid={`text-offer-name-${offer.id}`}>
                          {offer.name}
                        </div>
                        {offer.description && (
                          <div className="text-sm text-gray-500 truncate max-w-48">
                            {typeof offer.description === 'object' ? 
                              offer.description?.en || offer.description?.ru || 'Описание' : 
                              offer.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div data-testid={`text-advertiser-${offer.id}`}>
                      {offer.advertiser_name}
                      {offer.advertiser_company && (
                        <div className="text-sm text-muted-foreground">
                          {offer.advertiser_company}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 flex-wrap">
                      {formatCountries(offer.countries || []).slice(0, 3).map((country, index) => (
                        <div key={`${offer.id}-country-${index}`} className="flex items-center gap-1">
                          <span className="text-lg" title={country.name}>{country.flag}</span>
                          <span className="text-xs font-mono bg-muted px-1 py-0.5 rounded">{country.code}</span>
                        </div>
                      ))}
                      {formatCountries(offer.countries || []).length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{formatCountries(offer.countries || []).length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge {...getCategoryBadgeProps(offer.category)}>
                      {typeof offer.category === 'object' ? 
                        offer.category?.en || offer.category?.ru || 'Категория' : 
                        offer.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {offer.hasFullAccess ? (
                      formatCR(offer.cr) + "%"
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span data-testid={`text-payout-${offer.id}`}>
                      {offer.customPayout || offer.payout} {offer.currency}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getAccessStatusBadge(offer.accessStatus, offer.hasFullAccess)}
                  </TableCell>
                  <TableCell className="text-right">
                    {getActionButton(offer)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredOffers.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Офферы не найдены</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно запроса доступа */}
      {selectedOffer && (
        <RequestAccessModal
          isOpen={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false);
            setSelectedOffer(null);
          }}
          offer={selectedOffer}
        />
      )}
    </div>
  );
}