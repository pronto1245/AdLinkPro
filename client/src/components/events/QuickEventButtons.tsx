import React, { useState } from 'react';
import { Button } from './ui/button';
import { useSendEvent } from '../../hooks/useSendEvent';
import { UserPlus, ShoppingCart, Loader2 } from 'lucide-react';

interface QuickEventButtonsProps {
  clickid: string;
  baseLabel?: string;
}

export function QuickEventButtons({ clickid, baseLabel = 'test' }: QuickEventButtonsProps) {
  const { sendEvent } = useSendEvent();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  };

  const handleRegEvent = async () => {
    const key = 'reg';
    setLoading(key, true);
    
    try {
      await sendEvent({
        type: 'reg',
        clickid,
        txid: `tx_reg_${Date.now()}`,
        meta: {
          source: 'quick_button',
          antifraudLevel: 'ok'
        }
      });
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(key, false);
    }
  };

  const handlePurchaseEvent = async () => {
    const key = 'purchase';
    setLoading(key, true);
    
    try {
      await sendEvent({
        type: 'purchase',
        clickid,
        txid: `tx_purchase_${Date.now()}`,
        value: Math.floor(Math.random() * 200) + 50, // Random value 50-250
        currency: 'USD',
        meta: {
          source: 'quick_button',
          antifraudLevel: 'ok'
        }
      });
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(key, false);
    }
  };

  const handleAntifraudTest = async (level: 'soft' | 'hard') => {
    const key = `af_${level}`;
    setLoading(key, true);
    
    try {
      await sendEvent({
        type: 'purchase',
        clickid,
        txid: `tx_af_${level}_${Date.now()}`,
        value: 150,
        currency: 'USD',
        meta: {
          source: 'antifraud_test',
          antifraudLevel: level
        }
      });
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(key, false);
    }
  };

  if (!clickid) {
    return (
      <div className="text-sm text-muted-foreground p-4 border rounded-lg">
        Укажите Click ID для быстрых действий
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">
        Быстрые события для: <code className="bg-muted px-1 rounded">{clickid}</code>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegEvent}
          disabled={loadingStates.reg}
          data-testid="button-quick-reg"
          title="Отправить событие регистрации"
        >
          {loadingStates.reg ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          <span className="ml-1">Регистрация</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePurchaseEvent}
          disabled={loadingStates.purchase}
          data-testid="button-quick-purchase"
          title="Отправить событие покупки"
        >
          {loadingStates.purchase ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          <span className="ml-1">Покупка</span>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleAntifraudTest('soft')}
          disabled={loadingStates.af_soft}
          data-testid="button-quick-soft-af"
          title="Тест soft антифрода"
        >
          {loadingStates.af_soft ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            '⚠️'
          )}
          <span className="ml-1">Soft AF</span>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleAntifraudTest('hard')}
          disabled={loadingStates.af_hard}
          data-testid="button-quick-hard-af"
          title="Тест hard антифрода"
        >
          {loadingStates.af_hard ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            '🚫'
          )}
          <span className="ml-1">Hard AF</span>
        </Button>
      </div>
    </div>
  );
}