import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Settings, Users, DollarSign, UserPlus, TrendingUp } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

interface ReferralStats {
  referrals: {
    total_referred: number;
    active_referrals: number;
    referred_users: Array<{
      id: string;
      username: string;
      email: string;
      status: string;
      registered_at: string;
      balance: string;
    }>;
  };
  earnings: {
    total_earned: string;
    pending_amount: string;
    total_transactions: string;
    commission_rate: string;
  };
}

interface DetailedReferralStats {
  invited_partners: Array<{
    id: string;
    username: string;
    email: string;
    status: string;
    total_spent: string;
    total_commission: string;
    registered_at: string;
    last_payout: string;
  }>;
  commission_history: Array<{
    id: string;
    advertiser_name: string;
    original_amount: string;
    commission_amount: string;
    commission_rate: string;
    status: string;
    created_at: string;
    paid_at: string;
  }>;
  summary: {
    total_commission_paid: string;
    pending_commission: string;
    total_partners_invited: number;
    active_partners: number;
    total_transactions: number;
    average_commission_per_transaction: string;
  };
}

export default function ReferralProgram() {
  const [isEnabled, setIsEnabled] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Запрос данных статистики
  const { data: referralStats, isLoading } = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/stats'],
    enabled: isEnabled
  });

  // Запрос детальной статистики
  const { data: detailedStats, isLoading: isLoadingDetailed } = useQuery<DetailedReferralStats>({
    queryKey: ['/api/advertiser/referral-statistics'],
    enabled: isEnabled
  });

  // Мутация для переключения программы
  const toggleProgramMutation = useMutation({
    mutationFn: (enabled: boolean) => 
      apiRequest('/api/advertiser/referral-program/toggle', 'POST', { enabled }),
    onSuccess: (data) => {
      setIsEnabled(data.enabled);
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/stats'] });
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
      {isEnabled && referralStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего рефералов</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {referralStats.referrals.total_referred}
              </div>
              <p className="text-xs text-muted-foreground">
                Активных: {referralStats.referrals.active_referrals}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Заработано комиссий</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${referralStats.earnings.total_earned}
              </div>
              <p className="text-xs text-muted-foreground">
                В ожидании: ${referralStats.earnings.pending_amount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего транзакций</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {referralStats.earnings.total_transactions}
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
                {referralStats.earnings.commission_rate}%
              </div>
              <p className="text-xs text-muted-foreground">
                С каждой выплаты
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Список рефералов */}
      {isEnabled && referralStats?.referrals.referred_users && referralStats.referrals.referred_users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Приглашенные пользователи</CardTitle>
            <CardDescription>Список всех рефералов в вашей программе</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralStats.referrals.referred_users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status === 'active' ? 'Активен' : 'Неактивен'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Баланс: ${user.balance}
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
        {(isLoadingDetailed || !detailedStats) ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Общая статистика */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего заработано</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${detailedStats.summary.total_commission_paid}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    От {detailedStats.summary.total_transactions} транзакций
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
                    ${detailedStats.summary.pending_commission}
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
                    {detailedStats.summary.total_partners_invited}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Активных: {detailedStats.summary.active_partners}
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
                    ${detailedStats.summary.average_commission_per_transaction}
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
                      <TableHead>Потрачено всего</TableHead>
                      <TableHead>Ваша комиссия</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedStats.invited_partners?.map((advertiser) => (
                      <TableRow key={advertiser.id}>
                        <TableCell className="font-medium">{advertiser.username}</TableCell>
                        <TableCell>{advertiser.email}</TableCell>
                        <TableCell>
                          <Badge variant={advertiser.status === 'active' ? 'default' : 'secondary'}>
                            {advertiser.status === 'active' ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </TableCell>
                        <TableCell>${advertiser.total_spent}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          ${advertiser.total_commission}
                        </TableCell>
                        <TableCell>
                          {new Date(advertiser.registered_at).toLocaleDateString('ru-RU')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* История комиссий */}
            <Card>
              <CardHeader>
                <CardTitle>История комиссий</CardTitle>
                <CardDescription>
                  Все транзакции с вашими комиссионными выплатами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Партнер</TableHead>
                      <TableHead>Сумма выплаты</TableHead>
                      <TableHead>Комиссия</TableHead>
                      <TableHead>Ставка</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedStats.commission_history?.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-medium">{commission.advertiser_name}</TableCell>
                        <TableCell>${commission.original_amount}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          ${commission.commission_amount}
                        </TableCell>
                        <TableCell>{(parseFloat(commission.commission_rate) * 100).toFixed(1)}%</TableCell>
                        <TableCell>
                          <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                            {commission.status === 'paid' ? 'Выплачено' : 'Ожидает'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(commission.created_at).toLocaleDateString('ru-RU')}
                        </TableCell>
                      </TableRow>
                    ))}
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