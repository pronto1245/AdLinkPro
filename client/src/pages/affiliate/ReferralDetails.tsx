import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Copy,
  ExternalLink,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReferredUser {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  company: string;
  createdAt: string;
  lastLoginAt: string;
  isActive: boolean;
  status: string;
}

interface CommissionEntry {
  id: string;
  amount: string;
  rate: string;
  originalAmount: string;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt: string | null;
  transactionId: string | null;
  referredUser: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

interface ReferralDetailsData {
  referralCode: string;
  referredUsers: ReferredUser[];
  commissionHistory: CommissionEntry[];
  stats: {
    totalReferrals: number;
    activeReferrals: number;
    totalEarned: string;
    totalTransactions: number;
    paidAmount: string;
    pendingAmount: string;
  };
}

export default function ReferralDetails() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'advertiser' | 'affiliate'>('all');
  const { toast } = useToast();

  const { data: referralDetails, isLoading, error } = useQuery<ReferralDetailsData>({
    queryKey: ['/api/partner/referral-details']
  });

  const copyReferralLink = () => {
    if (referralDetails?.referralCode) {
      const referralUrl = `${window.location.origin}/register?ref=${referralDetails.referralCode}`;
      navigator.clipboard.writeText(referralUrl);
      toast({
        title: "Ссылка скопирована",
        description: "Реферальная ссылка скопирована в буфер обмена",
      });
    }
  };

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

  if (error || !referralDetails) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Ошибка загрузки данных реферальной программы
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredHistory = referralDetails.commissionHistory.filter(commission => {
    const matchesSearch = commission.referredUser.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.referredUser.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = referralDetails.referredUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'advertiser':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Рекламодатель</Badge>;
      case 'affiliate':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Партнер</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Детальная статистика рефералов</h1>
          <p className="text-muted-foreground">
            Все приглашенные пользователи и заработанные комиссии
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Input 
            value={`${window.location.origin}/register?ref=${referralDetails.referralCode}`}
            readOnly 
            className="w-64 text-sm"
          />
          <Button onClick={copyReferralLink} size="sm">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Всего рефералов</p>
                <p className="text-xl font-bold">{referralDetails.stats.totalReferrals}</p>
              </div>
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Активные</p>
                <p className="text-xl font-bold">{referralDetails.stats.activeReferrals}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Всего заработано</p>
                <p className="text-xl font-bold">${referralDetails.stats.totalEarned}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Выплачено</p>
                <p className="text-xl font-bold">${referralDetails.stats.paidAmount}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Ожидает</p>
                <p className="text-xl font-bold">${referralDetails.stats.pendingAmount}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Транзакций</p>
                <p className="text-xl font-bold">{referralDetails.stats.totalTransactions}</p>
              </div>
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Приглашенные пользователи</TabsTrigger>
          <TabsTrigger value="commissions">История комиссий</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Приглашенные пользователи ({filteredUsers.length})</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Поиск пользователей..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="all">Все роли</option>
                    <option value="advertiser">Рекламодатели</option>
                    <option value="affiliate">Партнеры</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Нет приглашенных пользователей</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${user.role === 'advertiser' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            {user.role === 'advertiser' ? 
                              <Building className="h-5 w-5 text-blue-600" /> : 
                              <Users className="h-5 w-5 text-green-600" />
                            }
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {user.firstName} {user.lastName} (@{user.username})
                            </h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.company && (
                              <p className="text-xs text-blue-600">{user.company}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          {getRoleBadge(user.role)}
                          <div className="flex items-center space-x-2">
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Активен" : "Неактивен"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                          {user.lastLoginAt && (
                            <p className="text-xs text-green-600">
                              Последний вход: {new Date(user.lastLoginAt).toLocaleDateString('ru-RU')}
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

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>История комиссий ({filteredHistory.length})</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Поиск комиссий..."
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
                                От выплаты ${commission.originalAmount} → @{commission.referredUser.username}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                {getRoleBadge(commission.referredUser.role)}
                                {commission.transactionId && (
                                  <Badge variant="outline" className="text-xs">
                                    Транзакция: {commission.transactionId.slice(0, 8)}...
                                  </Badge>
                                )}
                              </div>
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