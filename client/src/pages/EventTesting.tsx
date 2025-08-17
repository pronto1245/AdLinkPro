import React from 'react';
import { useTranslation } from 'react-i18next';
import { EventSender } from '@/components/events/EventSender';
import { QuickEventButtons } from '@/components/events/QuickEventButtons';
import { EventHistory } from '@/components/events/EventHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Activity, TestTube, History } from 'lucide-react';

export function EventTesting() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-2">
        <TestTube className="h-6 w-6" />
        <h1 className="text-3xl font-bold">{t('eventTesting.title')}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Sender Form */}
        <div>
          <EventSender 
            defaultClickId="test_click_123"
            defaultTxId="tx_test_456"
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('eventTesting.quickActions')}
              </CardTitle>
              <CardDescription>
                {t('eventTesting.quickActionsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuickEventButtons clickid="test_click_123" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Инструкции</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <strong>Типы событий:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><code>reg</code> — регистрация пользователя</li>
                  <li><code>purchase</code> — покупка/депозит</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <strong>Антифрод уровни:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><code>ok</code> — чистый трафик, проходит везде</li>
                  <li><code>soft</code> — backup профиль блокирует approved</li>
                  <li><code>hard</code> — блокируются все профили</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <strong>Результат:</strong>
                <p className="mt-1">
                  После отправки события создается conversion и запускается 
                  система постбеков с применением антифрод политик.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event History */}
        <div>
          <EventHistory
            events={[
              {
                id: '1',
                type: 'reg',
                clickid: 'test_click_123',
                txid: 'tx_reg_001',
                status: 'initiated',
                antifraudLevel: 'ok',
                createdAt: new Date().toISOString()
              },
              {
                id: '2',
                type: 'purchase',
                clickid: 'test_click_456',
                txid: 'tx_purchase_001',
                value: 150,
                currency: 'USD',
                status: 'approved',
                antifraudLevel: 'soft',
                createdAt: new Date(Date.now() - 300000).toISOString()
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}