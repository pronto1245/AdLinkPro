import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Copy, 
  CheckCircle,
  UserCheck,
  Activity,
  Award,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    total_transactions: number;
    commission_rate: string;
  };
}

const ReferralStats = () => {
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/stats'],
    refetchInterval: 30000 // Обновляем каждые 30 секунд
  });

  const copyReferralLink = async () => {
    try {
      // Получаем реферальный код текущего пользователя
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const referralCode = user.referralCode;
      
      if (!referralCode) {
        toast({
          title: "Ошибка",
          description: "Реферальный код не найден",
          variant: "destructive"
        });
        return;
      }

      const referralUrl = `${window.location.origin}/register?ref=${referralCode}`;
      await navigator.clipboard.writeText(referralUrl);
      
      toast({
        title: "Ссылка скопирована!",
        description: "Реферальная ссылка скопирована в буфер обмена",
      });
    } catch (_error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать ссылку",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Реферальная программа</h1>
          <p className="text-muted-foreground">
            Приглашайте партнеров и получайте 5% с их доходов
          </p>
        </div>
        <Button onClick={copyReferralLink} className="gap-2">
          <Copy className="h-4 w-4" />
          Скопировать ссылку
        </Button>
      </div>

      {/* Статистика - карточки */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего рефералов</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.referrals.total_referred || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Активных: {stats?.referrals.active_referrals || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заработано всего</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats?.earnings.total_earned || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Комиссия: {stats?.earnings.commission_rate || '5'}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ожидает выплаты</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${stats?.earnings.pending_amount || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              К выплате
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Транзакций</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.earnings.total_transactions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Всего начислений
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Детальная информация */}
      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referrals" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Мои рефералы
          </TabsTrigger>
          <TabsTrigger value="earnings" className="gap-2">
            <Award className="h-4 w-4" />
            История начислений
          </TabsTrigger>
          <TabsTrigger value="program" className="gap-2">
            <Target className="h-4 w-4" />
            Условия программы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Приглашенные пользователи</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.referrals?.referred_users && stats.referrals.referred_users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Баланс</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.referrals?.referred_users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status === 'active' ? 'Активен' : user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${user.balance}</TableCell>
                        <TableCell>
                          {new Date(user.registered_at).toLocaleDateString('ru-RU')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>У вас пока нет рефералов</p>
                  <p className="text-sm">Поделитесь своей реферальной ссылкой с друзьями!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История реферальных начислений</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>История начислений будет появляться здесь</p>
                <p className="text-sm">Когда ваши рефералы получат выплаты, вы увидите комиссии</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="program" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Условия реферальной программы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Как это работает
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Партнер приглашает другого партнера к вам</li>
                    <li>• При выплате приглашенному партнеру</li>
                    <li>• Вы доплачиваете 5% комиссии рефереру</li>
                    <li>• Комиссия списывается с вашего бюджета</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-500" />
                    Условия для рекламодателя
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Комиссия: 5% сверх выплаты партнеру</li>
                    <li>• Только партнер → партнер</li>
                    <li>• Автоматическое списание</li>
                    <li>• Владелец не участвует в программе</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    💡 Совет
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Учитывайте дополнительные расходы на реферальные комиссии при планировании 
                    бюджета на выплаты партнерам. За каждые $100 выплаты приглашенному партнеру 
                    вы доплачиваете $5 рефереру.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferralStats;