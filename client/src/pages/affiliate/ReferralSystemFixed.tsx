import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
import { useAuth } from '@/contexts/auth-context';

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

const ReferralSystemFixed: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Получаем статистику рефералов партнера
  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ['/api/partner/referral-stats'],
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
    if (stats?.referral_code && typeof navigator !== 'undefined' && navigator.share) {
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

  // Проверяем, включена ли программа
  const isProgramEnabled = stats.program_enabled !== false;

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
        {!isProgramEnabled && (
          <Badge variant="destructive">
            Программа приостановлена
          </Badge>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Настройки</TabsTrigger>
          <TabsTrigger value="statistics">Статистика</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Статус программы */}
          {!isProgramEnabled && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
              <CardHeader>
                <CardTitle className="text-orange-800 dark:text-orange-200">
                  Программа временно приостановлена
                </CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  Ваш рекламодатель временно отключил реферальную программу. 
                  Новые приглашения недоступны до возобновления программы.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Реферальная ссылка - показываем только когда программа включена */}
          {isProgramEnabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Ваша реферальная ссылка
                </CardTitle>
                <CardDescription>
                  Поделитесь этой ссылкой с потенциальными рекламодателями
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/register?ref=${stats.referral_code}`}
                    readOnly
                    className="font-mono"
                    data-testid="input-referral-link"
                  />
                  <Button
                    onClick={copyReferralLink}
                    variant="outline"
                    size="icon"
                    title="Копировать ссылку"
                    data-testid="button-copy-link"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={shareReferralLink}
                    variant="outline"
                    size="icon"
                    title="Поделиться ссылкой"
                    data-testid="button-share-link"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="referral-code">Ваш реферальный код:</Label>
                  <Badge variant="secondary" className="font-mono">
                    {stats.referral_code}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Статистика */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Приглашено</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_referrals}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.active_referrals} активных
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Заработано</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.total_earned} USD
                </div>
                <p className="text-xs text-muted-foreground">
                  +{stats.pending_amount} USD ожидает
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
                  {stats.total_transactions}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Статус</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isProgramEnabled ? (
                    <Badge variant="default" className="text-xs">Активна</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Приостановлена</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          {/* Приглашенные рекламодатели */}
          <Card>
            <CardHeader>
              <CardTitle>Приглашенные рекламодатели</CardTitle>
              <CardDescription>
                Список всех рекламодателей, зарегистрированных по вашей ссылке
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.referred_advertisers && stats.referred_advertisers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Рекламодатель</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Заработано</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.referred_advertisers.map((advertiser) => (
                      <TableRow key={advertiser.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{advertiser.username}</div>
                            <div className="text-sm text-muted-foreground">{advertiser.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(advertiser.createdAt).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={advertiser.isActive ? "default" : "secondary"}>
                            {advertiser.isActive ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {advertiser.totalCommissions} USD
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Нет приглашенных рекламодателей
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Поделитесь своей реферальной ссылкой для привлечения рекламодателей
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* История комиссий */}
          <Card>
            <CardHeader>
              <CardTitle>История комиссий</CardTitle>
              <CardDescription>
                Детальная история всех полученных комиссий
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.commission_history && stats.commission_history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Рекламодатель</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.commission_history.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell>
                          {new Date(commission.createdAt).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell>
                          {commission.amount} USD
                        </TableCell>
                        <TableCell>
                          <Badge variant={commission.status === 'paid' ? "default" : "secondary"}>
                            {commission.status === 'paid' ? 'Выплачено' : 'Ожидает'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {commission.referredUser ? commission.referredUser.username : 'Н/Д'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Нет комиссий
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Комиссии появятся после выплат приглашенным партнерам
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferralSystemFixed;