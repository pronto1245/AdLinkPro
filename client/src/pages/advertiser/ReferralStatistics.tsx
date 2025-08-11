import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  UserPlus,
  Calendar,
  Search,
  Download
} from 'lucide-react';

interface ReferredPartner {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  referralCode: string;
  createdAt: string;
  referrerInfo: {
    id: string;
    username: string;
    email: string;
  } | null;
}

interface CommissionHistory {
  id: string;
  amount: string;
  rate: string;
  originalAmount: string;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt: string | null;
  referrer: {
    id: string;
    username: string;
    email: string;
  };
  referredUser: {
    id: string;
    username: string;
    email: string;
  };
}

interface ReferralStatsData {
  referredPartners: ReferredPartner[];
  commissionStats: {
    totalCommissions: string;
    totalTransactions: number;
    paidCommissions: string;
    pendingCommissions: string;
  };
  commissionHistory: CommissionHistory[];
}

export default function ReferralStatistics() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');

  const { data: referralStats, isLoading, error } = useQuery<ReferralStatsData>({
    queryKey: ['/api/advertiser/referral-stats']
  });

  const { data: programStatus } = useQuery<{enabled: boolean}>({
    queryKey: ['/api/advertiser/referral-program/status']
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !referralStats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Ошибка загрузки статистики реферальной программы
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredHistory = referralStats.commissionHistory.filter(commission => {
    const matchesSearch = commission.referrer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.referredUser.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Выплачено</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Ожидает</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Отменено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Статистика реферальной программы</h1>
          <p className="text-muted-foreground">
            Детальная статистика по приглашенным партнерам и комиссиям
          </p>
        </div>
        {programStatus && (
          <Badge variant={programStatus.enabled ? "default" : "secondary"}>
            {programStatus.enabled ? "Программа активна" : "Программа отключена"}
          </Badge>
        )}
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Приглашенные партнеры</p>
                <p className="text-2xl font-bold">{referralStats.referredPartners.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Общие комиссии</p>
                <p className="text-2xl font-bold">${referralStats.commissionStats.totalCommissions}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Выплаченные комиссии</p>
                <p className="text-2xl font-bold">${referralStats.commissionStats.paidCommissions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ожидающие комиссии</p>
                <p className="text-2xl font-bold">${referralStats.commissionStats.pendingCommissions}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="partners" className="w-full">
        <TabsList>
          <TabsTrigger value="partners">Приглашенные партнеры</TabsTrigger>
          <TabsTrigger value="commissions">История комиссий</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Приглашенные партнеры ({referralStats.referredPartners.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {referralStats.referredPartners.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Пока нет приглашенных партнеров</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {referralStats.referredPartners.map((partner) => (
                    <div key={partner.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {partner.firstName} {partner.lastName} (@{partner.username})
                            </h3>
                            <p className="text-sm text-muted-foreground">{partner.email}</p>
                            {partner.referrerInfo && (
                              <p className="text-xs text-blue-600">
                                Приглашен: @{partner.referrerInfo.username}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            Код: {partner.referralCode}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Регистрация: {new Date(partner.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>История комиссий ({referralStats.commissionHistory.length})</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Поиск по пользователям..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="all">Все статусы</option>
                    <option value="pending">Ожидающие</option>
                    <option value="paid">Выплаченные</option>
                    <option value="cancelled">Отмененные</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>История комиссий пуста</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHistory.map((commission) => (
                    <div key={commission.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-4">
                            <div className="bg-green-100 p-2 rounded-full">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                Комиссия ${commission.amount} ({commission.rate}%)
                              </p>
                              <p className="text-sm text-muted-foreground">
                                От выплаты ${commission.originalAmount} партнеру @{commission.referredUser.username}
                              </p>
                              <p className="text-xs text-blue-600">
                                Реферер: @{commission.referrer.username}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          {getStatusBadge(commission.status)}
                          <p className="text-xs text-muted-foreground">
                            Создано: {new Date(commission.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                          {commission.paidAt && (
                            <p className="text-xs text-green-600">
                              Выплачено: {new Date(commission.paidAt).toLocaleDateString('ru-RU')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}