import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, offersApi, usersApi } from '@/lib/api-services';
import { useNotifications } from '@/components/NotificationToast';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Activity,
  RefreshCw,
  Eye,
  MousePointer,
  ExternalLink,
  Plus,
  BarChart3,
  UserCheck
} from 'lucide-react';

export default function AdvertiserDashboard() {
  const { user } = useAuth();
  const { showNotification } = useNotifications();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError, refetch } = useQuery({
    queryKey: ['dashboard-stats', 'advertiser'],
    queryFn: dashboardApi.getDashboardStats,
  });

  // Fetch user's offers
  const { data: offersData, isLoading: offersLoading } = useQuery({
    queryKey: ['offers', 'advertiser', 'mine'],
    queryFn: () => offersApi.getOffers({ limit: 5 }),
  });

  // Fetch partners
  const { data: partnersData, isLoading: partnersLoading } = useQuery({
    queryKey: ['users', 'partners'],
    queryFn: () => usersApi.getUsers({ role: 'partner', limit: 5 }),
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      showNotification({
        type: 'success',
        title: 'Обновлено',
        message: 'Данные дашборда обновлены',
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось обновить данные',
      });
    }
  };

  if (statsError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Ошибка загрузки дашборда</p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Попробовать снова
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Добро пожаловать, {user?.name || user?.email}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Панель рекламодателя
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button size="sm" asChild>
            <a href="/dashboard/advertiser/offers">
              <Plus className="h-4 w-4 mr-2" />
              Создать оффер
            </a>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `$${stats?.totalRevenue || 0}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.revenueChange && (
                <>
                  {stats.revenueChange > 0 ? '+' : ''}{stats.revenueChange}% с прошлого месяца
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Мои офферы</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalOffers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Активных: {stats?.activeOffers || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Клики</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalClicks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.clicksChange && (
                <>
                  {stats.clicksChange > 0 ? '+' : ''}{stats.clicksChange}% с прошлого месяца
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конверсии</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalConversions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              CR: {stats?.conversionRate || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Offers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Мои офферы</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/advertiser/offers">
                Все офферы <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            {offersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : offersData?.data?.length ? (
              <div className="space-y-4">
                {offersData.data.slice(0, 5).map((offer: any) => (
                  <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">{offer.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Выплата: ${offer.payout} | CR: {offer.conversionRate}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                        {offer.status === 'active' ? 'Активный' : 'Неактивный'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Подробнее
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  У вас пока нет офферов
                </p>
                <Button variant="outline" asChild>
                  <a href="/dashboard/advertiser/offers">
                    <Plus className="h-4 w-4 mr-2" />
                    Создать первый оффер
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Partners */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Активные партнеры</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/advertiser/partners">
                Все партнеры <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            {partnersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : partnersData?.data?.length ? (
              <div className="space-y-4">
                {partnersData.data.slice(0, 5).map((partner: any) => (
                  <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {partner.name ? partner.name.charAt(0).toUpperCase() : partner.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium">{partner.name || 'Не указано'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {partner.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                      <UserCheck className="h-3 w-3 mr-1" />
                      {partner.status === 'active' ? 'Активный' : 'Неактивный'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Нет активных партнеров
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Недавняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statsLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </>
              ) : stats?.recentActivity?.length ? (
                stats.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Activity className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Нет недавней активности
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/dashboard/advertiser/offers">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать оффер
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/dashboard/advertiser/partners">
                  <Users className="h-4 w-4 mr-2" />
                  Управление партнерами
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/dashboard/advertiser/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Отчеты и аналитика
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/dashboard/advertiser/profile">
                  <Users className="h-4 w-4 mr-2" />
                  Профиль
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}