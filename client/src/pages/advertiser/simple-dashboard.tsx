import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Target, 
  Users, 
  BarChart3, 
  Settings, 
  DollarSign,
  TrendingUp,
  User,
  Briefcase,
  Wallet,
  Send,
  Building2,
  Bell,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function AdvertiserDashboard() {
  const { user } = useAuth();

  // Получаем данные дашборда
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/advertiser/dashboard'],
    enabled: !!user
  });

  // Получаем финансовые данные
  const { data: financialData } = useQuery({
    queryKey: ['/api/advertiser/financial-overview'],
    enabled: !!user
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Загрузка данных...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок и приветствие */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">
            Кабинет рекламодателя
          </h1>
          <p className="text-muted-foreground">
            Добро пожаловать, {user?.firstName} {user?.lastName}! 
            Управляйте офферами и партнёрами
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/advertiser/offers/new">
            <Button data-testid="button-create-offer">
              <Plus className="h-4 w-4 mr-2" />
              Создать оффер
            </Button>
          </Link>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Баланс</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="balance-amount">
              ${financialData?.balance?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Доступно для выплат
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Мои офферы</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="offers-count">
              {dashboardData?.offersCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.activeOffers || 0} активных
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Партнёры</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="partners-count">
              {dashboardData?.partnersCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.pendingApplications || 0} новых заявок
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выручка (месяц)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="monthly-revenue">
              ${dashboardData?.monthlyRevenue?.toFixed(2) || '0.00'}
            </div>
            <div className="flex items-center text-xs">
              {dashboardData?.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-600 mr-1 rotate-180" />
              )}
              <span className={dashboardData?.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(dashboardData?.revenueGrowth || 0).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия и навигация */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Управление офферами */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Управление офферами
            </CardTitle>
            <CardDescription>
              Создавайте и управляйте вашими офферами
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/advertiser/offers">
              <Button className="w-full justify-start" data-testid="button-my-offers">
                <Target className="mr-2 h-4 w-4" />
                Мои офферы
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/advertiser/offers/new">
              <Button variant="outline" className="w-full justify-start" data-testid="button-create-new-offer">
                <Plus className="mr-2 h-4 w-4" />
                Создать новый оффер
              </Button>
            </Link>
            <Link href="/advertiser/analytics">
              <Button variant="ghost" className="w-full justify-start" data-testid="button-offer-analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Аналитика офферов
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Работа с партнёрами */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Работа с партнёрами
            </CardTitle>
            <CardDescription>
              Управляйте партнёрами и заявками
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/advertiser/partners">
              <Button className="w-full justify-start" data-testid="button-partners">
                <Users className="mr-2 h-4 w-4" />
                Мои партнёры
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2 text-orange-600" />
                <span className="text-sm">Новые заявки</span>
              </div>
              <Badge variant="destructive">
                {dashboardData?.pendingApplications || 0}
              </Badge>
            </div>
            <Link href="/advertiser/postbacks">
              <Button variant="ghost" className="w-full justify-start" data-testid="button-postbacks">
                <Send className="mr-2 h-4 w-4" />
                Постбэки
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Финансы и профиль */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Бизнес и финансы
            </CardTitle>
            <CardDescription>
              Настройки бренда и финансовые операции
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/advertiser/finances">
              <Button className="w-full justify-start" data-testid="button-finances">
                <DollarSign className="mr-2 h-4 w-4" />
                Финансы
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/advertiser/profile">
              <Button variant="outline" className="w-full justify-start" data-testid="button-profile">
                <User className="mr-2 h-4 w-4" />
                Профиль и бренд
              </Button>
            </Link>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center">
                <Wallet className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm">Текущий баланс</span>
              </div>
              <span className="font-semibold text-green-600">
                ${financialData?.balance?.toFixed(2) || '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Статистика и последние действия */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Последние офферы */}
        <Card>
          <CardHeader>
            <CardTitle>Последние офферы</CardTitle>
            <CardDescription>
              Недавно созданные и обновлённые офферы
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentOffers?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentOffers.slice(0, 5).map((offer: any) => (
                  <div key={offer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{offer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {offer.category} • Выплата: {offer.payout}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={
                          offer.status === 'active' ? 'bg-green-100 text-green-800' :
                          offer.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {offer.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {offer.status === 'paused' && <Clock className="h-3 w-3 mr-1" />}
                        {offer.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Офферов пока нет</p>
                <Link href="/advertiser/offers/new">
                  <Button size="sm" className="mt-2">
                    Создать первый оффер
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Недавняя активность */}
        <Card>
          <CardHeader>
            <CardTitle>Недавняя активность</CardTitle>
            <CardDescription>
              Последние события в кабинете
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentActivity?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'offer_created' && <Plus className="h-4 w-4 text-green-600" />}
                      {activity.type === 'partner_joined' && <Users className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'conversion' && <TrendingUp className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-orange-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{activity.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Активности пока нет</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Управление офферами</CardTitle>
            <CardDescription>
              Создавайте и управляйте вашими офферами
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Создать новый оффер</h3>
                <p className="text-sm text-muted-foreground">
                  Добавьте новый оффер с автоматической генерацией партнерских ссылок
                </p>
              </div>
              <Link href="/advertiser/offers">
                <Button data-testid="button-create-offer">
                  Создать
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Управление офферами</h3>
                <p className="text-sm text-muted-foreground">
                  Редактируйте существующие офферы и настраивайте base_url
                </p>
              </div>
              <Link href="/advertiser/offers">
                <Button variant="outline" data-testid="button-manage-offers">
                  Управление
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Партнеры и аналитика</CardTitle>
            <CardDescription>
              Отслеживайте производительность ваших офферов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Управление партнерами</h3>
                <p className="text-sm text-muted-foreground">
                  Одобряйте партнеров для приватных офферов
                </p>
              </div>
              <Link href="/advertiser/users">
                <Button variant="outline" data-testid="button-manage-partners">
                  Партнеры
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Аналитика и статистика</h3>
                <p className="text-sm text-muted-foreground">
                  Просматривайте детальную статистику по кликам и конверсиям
                </p>
              </div>
              <Link href="/advertiser/analytics">
                <Button variant="outline" data-testid="button-view-analytics">
                  Аналитика
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}