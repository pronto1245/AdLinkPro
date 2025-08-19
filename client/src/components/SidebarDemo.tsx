import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { validateToken, getUserRoleFromToken } from '@/lib/menu';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function SidebarDemo() {
  const { user, token } = useAuth();
  const validation = validateToken(token);
  const roleFromToken = getUserRoleFromToken();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Демонстрация Universal Sidebar
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Тестирование левого меню для ролей Партнер и Рекламодатель
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Информация о пользователе</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Роль:</span>
              <Badge variant={user?.role === 'advertiser' ? 'default' : 'secondary'}>
                {user?.role || 'Не определена'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Роль из токена:</span>
              <Badge variant="outline">
                {roleFromToken || 'Не определена'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{user?.email || 'Не указан'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">ID:</span>
              <span>{user?.id || 'Не определен'}</span>
            </div>
          </div>
        </Card>

        {/* Token Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Информация о токене</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Статус:</span>
              <Badge variant={validation.valid ? 'default' : 'destructive'}>
                {validation.valid ? 'Действительный' : 'Недействительный'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Истек:</span>
              <Badge variant={validation.expired ? 'destructive' : 'default'}>
                {validation.expired ? 'Да' : 'Нет'}
              </Badge>
            </div>
            {validation.expiresAt && (
              <div className="flex justify-between">
                <span className="font-medium">Истекает:</span>
                <span className="text-sm">
                  {new Date(validation.expiresAt * 1000).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Токен присутствует:</span>
              <Badge variant={token ? 'default' : 'destructive'}>
                {token ? 'Да' : 'Нет'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Menu Features */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Функции меню</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Для роли Партнер/Affiliate:</h3>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Дашборд</li>
              <li>• Офферы и заявки доступа</li>
              <li>• Ссылки и креативы</li>
              <li>• Статистика (требует токен)</li>
              <li>• Постбэки и команда</li>
              <li>• Финансы (требует токен)</li>
              <li>• Профиль и безопасность</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Для роли Advertiser:</h3>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Дашборд</li>
              <li>• Мои офферы и партнеры</li>
              <li>• Заявки партнеров</li>
              <li>• Аналитика (требует токен)</li>
              <li>• Финансы (требует токен)</li>
              <li>• Антифрод (требует токен)</li>
              <li>• Уведомления и постбэки</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h2 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
          Инструкции по тестированию
        </h2>
        <div className="text-blue-800 dark:text-blue-200 space-y-2">
          <p>1. Проверьте навигацию по пунктам меню в левой панели</p>
          <p>2. Убедитесь, что пункты меню соответствуют вашей роли</p>
          <p>3. Протестируйте сворачивание/разворачивание меню</p>
          <p>4. На мобильных устройствах проверьте работу мобильного меню</p>
          <p>5. Проверьте функцию выхода из системы</p>
          <p>6. Убедитесь, что элементы, требующие токен, отображаются корректно</p>
        </div>
      </Card>
    </div>
  );
}