import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Settings, Users, DollarSign, UserPlus, TrendingUp } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ReferralStats {
  referrals: {
    total_referred: number;
    active_partners: number;
    total_commissions_paid: number;
    commission_rate: number;
  };
  recent_referrals: Array<{
    id: string;
    referrer_name: string;
    referred_name: string;
    date: string;
    status: string;
  }>;
  commission_summary: {
    this_month: number;
    last_month: number;
    total_paid: number;
  };
}

export function ReferralProgram() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEnabled, setIsEnabled] = useState(true);

  // Получаем текущие настройки реферальной программы
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Получаем статистику реферальной программы
  const { data: referralStats, isLoading: statsLoading } = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/stats'],
    enabled: !!user,
  });

  // Мутация для изменения статуса реферальной программы
  const toggleProgramMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return apiRequest('/api/advertiser/referral-program/toggle', {
        method: 'POST',
        body: JSON.stringify({ enabled }),
      });
    },
    onSuccess: (data, enabled) => {
      toast({
        title: enabled ? 'Реферальная программа включена' : 'Реферальная программа отключена',
        description: enabled 
          ? 'Партнеры теперь могут видеть и использовать реферальные ссылки'
          : 'Реферальные ссылки скрыты от партнеров',
      });
      setIsEnabled(enabled);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/stats'] });
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить настройки реферальной программы',
        variant: 'destructive',
      });
    },
  });

  React.useEffect(() => {
    if (user?.referralProgramEnabled !== undefined) {
      setIsEnabled(user.referralProgramEnabled);
    }
  }, [user]);

  if (userLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Реферальная программа</h1>
          <p className="text-muted-foreground">
            Управляйте настройками реферальной программы и отслеживайте статистику
          </p>
        </div>
        <Badge variant={isEnabled ? 'default' : 'secondary'}>
          {isEnabled ? 'Активна' : 'Отключена'}
        </Badge>
      </div>

      {/* Основные настройки */}
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
                {isEnabled 
                  ? 'Партнеры могут приглашать других партнеров и получать комиссию 5%'
                  : 'Реферальные ссылки скрыты от партнеров'
                }
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

          {isEnabled && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Как работает система:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Партнеры получают уникальные реферальные коды</li>
                <li>• При регистрации по реферальной ссылке устанавливается связь</li>
                <li>• При выплате партнеру автоматически начисляется 5% реферальной комиссии</li>
                <li>• Дополнительная комиссия списывается с вашего баланса</li>
              </ul>
            </div>
          )}
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
              <div className="text-2xl font-bold">{referralStats.referrals.total_referred}</div>
              <p className="text-xs text-muted-foreground">
                Активных: {referralStats.referrals.active_partners}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Комиссия этот месяц</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${referralStats.commission_summary.this_month.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Прошлый месяц: ${referralStats.commission_summary.last_month.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего выплачено</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${referralStats.commission_summary.total_paid.toFixed(2)}
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
                {referralStats.referrals.commission_rate}%
              </div>
              <p className="text-xs text-muted-foreground">
                С каждой выплаты
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Последние рефералы */}
      {isEnabled && referralStats?.recent_referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Недавние рефералы</CardTitle>
            <CardDescription>Последние приглашения партнеров</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralStats.recent_referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{referral.referred_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Приглашен: {referral.referrer_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={referral.status === 'active' ? 'default' : 'secondary'}>
                      {referral.status === 'active' ? 'Активен' : 'Неактивен'}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(referral.date).toLocaleDateString('ru-RU')}
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
    </div>
  );
}