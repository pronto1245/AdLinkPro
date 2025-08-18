import React from 'react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Users, Building2, TrendingUp, DollarSign, Shield, Settings, Activity } from 'lucide-react';
import DynamicContentManager from '@/components/dynamic/DynamicContentManager';
import RoleBasedNavigation, { RoleBasedQuickActions } from '@/components/navigation/RoleBasedNavigation';

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
    <div className="flex min-h-screen bg-background">
      {/* Role-based Navigation */}
      <div className="flex-shrink-0">
        <RoleBasedNavigation userRole="super_admin" />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Actions - takes 1 column */}
          <div className="lg:col-span-1">
            <RoleBasedQuickActions userRole="super_admin" />
          </div>

          {/* Dynamic Content Manager - takes 3 columns */}
          <div className="lg:col-span-3">
            <DynamicContentManager userRole="super_admin" showAdvancedFeatures={true} />
          </div>
        </div>

        {/* System Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Системный статус</h3>
            <div className="flex items-center space-x-1">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Все системы работают</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">99.9%</p>
              <p className="text-sm text-muted-foreground">Доступность системы</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">245ms</p>
              <p className="text-sm text-muted-foreground">Среднее время ответа</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">1.2M</p>
              <p className="text-sm text-muted-foreground">Запросов сегодня</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}