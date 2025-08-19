import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Copy, 
  ExternalLink, 
  Plus, 
  Search, 
  Filter,
  BarChart3,
  Link as LinkIcon,
  Eye,
  Settings,
  Trash2
} from 'lucide-react';

interface TrackingLink {
  id: string;
  offer_id: string;
  offer_name: string;
  link_name: string;
  original_url: string;
  tracking_url: string;
  sub_id_1?: string;
  sub_id_2?: string;
  sub_id_3?: string;
  clicks: number;
  conversions: number;
  is_active: boolean;
  created_at: string;
}

export default function TrackingLinks() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newLink, setNewLink] = useState({
    offer_id: '',
    link_name: '',
    sub_id_1: '',
    sub_id_2: '',
    sub_id_3: ''
  });

  const { data: links, isLoading } = useQuery({
    queryKey: ['tracking-links'],
    queryFn: () => apiRequest('/api/partner/tracking-links')
  });

  const { data: offers } = useQuery({
    queryKey: ['partner-offers'],
    queryFn: () => apiRequest('/api/partner/offers')
  });

  const createLinkMutation = useMutation({
    mutationFn: (data: typeof newLink) => 
      apiRequest('/api/partner/tracking-links', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-links'] });
      setShowCreateDialog(false);
      setNewLink({ offer_id: '', link_name: '', sub_id_1: '', sub_id_2: '', sub_id_3: '' });
      toast({
        title: t('common.success', 'Успешно'),
        description: t('links.created', 'Ссылка создана')
      });
    }
  });

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: t('common.copied', 'Скопировано'),
      description: t('links.copied', 'Ссылка скопирована в буфер обмена')
    });
  };

  const filteredLinks = links?.filter((link: TrackingLink) => {
    const matchesSearch = link.link_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.offer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && link.is_active) ||
                         (statusFilter === 'inactive' && !link.is_active);
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('links.title', 'Трекинговые ссылки')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('links.description', 'Создавайте и управляйте трекинговыми ссылками для ваших офферов')}
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('links.create', 'Создать ссылку')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('links.createNew', 'Создать новую ссылку')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="offer">{t('links.offer', 'Оффер')}</Label>
                <Select value={newLink.offer_id} onValueChange={(value) => setNewLink(prev => ({ ...prev, offer_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('links.selectOffer', 'Выберите оффер')} />
                  </SelectTrigger>
                  <SelectContent>
                    {offers?.map((offer: any) => (
                      <SelectItem key={offer.id} value={offer.id}>
                        {offer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="linkName">{t('links.name', 'Название ссылки')}</Label>
                <Input
                  id="linkName"
                  value={newLink.link_name}
                  onChange={(e) => setNewLink(prev => ({ ...prev, link_name: e.target.value }))}
                  placeholder={t('links.namePlaceholder', 'Например: Facebook Traffic')}
                />
              </div>

              <div>
                <Label htmlFor="subId1">Sub ID 1</Label>
                <Input
                  id="subId1"
                  value={newLink.sub_id_1}
                  onChange={(e) => setNewLink(prev => ({ ...prev, sub_id_1: e.target.value }))}
                  placeholder={t('links.subIdPlaceholder', 'Дополнительный параметр')}
                />
              </div>

              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="subId2">Sub ID 2</Label>
                  <Input
                    id="subId2"
                    value={newLink.sub_id_2}
                    onChange={(e) => setNewLink(prev => ({ ...prev, sub_id_2: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="subId3">Sub ID 3</Label>
                  <Input
                    id="subId3"
                    value={newLink.sub_id_3}
                    onChange={(e) => setNewLink(prev => ({ ...prev, sub_id_3: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCreateDialog(false)}
                >
                  {t('common.cancel', 'Отмена')}
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => createLinkMutation.mutate(newLink)}
                  disabled={!newLink.offer_id || !newLink.link_name || createLinkMutation.isPending}
                >
                  {createLinkMutation.isPending ? t('common.creating', 'Создание...') : t('common.create', 'Создать')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('links.search', 'Поиск по названию или офферу')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all', 'Все')}</SelectItem>
                <SelectItem value="active">{t('common.active', 'Активные')}</SelectItem>
                <SelectItem value="inactive">{t('common.inactive', 'Неактивные')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LinkIcon className="h-5 w-5 mr-2" />
            {t('links.allLinks', 'Все ссылки')}
          </CardTitle>
          <CardDescription>
            {filteredLinks.length} {t('links.found', 'ссылок найдено')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">{t('common.loading', 'Загрузка...')}</div>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-8">
              <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-lg font-semibold mb-2">{t('links.empty', 'Нет ссылок')}</div>
              <div className="text-muted-foreground">{t('links.emptyDescription', 'Создайте первую трекинговую ссылку')}</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('links.name', 'Название')}</TableHead>
                  <TableHead>{t('links.offer', 'Оффер')}</TableHead>
                  <TableHead>{t('links.url', 'Ссылка')}</TableHead>
                  <TableHead>{t('links.stats', 'Статистика')}</TableHead>
                  <TableHead>{t('common.status', 'Статус')}</TableHead>
                  <TableHead>{t('common.actions', 'Действия')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map((link: TrackingLink) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{link.link_name}</div>
                        {(link.sub_id_1 || link.sub_id_2 || link.sub_id_3) && (
                          <div className="text-sm text-muted-foreground">
                            {[link.sub_id_1, link.sub_id_2, link.sub_id_3].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{link.offer_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-mono text-sm truncate">{link.tracking_url}</div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyLink(link.tracking_url)}
                          className="h-6 px-2 text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {t('common.copy', 'Копировать')}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Eye className="h-3 w-3 mr-1" />
                          {link.clicks} {t('links.clicks', 'кликов')}
                        </div>
                        <div className="flex items-center text-sm">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          {link.conversions} {t('links.conversions', 'конверсий')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={link.is_active ? 'default' : 'secondary'}>
                        {link.is_active ? t('common.active', 'Активна') : t('common.inactive', 'Неактивна')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}