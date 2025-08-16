import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { 
  Copy, 
  Share2, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Award, 
  Link as LinkIcon, 
  Target, 
  Clock,
  CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/auth-context';

interface ReferralStats {
  referral_code: string;
  total_referrals: number;
  active_referrals: number;
  total_earned: string;
  pending_amount: string;
  total_transactions: number;
  referred_advertisers: any[];
  commission_history: any[];
  program_enabled?: boolean;
}

interface DetailedReferralData {
  referralCode: string;
  referredUsers: Array<{
    id: string;
    username: string;
    email: string;
    status: string;
    total_spent: string;
    total_commission: string;
    registered_at: string;
    last_payout: string;
  }>;
  commissionHistory: Array<{
    id: string;
    advertiser_name: string;
    original_amount: string;
    commission_amount: string;
    commission_rate: string;
    status: string;
    created_at: string;
    paid_at: string;
  }>;
  stats: {
    totalReferrals: number;
    activeReferrals: number;
    totalEarned: string;
    totalTransactions: number;
    paidAmount: string;
    pendingAmount: string;
  };
}

const ReferralSystem: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Получаем статистику рефералов партнера
  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ['/api/partner/referral-stats'],
    enabled: !!user && user.role === 'affiliate'
  });

  // Получаем общую статистику рефералов с историей комиссий
  const { data: generalStats } = useQuery({
    queryKey: ['/api/referrals/stats'],
    enabled: !!user && user.role === 'affiliate'
  });

  const copyReferralLink = () => {
    if (stats?.referral_code) {
      const link = `${window.location.origin}/register?ref=${stats.referral_code}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: "Ссылка скопирована!",
        description: "Реферальная ссылка скопирована в буфер обмена",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferralLink = () => {
    if (stats?.referral_code && navigator.share) {
      const link = `${window.location.origin}/register?ref=${stats.referral_code}`;
      navigator.share({
        title: 'Приглашаю стать рекламодателем',
        text: 'Регистрируйтесь по моей ссылке и получите отличные условия для рекламы!',
        url: link
      });
    }
  };

  // Показываем загрузку
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Если нет данных
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Users className="h-12 w-12 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Реферальная программа недоступна
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Обратитесь к администратору для активации реферальной программы
        </p>
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
            Приглашайте рекламодателей и получайте 5% с их выплат партнерам
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="details">Детальная статистика</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Основная статистика */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Заработано</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${stats.total_earned}</div>
                <p className="text-xs text-muted-foreground">
                  Общий доход от рефералов
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">К выплате</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">${stats.pending_amount}</div>
                <p className="text-xs text-muted-foreground">
                  Ожидает выплаты
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Рефералов</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.total_referrals}</div>
                <p className="text-xs text-muted-foreground">
                  Активных: {stats.active_referrals}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Транзакций</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.total_transactions}</div>
                <p className="text-xs text-muted-foreground">
                  С комиссионными
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Реферальная ссылка */}
          <Card>
            <CardHeader>
              <CardTitle>Ваша реферальная ссылка</CardTitle>
              <CardDescription>
                Отправляйте эту ссылку рекламодателям для получения 5% комиссии
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input 
                  readOnly 
                  value={`${window.location.origin}/register?ref=${stats.referral_code}`}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={copyReferralLink}
                  variant="outline"
                  size="icon"
                  data-testid="button-copy-referral-link"
                  title="Копировать ссылку"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <Button
                    onClick={shareReferralLink}
                    variant="outline"
                    size="icon"
                    data-testid="button-share-referral-link"
                    title="Поделиться"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      Ваш реферальный код: {stats.referral_code}
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                      Рекламодатели, зарегистрировавшиеся по этому коду, станут вашими рефералами
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Последние рефералы */}
          {stats.referred_advertisers && stats.referred_advertisers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Последние рефералы</CardTitle>
                <CardDescription>
                  Недавно приглашенные рекламодатели
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.referred_advertisers.slice(0, 5).map((referral: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{referral.username || referral.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(referral.registered_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={referral.status === 'active' ? 'default' : 'secondary'}>
                        {referral.status === 'active' ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Информация о программе */}
          <Card>
            <CardHeader>
              <CardTitle>Как работает программа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-green-500" />
                    Приглашение
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Отправляйте ссылку рекламодателям</li>
                    <li>• Они регистрируются по вашему коду</li>
                    <li>• Становятся вашими рефералами навсегда</li>
                    <li>• Начинают использовать платформу</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-500" />
                    Условия
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Комиссия: 5% с выплат рекламодателя</li>
                    <li>• Начисление: автоматическое</li>
                    <li>• Источник: бюджет рекламодателя</li>
                    <li>• Срок действия: пожизненно</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-6">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    💡 Пример расчета
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Приглашенный рекламодатель выплачивает партнеру $1000. 
                    Партнер получает $1000, а вы получаете $50 комиссии (5%). 
                    Рекламодатель доплачивает эти $50 из своего бюджета.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {!generalStats ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Детальная статистика */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${generalStats.earnings?.total_earned || '0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      От {generalStats.earnings?.total_transactions || 0} транзакций
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">К выплате</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      ${generalStats.earnings?.pending_amount || '0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ожидает выплаты
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Приглашенных пользователей</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {generalStats.referrals?.total_referred || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Активных: {generalStats.referrals?.active_referrals || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Средняя комиссия</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      ${generalStats.earnings?.total_transactions > 0 ? (parseFloat(generalStats.earnings.total_earned) / generalStats.earnings.total_transactions).toFixed(2) : '0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      За транзакцию
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Приглашенные пользователи */}
              <Card>
                <CardHeader>
                  <CardTitle>Приглашенные пользователи</CardTitle>
                  <CardDescription>
                    Подробная информация о всех пользователях, которых вы пригласили
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Пользователь</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Роль</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Дата регистрации</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generalStats.referrals?.referred_users?.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user.userType || user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status === 'active' ? 'Активен' : 'Неактивен'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.registered_at).toLocaleDateString('ru-RU')}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!generalStats.referrals?.referred_users || generalStats.referrals.referred_users.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            Пока нет приглашенных пользователей
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
                  <CardTitle>История комиссионных выплат</CardTitle>
                  <CardDescription>
                    Полная история всех комиссионных выплат
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Пользователь</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Дата создания</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generalStats.commission_history?.map((commission: any) => (
                        <TableRow key={commission.id}>
                          <TableCell className="font-medium">
                            {commission.referredUser?.username || 'Неизвестно'}
                          </TableCell>
                          <TableCell className="text-green-600 font-semibold">
                            ${commission.amount}
                          </TableCell>
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
                      {(!generalStats.commission_history || generalStats.commission_history.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
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
};

export default ReferralSystem;