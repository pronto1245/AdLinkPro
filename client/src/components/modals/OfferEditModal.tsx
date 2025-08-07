import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface OfferEditModalProps {
  offer: any;
  onClose: () => void;
  onSave: (offer: any) => void;
}

const OfferEditModal: React.FC<OfferEditModalProps> = ({ offer, onClose, onSave }) => {
  const { toast } = useToast();
  const [name, setName] = useState(offer.name || '');
  const [payout, setPayout] = useState(offer.payout || '');
  const [category, setCategory] = useState(offer.category || '');
  const [cap, setCap] = useState(offer.cap || '');
  const [hold, setHold] = useState(offer.hold || '');
  const [abtestLinks, setAbtestLinks] = useState(offer.abtestLinks || []);
  const [partners, setPartners] = useState(offer.partners || []);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите название",
        variant: "destructive"
      });
      return;
    }

    onSave({
      ...offer,
      name,
      payout,
      category,
      cap,
      hold,
      abtestLinks,
      partners,
      isTemplate: saveAsTemplate,
    });
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Редактировать оффер</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Название</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              data-testid="input-offer-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Payout</Label>
              <Input 
                value={payout} 
                onChange={(e) => setPayout(e.target.value)}
                data-testid="input-offer-payout"
              />
            </div>
            <div>
              <Label>Категория</Label>
              <Input 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                data-testid="input-offer-category"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CAP</Label>
              <Input 
                value={cap} 
                onChange={(e) => setCap(e.target.value)}
                data-testid="input-offer-cap"
              />
            </div>
            <div>
              <Label>Холд</Label>
              <Input 
                value={hold} 
                onChange={(e) => setHold(e.target.value)}
                data-testid="input-offer-hold"
              />
            </div>
          </div>

          <div>
            <Label>A/B лендинги</Label>
            <div className="space-y-2">
              {abtestLinks.map((link: string, i: number) => (
                <div key={`abtest-link-${i}`} className="flex gap-2">
                  <Input
                    className="flex-1"
                    value={link}
                    onChange={(e) => handleChangeLink(i, e.target.value)}
                    placeholder={`Лендинг ${i + 1}`}
                    data-testid={`input-abtest-link-${i}`}
                  />
                  <Button 
                    variant="ghost" 
                    onClick={() => handleRemoveLink(i)}
                    data-testid={`button-remove-link-${i}`}
                  >
                    Удалить
                  </Button>
                </div>
              ))}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAddLink}
                data-testid="button-add-landing"
              >
                Добавить лендинг
              </Button>
            </div>
          </div>

          <div>
            <Label>Назначить партнёров (ID через запятую)</Label>
            <Textarea
              rows={2}
              value={partners.join(',')}
              onChange={(e) => setPartners(e.target.value.split(',').map(v => v.trim()).filter(v => v))}
              placeholder="partner1, partner2, partner3"
              data-testid="textarea-partners"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox 
              checked={saveAsTemplate} 
              onCheckedChange={(checked) => setSaveAsTemplate(checked === true)}
              data-testid="checkbox-save-template"
            />
            <Label>Сохранить как шаблон</Label>
          </div>

          <div className="flex justify-end pt-4 gap-2">
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
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferEditModal;