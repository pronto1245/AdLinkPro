import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Trash2, 
  BarChartBig, 
  Edit3, 
  Pencil, 
  Flag, 
  FileDown,
  GripVertical,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import OfferEditModal from '@/components/modals/OfferEditModal';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import SortableItem from '@/components/ui/SortableItem';
import { formatCountries } from '@/utils/countries';

interface Offer {
  id: string;
  name: string;
  logo?: string;
  status: string;
  payoutType: string;
  category: string;
  description?: string;
  payout: string;
  currency: string;
  countries?: string[];
  geoPricing?: Record<string, any>;
  createdAt?: string;
  partnersCount?: number;
  clicks?: number;
  leads?: number;
  conversionRate?: number;
  revenue?: number;
  cap?: string;
  hold?: string;
  cr?: string;
  abtestLinks?: string[];
  partners?: string[];
}

const MyOffersDragDrop: React.FC = () => {
  const { toast } = useToast();
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all-categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: offers = [], isLoading } = useQuery<Offer[]>({
    queryKey: ['/api/advertiser/offers'],
    retry: false
  });

  // Обновляем items при загрузке данных
  useEffect(() => {
    if (offers && offers.length > 0) {
      setItems(offers.map((o: Offer) => o.id));
    }
  }, [offers]);

  const createOfferMutation = useMutation({
    mutationFn: (payload: Partial<Offer>) => apiRequest('/api/advertiser/offers', { method: 'POST', body: payload }),
    onSuccess: () => { 
      toast({
        title: "Успех",
        description: "Оффер добавлен"
      }); 
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: "Ошибка создания оффера: " + error.message,
        variant: "destructive"
      });
    }
  });

  const updateOfferMutation = useMutation({
    mutationFn: (payload: Partial<Offer> & { id: string }) => 
      apiRequest(`/api/advertiser/offers/${payload.id}`, { method: 'PUT', body: payload }),
    onSuccess: () => { 
      toast({
        title: "Успех",
        description: "Оффер обновлён"
      }); 
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: "Ошибка обновления оффера: " + error.message,
        variant: "destructive"
      });
    }
  });

  const deleteOfferMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/advertiser/offers/${id}`, { method: 'DELETE' }),
    onSuccess: () => { 
      toast({
        title: "Успех",
        description: "Оффер удален"
      }); 
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: "Ошибка удаления оффера: " + error.message,
        variant: "destructive"
      });
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      toast({
        title: "Информация",
        description: "Порядок офферов изменён"
      });
    }
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      let imported = 0;
      
      for (const line of lines) {
        const [name, geo, payout, category, cap, status] = line.split(';');
        if (!name?.trim()) continue;
        
        try {
          await createOfferMutation.mutateAsync({
            name: name.trim(),
            countries: geo?.split(',').map(g => g.trim()) || [],
            payout: payout?.trim() || '0',
            category: category?.trim() || '',
            cap: cap?.trim() || '',
            status: status?.trim() || 'active',
            hold: '', 
            abtestLinks: [], 
            partners: []
          });
          imported++;
        } catch (error) {
          console.error('Ошибка импорта строки:', line, error);
        }
      }
      toast({
        title: "Успех",
        description: `Импорт завершён. Добавлено: ${imported} офферов`
      });
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    const csvContent = offers.map((offer: Offer) => 
      [
        offer.name || '',
        (offer.countries || []).join(','),
        offer.payout || '',
        offer.category || '',
        offer.cap || '',
        offer.status || ''
      ].join(';')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'offers.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Успех",
      description: "Экспорт завершён"
    });
  };

  const bulkStatusUpdate = (newStatus: string) => {
    if (selectedOffers.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите офферы для изменения статуса",
        variant: "destructive"
      });
      return;
    }

    const updates = selectedOffers.map(id => {
      const offer = offers.find((o: Offer) => o.id === id);
      if (offer) {
        return updateOfferMutation.mutateAsync({ ...offer, status: newStatus });
      }
      return Promise.resolve();
    });

    Promise.all(updates).then(() => {
      toast({
        title: "Успех",
        description: `Статус изменён для ${selectedOffers.length} офферов`
      });
      setSelectedOffers([]);
    });
  };

  const bulkDeleteOffers = () => {
    if (selectedOffers.length === 0) {
      toast({
        title: "Ошибка", 
        description: "Выберите офферы для удаления",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`Удалить ${selectedOffers.length} офферов? Это действие нельзя отменить.`)) {
      return;
    }

    const deletions = selectedOffers.map(id => deleteOfferMutation.mutateAsync(id));
    
    Promise.all(deletions).then(() => {
      toast({
        title: "Успех",
        description: `Удалено ${selectedOffers.length} офферов`
      });
      setSelectedOffers([]);
    });
  };

  const renderABPreview = (links: string[], offer: Offer) => {
    if (!links?.length) return <span className="text-muted-foreground">—</span>;
    
    return (
      <div className="flex flex-col gap-1">
        {links.slice(0, 2).map((link, i) => (
          <a 
            key={`abtest-${offer.id}-${i}`} 
            href={link} 
            target="_blank" 
            rel="noreferrer" 
            className="text-blue-600 dark:text-blue-400 underline text-xs hover:text-blue-800 dark:hover:text-blue-300"
          >
            Лендинг {i + 1}
          </a>
        ))}
        {links.length > 2 && (
          <span className="text-xs text-muted-foreground">+{links.length - 2} еще</span>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-xs h-6 px-2 mt-1 text-blue-500 hover:text-blue-700"
          onClick={() => setEditingOffer(offer)}
          data-testid={`button-edit-landings-${offer.id}`}
        >
          <Pencil className="w-3 h-3 mr-1" />
          Редактировать
        </Button>
      </div>
    );
  };

  const showDashboard = (offerId: string) => {
    toast({
      title: "Информация",
      description: `Открываю дашборд для оффера: ${offerId}`
    });
    // Здесь будет переход к странице статистики оффера
  };

  // Удаляем старую функцию getCountryFlag, используем новую систему formatCountries

  const filteredOffers = offers.filter((offer: Offer) => {
    const statusMatch = filterStatus === 'all' || offer.status === filterStatus;
    const categoryMatch = filterCategory === 'all-categories' || !filterCategory || offer.category?.includes(filterCategory);
    const searchMatch = !searchQuery || 
      offer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && categoryMatch && searchMatch;
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка офферов...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего офферов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{offers.length}</div>
            <p className="text-xs text-muted-foreground">
              Активных: {offers.filter((o: Offer) => o.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Среднее CR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {offers.length > 0 
                ? (offers.reduce((sum: number, o: Offer) => sum + (parseFloat(o.cr || '0')), 0) / offers.length).toFixed(2)
                : '0.00'
              }%
            </div>
            <p className="text-xs text-muted-foreground">Конверсия</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${offers.reduce((sum: number, o: Offer) => sum + (o.revenue || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">За весь период</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Партнёров</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {offers.reduce((sum: number, o: Offer) => sum + (o.partnersCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Всего подключений</p>
          </CardContent>
        </Card>
      </div>

      {/* Панель управления */}
      <div className="flex flex-wrap gap-2 items-center justify-between p-4 bg-card border rounded-lg">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Поиск офферов..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search-offers"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="paused">На паузе</SelectItem>
              <SelectItem value="archived">Архив</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">Все</SelectItem>
              <SelectItem value="gambling">Gambling</SelectItem>
              <SelectItem value="dating">Dating</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="nutra">Nutra</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={exportToCSV}
            data-testid="button-export-csv"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          
          <div className="relative">
            <Input 
              type="file" 
              accept=".csv" 
              onChange={importFromCSV} 
              className="hidden"
              id="csv-import"
            />
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => document.getElementById('csv-import')?.click()}
              data-testid="button-import-csv"
            >
              <Upload className="h-4 w-4 mr-2" />
              Импорт CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Массовые действия */}
      {selectedOffers.length > 0 && (
        <div className="flex gap-2 items-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <span className="text-sm font-medium">
            Выбрано: {selectedOffers.length}
          </span>
          <Button 
            size="sm" 
            onClick={() => bulkStatusUpdate('active')}
            data-testid="button-bulk-activate"
          >
            Активировать
          </Button>
          <Button 
            size="sm" 
            onClick={() => bulkStatusUpdate('paused')}
            data-testid="button-bulk-pause"
          >
            Приостановить
          </Button>
          <Button 
            size="sm" 
            onClick={() => bulkStatusUpdate('archived')}
            data-testid="button-bulk-archive"
          >
            Архивировать
          </Button>
          <Button 
            size="sm" 
            onClick={bulkDeleteOffers} 
            variant="destructive"
            data-testid="button-bulk-delete"
          >
            Удалить
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setSelectedOffers([])}
            data-testid="button-clear-selection"
          >
            Отменить
          </Button>
        </div>
      )}

      {/* Drag'n'Drop таблица */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedOffers.length === filteredOffers.length && filteredOffers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOffers(filteredOffers.map((o: Offer) => o.id));
                        } else {
                          setSelectedOffers([]);
                        }
                      }}
                      data-testid="checkbox-select-all"
                    />
                  </TableHead>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Оффер</TableHead>
                  <TableHead>GEO</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead>CAP</TableHead>
                  <TableHead>CR</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>A/B Лендинги</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((id) => {
                  const offer = filteredOffers.find((o: Offer) => o.id === id);
                  if (!offer) return null;
                  
                  return (
                    <SortableItem key={`offer-${id}`} id={id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedOffers.includes(offer.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOffers([...selectedOffers, offer.id]);
                              } else {
                                setSelectedOffers(selectedOffers.filter(id => id !== offer.id));
                              }
                            }}
                            data-testid={`checkbox-select-${offer.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {offer.logo && (
                              <img 
                                src={offer.logo} 
                                alt={offer.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{offer.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {offer.category}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            {formatCountries(offer.countries).slice(0, 3).map((country, index) => (
                              <div key={`${offer.id}-country-${index}`} className="flex items-center gap-1">
                                <span className="text-lg" title={country.name}>{country.flag}</span>
                                <span className="text-xs font-mono bg-muted px-1 py-0.5 rounded">{country.code}</span>
                              </div>
                            ))}
                            {formatCountries(offer.countries).length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{formatCountries(offer.countries).length - 3}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            ${offer.payout}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {offer.cap || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={parseFloat(offer.cr || '0') > 5 ? 'default' : 'secondary'}
                            className={parseFloat(offer.cr || '0') > 5 ? 'bg-green-100 text-green-800' : ''}
                          >
                            {offer.cr || '0'}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              offer.status === 'active' ? 'default' :
                              offer.status === 'paused' ? 'secondary' :
                              offer.status === 'archived' ? 'destructive' :
                              offer.status === 'draft' ? 'outline' :
                              'default'
                            }
                            className={
                              offer.status === 'active' ? 'bg-green-500 hover:bg-green-600 text-white' :
                              offer.status === 'paused' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                              offer.status === 'archived' ? 'bg-red-500 hover:bg-red-600 text-white' :
                              offer.status === 'draft' ? 'bg-gray-500 hover:bg-gray-600 text-white border-gray-600' :
                              'bg-blue-500 hover:bg-blue-600 text-white'
                            }
                          >
                            {offer.status === 'active' ? 'Активный' :
                             offer.status === 'paused' ? 'Приостановлен' :
                             offer.status === 'archived' ? 'Архив' :
                             offer.status === 'draft' ? 'Черновик' :
                             offer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {renderABPreview(offer.abtestLinks || [], offer)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setEditingOffer(offer)}
                              data-testid={`button-edit-${offer.id}`}
                              title="Редактировать оффер"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => showDashboard(offer.id)}
                              data-testid={`button-dashboard-${offer.id}`}
                              title="Статистика оффера"
                            >
                              <BarChartBig className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => deleteOfferMutation.mutate(offer.id)}
                              data-testid={`button-delete-${offer.id}`}
                              title="Удалить оффер"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                    </SortableItem>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </SortableContext>
      </DndContext>

      {/* Пустое состояние */}
      {filteredOffers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">
              {searchQuery || filterStatus !== 'all' || filterCategory ? (
                <>
                  <p>Офферы не найдены по заданным критериям.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                      setFilterCategory('');
                    }}
                  >
                    Сбросить фильтры
                  </Button>
                </>
              ) : (
                <>
                  <p>У вас пока нет офферов.</p>
                  <Button className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Создать первый оффер
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Модальное окно редактирования */}
      {editingOffer && (
        <OfferEditModal
          offer={editingOffer}
          onClose={() => setEditingOffer(null)}
          onSave={(updatedOffer) => {
            updateOfferMutation.mutate(updatedOffer);
            setEditingOffer(null);
          }}
        />
      )}
    </div>
  );
};

export default MyOffersDragDrop;