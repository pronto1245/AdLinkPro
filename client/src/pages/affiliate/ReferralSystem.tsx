import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, Copy, DollarSign, UserPlus, TrendingUp, 
  Clock, CheckCircle, Share2, Target, Award 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { Link } from 'wouter';

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

const ReferralSystem: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Получаем статистику рефералов партнера
  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ['/api/partner/referral-stats'],
    enabled: !!user && user.role === 'affiliate'
  });

  const copyReferralLink = async () => {
    if (stats?.referral_code) {
      const referralLink = `${window.location.origin}/register?ref=${stats.referral_code}`;
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Проверяем, включена ли реферальная программа
  if (stats && stats.program_enabled === false) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Реферальная программа
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Реферальная программа временно недоступна
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <UserPlus className="h-5 w-5" />
              Программа отключена
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Реферальная программа недоступна
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Рекламодатель временно отключил реферальную программу. 
                Обратитесь к менеджеру для получения дополнительной информации.
              </p>
            </div>
          </CardContent>
        </Card>
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
        <Link href="/affiliate/referral-details">
          <Button variant="outline" data-testid="button-referral-details">
            <TrendingUp className="h-4 w-4 mr-2" />
            Детальная статистика
          </Button>
        </Link>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Приглашено</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.total_referrals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Активных: {stats?.active_referrals || 0}
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
              ${stats?.total_earned || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Комиссия: 5%
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
              ${stats?.pending_amount || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Ожидает
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
              {stats?.total_transactions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Всего начислений
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Реферальная ссылка */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Ваша реферальная ссылка
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input 
              value={`${window.location.origin}/register?ref=${stats?.referral_code || 'LOADING'}`}
              readOnly 
              className="bg-gray-50 dark:bg-gray-800"
            />
            <Button
              onClick={copyReferralLink}
              variant={copied ? "default" : "outline"}
              size="sm"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Скопировано
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Копировать
                </>
              )}
            </Button>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Ваш код:</strong> {stats?.referral_code || 'Загружается...'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Детальная информация */}
      <Tabs defaultValue="advertisers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="advertisers" className="gap-2">
            <Target className="h-4 w-4" />
            Приглашенные рекламодатели
          </TabsTrigger>
          <TabsTrigger value="earnings" className="gap-2">
            <Award className="h-4 w-4" />
            История комиссий
          </TabsTrigger>
          <TabsTrigger value="how-it-works" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Как это работает
          </TabsTrigger>
        </TabsList>

        <TabsContent value="advertisers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Приглашенные рекламодатели</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.referred_advertisers && stats.referred_advertisers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Рекламодатель</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                      <TableHead>Выплачено комиссий</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.referred_advertisers?.map((advertiser) => (
                      <TableRow key={advertiser.id}>
                        <TableCell className="font-medium">{advertiser.username}</TableCell>
                        <TableCell>{advertiser.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={advertiser.isActive ? "default" : "secondary"}
                          >
                            {advertiser.isActive ? "Активен" : "Неактивен"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(advertiser.createdAt).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">
                            ${advertiser.totalCommissions || '0.00'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Пока нет приглашенных рекламодателей</p>
                  <p className="text-sm">Поделитесь своей реферальной ссылкой</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История комиссий</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>История комиссий будет появляться здесь</p>
                <p className="text-sm">Когда приглашенные рекламодатели начнут делать выплаты</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="how-it-works" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Как работает реферальная программа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Схема работы
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Вы приглашаете рекламодателя по своей ссылке</li>
                    <li>• Рекламодатель регистрируется и создает офферы</li>
                    <li>• Когда он делает выплаты партнерам</li>
                    <li>• Вы получаете 5% комиссии с каждой выплаты</li>
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
              
              <div className="border-t pt-4">
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
      </Tabs>
    </div>
  );
};

export default ReferralSystem;