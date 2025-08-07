import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';

interface OfferEditModalProps {
  offer: any;
  onClose: () => void;
  onSave: (offer: any) => void;
}

const OfferEditModal: React.FC<OfferEditModalProps> = ({ offer, onClose, onSave }) => {
  const { toast } = useToast();
  
  // Основная информация об оффере
  const [name, setName] = useState(offer.name || '');
  const [description, setDescription] = useState(offer.description || '');
  const [url, setUrl] = useState(offer.url || '');
  const [previewUrl, setPreviewUrl] = useState(offer.previewUrl || '');
  const [category, setCategory] = useState(offer.category || '');
  const [vertical, setVertical] = useState(offer.vertical || '');
  const [status, setStatus] = useState(offer.status || 'active');
  
  // Выплаты
  const [payoutType, setPayoutType] = useState(offer.payoutType || 'cpa');
  const [payout, setPayout] = useState(offer.payout || '');
  const [currency, setCurrency] = useState(offer.currency || 'USD');
  const [cap, setCap] = useState(offer.cap || '');
  const [hold, setHold] = useState(offer.hold || '');
  
  // Гео и таргетинг
  const [countries, setCountries] = useState(offer.countries?.join(', ') || '');
  const [languages, setLanguages] = useState(offer.languages?.join(', ') || '');
  const [devices, setDevices] = useState(offer.devices?.join(', ') || 'desktop,mobile');
  const [os, setOs] = useState(offer.os?.join(', ') || '');
  
  // Антифрод
  const [antifraudMethods, setAntifraudMethods] = useState(offer.antifraudMethods || []);
  const [allowedApplications, setAllowedApplications] = useState(offer.allowedApplications || []);
  
  // A/B тестирование
  const [abtestLinks, setAbtestLinks] = useState(offer.abtestLinks || ['']);
  
  // Настройки партнеров
  const [partnerApprovalType, setPartnerApprovalType] = useState(offer.partnerApprovalType || 'manual');
  const [partners, setPartners] = useState(offer.partners || []);
  
  // Дополнительные настройки
  const [isPrivate, setIsPrivate] = useState(offer.isPrivate || false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [tags, setTags] = useState(offer.tags?.join(', ') || '');

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите название оффера",
        variant: "destructive"
      });
      return;
    }

    if (!url.trim()) {
      toast({
        title: "Ошибка", 
        description: "Укажите URL оффера",
        variant: "destructive"
      });
      return;
    }

    const updatedOffer = {
      ...offer,
      name,
      description,
      url,
      previewUrl,
      category,
      vertical,
      status,
      payoutType,
      payout: parseFloat(payout) || 0,
      currency,
      cap: parseInt(cap) || 0,
      hold: parseInt(hold) || 0,
      countries: countries.split(',').map(c => c.trim()).filter(c => c),
      languages: languages.split(',').map(l => l.trim()).filter(l => l),
      devices: devices.split(',').map(d => d.trim()).filter(d => d),
      os: os.split(',').map(o => o.trim()).filter(o => o),
      antifraudMethods,
      allowedApplications,
      abtestLinks: abtestLinks.filter(link => link.trim()),
      partnerApprovalType,
      partners,
      isPrivate,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      isTemplate: saveAsTemplate,
    };

    onSave(updatedOffer);
    onClose();
  };

  const handleAddLink = () => setAbtestLinks([...abtestLinks, '']);
  
  const handleChangeLink = (index: number, value: string) => {
    const copy = [...abtestLinks];
    copy[index] = value;
    setAbtestLinks(copy);
  };
  
  const handleRemoveLink = (index: number) => {
    const copy = [...abtestLinks];
    copy.splice(index, 1);
    setAbtestLinks(copy);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{offer.id ? 'Редактировать оффер' : 'Создать оффер'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Основное</TabsTrigger>
            <TabsTrigger value="payout">Выплаты</TabsTrigger>
            <TabsTrigger value="targeting">Таргетинг</TabsTrigger>
            <TabsTrigger value="antifraud">Антифрод</TabsTrigger>
            <TabsTrigger value="advanced">Дополнительно</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название оффера *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите название оффера"
                  data-testid="input-offer-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активный</SelectItem>
                    <SelectItem value="paused">Приостановлен</SelectItem>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="archived">Архив</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание оффера..."
                rows={3}
                data-testid="textarea-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL оффера *</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/offer"
                  data-testid="input-url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previewUrl">URL предпросмотра</Label>
                <Input
                  id="previewUrl"
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  placeholder="https://example.com/preview"
                  data-testid="input-preview-url"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casino">Казино</SelectItem>
                    <SelectItem value="betting">Ставки</SelectItem>
                    <SelectItem value="finance">Финансы</SelectItem>
                    <SelectItem value="crypto">Криптовалюты</SelectItem>
                    <SelectItem value="dating">Знакомства</SelectItem>
                    <SelectItem value="gaming">Игры</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="health">Здоровье</SelectItem>
                    <SelectItem value="education">Образование</SelectItem>
                    <SelectItem value="travel">Путешествия</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vertical">Вертикаль</Label>
                <Input
                  id="vertical"
                  value={vertical}
                  onChange={(e) => setVertical(e.target.value)}
                  placeholder="Gambling, Finance, Dating..."
                  data-testid="input-vertical"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payout" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payoutType">Тип выплаты</Label>
                <Select value={payoutType} onValueChange={setPayoutType}>
                  <SelectTrigger data-testid="select-payout-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpa">CPA</SelectItem>
                    <SelectItem value="cpl">CPL</SelectItem>
                    <SelectItem value="cpc">CPC</SelectItem>
                    <SelectItem value="cpm">CPM</SelectItem>
                    <SelectItem value="revshare">RevShare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payout">Размер выплаты</Label>
                <Input
                  id="payout"
                  type="number"
                  step="0.01"
                  value={payout}
                  onChange={(e) => setPayout(e.target.value)}
                  placeholder="0.00"
                  data-testid="input-payout"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Валюта</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger data-testid="select-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="RUB">RUB</SelectItem>
                    <SelectItem value="UAH">UAH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cap">CAP (лимит конверсий)</Label>
                <Input
                  id="cap"
                  type="number"
                  value={cap}
                  onChange={(e) => setCap(e.target.value)}
                  placeholder="0 = без лимита"
                  data-testid="input-cap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hold">Холд (дни)</Label>
                <Input
                  id="hold"
                  type="number"
                  value={hold}
                  onChange={(e) => setHold(e.target.value)}
                  placeholder="0"
                  data-testid="input-hold"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="targeting" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="countries">Страны (через запятую)</Label>
              <Input
                id="countries"
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                placeholder="US, CA, GB, DE..."
                data-testid="input-countries"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Языки (через запятую)</Label>
              <Input
                id="languages"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="en, de, fr, es..."
                data-testid="input-languages"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="devices">Устройства</Label>
                <Input
                  id="devices"
                  value={devices}
                  onChange={(e) => setDevices(e.target.value)}
                  placeholder="desktop, mobile, tablet"
                  data-testid="input-devices"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="os">Операционные системы</Label>
                <Input
                  id="os"
                  value={os}
                  onChange={(e) => setOs(e.target.value)}
                  placeholder="windows, macos, android, ios"
                  data-testid="input-os"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="antifraud" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Методы антифрода</h4>
              <div className="grid grid-cols-2 gap-4">
                {['IP Filtering', 'Device Fingerprinting', 'Behavioral Analysis', 'Geo Verification', 'Rate Limiting', 'Bot Detection'].map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={method}
                      checked={antifraudMethods.includes(method)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAntifraudMethods([...antifraudMethods, method]);
                        } else {
                          setAntifraudMethods(antifraudMethods.filter(m => m !== method));
                        }
                      }}
                      data-testid={`checkbox-antifraud-${method.toLowerCase().replace(' ', '-')}`}
                    />
                    <Label htmlFor={method}>{method}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Разрешенные источники трафика</h4>
              <div className="grid grid-cols-2 gap-4">
                {['Search', 'Social Media', 'Email', 'Display', 'Native', 'Push', 'Pop', 'SMS'].map((app) => (
                  <div key={app} className="flex items-center space-x-2">
                    <Checkbox
                      id={app}
                      checked={allowedApplications.includes(app)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAllowedApplications([...allowedApplications, app]);
                        } else {
                          setAllowedApplications(allowedApplications.filter(a => a !== app));
                        }
                      }}
                      data-testid={`checkbox-app-${app.toLowerCase()}`}
                    />
                    <Label htmlFor={app}>{app}</Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">A/B тестирование лендингов</h4>
              <div className="space-y-2">
                {abtestLinks.map((link: string, i: number) => (
                  <div key={`abtest-link-${i}`} className="flex gap-2">
                    <Input
                      className="flex-1"
                      value={link}
                      onChange={(e) => handleChangeLink(i, e.target.value)}
                      placeholder={`https://landing${i + 1}.example.com`}
                      data-testid={`input-abtest-link-${i}`}
                    />
                    {abtestLinks.length > 1 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveLink(i)}
                        data-testid={`button-remove-link-${i}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddLink}
                  data-testid="button-add-landing"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить лендинг
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerApprovalType">Тип подтверждения партнеров</Label>
              <Select value={partnerApprovalType} onValueChange={setPartnerApprovalType}>
                <SelectTrigger data-testid="select-partner-approval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Автоматическое</SelectItem>
                  <SelectItem value="manual">Ручное</SelectItem>
                  <SelectItem value="none">Без подтверждения</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Теги (через запятую)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="exclusive, premium, tier1"
                data-testid="input-tags"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPrivate"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                data-testid="switch-private"
              />
              <Label htmlFor="isPrivate">Приватный оффер</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={saveAsTemplate} 
                onCheckedChange={(checked) => setSaveAsTemplate(checked === true)}
                data-testid="checkbox-save-template"
              />
              <Label>Сохранить как шаблон</Label>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 gap-2 mt-6 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel"
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSave}
            data-testid="button-save"
          >
            {offer.id ? 'Сохранить изменения' : 'Создать оффер'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferEditModal;