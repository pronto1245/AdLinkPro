import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const EditOffer: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useParams();
  const offerId = params.id;

  // Загрузка данных оффера
  const { data: offer, isLoading } = useQuery({
    queryKey: ['/api/advertiser/offers', offerId],
    queryFn: () => apiRequest(`/api/advertiser/offers/${offerId}`),
    enabled: !!offerId
  });

  // Состояние формы
  const [formData, setFormData] = useState({
    name: '',
    description: { ru: '', en: '' },
    category: '',
    payout: '',
    currency: 'USD',
    payoutType: 'CPA',
    countries: [] as string[],
    trafficSources: [] as string[],
    allowedApplications: [] as string[],
    antifraudEnabled: false,
    antifraudMethods: [] as string[],
    partnerApprovalType: 'automatic',
    kycRequired: false,
    isPrivate: false,
    dailyLimit: '',
    monthlyLimit: '',
    landingPages: [{ name: 'Default Landing', url: '', isDefault: true }]
  });

  // Заполнение формы данными оффера
  useEffect(() => {
    if (offer) {
      setFormData({
        name: offer.name || '',
        description: offer.description || { ru: '', en: '' },
        category: offer.category || '',
        payout: offer.payout || '',
        currency: offer.currency || 'USD',
        payoutType: offer.payoutType || 'CPA',
        countries: offer.countries || [],
        trafficSources: offer.trafficSources || [],
        allowedApplications: offer.allowedApplications || [],
        antifraudEnabled: offer.antifraudEnabled || false,
        antifraudMethods: offer.antifraudMethods || [],
        partnerApprovalType: offer.partnerApprovalType || 'automatic',
        kycRequired: offer.kycRequired || false,
        isPrivate: offer.isPrivate || false,
        dailyLimit: offer.dailyLimit?.toString() || '',
        monthlyLimit: offer.monthlyLimit?.toString() || '',
        landingPages: offer.landingPages || [{ name: 'Default Landing', url: '', isDefault: true }]
      });
    }
  }, [offer]);

  // Мутация для обновления оффера
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/advertiser/offers/${offerId}`, {
        method: 'PATCH',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: 'Оффер обновлен',
        description: 'Изменения успешно сохранены',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/offers'] });
      setLocation('/advertiser/offers');
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить оффер',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      dailyLimit: formData.dailyLimit ? parseInt(formData.dailyLimit) : null,
      monthlyLimit: formData.monthlyLimit ? parseInt(formData.monthlyLimit) : null,
    };
    
    updateMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-gray-600">Оффер не найден</p>
        <Button 
          onClick={() => setLocation('/advertiser/offers')}
          className="mt-4"
        >
          Вернуться к офферам
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation('/advertiser/offers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к офферам
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Редактирование оффера</h1>
            <p className="text-muted-foreground">{offer.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => setLocation('/advertiser/offers')}
          >
            <X className="h-4 w-4 mr-2" />
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>

      {/* Форма редактирования */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Название оффера</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Категория</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gambling">Гемблинг</SelectItem>
                    <SelectItem value="betting">Ставки</SelectItem>
                    <SelectItem value="finance">Финансы</SelectItem>
                    <SelectItem value="crypto">Криптовалюта</SelectItem>
                    <SelectItem value="dating">Знакомства</SelectItem>
                    <SelectItem value="nutra">Нутра</SelectItem>
                    <SelectItem value="games">Игры</SelectItem>
                    <SelectItem value="apps">Приложения</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description-ru">Описание (русский)</Label>
              <Textarea
                id="description-ru"
                value={formData.description.ru}
                onChange={(e) => handleInputChange('description', {
                  ...formData.description,
                  ru: e.target.value
                })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="description-en">Описание (английский)</Label>
              <Textarea
                id="description-en"
                value={formData.description.en}
                onChange={(e) => handleInputChange('description', {
                  ...formData.description,
                  en: e.target.value
                })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Выплаты и лимиты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="payout">Payout</Label>
                <Input
                  id="payout"
                  value={formData.payout}
                  onChange={(e) => handleInputChange('payout', e.target.value)}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="currency">Валюта</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => handleInputChange('currency', value)}
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
              <div>
                <Label htmlFor="payoutType">Тип выплаты</Label>
                <Select 
                  value={formData.payoutType} 
                  onValueChange={(value) => handleInputChange('payoutType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPA">CPA</SelectItem>
                    <SelectItem value="CPL">CPL</SelectItem>
                    <SelectItem value="CPC">CPC</SelectItem>
                    <SelectItem value="CPM">CPM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dailyLimit">Дневной лимит</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  value={formData.dailyLimit}
                  onChange={(e) => handleInputChange('dailyLimit', e.target.value)}
                  placeholder="Не ограничен"
                />
              </div>
              <div>
                <Label htmlFor="monthlyLimit">Месячный лимит</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  value={formData.monthlyLimit}
                  onChange={(e) => handleInputChange('monthlyLimit', e.target.value)}
                  placeholder="Не ограничен"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Настройки доступа</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="antifraudEnabled"
                checked={formData.antifraudEnabled}
                onCheckedChange={(checked) => handleInputChange('antifraudEnabled', checked)}
              />
              <Label htmlFor="antifraudEnabled">Включить антифрод</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="kycRequired"
                checked={formData.kycRequired}
                onCheckedChange={(checked) => handleInputChange('kycRequired', checked)}
              />
              <Label htmlFor="kycRequired">Требуется KYC</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrivate"
                checked={formData.isPrivate}
                onCheckedChange={(checked) => handleInputChange('isPrivate', checked)}
              />
              <Label htmlFor="isPrivate">Приватный оффер</Label>
            </div>

            <div>
              <Label htmlFor="partnerApprovalType">Тип одобрения партнеров</Label>
              <Select 
                value={formData.partnerApprovalType} 
                onValueChange={(value) => handleInputChange('partnerApprovalType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Автоматическое</SelectItem>
                  <SelectItem value="manual">Ручное</SelectItem>
                  <SelectItem value="on_request">По запросу</SelectItem>
                  <SelectItem value="whitelist_only">Только whitelist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditOffer;