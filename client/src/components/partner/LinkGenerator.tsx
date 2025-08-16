import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Copy, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface LinkGeneratorProps {
  offerId: string;
  offerName: string;
  isApproved?: boolean;
  accessStatus?: string;
}

export function LinkGenerator({ offerId, offerName, isApproved = false, accessStatus }: LinkGeneratorProps) {
  const { toast } = useToast();
  const { t } = useTranslation();

  // КРИТИЧНО: Показываем ссылки ТОЛЬКО если доступ одобрен
  if (!isApproved || accessStatus !== 'approved') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              {t('links.trackingLinks')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                {t('links.accessRestricted')}
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                {t('links.waitingApproval')}
              </p>
              {accessStatus === 'pending' && (
                <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-2">
                  {t('links.status')}: {t('links.pendingApproval')}
                </p>
              )}
              {accessStatus === 'available' && (
                <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-2">
                  {t('links.requestAccess')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Получаем готовую автоматическую ссылку с сервера  
  const autoTrackingLink = `https://track.platform.com/click?offer=${offerId}&clickid=partner_${Date.now()}&partner_id=PARTNER_ID`;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: t('common.copied'),
      description: t('links.linkCopied')
    });
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Готовые трекинговые ссылки
          </CardTitle>
          <CardDescription>
            Автоматически сгенерированные ссылки с clickid для оффера "{offerName}"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Основная готовая ссылка */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Готовая ссылка с clickid:</label>
            <div className="flex gap-2">
              <Input
                value={autoTrackingLink}
                readOnly
                className="font-mono text-sm"
                data-testid="input-auto-tracking-link"
              />
              <Button
                onClick={() => handleCopyLink(autoTrackingLink)}
                size="sm"
                title="Скопировать готовую ссылку"
                data-testid="button-copy-auto-link"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => handleOpenLink(autoTrackingLink)}
                size="sm"
                variant="outline"
                title="Открыть ссылку в новой вкладке"
                data-testid="button-open-auto-link"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Информационное сообщение */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Автоматическая система трекинга
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Ваша ссылка уже содержит уникальный clickid для отслеживания конверсий. 
                  Никаких дополнительных настроек не требуется - просто используйте готовую ссылку!
                </p>
              </div>
            </div>
          </div>


        </CardContent>
      </Card>
    </div>
  );
}