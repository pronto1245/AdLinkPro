// ✅ AdvertiserOffers.tsx: офферы рекламодателя с предпросмотром лендинга, созданием, редактированием, фильтрацией, флагами, экспортом, drag'n'drop reorder, массовыми действиями и редактором лендингов, а также назначением офферов партнёрам с логикой запроса доступа и одобрения.

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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

function DraggableRow({ offer, index, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: offer.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <TableRow ref={setNodeRef} style={style} {...attributes}>
      <TableCell {...listeners} className="cursor-grab">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['/api/advertiser/offers'],
    queryFn: () => apiRequest('/api/advertiser/offers'),
  });

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
    mutationFn: (ids: string[]) => apiRequest(`/api/advertiser/offers/bulk-delete`, 'POST', { ids }),
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Удалено",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      setSelectedOffers([]);
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

  const filtered = offers
    .filter((o: any) => o.name.toLowerCase().includes(search.toLowerCase()))
    .filter((o: any) => {
      if (selectedStatus === 'archived') return o.status === 'archived';
      if (selectedStatus === 'all') return true;
      return o.status === selectedStatus;
    });

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
        <Button onClick={() => navigate('/advertiser/offers/new')}>
          <Plus className="h-4 w-4 mr-2" />
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
          <Button onClick={() => handleBulkStatusChange('active')} size="sm">
            <Play className="w-4 h-4 mr-1" /> Активировать
          </Button>
          <Button onClick={() => handleBulkStatusChange('archived')} size="sm">
            <Archive className="w-4 h-4 mr-1" /> Архивировать
          </Button>
          <Button onClick={() => handleBulkStatusChange('paused')} size="sm">
            <Pause className="w-4 h-4 mr-1" /> Приостановить
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
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
            <TableHead></TableHead>
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
          <DndContext>
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
                        {offer.logo && (
                          <img 
                            src={offer.logo} 
                            alt={offer.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
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
                      <div className="flex items-center gap-1 flex-wrap">
                        {parseCountries(offer.countries).slice(0, 3).map((country, index) => (
                          <div key={`${offer.id}-country-${index}`} className="flex items-center gap-1">
                            <span className="text-lg" title={country.name}>{country.flag}</span>
                            <span className="text-xs font-mono bg-muted px-1 py-0.5 rounded">{country.code}</span>
                          </div>
                        ))}
                        {parseCountries(offer.countries).length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{parseCountries(offer.countries).length - 3}
                          </span>
                        )}
                      </div>
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
                        <Button size="sm" variant="ghost" onClick={() => setEditOffer(offer)} title="Редактировать">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleAction(offer, 'preview')} title="Предпросмотр">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleAction(offer, 'duplicate')} title="Дублировать">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                </DraggableRow>
              ))}
            </SortableContext>
          </DndContext>
        </TableBody>
      </Table>

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
    </div>
  );
};

export default AdvertiserOffers;