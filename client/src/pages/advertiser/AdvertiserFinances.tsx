import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Clock,
  AlertCircle,
  FileText,
  Plus
} from 'lucide-react';

interface FinancialOverview {
  balance: number;
  totalSpent: number;
  totalDeposited: number;
  pendingPayouts: number;
  monthlySpending: number;
  weeklySpending: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'payout' | 'fee' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  createdAt: string;
  method?: string;
  reference?: string;
}

const PAYMENT_METHODS = [
  { value: 'usdt', label: 'USDT (Tether)', icon: '₮' },
  { value: 'btc', label: 'Bitcoin', icon: '₿' },
  { value: 'card', label: 'Банковская карта', icon: '💳' },
  { value: 'swift', label: 'SWIFT', icon: '🏦' },
  { value: 'sepa', label: 'SEPA', icon: '🇪🇺' },
  { value: 'payoneer', label: 'Payoneer', icon: '💰' }
];

export default function AdvertiserFinances() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  // Финансовый обзор
  const { data: financialOverview, isLoading: overviewLoading } = useQuery({
    queryKey: ['/api/advertiser/financial-overview'],
    enabled: !!user
  });

  // История транзакций
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/advertiser/transactions'],
    enabled: !!user
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
      case 'payout': return <ArrowDownCircle className="h-4 w-4 text-blue-600" />;
      case 'fee': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'refund': return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  if (overviewLoading) {
    return <div className="flex items-center justify-center h-64">Загрузка финансовых данных...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="page-title">Финансы</h1>
        <p className="text-muted-foreground">
          Управление балансом, депозитами и выплатами партнёрам
        </p>
      </div>

      {/* Финансовый обзор */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Баланс</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="balance-amount">
              ${financialOverview?.balance?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Доступно для выплат партнёрам
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего потрачено</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-spent">
              ${financialOverview?.totalSpent?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Выплаты партнёрам за всё время
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего депозитов</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-deposited">
              ${financialOverview?.totalDeposited?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Пополнения баланса
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ожидает выплаты</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="pending-payouts">
              ${financialOverview?.pendingPayouts?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Запросы на выплату в обработке
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Обзор</TabsTrigger>
          <TabsTrigger value="deposit" data-testid="tab-deposit">Пополнение</TabsTrigger>
          <TabsTrigger value="transactions" data-testid="tab-transactions">Транзакции</TabsTrigger>
          <TabsTrigger value="invoices" data-testid="tab-invoices">Инвойсы</TabsTrigger>
          <TabsTrigger value="budgets" data-testid="tab-budgets">Бюджеты</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Быстрые действия */}
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
                <CardDescription>
                  Основные финансовые операции
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" data-testid="button-add-funds">
                  <Plus className="h-4 w-4 mr-2" />
                  Пополнить баланс
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-view-payouts">
                  <ArrowDownCircle className="h-4 w-4 mr-2" />
                  Просмотреть выплаты партнёрам
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-create-invoice">
                  <FileText className="h-4 w-4 mr-2" />
                  Создать инвойс
                </Button>
              </CardContent>
            </Card>

            {/* Последние транзакции */}
            <Card>
              <CardHeader>
                <CardTitle>Последние транзакции</CardTitle>
                <CardDescription>
                  Недавние финансовые операции
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-4">Загрузка...</div>
                ) : transactions?.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction: Transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(transaction.type)}
                          <div>
                            <div className="font-medium text-sm">
                              {transaction.description}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </div>
                          <Badge 
                            className={`text-xs ${getStatusColor(transaction.status)}`}
                            data-testid={`status-${transaction.status}`}
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Транзакций пока нет
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deposit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Пополнение баланса</CardTitle>
              <CardDescription>
                Выберите сумму и способ пополнения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="depositAmount">Сумма пополнения</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      data-testid="input-deposit-amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Способ оплаты</Label>
                    <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue placeholder="Выберите способ оплаты" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map(method => (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center space-x-2">
                              <span>{method.icon}</span>
                              <span>{method.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full" 
                    disabled={!depositAmount || !selectedMethod}
                    data-testid="button-deposit"
                  >
                    Пополнить баланс
                  </Button>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Популярные суммы</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['100', '500', '1000', '5000'].map(amount => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setDepositAmount(amount)}
                        data-testid={`button-amount-${amount}`}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>История транзакций</CardTitle>
              <CardDescription>
                Все финансовые операции
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">Загрузка транзакций...</div>
              ) : transactions?.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction: Transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getTypeIcon(transaction.type)}
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleString()} • {transaction.method}
                          </div>
                          {transaction.reference && (
                            <div className="text-xs text-muted-foreground">
                              Ref: {transaction.reference}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-lg">
                          {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </div>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Транзакций пока нет
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Инвойсы</CardTitle>
              <CardDescription>
                Создание и управление инвойсами
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Инвойсов пока нет</h3>
                <p className="text-muted-foreground mb-4">
                  Создайте первый инвойс для запроса оплаты
                </p>
                <Button data-testid="button-create-first-invoice">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать инвойс
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Планирование бюджетов</CardTitle>
              <CardDescription>
                Установите лимиты и планы расходов на офферы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Бюджеты не настроены</h3>
                <p className="text-muted-foreground mb-4">
                  Настройте планируемые бюджеты для эффективного управления расходами
                </p>
                <Button data-testid="button-setup-budgets">
                  <Plus className="h-4 w-4 mr-2" />
                  Настроить бюджеты
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}