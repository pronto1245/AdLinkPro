import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../../contexts/auth-context";
import { useToast } from "../../hooks/use-toast";
import { queryClient } from "../../lib/queryClient";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard,
  Wallet,
  Download,
  Filter,
  Search,
  RefreshCw,
  Plus,
  Eye,
  AlertTriangle,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Target
} from "lucide-react";

// Типы данных
interface FinancialSummary {
  totalExpenses: number;
  totalRevenue: number;
  totalPayouts: number;
  avgEPC: number;
  avgCR: number;
  avgPayout: number;
  balance: number;
  pendingPayouts: number;
}

interface Transaction {
  id: string;
  date: string;
  offerId: string;
  offerName: string;
  partnerId: string;
  partnerUsername: string;
  amount: number;
  currency: string;
  type: 'payout' | 'commission' | 'refund' | 'bonus' | 'adjustment';
  status: 'completed' | 'pending' | 'cancelled' | 'failed';
  comment?: string;
  paymentMethod?: string;
  txHash?: string;
  details?: {
    leads: number;
    clicks: number;
    period: string;
  };
}

interface PayoutForm {
  partnerId: string;
  amount: string;
  currency: string;
  period: string;
  comment: string;
  paymentMethod: string;
}

interface FinanceFilters {
  dateFrom: string;
  dateTo: string;
  search: string;
  offerId: string;
  partnerId: string;
  type: string;
  status: string;
  minAmount: string;
  maxAmount: string;
}

// Компонент метрики
interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  type: 'currency' | 'percent' | 'number';
  trend?: number;
  alert?: boolean;
}

const MetricCard = ({ title, value, icon: Icon, type, trend, alert }: MetricCardProps) => {
  const formatValue = (val: number) => {
    switch (type) {
      case 'currency':
        return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percent':
        return `${val.toFixed(2)}%`;
      case 'number':
        return val.toLocaleString();
      default:
        return val.toString();
    }
  };

  return (
    <Card className={alert ? "border-red-200 dark:border-red-800" : ""}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${alert ? 'text-red-600 dark:text-red-400' : ''}`}>
              {formatValue(value)}
            </p>
            {trend !== undefined && (
              <p className={`text-sm flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(trend).toFixed(1)}%
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${alert ? 'text-red-500' : 'text-muted-foreground'}`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default function Finance() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Состояния для фильтров
  const [filters, setFilters] = useState<FinanceFilters>({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    search: '',
    offerId: 'all',
    partnerId: 'all',
    type: 'all',
    status: 'all',
    minAmount: '',
    maxAmount: ''
  });

  // Состояние для формы выплаты
  const [payoutForm, setPayoutForm] = useState<PayoutForm>({
    partnerId: '',
    amount: '',
    currency: 'USD',
    period: new Date().toISOString().slice(0, 7), // YYYY-MM
    comment: '',
    paymentMethod: 'bank'
  });

  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Получение финансовой сводки
  const { data: summary = {
    totalExpenses: 0,
    totalRevenue: 0,
    totalPayouts: 0,
    avgEPC: 0,
    avgCR: 0,
    avgPayout: 0,
    balance: 0,
    pendingPayouts: 0
  } as FinancialSummary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['/api/advertiser/finance/summary', user?.id, filters.dateFrom, filters.dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('dateFrom', filters.dateFrom);
      params.set('dateTo', filters.dateTo);
      params.set('advertiserId', user?.id || '');
      
      const response = await fetch(`/api/advertiser/financial-overview?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Не удалось загрузить финансовую сводку');
      }
      return response.json();
    },
    enabled: !!user?.id
  });

  // Получение транзакций
  const { data: transactions = [], isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['/api/advertiser/finance/transactions', user?.id, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.set(key, value);
      });
      params.set('advertiserId', user?.id || '');
      
      const response = await fetch(`/api/advertiser/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Не удалось загрузить транзакции');
      }
      return response.json();
    },
    enabled: !!user?.id
  });

  // Получение списка партнёров для выплат
  const { data: partners = [] } = useQuery({
    queryKey: ['/api/advertiser/partners', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/advertiser/partners', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Ошибка загрузки партнёров');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Получение списка офферов для фильтра
  const { data: offers = [] } = useQuery({
    queryKey: ['/api/advertiser/offers', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/advertiser/offers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Ошибка загрузки офферов');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Мутация для создания выплаты
  const createPayoutMutation = useMutation({
    mutationFn: async (payoutData: PayoutForm) => {
      const response = await fetch('/api/advertiser/finance/payouts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...payoutData,
          amount: parseFloat(payoutData.amount),
          advertiserId: user?.id
        })
      });
      if (!response.ok) throw new Error('Ошибка создания выплаты');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/finance/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/finance/transactions'] });
      setIsPayoutDialogOpen(false);
      setPayoutForm({
        partnerId: '',
        amount: '',
        currency: 'USD',
        period: new Date().toISOString().slice(0, 7),
        comment: '',
        paymentMethod: 'bank'
      });
      toast({
        title: "Выплата создана",
        description: "Выплата партнёру поставлена в очередь на обработку"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка создания выплаты",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Мутация для изменения статуса транзакции
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, status }: { transactionId: string; status: string }) => {
      const response = await fetch(`/api/advertiser/finance/transactions/${transactionId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Ошибка изменения статуса');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/finance/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/finance/summary'] });
      toast({
        title: "Статус изменён",
        description: "Статус транзакции обновлён"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Функция экспорта
  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.set(key, value);
      });
      params.set('format', format);
      params.set('advertiserId', user?.id || '');

      const response = await fetch(`/api/advertiser/finance/export?${params}`);
      if (!response.ok) throw new Error('Ошибка экспорта');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `finance-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Экспорт выполнен",
        description: `Файл ${format.toUpperCase()} успешно скачан`
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось выполнить экспорт данных",
        variant: "destructive"
      });
    }
  };

  // Функция получения деталей транзакции
  const fetchTransactionDetails = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/advertiser/finance/transactions/${transactionId}/details`);
      if (!response.ok) throw new Error('Ошибка загрузки деталей');
      return response.json();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить детали транзакции",
        variant: "destructive"
      });
    }
  };

  // Сброс фильтров
  const resetFilters = () => {
    setFilters({
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      search: '',
      offerId: 'all',
      partnerId: 'all',
      type: 'all',
      status: 'all',
      minAmount: '',
      maxAmount: ''
    });
  };

  // Функции валидации
  const validatePayoutForm = () => {
    const errors: string[] = [];
    
    if (!payoutForm.partnerId) errors.push("Выберите партнёра");
    if (!payoutForm.amount || isNaN(parseFloat(payoutForm.amount)) || parseFloat(payoutForm.amount) <= 0) {
      errors.push("Введите корректную сумму выплаты");
    }
    if (summary.balance < parseFloat(payoutForm.amount || '0')) {
      errors.push("Недостаточно средств на балансе");
    }
    
    return errors;
  };

  const handleCreatePayout = () => {
    const validationErrors = validatePayoutForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Ошибка валидации",
        description: validationErrors.join(", "),
        variant: "destructive"
      });
      return;
    }
    
    createPayoutMutation.mutate(payoutForm);
  };

  if (summaryLoading || transactionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="finance-page">
        {/* Заголовок */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Финансы</h1>
            <p className="text-muted-foreground">
              Управление финансами, выплаты партнёрам и транзакции
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                refetchSummary();
                refetchTransactions();
              }}
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
            
            <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-payout">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать выплату
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Выплата партнёру</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Партнёр */}
                  <div className="space-y-2">
                    <Label htmlFor="partnerId">Партнёр *</Label>
                    <Select 
                      value={payoutForm.partnerId}
                      onValueChange={(value) => setPayoutForm({...payoutForm, partnerId: value})}
                    >
                      <SelectTrigger data-testid="select-partner">
                        <SelectValue placeholder="Выберите партнёра" />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map((partner: any) => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.username} ({partner.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Сумма и валюта */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Сумма *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={payoutForm.amount}
                        onChange={(e) => setPayoutForm({...payoutForm, amount: e.target.value})}
                        placeholder="0.00"
                        data-testid="input-amount"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency">Валюта</Label>
                      <Select 
                        value={payoutForm.currency}
                        onValueChange={(value) => setPayoutForm({...payoutForm, currency: value})}
                      >
                        <SelectTrigger data-testid="select-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="BTC">BTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Период */}
                  <div className="space-y-2">
                    <Label htmlFor="period">Период</Label>
                    <Input
                      id="period"
                      type="month"
                      value={payoutForm.period}
                      onChange={(e) => setPayoutForm({...payoutForm, period: e.target.value})}
                      data-testid="input-period"
                    />
                  </div>
                  
                  {/* Способ оплаты */}
                  <div className="space-y-2">
                    <Label>Способ выплаты</Label>
                    <Select 
                      value={payoutForm.paymentMethod}
                      onValueChange={(value) => setPayoutForm({...payoutForm, paymentMethod: value})}
                    >
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Банковский перевод</SelectItem>
                        <SelectItem value="crypto">Криптовалюта (USDT)</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="wise">Wise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Комментарий */}
                  <div className="space-y-2">
                    <Label htmlFor="comment">Комментарий</Label>
                    <Textarea
                      id="comment"
                      value={payoutForm.comment}
                      onChange={(e) => setPayoutForm({...payoutForm, comment: e.target.value})}
                      placeholder="Комментарий к выплате (опционально)"
                      data-testid="textarea-comment"
                    />
                  </div>
                  
                  {/* Информация о балансе */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Доступный баланс:</span>
                      <span className="font-semibold">${summary.balance.toLocaleString()}</span>
                    </div>
                    {payoutForm.amount && parseFloat(payoutForm.amount) > summary.balance && (
                      <div className="mt-2 flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Недостаточно средств</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Кнопки */}
                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsPayoutDialogOpen(false)}
                      data-testid="button-cancel-payout"
                    >
                      Отмена
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleCreatePayout}
                      disabled={createPayoutMutation.isPending}
                      data-testid="button-submit-payout"
                    >
                      {createPayoutMutation.isPending && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      )}
                      <Send className="h-4 w-4 mr-2" />
                      Выплатить
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Финансовые метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Общие расходы"
            value={summary.totalExpenses}
            icon={DollarSign}
            type="currency"
            alert={summary.totalExpenses > summary.balance * 10}
          />
          <MetricCard
            title="Доход от офферов"
            value={summary.totalRevenue}
            icon={TrendingUp}
            type="currency"
          />
          <MetricCard
            title="Выплачено партнёрам"
            value={summary.totalPayouts}
            icon={Users}
            type="currency"
          />
          <MetricCard
            title="Баланс"
            value={summary.balance}
            icon={Wallet}
            type="currency"
            alert={summary.balance < 1000}
          />
        </div>

        {/* Дополнительные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Средний EPC"
            value={summary.avgEPC}
            icon={TrendingUp}
            type="currency"
          />
          <MetricCard
            title="Средний CR"
            value={summary.avgCR}
            icon={Target}
            type="percent"
          />
          <MetricCard
            title="В ожидании выплат"
            value={summary.pendingPayouts}
            icon={Clock}
            type="currency"
            alert={summary.pendingPayouts > 0}
          />
        </div>

        {/* Фильтры и поиск транзакций */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Фильтры транзакций
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Поиск */}
              <div className="space-y-2">
                <Label>Поиск</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Транзакция, партнёр, оффер..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-10"
                    data-testid="input-search-transactions"
                  />
                </div>
              </div>

              {/* Период */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>С даты</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    data-testid="input-date-from"
                  />
                </div>
                <div className="space-y-2">
                  <Label>По дату</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    data-testid="input-date-to"
                  />
                </div>
              </div>

              {/* Оффер */}
              <div className="space-y-2">
                <Label>Оффер</Label>
                <Select value={filters.offerId} onValueChange={(value) => setFilters({...filters, offerId: value})}>
                  <SelectTrigger data-testid="select-offer-filter">
                    <SelectValue placeholder="Все офферы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все офферы</SelectItem>
                    {offers.map((offer: any) => (
                      <SelectItem key={offer.id} value={offer.id}>
                        {offer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Партнёр */}
              <div className="space-y-2">
                <Label>Партнёр</Label>
                <Select value={filters.partnerId} onValueChange={(value) => setFilters({...filters, partnerId: value})}>
                  <SelectTrigger data-testid="select-partner-filter">
                    <SelectValue placeholder="Все партнёры" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все партнёры</SelectItem>
                    {partners.map((partner: any) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Тип транзакции */}
              <div className="space-y-2">
                <Label>Тип</Label>
                <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                  <SelectTrigger data-testid="select-type-filter">
                    <SelectValue placeholder="Все типы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="payout">Выплата</SelectItem>
                    <SelectItem value="commission">Комиссия</SelectItem>
                    <SelectItem value="refund">Возврат</SelectItem>
                    <SelectItem value="bonus">Бонус</SelectItem>
                    <SelectItem value="adjustment">Корректировка</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Статус */}
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="completed">Завершена</SelectItem>
                    <SelectItem value="pending">В ожидании</SelectItem>
                    <SelectItem value="cancelled">Отменена</SelectItem>
                    <SelectItem value="failed">Ошибка</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Сумма */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>От суммы</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                    data-testid="input-min-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>До суммы</Label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                    data-testid="input-max-amount"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                data-testid="button-reset-filters"
              >
                Сбросить фильтры
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleExport('csv')}
                  data-testid="button-export-csv"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExport('xlsx')}
                  data-testid="button-export-xlsx"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Таблица транзакций */}
        <Card>
          <CardHeader>
            <CardTitle>
              Транзакции ({transactions.length} записей)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Нет транзакций за выбранный период</p>
                <p className="text-sm mt-2">Создайте первую выплату партнёру</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Оффер</TableHead>
                      <TableHead>Партнёр</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Способ оплаты</TableHead>
                      <TableHead className="text-center">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: Transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(transaction.date).toLocaleDateString('ru-RU')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.type === 'payout' && <Send className="h-4 w-4 text-red-500" />}
                            {transaction.type === 'commission' && <TrendingUp className="h-4 w-4 text-green-500" />}
                            {transaction.type === 'refund' && <ArrowDownRight className="h-4 w-4 text-blue-500" />}
                            {transaction.type === 'bonus' && <Plus className="h-4 w-4 text-purple-500" />}
                            <span className="capitalize">
                              {transaction.type === 'payout' ? 'Выплата' : 
                               transaction.type === 'commission' ? 'Комиссия' :
                               transaction.type === 'refund' ? 'Возврат' :
                               transaction.type === 'bonus' ? 'Бонус' : transaction.type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.offerName}</TableCell>
                        <TableCell>{transaction.partnerUsername}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={transaction.type === 'payout' || transaction.type === 'refund' ? 'text-red-600' : 'text-green-600'}>
                            {transaction.type === 'payout' || transaction.type === 'refund' ? '-' : '+'}
                            {transaction.currency} {transaction.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            transaction.status === 'completed' ? 'default' :
                            transaction.status === 'pending' ? 'secondary' :
                            transaction.status === 'cancelled' ? 'outline' : 'destructive'
                          }>
                            <div className="flex items-center gap-1">
                              {transaction.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                              {transaction.status === 'pending' && <Clock className="h-3 w-3" />}
                              {transaction.status === 'cancelled' && <XCircle className="h-3 w-3" />}
                              {transaction.status === 'failed' && <AlertTriangle className="h-3 w-3" />}
                              {transaction.status === 'completed' ? 'Завершена' :
                               transaction.status === 'pending' ? 'В ожидании' :
                               transaction.status === 'cancelled' ? 'Отменена' : 'Ошибка'}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            {transaction.paymentMethod === 'bank' ? 'Банк' :
                             transaction.paymentMethod === 'crypto' ? 'Криpto' :
                             transaction.paymentMethod === 'paypal' ? 'PayPal' :
                             transaction.paymentMethod === 'wise' ? 'Wise' : transaction.paymentMethod}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedTransaction(transaction)}
                              title="Посмотреть детализацию"
                              data-testid={`button-view-details-${transaction.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {transaction.status === 'pending' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => updateTransactionMutation.mutate({
                                  transactionId: transaction.id,
                                  status: 'cancelled'
                                })}
                                title="Отменить транзакцию"
                                data-testid={`button-cancel-${transaction.id}`}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}