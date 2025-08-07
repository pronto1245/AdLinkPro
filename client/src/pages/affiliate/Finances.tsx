import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { apiRequest } from "@/lib/queryClient";

export default function Finances() {
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('');
  const [withdrawalDetails, setWithdrawalDetails] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock данные для демонстрации
  const mockFinanceData = {
    balance: {
      current: 2847.50,
      pending: 850.25,
      total: 3697.75,
      lastPayment: 1200.00
    },
    transactions: [
      {
        id: 1,
        type: 'earnings',
        description: '4RaBet India - Конверсии за период',
        amount: 480.00,
        status: 'completed',
        date: '2025-08-05',
        offerName: '4RaBet India'
      },
      {
        id: 2,
        type: 'withdrawal',
        description: 'Вывод средств на PayPal',
        amount: -1200.00,
        status: 'completed',
        date: '2025-08-04',
        paymentMethod: 'PayPal'
      },
      {
        id: 3,
        type: 'earnings',
        description: 'Crypto Trading Pro - Конверсии за период',
        amount: 320.25,
        status: 'pending',
        date: '2025-08-03',
        offerName: 'Crypto Trading Pro'
      },
      {
        id: 4,
        type: 'earnings',
        description: 'Dating VIP - Конверсии за период',
        amount: 150.00,
        status: 'completed',
        date: '2025-08-03',
        offerName: 'Dating VIP'
      },
      {
        id: 5,
        type: 'withdrawal',
        description: 'Вывод средств на банковскую карту',
        amount: -800.00,
        status: 'processing',
        date: '2025-08-02',
        paymentMethod: 'Bank Card'
      }
    ]
  };

  const { data: financeData, isLoading } = useQuery({
    queryKey: ['/api/affiliate/finances'],
    initialData: mockFinanceData
  });

  const withdrawalMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/affiliate/withdrawal', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Запрос отправлен",
        description: "Заявка на вывод средств создана и будет обработана в течение 24 часов.",
        variant: "default"
      });
      setWithdrawalOpen(false);
      setWithdrawalAmount('');
      setWithdrawalMethod('');
      setWithdrawalDetails('');
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/finances'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать заявку на вывод средств",
        variant: "destructive"
      });
    }
  });

  const handleWithdrawal = () => {
    if (!withdrawalAmount || !withdrawalMethod || !withdrawalDetails) {
      toast({
        title: "Заполните все поля",
        description: "Все поля обязательны для заполнения",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(withdrawalAmount) > financeData.balance.current) {
      toast({
        title: "Недостаточно средств",
        description: "Сумма вывода превышает доступный баланс",
        variant: "destructive"
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
    return type === 'earnings' ? 
      <ArrowUpRight className="h-4 w-4 text-green-600" /> : 
      <ArrowDownLeft className="h-4 w-4 text-red-600" />;
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
          <h1 className="text-3xl font-bold tracking-tight">Финансы</h1>
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
                  Создание заявки на вывод средств. Доступно: {formatCurrency(financeData.balance.current)}
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
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Отчёт
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Текущий баланс</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financeData.balance.current)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В ожидании</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(financeData.balance.pending)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общий баланс</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(financeData.balance.total)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Последняя выплата</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(financeData.balance.lastPayment)}
            </div>
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
              {financeData.transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.type)}
                      <span>{transaction.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`font-medium ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {transaction.offerName || transaction.paymentMethod || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}