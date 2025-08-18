import React from 'react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Users, Building2, TrendingUp, DollarSign, Shield, Settings } from 'lucide-react';

export default function SuperAdminDashboard() {
  const { t } = useLanguage();

  const stats = [
    {
      title: 'Общих пользователей',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Активных рекламодателей',
      value: '148',
      change: '+5%',
      icon: Building2,
      color: 'text-green-600'
    },
    {
      title: 'Конверсий сегодня',
      value: '1,254',
      change: '+18%',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Доход платформы',
      value: '$45,678',
      change: '+22%',
      icon: DollarSign,
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Супер-админ панель</h1>
          <p className="text-muted-foreground mt-1">
            Полное управление платформой и мониторинг системы
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-red-500" />
          <span className="text-sm font-medium text-red-500">SUPER ADMIN</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Управление пользователями</h3>
          <p className="text-muted-foreground mb-4">
            Создание, редактирование и управление всеми пользователями системы
          </p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            Перейти к управлению
          </button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Системные настройки</h3>
          <p className="text-muted-foreground mb-4">
            Конфигурация платформы, безопасность и интеграции
          </p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
            Открыть настройки
          </button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Аналитика и отчеты</h3>
          <p className="text-muted-foreground mb-4">
            Детальная аналитика по всей платформе и пользователям
          </p>
          <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700">
            Смотреть отчеты
          </button>
        </Card>
      </div>
    </div>
  );
}