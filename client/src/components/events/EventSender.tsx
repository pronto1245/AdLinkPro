import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSendEvent, type SendEventPayload } from '@/hooks/useSendEvent';
import { Loader2, Send } from 'lucide-react';

interface EventSenderProps {
  defaultClickId?: string;
  defaultTxId?: string;
}

export function EventSender({ defaultClickId = '', defaultTxId = '' }: EventSenderProps) {
  const { sendEvent } = useSendEvent();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'reg' as 'reg' | 'purchase',
    clickid: defaultClickId,
    txid: defaultTxId,
    value: '',
    currency: 'USD',
    antifraudLevel: 'ok'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clickid || !formData.txid) {
      return;
    }

    setIsLoading(true);
    
    try {
      const payload: SendEventPayload = {
        type: formData.type,
        clickid: formData.clickid,
        txid: formData.txid,
        ...(formData.value && { value: Number(formData.value) }),
        currency: formData.currency,
        meta: {
          antifraudLevel: formData.antifraudLevel,
          source: 'frontend_form'
        }
      };

      await sendEvent(payload);
      
      // Reset form on success
      setFormData(prev => ({
        ...prev,
        txid: '',
        value: ''
      }));
      
    } catch (_error) {
      // Error is handled by useSendEvent hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Отправка события
        </CardTitle>
        <CardDescription>
          Создание conversion события для тестирования системы
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Тип события</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'reg' | 'purchase') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger data-testid="select-event-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reg">Регистрация</SelectItem>
                  <SelectItem value="purchase">Покупка</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="antifraud">Антифрод</Label>
              <Select
                value={formData.antifraudLevel}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, antifraudLevel: value }))
                }
              >
                <SelectTrigger data-testid="select-antifraud-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ok">Чистый</SelectItem>
                  <SelectItem value="soft">Soft</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clickid">Click ID</Label>
            <Input
              id="clickid"
              value={formData.clickid}
              onChange={(e) => setFormData(prev => ({ ...prev, clickid: e.target.value }))}
              placeholder="click_123_test"
              required
              data-testid="input-clickid"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="txid">Transaction ID</Label>
            <Input
              id="txid"
              value={formData.txid}
              onChange={(e) => setFormData(prev => ({ ...prev, txid: e.target.value }))}
              placeholder="tx_456_test"
              required
              data-testid="input-txid"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Сумма</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="100.00"
                data-testid="input-value"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Валюта</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="RUB">RUB</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !formData.clickid || !formData.txid}
            data-testid="button-send-event"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Отправить событие
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}