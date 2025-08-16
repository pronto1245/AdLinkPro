import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useToast } from '../../hooks/use-toast';
import {
  Copy,
  Plus,
  Send,
  Link,
  Calendar,
  Users,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface InviteLink {
  id: string;
  name: string;
  token: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  usageCount: number;
  maxUsage?: number;
  description?: string;
}

interface InvitePartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvitePartnersModal({ isOpen, onClose }: InvitePartnersModalProps) {
  const [linkName, setLinkName] = useState('');
  const [description, setDescription] = useState('');
  const [maxUsage, setMaxUsage] = useState('');
  const [expiryDays, setExpiryDays] = useState('30');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Загрузка списка ссылок приглашений
  const { data: inviteLinks = [], isLoading } = useQuery<InviteLink[]>({
    queryKey: ['/api/invite-links'],
    enabled: isOpen
  });

  // Создание новой ссылки приглашения
  const createLinkMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      maxUsage?: number;
      expiryDays?: number;
    }) => {
      return apiRequest('/api/invite-links', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invite-links'] });
      setLinkName('');
      setDescription('');
      setMaxUsage('');
      setExpiryDays('30');
      toast({
        title: 'Успех',
        description: 'Ссылка приглашения создана успешно!'
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать ссылку приглашения',
        variant: 'destructive'
      });
    }
  });

  // Переключение активности ссылки
  const toggleLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      return apiRequest(`/api/invite-links/${linkId}/toggle`, 'PATCH');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invite-links'] });
      toast({
        title: 'Успех',
        description: 'Статус ссылки изменен'
      });
    }
  });

  // Удаление ссылки
  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      return apiRequest(`/api/invite-links/${linkId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invite-links'] });
      toast({
        title: 'Успех',
        description: 'Ссылка удалена'
      });
    }
  });

  const handleCreateLink = () => {
    if (!linkName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название ссылки',
        variant: 'destructive'
      });
      return;
    }

    createLinkMutation.mutate({
      name: linkName.trim(),
      description: description.trim() || undefined,
      maxUsage: maxUsage ? parseInt(maxUsage) : undefined,
      expiryDays: expiryDays ? parseInt(expiryDays) : undefined
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Скопировано',
        description: 'Ссылка скопирована в буфер обмена'
      });
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Ссылки приглашения партнеров
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Создание новой ссылки */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Создать ссылку
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="linkName">Название ссылки *</Label>
                  <Input
                    id="linkName"
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                    placeholder="Например: VIP партнеры"
                    data-testid="input-link-name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Описание для внутреннего использования"
                    data-testid="input-description"
                  />
                </div>

                <div>
                  <Label htmlFor="maxUsage">Лимит использований</Label>
                  <Input
                    id="maxUsage"
                    type="number"
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(e.target.value)}
                    placeholder="Оставьте пустым для неограниченного"
                    data-testid="input-max-usage"
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDays">Срок действия (дни)</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    placeholder="30"
                    data-testid="input-expiry-days"
                  />
                </div>

                <Button
                  onClick={handleCreateLink}
                  disabled={createLinkMutation.isPending}
                  className="w-full"
                  data-testid="button-create-link"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createLinkMutation.isPending ? 'Создание...' : 'Создать ссылку'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Список ссылок */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Активные ссылки ({inviteLinks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
                    <p>Загрузка ссылок...</p>
                  </div>
                ) : inviteLinks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Link className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Ссылки приглашения не созданы</p>
                    <p className="text-sm">Создайте первую ссылку для приглашения партнеров</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inviteLinks.map((link: InviteLink) => (
                      <div
                        key={link.id}
                        className="border rounded-lg p-4 space-y-2"
                        data-testid={`link-card-${link.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold" data-testid={`link-name-${link.id}`}>
                                {link.name}
                              </h3>
                              <Badge 
                                variant={link.isActive ? 'default' : 'secondary'}
                                data-testid={`link-status-${link.id}`}
                              >
                                {link.isActive ? 'Активна' : 'Неактивна'}
                              </Badge>
                            </div>
                            {link.description && (
                              <p className="text-sm text-gray-600 mb-2">{link.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleLinkMutation.mutate(link.id)}
                              disabled={toggleLinkMutation.isPending}
                              data-testid={`button-toggle-${link.id}`}
                            >
                              {link.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteLinkMutation.mutate(link.id)}
                              disabled={deleteLinkMutation.isPending}
                              data-testid={`button-delete-${link.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded p-2">
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-sm break-all" data-testid={`link-url-${link.id}`}>
                              {link.url}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(link.url)}
                              data-testid={`button-copy-${link.id}`}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Использований: {link.usageCount}
                              {link.maxUsage && ` / ${link.maxUsage}`}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Создана: {formatDate(link.createdAt)}
                            </span>
                          </div>
                          {link.expiresAt && (
                            <span className="flex items-center gap-1">
                              Истекает: {formatDate(link.expiresAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Информация о регистрации */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Как это работает</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Создайте ссылку</h4>
                  <p className="text-gray-600">Настройте название, описание и ограничения для ссылки приглашения</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Поделитесь ссылкой</h4>
                  <p className="text-gray-600">Отправьте ссылку потенциальным партнерам через любые каналы связи</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Автоматическая привязка</h4>
                  <p className="text-gray-600">Партнеры регистрируются и автоматически привязываются к вашему аккаунту</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}