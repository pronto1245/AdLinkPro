import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";

export default function NotFound() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Страница не найдена</h1>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Путь:</strong> {location}</p>
            <p><strong>Пользователь:</strong> {user ? `${user.username} (${user.role})` : 'Не авторизован'}</p>
          </div>

          <div className="mt-6 space-y-2">
            {!user ? (
              <Link href="/login">
                <Button className="w-full">Войти в систему</Button>
              </Link>
            ) : (
              <div className="space-y-2">
                {user.role === 'super_admin' && (
                  <Link href="/admin">
                    <Button variant="outline" className="w-full">Админ панель</Button>
                  </Link>
                )}
                {user.role === 'advertiser' && (
                  <Link href="/advertiser">
                    <Button variant="outline" className="w-full">Панель рекламодателя</Button>
                  </Link>
                )}
                {user.role === 'affiliate' && (
                  <div className="space-y-2">
                    <Link href="/affiliate">
                      <Button variant="outline" className="w-full">Партнерская панель</Button>
                    </Link>
                    <Link href="/affiliate/offers">
                      <Button variant="outline" className="w-full">Партнерские ссылки</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
