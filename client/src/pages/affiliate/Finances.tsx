import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  CreditCard,
  Download,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import { apiRequest } from '@/lib/queryClient';

export default function Finances() {
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('');
  const [withdrawalDetails, setWithdrawalDetails] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Реальные данные финансов
  const { data: financeData, isLoading: isFinanceLoading } = useQuery({
    queryKey: ['/api/partner/finance/summary'],
  });

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['/api/partner/finance/transactions'],
  });

  const isLoading = isFinanceLoading || isTransactionsLoading;

  const withdrawalMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/partner/finance/withdrawal', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: t('finances.messages.withdrawalRequested'),
        description: t('finances.messages.withdrawalRequestedDesc'),
        variant: 'default'
      });
      setWithdrawalOpen(false);
      setWithdrawalAmount('');
      setWithdrawalMethod('');
      setWithdrawalDetails('');
      queryClient.invalidateQueries({ queryKey: ['/api/partner/finance/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/finance/transactions'] });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('finances.messages.withdrawalError'),
        variant: 'destructive'
      });
    }
  });

  const handleWithdrawal = () => {
    if (!withdrawalAmount || !withdrawalMethod || !withdrawalDetails) {
      toast({
        title: 'Заполните все поля',
        description: 'Все поля обязательны для заполнения',
        variant: 'destructive'
      });
      return;
    }

    if (parseFloat(withdrawalAmount) > (financeData as any)?.balance) {
      toast({
        title: 'Недостаточно средств',
        description: 'Сумма вывода превышает доступный баланс',
        variant: 'destructive'
      });
      return;
    }

    withdrawalMutation.mutate({
      amount: parseFloat(withdrawalAmount),
      method: withdrawalMethod,
      details: withdrawalDetails
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Завершено</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Ожидание</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700"><Clock className="w-3 h-3 mr-1" />Обработка</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Отклонено</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'commission':
      case 'bonus':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'payout':
        return <ArrowDownLeft className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionType = (type: string) => {
    switch (type) {
      case 'commission':
        return 'Комиссия';
      case 'bonus':
        return 'Бонус';
      case 'payout':
        return 'Вывод';
      default:
        return type;
    }
  };

  const handleExportReport = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch('/api/partner/finance/export?format=' + format, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Отчёт загружен',
        description: `Финансовый отчёт в формате ${format.toUpperCase()} успешно загружен`,
        variant: 'default'
      });
    } catch (_error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить отчёт',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('finances.title')}</h1>
          <p className="text-muted-foreground">
            Управление балансом и выводом средств
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={withdrawalOpen} onOpenChange={setWithdrawalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Вывод средств
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Вывод средств</DialogTitle>
                <DialogDescription>
                  Создание заявки на вывод средств. Доступно: {formatCurrency((financeData as any)?.balance || 0)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Сумма</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="method">Способ получения</Label>
                  <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите способ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank_card">Банковская карта</SelectItem>
                      <SelectItem value="bank_transfer">Банковский перевод</SelectItem>
                      <SelectItem value="crypto">Криптовалюта</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="details">Реквизиты</Label>
                  <Textarea
                    id="details"
                    placeholder="Укажите реквизиты для получения средств"
                    value={withdrawalDetails}
                    onChange={(e) => setWithdrawalDetails(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setWithdrawalOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleWithdrawal} disabled={withdrawalMutation.isPending}>
                  {withdrawalMutation.isPending ? 'Отправка...' : 'Отправить заявку'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportReport('csv')} title="Скачать отчёт в CSV">
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('json')} title="Скачать отчёт в JSON">
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Текущий баланс - зеленый */}
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Текущий баланс</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency((financeData as any)?.balance || 0)}</div>
            <p className="text-xs text-green-600/80 dark:text-green-400/80">
              Доступно к выводу
            </p>
          </CardContent>
        </Card>

        {/* В ожидании - оранжевый */}
        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">В ожидании</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{formatCurrency((financeData as any)?.pendingPayouts || 0)}</div>
            <p className="text-xs text-orange-600/80 dark:text-orange-400/80">
              Ожидает подтверждения
            </p>
          </CardContent>
        </Card>

        {/* Общий доход - синий */}
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Общий доход</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency((financeData as any)?.totalRevenue || 0)}</div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
              За всё время
            </p>
          </CardContent>
        </Card>

        {/* Средний EPC - фиолетовый */}
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Средний EPC</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{formatCurrency((financeData as any)?.avgEPC || 0)}</div>
            <p className="text-xs text-purple-600/80 dark:text-purple-400/80">
              Доходность на клик
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>История операций</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Детали</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {((transactionsData as any) || []).map((transaction: any) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {new Date(transaction.createdAt).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="font-medium">
                          {transaction.comment || 'Транзакция'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getTransactionType(transaction.type)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      (transaction.amount || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(transaction.amount || 0) >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount || 0))}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    ID: {transaction.id.substring(0, 8)}...
                  </TableCell>
                </TableRow>
              ))}
              {(!transactionsData || transactionsData.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Транзакции не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
