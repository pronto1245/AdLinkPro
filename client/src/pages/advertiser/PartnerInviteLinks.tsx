import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Link, Users, Settings, Plus, Eye, Trash2, QrCode } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface InviteLink {
  id: string;
  linkToken: string;
  fullUrl: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  usedCount: number;
  maxUses?: number;
  expiresAt?: Date;
}

export default function PartnerInviteLinks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([
    {
      id: '1',
      linkToken: 'adv_12345_invite_abc123',
      fullUrl: `${window.location.origin}/register-partner?token=adv_12345_invite_abc123`,
      description: 'Основная ссылка для партнеров',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      usedCount: 12,
      maxUses: undefined,
      expiresAt: undefined
    },
    {
      id: '2',
      linkToken: 'adv_12345_promo_xyz789',
      fullUrl: `${window.location.origin}/register-partner?token=adv_12345_promo_xyz789`,
      description: 'Промо-ссылка для мероприятий',
      isActive: true,
      createdAt: new Date('2024-01-20'),
      usedCount: 5,
      maxUses: 50,
      expiresAt: new Date('2024-12-31')
    }
  ]);

  const [newLinkForm, setNewLinkForm] = useState({
    description: '',
    maxUses: '',
    expiresAt: '',
    isActive: true
  });

  const [showCreateForm, setShowCreateForm] = useState(false);

  const generateInviteLink = () => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const linkToken = `adv_${user?.id?.substring(0, 8)}_invite_${randomId}`;
    const fullUrl = `${window.location.origin}/register-partner?token=${linkToken}`;

    const newLink: InviteLink = {
      id: timestamp.toString(),
      linkToken,
      fullUrl,
      description: newLinkForm.description || 'Новая ссылка для партнеров',
      isActive: newLinkForm.isActive,
      createdAt: new Date(),
      usedCount: 0,
      maxUses: newLinkForm.maxUses ? parseInt(newLinkForm.maxUses) : undefined,
      expiresAt: newLinkForm.expiresAt ? new Date(newLinkForm.expiresAt) : undefined
    };

    setInviteLinks([newLink, ...inviteLinks]);
    setNewLinkForm({ description: '', maxUses: '', expiresAt: '', isActive: true });
    setShowCreateForm(false);

    toast({
      title: "Ссылка создана!",
      description: "Новая ссылка для приглашения партнеров готова к использованию.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Скопировано!",
        description: "Ссылка скопирована в буфер обмена.",
      });
    });
  };

  const toggleLinkStatus = (id: string) => {
    setInviteLinks(links => 
      links.map(link => 
        link.id === id ? { ...link, isActive: !link.isActive } : link
      )
    );
  };

  const deleteLink = (id: string) => {
    setInviteLinks(links => links.filter(link => link.id !== id));
    toast({
      title: "Ссылка удалена",
      description: "Ссылка для приглашения партнеров была удалена.",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (link: InviteLink) => {
    return link.expiresAt && link.expiresAt < new Date();
  };

  const isMaxUsesReached = (link: InviteLink) => {
    return link.maxUses && link.usedCount >= link.maxUses;
  };

  const getLinkStatus = (link: InviteLink) => {
    if (!link.isActive) return { text: 'Неактивна', color: 'bg-gray-500' };
    if (isExpired(link)) return { text: 'Истекла', color: 'bg-red-500' };
    if (isMaxUsesReached(link)) return { text: 'Лимит исчерпан', color: 'bg-orange-500' };
    return { text: 'Активна', color: 'bg-green-500' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ссылки для приглашения партнеров</h1>
          <p className="text-gray-600 mt-2">
            Создавайте и управляйте ссылками для регистрации новых партнеров
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-create-invite-link"
        >
          <Plus className="w-4 h-4 mr-2" />
          Создать ссылку
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего ссылок</p>
                <p className="text-2xl font-bold text-blue-600">{inviteLinks.length}</p>
              </div>
              <Link className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Активных ссылок</p>
                <p className="text-2xl font-bold text-green-600">
                  {inviteLinks.filter(link => link.isActive && !isExpired(link) && !isMaxUsesReached(link)).length}
                </p>
              </div>
              <Settings className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего переходов</p>
                <p className="text-2xl font-bold text-purple-600">
                  {inviteLinks.reduce((sum, link) => sum + link.usedCount, 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Новых партнеров</p>
                <p className="text-2xl font-bold text-orange-600">
                  {inviteLinks.reduce((sum, link) => sum + link.usedCount, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Форма создания новой ссылки */}
      {showCreateForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Создать новую ссылку приглашения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Описание ссылки</Label>
              <Input
                id="description"
                placeholder="Например: Ссылка для конференции Digital Marketing 2024"
                value={newLinkForm.description}
                onChange={(e) => setNewLinkForm({ ...newLinkForm, description: e.target.value })}
                data-testid="input-link-description"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxUses">Максимальное количество использований (необязательно)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  placeholder="Например: 100"
                  value={newLinkForm.maxUses}
                  onChange={(e) => setNewLinkForm({ ...newLinkForm, maxUses: e.target.value })}
                  data-testid="input-max-uses"
                />
              </div>
              
              <div>
                <Label htmlFor="expiresAt">Дата истечения (необязательно)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={newLinkForm.expiresAt}
                  onChange={(e) => setNewLinkForm({ ...newLinkForm, expiresAt: e.target.value })}
                  data-testid="input-expires-at"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={newLinkForm.isActive}
                onCheckedChange={(checked) => setNewLinkForm({ ...newLinkForm, isActive: checked })}
                data-testid="switch-is-active"
              />
              <Label htmlFor="isActive">Активировать ссылку сразу</Label>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={generateInviteLink} data-testid="button-generate-link">
                <Plus className="w-4 h-4 mr-2" />
                Создать ссылку
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                data-testid="button-cancel-create"
              >
                Отменить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Список ссылок */}
      <Card>
        <CardHeader>
          <CardTitle>Управление ссылками приглашения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inviteLinks.map((link) => {
              const status = getLinkStatus(link);
              
              return (
                <div 
                  key={link.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  data-testid={`invite-link-${link.id}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{link.description}</h3>
                        <Badge className={`${status.color} text-white text-xs`}>
                          {status.text}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Создана: {formatDate(link.createdAt)} • 
                        Использована: {link.usedCount} раз
                        {link.maxUses && ` (макс. ${link.maxUses})`}
                        {link.expiresAt && ` • Истекает: ${formatDate(link.expiresAt)}`}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleLinkStatus(link.id)}
                        data-testid={`button-toggle-${link.id}`}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteLink(link.id)}
                        className="text-red-600 hover:bg-red-50"
                        data-testid={`button-delete-${link.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 rounded p-3">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-gray-700 flex-1 break-all">
                        {link.fullUrl}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(link.fullUrl)}
                        className="ml-2 text-blue-600 hover:bg-blue-50"
                        data-testid={`button-copy-${link.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {inviteLinks.length === 0 && (
              <div className="text-center py-12">
                <Link className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Нет ссылок для приглашения</h3>
                <p className="text-gray-500 mb-4">
                  Создайте первую ссылку для приглашения партнеров
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  data-testid="button-create-first-link"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать первую ссылку
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Инструкция */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Как использовать ссылки приглашения
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p>• <strong>Создайте ссылку</strong> с описательным названием для легкой идентификации</p>
          <p>• <strong>Скопируйте ссылку</strong> и отправьте потенциальным партнерам через email, мессенджеры или разместите на сайте</p>
          <p>• <strong>Установите лимиты</strong> по количеству использований или дате истечения при необходимости</p>
          <p>• <strong>Отслеживайте статистику</strong> использования каждой ссылки в реальном времени</p>
          <p>• <strong>Управляйте активностью</strong> ссылок - отключайте неактуальные или удаляйте ненужные</p>
        </CardContent>
      </Card>
    </div>
  );
}