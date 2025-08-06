import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/contexts/auth-context';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';
import { 
  Plus, 
  Save, 
  X,
  Globe,
  Smartphone,
  DollarSign
} from 'lucide-react';

interface ReceivedOffer {
  id: string;
  name: string;
  category: string;
  geo: string[];
  devices: string[];
  payoutType: 'cpa' | 'revshare' | 'cpl';
  supplierRate: string;
  partnerRate: string;
  targetUrl: string;
  postbackUrl: string;
  conditions: string;
  supplierSource: string;
  status: 'active' | 'paused' | 'draft';
  createdAt: string;
}

const categories = [
  'gambling', 'finance', 'dating', 'health', 'entertainment', 
  'e-commerce', 'education', 'travel', 'games', 'crypto'
];

const geoOptions = [
  'russia', 'ukraine', 'belarus', 'kazakhstan', 'usa', 'canada', 
  'germany', 'france', 'uk', 'brazil', 'india', 'china'
];

const deviceOptions = [
  'desktop', 'mobile', 'tablet', 'smart-tv', 'all'
];

const supplierSources = [
  'PropellerAds', 'RichAds', 'TacoLoco', 'AdCombo', 'Mobidea', 
  'CrakRevenue', 'ClickDealer', 'MaxBounty', 'Другой источник'
];

export default function ReceivedOffers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGeo, setSelectedGeo] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [customSupplierSource, setCustomSupplierSource] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    payoutType: 'cpa' as 'cpa' | 'revshare' | 'cpl',
    supplierRate: '',
    partnerRate: '',
    targetUrl: '',
    postbackUrl: '',
    conditions: '',
    supplierSource: ''
  });

  // Получение списка полученных офферов
  const { data: receivedOffers = [], isLoading } = useQuery({
    queryKey: ['/api/advertiser/received-offers'],
    enabled: !!user?.id
  });

  // Мутация для создания нового полученного оффера
  const createOfferMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/advertiser/received-offers', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          geo: selectedGeo,
          devices: selectedDevices,
          advertiserId: user?.id,
          status: 'active'
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/received-offers'] });
      toast({
        title: "Успешно",
        description: "Полученный оффер добавлен и активирован"
      });
      resetForm();
      setShowAddForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать оффер",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      payoutType: 'cpa',
      supplierRate: '',
      partnerRate: '',
      targetUrl: '',
      postbackUrl: '',
      conditions: '',
      supplierSource: ''
    });
    setSelectedGeo([]);
    setSelectedDevices([]);
    setCustomSupplierSource('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || selectedGeo.length === 0 || 
        selectedDevices.length === 0 || !formData.supplierRate || !formData.partnerRate ||
        !formData.targetUrl || !formData.postbackUrl) {
      toast({
        title: "Ошибка валидации",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    const supplierSource = formData.supplierSource === 'Другой источник' 
      ? customSupplierSource 
      : formData.supplierSource;

    createOfferMutation.mutate({
      ...formData,
      supplierSource
    });
  };

  const addGeo = (geo: string) => {
    if (!selectedGeo.includes(geo)) {
      setSelectedGeo([...selectedGeo, geo]);
    }
  };

  const removeGeo = (geo: string) => {
    setSelectedGeo(selectedGeo.filter(g => g !== geo));
  };

  const addDevice = (device: string) => {
    if (!selectedDevices.includes(device)) {
      setSelectedDevices([...selectedDevices, device]);
    }
  };

  const removeDevice = (device: string) => {
    setSelectedDevices(selectedDevices.filter(d => d !== device));
  };

  const getPayoutTypeColor = (type: string) => {
    switch(type) {
      case 'cpa': return 'bg-green-100 text-green-800 border-green-200';
      case 'cpl': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'revshare': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <RoleBasedLayout>
      <div className="space-y-6" data-testid="received-offers-page">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Полученные офферы
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Управление офферами от поставщиков
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          data-testid="button-add-received-offer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить оффер
        </Button>
      </div>

      {/* Форма добавления оффера */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Добавление оффера от поставщика</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Название оффера */}
                <div className="space-y-2">
                  <Label htmlFor="name">Название оффера *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Введите название оффера"
                    data-testid="input-offer-name"
                  />
                </div>

                {/* Категория */}
                <div className="space-y-2">
                  <Label htmlFor="category">Категория *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Тип выплаты */}
                <div className="space-y-2">
                  <Label htmlFor="payoutType">Тип выплаты *</Label>
                  <Select 
                    value={formData.payoutType} 
                    onValueChange={(value: 'cpa' | 'revshare' | 'cpl') => 
                      setFormData({...formData, payoutType: value})}
                  >
                    <SelectTrigger data-testid="select-payout-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpa">CPA</SelectItem>
                      <SelectItem value="cpl">CPL</SelectItem>
                      <SelectItem value="revshare">RevShare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Источник поставщика */}
                <div className="space-y-2">
                  <Label htmlFor="supplierSource">Источник поставщика</Label>
                  <Select 
                    value={formData.supplierSource} 
                    onValueChange={(value) => setFormData({...formData, supplierSource: value})}
                  >
                    <SelectTrigger data-testid="select-supplier-source">
                      <SelectValue placeholder="Выберите источник" />
                    </SelectTrigger>
                    <SelectContent>
                      {supplierSources.map(source => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.supplierSource === 'Другой источник' && (
                    <Input
                      value={customSupplierSource}
                      onChange={(e) => setCustomSupplierSource(e.target.value)}
                      placeholder="Введите название источника"
                      className="mt-2"
                      data-testid="input-custom-supplier"
                    />
                  )}
                </div>

                {/* Ставка поставщика */}
                <div className="space-y-2">
                  <Label htmlFor="supplierRate">Ставка поставщика (расход) *</Label>
                  <Input
                    id="supplierRate"
                    type="number"
                    step="0.01"
                    value={formData.supplierRate}
                    onChange={(e) => setFormData({...formData, supplierRate: e.target.value})}
                    placeholder="0.00"
                    data-testid="input-supplier-rate"
                  />
                </div>

                {/* Ставка для партнёров */}
                <div className="space-y-2">
                  <Label htmlFor="partnerRate">Ставка для партнёров (доход) *</Label>
                  <Input
                    id="partnerRate"
                    type="number"
                    step="0.01"
                    value={formData.partnerRate}
                    onChange={(e) => setFormData({...formData, partnerRate: e.target.value})}
                    placeholder="0.00"
                    data-testid="input-partner-rate"
                  />
                </div>

                {/* Целевая ссылка */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="targetUrl">Целевая ссылка от поставщика *</Label>
                  <Input
                    id="targetUrl"
                    type="url"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                    placeholder="https://example.com/offer"
                    data-testid="input-target-url"
                  />
                </div>

                {/* Постбек поставщика */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="postbackUrl">Постбек поставщика (куда отправлять действия) *</Label>
                  <Input
                    id="postbackUrl"
                    type="url"
                    value={formData.postbackUrl}
                    onChange={(e) => setFormData({...formData, postbackUrl: e.target.value})}
                    placeholder="https://example.com/postback"
                    data-testid="input-postback-url"
                  />
                </div>
              </div>

              {/* GEO */}
              <div className="space-y-3">
                <Label>GEO (геолокации) *</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedGeo.map(geo => (
                    <Badge key={geo} variant="secondary" className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {geo}
                      <button
                        type="button"
                        onClick={() => removeGeo(geo)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addGeo}>
                  <SelectTrigger data-testid="select-geo">
                    <SelectValue placeholder="Добавить геолокацию" />
                  </SelectTrigger>
                  <SelectContent>
                    {geoOptions.filter(geo => !selectedGeo.includes(geo)).map(geo => (
                      <SelectItem key={geo} value={geo}>{geo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Устройства */}
              <div className="space-y-3">
                <Label>Устройства *</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedDevices.map(device => (
                    <Badge key={device} variant="secondary" className="flex items-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      {device}
                      <button
                        type="button"
                        onClick={() => removeDevice(device)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addDevice}>
                  <SelectTrigger data-testid="select-devices">
                    <SelectValue placeholder="Добавить устройство" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceOptions.filter(device => !selectedDevices.includes(device)).map(device => (
                      <SelectItem key={device} value={device}>{device}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Условия/ограничения */}
              <div className="space-y-2">
                <Label htmlFor="conditions">Условия/ограничения</Label>
                <Textarea
                  id="conditions"
                  value={formData.conditions}
                  onChange={(e) => setFormData({...formData, conditions: e.target.value})}
                  placeholder="Описание условий работы с оффером, ограничений, требований к трафику..."
                  rows={4}
                  data-testid="textarea-conditions"
                />
              </div>

              {/* Кнопка сохранения */}
              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit"
                  disabled={createOfferMutation.isPending}
                  data-testid="button-save-activate"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createOfferMutation.isPending ? 'Сохранение...' : 'Сохранить и активировать'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Список полученных офферов */}
      <Card>
        <CardHeader>
          <CardTitle>Список полученных офферов ({receivedOffers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : receivedOffers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Пока нет полученных офферов</p>
              <p className="text-sm mt-2">Добавьте первый оффер от поставщика</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {receivedOffers.map((offer: ReceivedOffer) => (
                <div key={offer.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{offer.name}</h3>
                    <Badge 
                      variant={offer.status === 'active' ? 'default' : 'secondary'}
                    >
                      {offer.status === 'active' ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-500">Категория:</span>
                      <p className="font-medium">{offer.category}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-500">Тип выплаты:</span>
                      <Badge className={getPayoutTypeColor(offer.payoutType)}>
                        {offer.payoutType.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-500">Расход:</span>
                      <p className="font-medium text-red-600">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        {offer.supplierRate}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-500">Доход:</span>
                      <p className="font-medium text-green-600">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        {offer.partnerRate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {offer.geo.map(geo => (
                      <Badge key={geo} variant="outline" className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {geo}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {offer.devices.map(device => (
                      <Badge key={device} variant="outline" className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        {device}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </RoleBasedLayout>
  );
}