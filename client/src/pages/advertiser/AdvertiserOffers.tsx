// ✅ AdvertiserOffers.tsx: офферы рекламодателя с предпросмотром лендинга, созданием, редактированием, фильтрацией, флагами, экспортом, drag'n'drop reorder, массовыми действиями и редактором лендингов, а также назначением офферов партнёрам с логикой запроса доступа и одобрения.

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Download, Edit, Flag, Plus, Trash2, Eye, Settings2, Users2, PenTool, Archive, Copy, Play, ArrowUp, ArrowDown, ExternalLink, GripVertical, Pause } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { parseCountries } from '@/utils/countries';
import { getCategoryBadgeProps } from '@/utils/categories';
import { formatCR } from '@/utils/formatters';
import OfferEditModal from '@/components/modals/OfferEditModal';
import GeoDisplay from '@/components/GeoDisplay';

// Компонент для отображения изображения оффера
const OfferImageDisplay = ({ offer }: { offer: any }) => {
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Приоритет: 1) image 2) logo 3) placeholder с инициалами
  
  // Если есть image и нет ошибки загрузки
  if (offer.image && !imageError) {
    return (
      <img 
        src={offer.image} 
        alt={offer.name}
        className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
        onLoad={() => console.log('Offer image loaded successfully:', offer.image)}
        onError={() => {
          console.log('Offer image failed to load, trying logo:', offer.image);
          setImageError(true);
        }}
      />
    );
  }

  // Если нет image или он не загрузился, но есть logo
  if (offer.logo && !logoError) {
    return (
      <img 
        src={offer.logo} 
        alt={offer.name}
        className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
        onLoad={() => console.log('Logo loaded successfully:', offer.logo)}
        onError={() => {
          console.log('Logo failed to load:', offer.logo);
          setLogoError(true);
        }}
      />
    );
  }

  // Placeholder с инициалами (когда нет ни image, ни logo, или они не загрузились)
  return (
    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
      {offer.name?.substring(0, 2).toUpperCase() || 'OF'}
    </div>
  );
};

function DraggableRow({ offer, index, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: offer.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} className={isDragging ? 'bg-muted/50' : ''}>
      <TableCell 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing hover:bg-muted/50 p-2"
        title="Перетащите для изменения порядка"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground hover:text-foreground" />
      </TableCell>
      {children}
    </TableRow>
  );
}

const AdvertiserOffers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [editOffer, setEditOffer] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [localOffers, setLocalOffers] = useState<any[]>([]);

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['/api/advertiser/offers'],
    queryFn: () => apiRequest('/api/advertiser/offers'),
  });

  // Обновляем локальное состояние при загрузке данных с сервера
  React.useEffect(() => {
    if (offers && offers.length > 0) {
      // Сортируем по дате создания (новые сверху) при первой загрузке
      const sorted = [...offers].sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setLocalOffers(sorted);
    }
  }, [offers]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      if (!data.status) {
        data.status = 'active';
      }
      return data.id ? apiRequest(`/api/advertiser/offers/${data.id}`, 'PATCH', data) : apiRequest(`/api/advertiser/offers`, 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Оффер сохранён",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Ошибка при сохранении",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (offerId: string) => apiRequest(`/api/advertiser/offers/${offerId}`, 'DELETE'),
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Оффер удалён",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      setConfirmDelete(null);
      setSelectedOffers([]);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Ошибка при удалении",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (offerIds: string[]) => {
      const promises = offerIds.map(id => apiRequest(`/api/advertiser/offers/${id}`, 'DELETE'));
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Успех",
        description: `Удалено ${selectedOffers.length} офферов`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      setSelectedOffers([]);
      setConfirmBulkDelete(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Ошибка при массовом удалении",
        variant: "destructive",
      });
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      apiRequest(`/api/advertiser/offers/bulk-update`, 'POST', { ids, status }),
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Статус обновлён",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      setSelectedOffers([]);
    },
  });

  // Используем локальное состояние для фильтрации (уже отсортированное)
  const filtered = localOffers
    .filter((o: any) => o.name.toLowerCase().includes(search.toLowerCase()))
    .filter((o: any) => {
      if (selectedStatus === 'archived') return o.status === 'archived';
      if (selectedStatus === 'all') return true;
      return o.status === selectedStatus;
    });

  // Обработчик drag and drop
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localOffers.findIndex((offer: any) => offer.id === active.id);
    const newIndex = localOffers.findIndex((offer: any) => offer.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(localOffers, oldIndex, newIndex);
      
      // Обновляем локальное состояние немедленно
      setLocalOffers(newOrder);
      
      console.log('Reordered offers:', newOrder.map(o => ({ id: o.id, name: o.name })));
      
      toast({
        title: "Порядок изменён",
        description: `Оффер перемещён`,
      });
      
      // TODO: Здесь можно добавить сохранение порядка на сервер
      // apiRequest('/api/advertiser/offers/reorder', 'POST', { order: newOrder.map(o => o.id) });
    }
  };

  const handleBulkStatusChange = (status: string) => {
    bulkStatusMutation.mutate({ ids: selectedOffers, status });
  };

  const handleAction = (offer: any, action: string) => {
    switch (action) {
      case 'activate':
        updateMutation.mutate({ ...offer, status: 'active' });
        break;
      case 'archive':
        updateMutation.mutate({ ...offer, status: 'archived' });
        break;
      case 'duplicate':
        const duplicated = {
          ...offer,
          id: undefined,
          createdAt: undefined,
          updatedAt: undefined,
          name: offer.name + ' (копия)',
        };
        updateMutation.mutate(duplicated);
        break;
      case 'delete':
        setConfirmDelete(offer);
        break;
      case 'preview':
        if (offer?.landingPages?.[0]?.url) {
          window.open(offer.landingPages[0].url, '_blank');
        } else {
          toast({
            title: "Предупреждение",
            description: "Нет доступной ссылки для предпросмотра",
            variant: "destructive",
          });
        }
        break;
      case 'assign':
        navigate(`/advertiser/offers/${offer.id}/assign`);
        break;
      case 'edit-landing':
        navigate(`/advertiser/offers/${offer.id}/landing-editor`);
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }



  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Мои офферы</h1>
          <p className="text-muted-foreground">
            Управление офферами и отслеживание статистики
          </p>
        </div>
        <Button 
          onClick={() => navigate('/advertiser/offers/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          title="Создать новый оффер"
        >
          <Plus className="h-4 w-4 mr-2 text-white" />
          Создать оффер
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Поиск по названию..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <div className="flex gap-2">
          <Button onClick={() => setSelectedStatus('all')} variant={selectedStatus === 'all' ? 'default' : 'outline'}>Все</Button>
          <Button onClick={() => setSelectedStatus('active')} variant={selectedStatus === 'active' ? 'default' : 'outline'}>Активные</Button>
          <Button onClick={() => setSelectedStatus('paused')} variant={selectedStatus === 'paused' ? 'default' : 'outline'}>Приостановленные</Button>
          <Button onClick={() => setSelectedStatus('archived')} variant={selectedStatus === 'archived' ? 'default' : 'outline'}>Архив</Button>
        </div>
      </div>

      {selectedOffers.length > 0 && (
        <div className="flex gap-2">
          <Button 
            onClick={() => handleBulkStatusChange('active')} 
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            title="Активировать выбранные офферы"
          >
            <Play className="w-4 h-4 mr-1 text-white" /> Активировать
          </Button>
          <Button 
            onClick={() => handleBulkStatusChange('archived')} 
            size="sm"
            className="bg-gray-600 hover:bg-gray-700 text-white"
            title="Архивировать выбранные офферы"
          >
            <Archive className="w-4 h-4 mr-1 text-white" /> Архивировать
          </Button>
          <Button 
            onClick={() => handleBulkStatusChange('paused')} 
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
            title="Приостановить выбранные офферы"
          >
            <Pause className="w-4 h-4 mr-1 text-white" /> Приостановить
          </Button>
          <Button 
            onClick={() => setConfirmBulkDelete(true)} 
            size="sm" 
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
            title={`Удалить выбранные офферы (${selectedOffers.length})`}
          >
            <Trash2 className="w-4 h-4 mr-1 text-white" /> Удалить ({selectedOffers.length})
          </Button>
        </div>
      )}

      <DndContext onDragEnd={handleDragEnd}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" title="Перетащите для изменения порядка">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </TableHead>
              <TableHead>
                <Checkbox 
                  checked={selectedOffers.length === filtered.length && filtered.length > 0} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedOffers(filtered.map((o: any) => o.id));
                    } else {
                      setSelectedOffers([]);
                    }
                  }} 
                />
              </TableHead>
              <TableHead>Название</TableHead>
              <TableHead>GEO</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>CR</TableHead>
              <TableHead>Payout</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext items={filtered.map((o: any) => o.id)} strategy={verticalListSortingStrategy}>
              {filtered.map((offer: any, index: number) => (
                <DraggableRow key={offer.id} offer={offer} index={index}>
                  <>
                    <TableCell>
                      <Checkbox 
                        checked={selectedOffers.includes(offer.id)} 
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedOffers(prev => [...prev, offer.id]);
                          else setSelectedOffers(prev => prev.filter(id => id !== offer.id));
                        }} 
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {/* Логика отображения: Image > Logo > Placeholder */}
                        <OfferImageDisplay offer={offer} />
                        <div>
                          <div className="font-medium">{offer.name}</div>
                          {offer.description && (
                            <div className="text-sm text-gray-500 truncate max-w-48">
                              {typeof offer.description === 'object' ? offer.description?.en || offer.description?.ru || 'Описание' : offer.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <GeoDisplay 
                        countries={offer.countries}
                        geoTargeting={offer.geoTargeting}
                        payout={offer.payout}
                        currency={offer.currency}
                        offerId={offer.id}
                        payoutByGeo={offer.payoutByGeo}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge {...getCategoryBadgeProps(offer.category)}>
                        {typeof offer.category === 'object' ? offer.category?.en || offer.category?.ru || 'Категория' : offer.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCR(offer.cr)}%</TableCell>
                    <TableCell>${offer.payout} {offer.currency}</TableCell>
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
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setEditOffer(offer)} 
                          title="Редактировать оффер"
                          className="hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleAction(offer, 'preview')} 
                          title="Предпросмотр оффера"
                          className="hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/20 dark:hover:text-purple-400"
                        >
                          <Eye className="w-4 h-4 text-purple-500" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setConfirmDelete(offer)} 
                          title="Удалить оффер"
                          className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                </DraggableRow>
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>

      {/* Модальное окно редактирования оффера */}
      {editOffer && (
        <OfferEditModal
          offer={editOffer}
          onClose={() => setEditOffer(null)}
          onSave={(updatedOffer) => {
            updateMutation.mutate(updatedOffer);
            setEditOffer(null);
          }}
        />
      )}

      {/* Диалог подтверждения удаления одного оффера */}
      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить оффер "{confirmDelete?.name}"?
              <br />
              <span className="text-red-600 font-medium">Это действие необратимо.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Удаление...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог подтверждения массового удаления */}
      <AlertDialog open={confirmBulkDelete} onOpenChange={() => setConfirmBulkDelete(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите массовое удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить {selectedOffers.length} выбранных офферов?
              <br />
              <span className="text-red-600 font-medium">Это действие необратимо.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => bulkDeleteMutation.mutate(selectedOffers)}
              className="bg-red-600 hover:bg-red-700"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? 'Удаление...' : `Удалить ${selectedOffers.length} офферов`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdvertiserOffers;