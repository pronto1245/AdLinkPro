import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, BarChart3, DollarSign, Users } from "lucide-react";

export default function AffiliateDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Партнерская панель</h1>
        <p className="text-muted-foreground">Добро пожаловать, {user?.firstName} {user?.lastName}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Доступные офферы</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Офферы с партнерскими ссылками
            </p>
            <Link href="/affiliate/offers">
              <Button className="w-full mt-4" data-testid="button-view-offers">
                Просмотреть офферы
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Статистика</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Клики за месяц
            </p>
            <Button className="w-full mt-4" variant="outline" data-testid="button-view-stats">
              Посмотреть статистику
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заработок</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              За текущий месяц
            </p>
            <Button className="w-full mt-4" variant="outline" data-testid="button-view-payments">
              История выплат
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Быстрый старт</CardTitle>
          <CardDescription>
            Начните работу с партнерскими ссылками
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Автоматические партнерские ссылки</h3>
              <p className="text-sm text-muted-foreground">
                Получите уникальные ссылки для каждого оффера с автоматическим трекингом
              </p>
            </div>
            <Link href="/affiliate/offers">
              <Button data-testid="button-get-links">
                Получить ссылки
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Генератор кастомных ссылок</h3>
              <p className="text-sm text-muted-foreground">
                Создавайте ссылки с собственными SubID для отслеживания кампаний
              </p>
            </div>
            <Link href="/affiliate/offers">
              <Button variant="outline" data-testid="button-custom-generator">
                Создать ссылку
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}