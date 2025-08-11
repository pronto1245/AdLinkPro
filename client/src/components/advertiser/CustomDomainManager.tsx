import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Globe, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Info,
  Shield,
  Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CustomDomain {
  id: string;
  domain: string;
  status: 'pending' | 'verifying' | 'verified' | 'failed' | 'error' | 'expired';
  type: 'a_record' | 'cname';
  verificationValue: string;
  targetValue?: string;
  sslStatus?: 'none' | 'pending' | 'issued' | 'expired' | 'failed';
  sslCertificate?: string;
  sslPrivateKey?: string;
  sslValidUntil?: string;
  sslIssuer?: string;
  sslErrorMessage?: string;
  isActive?: boolean;
  lastChecked?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  verifiedAt?: string | null;
  advertiserId?: string;
  dnsInstructions?: {
    type: string;
    host: string;
    value: string;
  };
}

interface DNSInstructions {
  type: string;
  record: string;
  value: string;
  instructions: string;
}

export function CustomDomainManager() {
  const [newDomain, setNewDomain] = useState('');
  const [domainType, setDomainType] = useState<'cname' | 'a_record' | 'txt_record'>('cname');
  const [selectedDomain, setSelectedDomain] = useState<CustomDomain | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Получаем список доменов
  const { data: domains = [], isLoading } = useQuery({
    queryKey: ['/api/advertiser/profile/domains'],
    staleTime: 30000
  });

  // Добавление домена
  const addDomainMutation = useMutation({
    mutationFn: async (data: { domain: string; type: 'cname' | 'a_record' | 'txt_record' }) => {
      return apiRequest('/api/advertiser/profile/domains', 'POST', data);
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Домен успешно добавлен",
        description: `Домен ${data.domain} добавлен и ожидает верификации. Перейдите к инструкциям DNS для настройки.`
      });
      setNewDomain('');
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/profile/domains'] });
    },
    onError: (error: any) => {
      // Тихо обрабатываем ошибки добавления домена
      toast({
        title: "❌ Ошибка добавления домена",
        description: error?.message || "Не удалось добавить домен. Проверьте правильность ввода и попробуйте снова.",
        variant: "destructive"
      });
    }
  });

  // Верификация домена
  const verifyDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      return apiRequest(`/api/advertiser/profile/domains/${domainId}/verify`, 'POST');
    },
    onSuccess: (data: any, domainId: string) => {
      if (data.success) {
        toast({
          title: "Домен верифицирован",
          description: "Ваш кастомный домен успешно верифицирован и активирован!"
        });
      } else {
        toast({
          title: "Верификация не пройдена",
          description: data.error || "Проверьте DNS настройки и повторите попытку",
          variant: "destructive"
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/profile/domains'] });
    },
    onError: () => {
      toast({
        title: "Ошибка верификации",
        description: "Произошла ошибка при проверке домена",
        variant: "destructive"
      });
    }
  });

  // Выдача SSL сертификата
  const issueSSLMutation = useMutation({
    mutationFn: async (domainId: string) => {
      return apiRequest(`/api/advertiser/profile/domains/${domainId}/ssl`, 'POST');
    },
    onSuccess: (data: any) => {
      toast({
        title: "SSL сертификат выдается",
        description: data.message || "SSL сертификат выдается. Проверьте статус через несколько минут."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/profile/domains'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка выдачи SSL",
        description: error?.error || "Не удалось запустить выдачу SSL сертификата",
        variant: "destructive"
      });
    }
  });

  // Удаление домена
  const deleteDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      return apiRequest(`/api/advertiser/profile/domains/${domainId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Домен удален",
        description: "Кастомный домен успешно удален"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/profile/domains'] });
    }
  });

  // Получение инструкций - убираем, так как инструкции уже есть в компоненте
  // const { data: instructions } = useQuery({
  //   queryKey: ['/api/advertiser/domains', selectedDomain?.id, 'instructions'],
  //   enabled: !!selectedDomain,
  //   queryFn: () => 
  //     apiRequest(`/api/advertiser/domains/${selectedDomain?.id}/instructions`)
  // });

  const handleAddDomain = () => {
    if (!newDomain.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите доменное имя",
        variant: "destructive"
      });
      return;
    }

    // Простая валидация домена
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(newDomain.trim())) {
      toast({
        title: "Ошибка",
        description: "Введите корректное доменное имя",
        variant: "destructive"
      });
      return;
    }

    addDomainMutation.mutate({
      domain: newDomain.trim(),
      type: domainType
    });
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "Значение скопировано в буфер обмена"
    });
  };

  const getStatusIcon = (status: CustomDomain['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'verifying':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: CustomDomain['status']) => {
    const configs = {
      verified: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Активен' },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Ожидание' },
      verifying: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'Проверяется' },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Ошибка' },
      error: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'Ошибка' },
      expired: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', text: 'Истек' }
    };
    const config = configs[status] || configs.error; // Fallback to error if status not found
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Кастомные домены
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Кастомные домены
          </CardTitle>
          <CardDescription>
            Используйте свои домены для трекинговых ссылок. Это повышает доверие пользователей и обеспечивает белый лейбл.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Форма добавления домена */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="md:col-span-2">
              <Label htmlFor="domain">Доменное имя</Label>
              <Input
                id="domain"
                placeholder="track.example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                data-testid="input-new-domain"
              />
            </div>
            <div>
              <Label htmlFor="domain-type">Тип записи</Label>
              <Select value={domainType} onValueChange={(value: 'cname' | 'a_record' | 'txt_record') => setDomainType(value)}>
                <SelectTrigger data-testid="select-domain-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cname">CNAME (рекомендуется)</SelectItem>
                  <SelectItem value="a_record">A запись</SelectItem>
                  <SelectItem value="txt_record">TXT запись</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddDomain}
                disabled={addDomainMutation.isPending}
                data-testid="button-add-domain"
                className="w-full"
              >
                {addDomainMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Добавляем...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Список доменов */}
          <div className="space-y-4">
            {!Array.isArray(domains) || domains.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>У вас пока нет кастомных доменов</p>
                <p className="text-sm">Добавьте домен выше, чтобы начать использовать белый лейбл</p>
              </div>
            ) : (
              (domains as CustomDomain[]).map((domain: CustomDomain) => (
                <Card key={domain.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(domain.status)}
                        <div>
                          <h3 className="font-semibold text-lg">{domain.domain}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Добавлен {new Date(domain.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(domain.status)}
                        {domain.sslStatus === 'issued' && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            <Shield className="h-3 w-3 mr-1" />
                            SSL активен
                          </Badge>
                        )}
                        {domain.sslStatus === 'pending' && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            <Clock className="h-3 w-3 mr-1" />
                            SSL выдается
                          </Badge>
                        )}
                        {domain.sslStatus === 'failed' && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            SSL ошибка
                          </Badge>
                        )}
                        {domain.status === 'verified' && (!domain.sslStatus || domain.sslStatus === 'none') && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <Zap className="h-3 w-3 mr-1" />
                            Готов к SSL
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex items-center gap-2 mb-4">
                      {domain.status !== 'verified' && (
                        <Button
                          size="sm"
                          onClick={() => verifyDomainMutation.mutate(domain.id)}
                          disabled={verifyDomainMutation.isPending}
                          data-testid={`button-verify-${domain.id}`}
                        >
                          {verifyDomainMutation.isPending ? (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              Проверяем...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Проверить домен
                            </>
                          )}
                        </Button>
                      )}

                      {domain.status === 'verified' && (!domain.sslStatus || domain.sslStatus === 'none' || domain.sslStatus === 'failed') && (
                        <Button
                          size="sm"
                          onClick={() => issueSSLMutation.mutate(domain.id)}
                          disabled={issueSSLMutation.isPending}
                          data-testid={`button-ssl-${domain.id}`}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {issueSSLMutation.isPending ? (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              Выдаем SSL...
                            </>
                          ) : (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Выдать SSL
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedDomain(domain)}>
                            <Info className="h-3 w-3 mr-1" />
                            Инструкции DNS
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>DNS инструкции для {domain.domain}</DialogTitle>
                            <DialogDescription>
                              Следуйте инструкциям ниже для настройки DNS записей
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                  <Label className="text-sm font-semibold">Тип записи</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                                      {domain.type === 'cname' ? 'CNAME' : 'TXT'}
                                    </code>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-semibold">Имя/Host</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm break-all">
                                      {domain.type === 'cname' 
                                        ? domain.domain.split('.')[0] 
                                        : domain.domain.includes('.') 
                                          ? domain.domain 
                                          : '@'
                                      }
                                    </code>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleCopyToClipboard(
                                        domain.type === 'cname' 
                                          ? domain.domain.split('.')[0] 
                                          : domain.domain.includes('.') 
                                            ? domain.domain 
                                            : '@'
                                      )}
                                      title="Скопировать хост"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-semibold">Значение</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm break-all">
                                      {domain.type === 'cname' 
                                        ? (domain.targetValue || 'affiliate-tracker.replit.app')
                                        : domain.verificationValue
                                      }
                                    </code>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleCopyToClipboard(
                                        domain.type === 'cname' 
                                          ? (domain.targetValue || 'affiliate-tracker.replit.app')
                                          : domain.verificationValue
                                      )}
                                      title="Скопировать значение"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <Alert>
                                  <Info className="h-4 w-4" />
                                  <AlertDescription>
                                    {domain.type === 'cname' 
                                      ? `Добавьте CNAME запись в DNS настройках вашего домена. Это позволит использовать ваш собственный домен для трекинговых ссылок с белым лейблом.`
                                      : `Добавьте TXT запись в DNS настройках вашего домена для верификации. После добавления записи нажмите "Проверить домен".`
                                    }
                                  </AlertDescription>
                                </Alert>

                                {/* Пример трекинговой ссылки */}
                                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                  <h5 className="font-medium mb-2 text-green-800 dark:text-green-200">
                                    После настройки ваши трекинговые ссылки будут выглядеть так:
                                  </h5>
                                  <code className="text-sm bg-white dark:bg-gray-800 px-3 py-2 rounded border block">
                                    https://{domain.domain}/click?offer=123&clickid=partner_abc123
                                  </code>
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                    Белый лейбл повышает доверие пользователей и улучшает конверсию!
                                  </p>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                  <h5 className="font-medium mb-2">Пошаговая инструкция:</h5>
                                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <li>Войдите в панель управления DNS вашего провайдера домена (GoDaddy, Namecheap, Cloudflare и т.д.)</li>
                                    <li>Найдите раздел "DNS Records", "DNS управление" или "Zone File"</li>
                                    <li>Добавьте новую {domain.type === 'cname' ? 'CNAME' : 'TXT'} запись:</li>
                                    <li className="ml-4">
                                      • Тип: <strong>{domain.type === 'cname' ? 'CNAME' : 'TXT'}</strong><br/>
                                      • Имя/Host: <strong>{domain.type === 'cname' 
                                        ? domain.domain.split('.')[0] 
                                        : domain.domain.includes('.') 
                                          ? domain.domain 
                                          : '@'
                                      }</strong><br/>
                                      • Значение: <strong>{domain.type === 'cname' 
                                        ? (domain.targetValue || 'affiliate-tracker.replit.app')
                                        : domain.verificationValue
                                      }</strong>
                                    </li>
                                    <li>Сохраните изменения (распространение DNS может занять 5-30 минут)</li>
                                    <li>Вернитесь сюда и нажмите "Проверить домен" для верификации</li>
                                  </ol>
                                </div>
                                
                                {domain.type === 'cname' && (
                                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                      <strong>Важно:</strong> CNAME запись должна указывать на {domain.targetValue || 'affiliate-tracker.replit.app'}, 
                                      а имя записи должно быть {domain.domain.split('.')[0]} (первая часть вашего домена)
                                    </p>
                                  </div>
                                )}
                                
                                {domain.type === 'a_record' && (
                                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                      <strong>Важно для корневого домена:</strong> Добавьте TXT запись для верификации. 
                                      Имя записи должно быть точно {domain.domain} (или @ для корневого домена), 
                                      значение: {domain.verificationValue}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Пример трекинговой ссылки */}
                            {domain.status === 'verified' && (
                              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Zap className="h-4 w-4" />
                                  Пример трекинговой ссылки
                                </h4>
                                <code className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm block">
                                  https://{domain.domain}/click?offer=123&clickid=partner_abc123
                                </code>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteDomainMutation.mutate(domain.id)}
                        disabled={deleteDomainMutation.isPending}
                        data-testid={`button-delete-${domain.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Ошибки */}
                    {domain.errorMessage && (
                      <Alert className="mt-4" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{domain.errorMessage}</AlertDescription>
                      </Alert>
                    )}

                    {/* SSL информация */}
                    {domain.sslStatus && domain.sslStatus !== 'none' && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          SSL Сертификат
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Статус:</span>
                            <span className="ml-2 font-medium">
                              {domain.sslStatus === 'issued' && '✅ Выдан'}
                              {domain.sslStatus === 'pending' && '⏳ Выдается'}
                              {domain.sslStatus === 'failed' && '❌ Ошибка'}
                              {domain.sslStatus === 'expired' && '⚠️ Истек'}
                            </span>
                          </div>
                          {domain.sslIssuer && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Центр:</span>
                              <span className="ml-2 font-medium">{domain.sslIssuer}</span>
                            </div>
                          )}
                          {domain.sslValidUntil && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Действует до:</span>
                              <span className="ml-2 font-medium">
                                {new Date(domain.sslValidUntil).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                          )}
                          {domain.sslErrorMessage && (
                            <div className="col-span-2">
                              <span className="text-red-600 dark:text-red-400">Ошибка:</span>
                              <span className="ml-2">{domain.sslErrorMessage}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Информация о последней проверке */}
                    {domain.lastChecked && (
                      <p className="text-xs text-gray-500 mt-2">
                        Последняя проверка: {new Date(domain.lastChecked).toLocaleString('ru-RU')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}