import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Target, Users, BarChart3, Settings } from "lucide-react";

export default function AdvertiserDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Панель рекламодателя</h1>
        <p className="text-muted-foreground">Добро пожаловать, {user?.firstName} {user?.lastName}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Мои офферы</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Активных офферов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Партнеры</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Подключенных партнеров
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конверсии</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              За текущий месяц
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Доход</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,280</div>
            <p className="text-xs text-muted-foreground">
              За текущий месяц
            </p>
          </CardContent>
        </Card>
      </div>

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
              <Link href="/admin/offers">
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
              <Link href="/admin/offers">
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
              <Link href="/admin/users">
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
              <Link href="/admin/analytics">
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