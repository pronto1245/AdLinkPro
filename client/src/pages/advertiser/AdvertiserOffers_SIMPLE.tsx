import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

interface Offer {
  id: string;
  name: string;
  category: string;
  status: string;
  payout: string;
  currency: string;
  countries: string[];
  createdAt: string;
  logo?: string;
}

export default function AdvertiserOffersSimple() {
  const [, setLocation] = useLocation();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['/api/advertiser/offers'],
  });

  const typedOffers = offers as Offer[];

  console.log('AdvertiserOffersSimple - Offers data:', offers);
  console.log('AdvertiserOffersSimple - Loading:', isLoading);
  console.log('AdvertiserOffersSimple - Offers count:', typedOffers.length);

  return (
    <div className="w-full p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Мои Офферы (Простая версия)</CardTitle>
            <Button onClick={() => setLocation('/advertiser/offers/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Создать оффер
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm">
              🔍 Отладка: Всего офферов: {typedOffers.length} | Загрузка: {isLoading ? 'да' : 'нет'}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : typedOffers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Нет офферов</p>
              <Button onClick={() => setLocation('/advertiser/offers/new')}>
                Создать первый оффер
              </Button>
            </div>
          ) : (
            <div className="border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Выплата</TableHead>
                    <TableHead>Страны</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typedOffers.map((offer: Offer) => {
                    console.log('Rendering simple row:', offer.name, offer.id);
                    return (
                      <TableRow key={offer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {offer.logo && (
                              <img
                                src={offer.logo}
                                alt={offer.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{offer.name}</div>
                              <div className="text-xs text-gray-500">#{offer.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{offer.category}</Badge>
                        </TableCell>
                        <TableCell>
                          ${offer.payout} {offer.currency}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {Array.isArray(offer.countries) ? offer.countries.slice(0, 2).join(', ') : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                            {offer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(offer.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setLocation(`/advertiser/offers/${offer.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setLocation(`/advertiser/offers/${offer.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
