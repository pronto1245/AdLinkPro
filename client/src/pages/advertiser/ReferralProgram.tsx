import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useToast } from '../../hooks/use-toast';
import { Settings, Users, DollarSign, UserPlus, TrendingUp } from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';
import { Link } from 'wouter';

interface AdvertiserReferralStats {
  referredPartners: Array<{
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    referralCode?: string;
    createdAt: string;
    referrerInfo?: {
      id: string;
      username: string;
      email: string;
    } | null;
  }>;
  commissionStats: {
    totalCommissions: string;
    totalTransactions: number;
    paidCommissions: string;
    pendingCommissions: string;
  };
  commissionHistory: Array<{
    id: string;
    amount: string;
    rate: string;
    originalAmount: string;
    status: string;
    createdAt: string;
    paidAt?: string;
    referrer: {
      id: string;
      username: string;
      email: string;
    };
    referredUser: {
      id: string;
      username: string;
      email: string;
    };
  }>;
  programEnabled: boolean;
}

export default function ReferralProgram() {
  const [isEnabled, setIsEnabled] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Запрос статистики реферальной программы для рекламодателя
  const { data: referralStats, isLoading } = useQuery<AdvertiserReferralStats>({
    queryKey: ['/api/advertiser/referral-stats'],
  });

  // Синхронизируем локальное состояние с данными сервера
  React.useEffect(() => {
    if (referralStats?.programEnabled !== undefined) {
      setIsEnabled(referralStats.programEnabled);
    }
  }, [referralStats?.programEnabled]);

  // Мутация для переключения программы
  const toggleProgramMutation = useMutation({
    mutationFn: (enabled: boolean) => 
      apiRequest('/api/advertiser/referral-program/toggle', 'POST', { enabled }),
    onSuccess: (data) => {
      setIsEnabled(data.enabled);
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/referral-stats'] });
      toast({
        title: data.enabled ? 'Программа включена' : 'Программа отключена',
        description: data.enabled 
          ? 'Партнеры теперь могут приглашать новых партнеров' 
          : 'Реферальная программа временно приостановлена'
      });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус программы',
        variant: 'destructive'
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Реферальная программа
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Управление реферальной программой для партнеров
          </p>
        </div>
      </div>

      <Tabs defaultValue="program" className="space-y-6">
        <TabsList>
          <TabsTrigger value="program">Настройки программы</TabsTrigger>
          <TabsTrigger value="statistics">Детальная статистика</TabsTrigger>
        </TabsList>

        <TabsContent value="program" className="space-y-6">

      {/* Настройки программы */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Настройки программы
          </CardTitle>
          <CardDescription>
            Включите или отключите реферальную программу для ваших партнеров
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="referral-program">Реферальная программа</Label>
              <p className="text-sm text-muted-foreground">
                Партнеры получают 5% комиссии с выплат приглашенным партнерам
              </p>
            </div>
            <Switch
              id="referral-program"
              checked={isEnabled}
              onCheckedChange={(checked) => toggleProgramMutation.mutate(checked)}
              disabled={toggleProgramMutation.isPending}
              data-testid="switch-referral-program"
            />
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground">
            {isEnabled 
              ? '✅ Программа активна — партнеры могут приглашать новых участников'
              : '⏸️ Программа приостановлена — новые приглашения недоступны'
            }
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      {referralStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего партнеров</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {referralStats.referredPartners.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Активных: {referralStats.referredPartners.filter(p => p.referrerInfo).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Выплачено комиссий</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${referralStats.commissionStats.paidCommissions}
              </div>
              <p className="text-xs text-muted-foreground">
                В ожидании: ${referralStats.commissionStats.pendingCommissions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего комиссий</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {referralStats.commissionStats.totalTransactions}
              </div>
              <p className="text-xs text-muted-foreground">
                За все время
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ставка комиссии</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                5%
              </div>
              <p className="text-xs text-muted-foreground">
                С каждой выплаты
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Список приглашенных партнеров */}
      {referralStats?.referredPartners && referralStats.referredPartners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Приглашенные партнеры</CardTitle>
            <CardDescription>Список всех партнеров, приглашенных в вашу программу</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralStats.referredPartners.map((partner) => (
                <div key={partner.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{partner.username}</p>
                    <p className="text-sm text-muted-foreground">{partner.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={partner.referrerInfo ? 'default' : 'secondary'}>
                      {partner.referrerInfo ? 'Приглашен партнером' : 'Прямая регистрация'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Код: {partner.referralCode || 'Нет'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Информационная карточка когда программа отключена */}
      {!isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Реферальная программа отключена</CardTitle>
            <CardDescription>
              Включите программу, чтобы партнеры могли приглашать новых партнеров и получать комиссию
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => toggleProgramMutation.mutate(true)}
              disabled={toggleProgramMutation.isPending}
              data-testid="button-enable-referral"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Включить реферальную программу
            </Button>
          </CardContent>
        </Card>
      )}
      </TabsContent>

      <TabsContent value="statistics" className="space-y-6">
        {!referralStats ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Общая статистика */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего выплачено</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${referralStats.commissionStats.paidCommissions}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    От {referralStats.commissionStats.totalTransactions} транзакций
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">К выплате</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    ${referralStats.commissionStats.pendingCommissions}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ожидает выплаты
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Приглашенных партнеров</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {referralStats.referredPartners.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Приглашенных: {referralStats.referredPartners.filter(p => p.referrerInfo).length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Средняя комиссия</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    ${referralStats.commissionStats.totalTransactions > 0 ? 
                      (parseFloat(referralStats.commissionStats.paidCommissions) / referralStats.commissionStats.totalTransactions).toFixed(2) : 
                      '0.00'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    За транзакцию
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Приглашенные партнеры */}
            <Card>
              <CardHeader>
                <CardTitle>Приглашенные партнеры</CardTitle>
                <CardDescription>
                  Список всех партнеров, которых вы пригласили в систему
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Партнер</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Реферальный код</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralStats.referredPartners?.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">{partner.username}</TableCell>
                        <TableCell>{partner.email}</TableCell>
                        <TableCell>
                          <Badge variant={partner.referrerInfo ? 'default' : 'secondary'}>
                            {partner.referrerInfo ? 'Приглашен' : 'Прямо'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          {partner.referralCode || 'Нет кода'}
                        </TableCell>
                        <TableCell>
                          {new Date(partner.createdAt).toLocaleDateString('ru-RU')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!referralStats.referredPartners || referralStats.referredPartners.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Пока нет приглашенных партнеров
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* История комиссий */}
            <Card>
              <CardHeader>
                <CardTitle>История комиссий</CardTitle>
                <CardDescription>
                  Все комиссионные выплаты от ваших приглашенных партнеров
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Партнер</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Исходная сумма</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralStats.commissionHistory?.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-medium">{commission.referrer.username || 'Неизвестно'}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          ${commission.amount}
                        </TableCell>
                        <TableCell>${commission.originalAmount}</TableCell>
                        <TableCell>
                          <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                            {commission.status === 'paid' ? 'Выплачено' : 'Ожидает'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(commission.createdAt).toLocaleDateString('ru-RU')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!referralStats.commissionHistory || referralStats.commissionHistory.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Пока нет комиссионных выплат
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </TabsContent>
      </Tabs>
    </div>
  );
}