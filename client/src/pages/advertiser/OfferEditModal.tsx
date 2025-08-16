import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';

interface OfferEditModalProps {
  offer: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const OfferEditModal: React.FC<OfferEditModalProps> = ({ offer, onClose, onSave }) => {
  const [formData, setFormData] = useState(offer || {});
  
  useEffect(() => {
    setFormData(offer || {});
  }, [offer]);

  const handleSave = () => {
    onSave(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (!offer) return null;

  const isNew = !offer.id;

  return (
    <Dialog open={!!offer} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Создать оффер' : 'Редактировать оффер'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Название</label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Введите название оффера"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Категория</label>
              <Select value={formData.category || ''} onValueChange={(value) => updateField('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gambling">Gambling</SelectItem>
                  <SelectItem value="dating">Dating</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="betting">Betting</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="e-commerce">E-commerce</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="vpn">VPN</SelectItem>
                  <SelectItem value="antivirus">Antivirus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Описание</label>
            <Textarea 
              value={formData.description?.ru || ''} 
              onChange={(e) => updateField('description', { ru: e.target.value, en: formData.description?.en || '' })}
              placeholder="Описание оффера на русском языке"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Выплата</label>
              <Input 
                type="number"
                value={formData.payout || ''} 
                onChange={(e) => updateField('payout', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Валюта</label>
              <Select value={formData.currency || 'USD'} onValueChange={(value) => updateField('currency', value)}>
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
              <label className="text-sm font-medium">Тип выплаты</label>
              <Select value={formData.payoutType || 'cpa'} onValueChange={(value) => updateField('payoutType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpa">CPA</SelectItem>
                  <SelectItem value="cpl">CPL</SelectItem>
                  <SelectItem value="cpi">CPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Лендинг URL</label>
            <Input 
              value={formData.landingPages?.[0]?.url || ''} 
              onChange={(e) => {
                const landingPages = formData.landingPages || [{ id: '1', name: 'Основная', isDefault: true }];
                landingPages[0] = { ...landingPages[0], url: e.target.value };
                updateField('landingPages', landingPages);
              }}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Статус</label>
            <Select value={formData.status || 'active'} onValueChange={(value) => updateField('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активный</SelectItem>
                <SelectItem value="paused">Приостановлен</SelectItem>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="archived">Архивирован</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            {isNew ? 'Создать' : 'Сохранить'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferEditModal;