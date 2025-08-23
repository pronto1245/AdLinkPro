import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, TrendingUp, TrendingDown, DollarSign, Users, CreditCard, Download, 
  Eye, CheckCircle, XCircle, Clock, Send, FileText, Filter, BarChart3, 
  Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, Search, AlertCircle,
  Bitcoin, Banknote, Smartphone, Building, Globe, Copy, Edit, Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';

interface Transaction {
  id: string;
  type: 'deposit' | 'payout' | 'hold' | 'cancel' | 'correction';
  user: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'processing' | 'failed' | 'cancelled';
  paymentMethod: string;
  description?: string;
  createdAt: string;
  processedAt?: string;
}

interface PayoutRequest {
  id: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  amount: number;
  currency: string;
  walletAddress: string;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  processedAt?: string;
  note?: string;
}

export default function FinancesManagement() {
  const { toast } = useToast();
  const { token } = useAuth();
  const { isCollapsed } = useSidebar();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'transactions' | 'payouts' | 'deposits' | 'commission' | 'reports' | 'crypto'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCurrency, setFilterCurrency] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('30d');
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [selectedNote, setSelectedNote] = useState('');

  // Queries
  const { data: financialMetrics } = useQuery<any>({
    queryKey: ['/api/admin/financial-metrics', dateFilter],
    queryFn: async () => {
      const response = await fetch(`/api/admin/financial-metrics/${dateFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {throw new Error('Failed to fetch financial metrics');}
      return response.json();
    },
    staleTime: 30 * 1000, // 30 секунд для финансовых данных
    gcTime: 2 * 60 * 1000, // 2 минуты в памяти
    refetchOnWindowFocus: true, // Обновлять при возврате к окну
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/finances', { 
      status: filterStatus, 
      type: filterType, 
      currency: filterCurrency, 
      method: filterMethod,
      search: searchTerm 
    }],
    queryFn: async () => {
      const response = await fetch('/api/admin/finances', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {throw new Error('Failed to fetch transactions');}
      return response.json();
    },
    staleTime: 30 * 1000, // 30 секунд для финансовых данных
    gcTime: 2 * 60 * 1000, // 2 минуты в памяти
  });

  const { data: payoutRequests = [] } = useQuery<PayoutRequest[]>({
    queryKey: ['/api/admin/payout-requests', { 
      status: filterStatus, 
      currency: filterCurrency, 
      method: filterMethod,
      search: searchTerm 
    }],
    queryFn: async () => {
      const response = await fetch('/api/admin/payout-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {throw new Error('Failed to fetch payout requests');}
      return response.json();
    },
    staleTime: 30 * 1000, // 30 секунд для финансовых данных
    gcTime: 2 * 60 * 1000, // 2 минуты в памяти
  });

  const { data: deposits = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/deposits', { 
      status: filterStatus, 
      currency: filterCurrency, 
      method: filterMethod,
      search: searchTerm,
      period: dateFilter 
    }],
    queryFn: async () => {
      const response = await fetch('/api/admin/deposits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {throw new Error('Failed to fetch deposits');}
      return response.json();
    },
    staleTime: 30 * 1000, // 30 секунд для финансовых данных
    gcTime: 2 * 60 * 1000, // 2 минуты в памяти
  });

  const { data: commissionData = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/commission-data', { period: dateFilter }],
    queryFn: async () => {
      const response = await fetch('/api/admin/commission-data', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {throw new Error('Failed to fetch commission data');}
      return response.json();
    },
    staleTime: 30 * 1000, // 30 секунд для финансовых данных
    gcTime: 2 * 60 * 1000, // 2 минуты в памяти
  });

  const { data: chartData = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/financial-chart', dateFilter],
    queryFn: async () => {
      const response = await fetch(`/api/admin/financial-chart/${dateFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {throw new Error('Failed to fetch chart data');}
      return response.json();
    },
    staleTime: 30 * 1000, // 30 секунд для финансовых данных
    gcTime: 2 * 60 * 1000, // 2 минуты в памяти
    refetchOnWindowFocus: true, // Обновлять при возврате к окну
  });

  const { data: cryptoPortfolio = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/crypto-portfolio'],
    queryFn: async () => {
      const response = await fetch('/api/admin/crypto-portfolio', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {throw new Error('Failed to fetch crypto portfolio');}
      return response.json();
    },
  });

  const { data: cryptoWallets = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/crypto-wallets'],
    queryFn: async () => {
      const response = await fetch('/api/admin/crypto-wallets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {throw new Error('Failed to fetch crypto wallets');}
      return response.json();
    },
  });

  // Mutations
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, status, note }: { transactionId: string; status: string; note?: string }) => {
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, note }),
      });
      if (!response.ok) {throw new Error('Failed to update transaction');}
      return response.json();
    },
    onSuccess: () => {
      // Инвалидация всех финансовых данных при обновлении транзакции
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0] as string;
          return key?.includes('/api/admin/financial') || 
                 key?.includes('/api/admin/finances') || 
                 key?.includes('/api/admin/payout-requests') ||
                 key?.includes('/api/admin/deposits') ||
                 key?.includes('/api/admin/commission-data');
        }
      });
      toast({
        title: 'Успешно',
        description: 'Статус транзакции обновлён',
      });
    },
  });

  const processPayoutMutation = useMutation({
    mutationFn: async ({ payoutId, action, note }: { payoutId: string; action: 'approve' | 'reject' | 'complete'; note?: string }) => {
      const response = await fetch(`/api/admin/payouts/${payoutId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note }),
      });
      if (!response.ok) {throw new Error('Failed to process payout');}
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payout-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/financial-metrics'] });
      toast({
        title: 'Успешно',
        description: 'Выплата обработана',
      });
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceData),
      });
      if (!response.ok) {throw new Error('Failed to create invoice');}
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deposits'] });
      setIsInvoiceDialogOpen(false);
      toast({
        title: 'Инвойс создан',
        description: 'Уведомление отправлено рекламодателю',
      });
    },
  });

  // Filter functions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = !searchTerm || 
      transaction.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCurrency = filterCurrency === 'all' || transaction.currency === filterCurrency;
    const matchesMethod = filterMethod === 'all' || transaction.paymentMethod === filterMethod;
    
    return matchesSearch && matchesStatus && matchesType && matchesCurrency && matchesMethod;
  });

  const filteredPayouts = payoutRequests.filter((payout) => {
    const matchesSearch = !searchTerm || 
      payout.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.walletAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payout.status === filterStatus;
    const matchesCurrency = filterCurrency === 'all' || payout.currency === filterCurrency;
    const matchesMethod = filterMethod === 'all' || payout.paymentMethod === filterMethod;
    
    return matchesSearch && matchesStatus && matchesCurrency && matchesMethod;
  });

  // Utility functions
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: RefreshCw },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', icon: XCircle },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      deposit: <ArrowUpRight className="w-4 h-4 text-green-600" />,
      payout: <ArrowDownRight className="w-4 h-4 text-red-600" />,
      hold: <Clock className="w-4 h-4 text-yellow-600" />,
      cancel: <XCircle className="w-4 h-4 text-gray-600" />,
      correction: <Edit className="w-4 h-4 text-blue-600" />,
    };
    return icons[type as keyof typeof icons] || <DollarSign className="w-4 h-4" />;
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      USDT: <Bitcoin className="w-4 h-4 text-green-600" />,
      BTC: <Bitcoin className="w-4 h-4 text-orange-600" />,
      ETH: <Bitcoin className="w-4 h-4 text-blue-600" />,
      Crypto: <Bitcoin className="w-4 h-4 text-purple-600" />,
      Wire: <Building className="w-4 h-4 text-blue-600" />,
      Card: <CreditCard className="w-4 h-4 text-green-600" />,
      Payeer: <Wallet className="w-4 h-4 text-red-600" />,
      Qiwi: <Smartphone className="w-4 h-4 text-orange-600" />,
      YuMoney: <Banknote className="w-4 h-4 text-purple-600" />,
    };
    return icons[method as keyof typeof icons] || <Globe className="w-4 h-4" />;
  };

  const exportData = (type: string) => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'transactions':
        data = filteredTransactions;
        filename = 'transactions';
        break;
      case 'payouts':
        data = filteredPayouts;
        filename = 'payouts';
        break;
      case 'deposits':
        data = deposits;
        filename = 'deposits';
        break;
      default:
        return;
    }

    // Создаем CSV файл
    const headers = type === 'transactions' 
      ? ['ID', 'Тип', 'Пользователь', 'Сумма', 'Валюта', 'Статус', 'Дата']
      : type === 'payouts'
      ? ['ID', 'Пользователь', 'Сумма', 'Валюта', 'Кошелёк', 'Статус', 'Дата']
      : ['ID', 'Пользователь', 'Сумма', 'Валюта', 'Статус', 'Дата'];

    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        if (type === 'transactions') {
          return [
            item.id,
            item.type,
            item.user.username,
            item.amount,
            item.currency,
            item.status,
            new Date(item.createdAt).toLocaleDateString()
          ].join(',');
        } else if (type === 'payouts') {
          return [
            item.id,
            item.user.username,
            item.amount,
            item.currency,
            item.walletAddress,
            item.status,
            new Date(item.requestedAt).toLocaleDateString()
          ].join(',');
        } else {
          return [
            item.id,
            item.user?.username || 'N/A',
            item.amount,
            item.currency,
            item.status,
            new Date(item.createdAt).toLocaleDateString()
          ].join(',');
        }
      })
    ].join('\n');

    // Скачиваем файл
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Экспорт завершён',
      description: `Файл ${filename}.csv успешно скачан`,
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Header title="Финансы" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  💰 Финансы
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Управление финансами платформы и выплатами
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => exportData(selectedTab)}
                  data-testid="button-export"
                  title="Экспорт данных"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Экспорт
                </Button>
                
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32" title="Период">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 дней</SelectItem>
                    <SelectItem value="30d">30 дней</SelectItem>
                    <SelectItem value="90d">90 дней</SelectItem>
                    <SelectItem value="1y">1 год</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
              <div className="flex space-x-1 overflow-x-auto">
                {[
                  { id: 'dashboard', label: '📊 Дашборд', icon: BarChart3 },
                  { id: 'transactions', label: '🧾 Транзакции', icon: CreditCard },
                  { id: 'payouts', label: '💳 Выплаты', icon: Send },
                  { id: 'deposits', label: '🧮 Пополнения', icon: ArrowUpRight },
                  { id: 'commission', label: '📦 Комиссия', icon: DollarSign },
                  { id: 'crypto', label: '₿ Криптокошельки', icon: Bitcoin },
                  { id: 'reports', label: '📁 Отчёты', icon: FileText },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-3 px-4 rounded-md transition-all ${
                        selectedTab === tab.id
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      data-testid={`tab-${tab.id}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="whitespace-nowrap text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
        {selectedTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Platform Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="w-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Баланс платформы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${financialMetrics?.platformBalance?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-gray-500">
                        USD • EUR • USDT • BTC
                      </div>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Доход от рекламодателей
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${financialMetrics?.advertiserRevenue?.toLocaleString() || '0'}
                      </div>
                      <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +12.5%
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <ArrowUpRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Выплаты партнёрам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${financialMetrics?.partnerPayouts?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Выплачено: ${financialMetrics?.paidOut || '0'} • В холде: ${financialMetrics?.onHold || '0'}
                      </div>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                      <ArrowDownRight className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Комиссия платформы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${financialMetrics?.platformCommission?.toLocaleString() || '0'}
                      </div>
                      <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +8.2%
                      </div>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Flow Chart */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Финансовые потоки по дням
                </CardTitle>
                <CardDescription>
                  Доходы и расходы за выбранный период
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Доходы"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#EF4444" 
                        strokeWidth={2}
                        name="Расходы"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Currency Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Распределение по валютам</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={financialMetrics?.currencyDistribution || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(financialMetrics?.currencyDistribution || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Методы платежей</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(financialMetrics?.paymentMethods || []).map((method: any, index: number) => (
                      <div key={method.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(method.name)}
                          <span className="font-medium">{method.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${method.amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{method.count} транзакций</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedTab === 'transactions' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Поиск транзакций..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-transactions"
                      title="Поиск транзакций"
                    />
                  </div>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger title="Фильтр по статусу">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="completed">Выполнено</SelectItem>
                      <SelectItem value="pending">Ожидает</SelectItem>
                      <SelectItem value="processing">В обработке</SelectItem>
                      <SelectItem value="failed">Ошибка</SelectItem>
                      <SelectItem value="cancelled">Отменено</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger title="Фильтр по типу">
                      <SelectValue placeholder="Тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="deposit">Пополнение</SelectItem>
                      <SelectItem value="payout">Выплата</SelectItem>
                      <SelectItem value="hold">Холд</SelectItem>
                      <SelectItem value="cancel">Отмена</SelectItem>
                      <SelectItem value="correction">Корректировка</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCurrency} onValueChange={setFilterCurrency}>
                    <SelectTrigger title="Фильтр по валюте">
                      <SelectValue placeholder="Валюта" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все валюты</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterMethod} onValueChange={setFilterMethod}>
                    <SelectTrigger title="Фильтр по методу">
                      <SelectValue placeholder="Метод" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все методы</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="Crypto">Crypto</SelectItem>
                      <SelectItem value="Wire">Wire</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Payeer">Payeer</SelectItem>
                      <SelectItem value="Qiwi">Qiwi</SelectItem>
                      <SelectItem value="YuMoney">ЮMoney</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterType('all');
                      setFilterCurrency('all');
                      setFilterMethod('all');
                    }}
                    data-testid="button-clear-filters"
                    title="Очистить фильтры"
                  >
                    Очистить
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  История транзакций ({filteredTransactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Кому / От кого</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Дата и время</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Метод оплаты</TableHead>
                        <TableHead>Примечание</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-sm">
                            {transaction.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(transaction.type)}
                              <span className="capitalize">{transaction.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                {transaction.user.firstName?.charAt(0) || transaction.user.username.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{transaction.user.username}</div>
                                <div className="text-sm text-gray-500">{transaction.user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {transaction.amount >= 0 ? '+' : ''}${transaction.amount.toLocaleString()} {transaction.currency}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(transaction.createdAt).toLocaleString('ru-RU')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(transaction.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(transaction.paymentMethod)}
                              <span>{transaction.paymentMethod}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm text-gray-500">
                              {transaction.description || '—'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  toast({
                                    title: 'Просмотр транзакции',
                                    description: `Детали транзакции ${transaction.id}`,
                                  });
                                }}
                                title="Просмотр"
                                data-testid={`button-view-transaction-${transaction.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {transaction.status === 'pending' && (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => updateTransactionMutation.mutate({ 
                                      transactionId: transaction.id, 
                                      status: 'completed',
                                      note: 'Approved by admin'
                                    })}
                                    title="Одобрить"
                                    data-testid={`button-approve-transaction-${transaction.id}`}
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => updateTransactionMutation.mutate({ 
                                      transactionId: transaction.id, 
                                      status: 'failed',
                                      note: 'Rejected by admin'
                                    })}
                                    title="Отклонить"
                                    data-testid={`button-reject-transaction-${transaction.id}`}
                                  >
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => updateTransactionMutation.mutate({
                                  transactionId: transaction.id,
                                  status: 'refunded',
                                  note: 'Refunded by admin'
                                })}
                                title="Возврат"
                                data-testid={`button-refund-transaction-${transaction.id}`}
                              >
                                <RefreshCw className="w-4 h-4 text-orange-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'payouts' && (
          <div className="space-y-6">
            {/* Payout Requests Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Выплаты партнёрам</h2>
                <p className="text-gray-600 dark:text-gray-400">Запросы на выплату от партнёров</p>
              </div>
              <div className="flex space-x-2">
                {selectedPayouts.length > 0 && (
                  <Button
                    onClick={() => {
                      selectedPayouts.forEach(payoutId => {
                        processPayoutMutation.mutate({ 
                          payoutId, 
                          action: 'approve',
                          note: 'Bulk approval by admin'
                        });
                      });
                      setSelectedPayouts([]);
                      toast({
                        title: 'Массовая выплата',
                        description: `${selectedPayouts.length} выплат одобрено`,
                      });
                    }}
                    className="bg-green-600 hover:bg-green-700"
                    title="Массовая выплата"
                    data-testid="button-bulk-approve"
                    disabled={processPayoutMutation.isPending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {processPayoutMutation.isPending ? 'Обработка...' : `Выплатить выбранные (${selectedPayouts.length})`}
                  </Button>
                )}
              </div>
            </div>

            {/* Filters */}
            <Card className="w-full">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Поиск выплат..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      title="Поиск выплат"
                    />
                  </div>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger title="Фильтр по статусу">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="pending">Ожидает</SelectItem>
                      <SelectItem value="approved">Одобрено</SelectItem>
                      <SelectItem value="rejected">Отказ</SelectItem>
                      <SelectItem value="completed">Выплачено</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCurrency} onValueChange={setFilterCurrency}>
                    <SelectTrigger title="Фильтр по валюте">
                      <SelectValue placeholder="Валюта" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все валюты</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterMethod} onValueChange={setFilterMethod}>
                    <SelectTrigger title="Фильтр по методу">
                      <SelectValue placeholder="Метод" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все методы</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="Qiwi">Qiwi</SelectItem>
                      <SelectItem value="Payeer">Payeer</SelectItem>
                      <SelectItem value="YuMoney">ЮMoney</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterCurrency('all');
                      setFilterMethod('all');
                    }}
                    title="Очистить фильтры"
                  >
                    Очистить
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payouts Table */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Запросы на выплату ({filteredPayouts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedPayouts.length === filteredPayouts.length && filteredPayouts.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPayouts(filteredPayouts.map(p => p.id));
                              } else {
                                setSelectedPayouts([]);
                              }
                            }}
                            title="Выбрать все"
                          />
                        </TableHead>
                        <TableHead>ФИО / Название</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Кошелёк / Реквизиты</TableHead>
                        <TableHead>Метод</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Дата запроса</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedPayouts.includes(payout.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedPayouts([...selectedPayouts, payout.id]);
                                } else {
                                  setSelectedPayouts(selectedPayouts.filter(id => id !== payout.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                {payout.user.firstName?.charAt(0) || payout.user.username.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {payout.user.firstName && payout.user.lastName 
                                    ? `${payout.user.firstName} ${payout.user.lastName}` 
                                    : payout.user.username}
                                </div>
                                <div className="text-sm text-gray-500">{payout.user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              ${payout.amount.toLocaleString()} {payout.currency}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => navigator.clipboard.writeText(payout.walletAddress)}
                                title="Копировать адрес"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <span className="font-mono text-sm max-w-xs truncate">
                                {payout.walletAddress}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(payout.paymentMethod)}
                              <span>{payout.paymentMethod}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payout.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(payout.requestedAt).toLocaleString('ru-RU')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {payout.status === 'pending' && (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedPayout(payout);
                                      processPayoutMutation.mutate({ 
                                        payoutId: payout.id, 
                                        action: 'approve',
                                        note: 'Approved by admin'
                                      });
                                    }}
                                    title="Одобрить"
                                    data-testid={`button-approve-${payout.id}`}
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedPayout(payout);
                                      processPayoutMutation.mutate({ 
                                        payoutId: payout.id, 
                                        action: 'reject',
                                        note: 'Rejected by admin'
                                      });
                                    }}
                                    title="Отклонить"
                                    data-testid={`button-reject-${payout.id}`}
                                  >
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                              {payout.status === 'approved' && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedPayout(payout);
                                    processPayoutMutation.mutate({ 
                                      payoutId: payout.id, 
                                      action: 'complete',
                                      note: 'Payment completed by admin'
                                    });
                                  }}
                                  title="Отметить как выплачено"
                                  data-testid={`button-complete-${payout.id}`}
                                >
                                  <Send className="w-4 h-4 text-blue-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'deposits' && (
          <div className="space-y-6">
            {/* Deposits Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Пополнения от рекламодателей</h2>
                <p className="text-gray-600 dark:text-gray-400">История пополнений и создание инвойсов</p>
              </div>
              <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-invoice" title="Создать инвойс">
                    <Plus className="w-4 h-4 mr-2" />
                    Создать инвойс
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создать инвойс для рекламодателя</DialogTitle>
                    <DialogDescription>
                      Создайте инвойс для пополнения баланса рекламодателя
                    </DialogDescription>
                  </DialogHeader>
                  {/* Invoice form would go here */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="advertiser">Рекламодатель</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите рекламодателя" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Advertiser options */}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Сумма</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div>
                      <Label htmlFor="currency">Валюта</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите валюту" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Описание</Label>
                      <Textarea placeholder="Описание инвойса..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button 
                      onClick={() => {
                        // Get form data - in real implementation, get from form
                        const invoiceData = {
                          advertiserId: 'adv-1',
                          amount: 1000,
                          currency: 'USD',
                          description: 'Platform deposit invoice',
                        };
                        createInvoiceMutation.mutate(invoiceData);
                      }}
                      disabled={createInvoiceMutation.isPending}
                      data-testid="button-submit-invoice"
                    >
                      {createInvoiceMutation.isPending ? 'Создание...' : 'Создать инвойс'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Deposits Table */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5" />
                  История пополнений ({deposits.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Рекламодатель</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Валюта</TableHead>
                        <TableHead>Метод оплаты</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deposits.map((deposit) => (
                        <TableRow key={deposit.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                {deposit.advertiser?.charAt(0) || 'A'}
                              </div>
                              <span className="font-medium">{deposit.advertiser}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              ${deposit.amount?.toLocaleString() || '0'}
                            </div>
                          </TableCell>
                          <TableCell>{deposit.currency}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(deposit.method)}
                              <span>{deposit.method}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(deposit.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(deposit.createdAt).toLocaleString('ru-RU')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Просмотр"
                                data-testid={`button-view-deposit-${deposit.id}`}
                                onClick={() => {
                                  toast({
                                    title: 'Просмотр депозита',
                                    description: `Депозит ${deposit.id} от ${deposit.advertiser}`,
                                  });
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {deposit.status === 'pending' && (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    title="Подтвердить"
                                    data-testid={`button-approve-deposit-${deposit.id}`}
                                    onClick={() => {
                                      // In real implementation, call API to confirm deposit
                                      toast({
                                        title: 'Депозит подтвержден',
                                        description: `Депозит ${deposit.id} успешно подтвержден`,
                                      });
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    title="Отклонить"
                                    data-testid={`button-reject-deposit-${deposit.id}`}
                                    onClick={() => {
                                      // In real implementation, call API to reject deposit
                                      toast({
                                        title: 'Депозит отклонен',
                                        description: `Депозит ${deposit.id} отклонен`,
                                        variant: 'destructive',
                                      });
                                    }}
                                  >
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'commission' && (
          <div className="space-y-6">
            {/* Commission Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg">Общий доход платформы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ${financialMetrics?.totalPlatformRevenue?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    За выбранный период
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg">Средняя комиссия</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {financialMetrics?.averageCommission || '0'}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Процент от оборота
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg">Прибыль с учётом фрода</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {financialMetrics?.profitMargin || '0'}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    С учётом возвратов и холдов
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commission by Offer */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Комиссия по офферам</CardTitle>
                <CardDescription>
                  Доход платформы с каждого оффера
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Оффер</TableHead>
                        <TableHead>Цена рекламодателя</TableHead>
                        <TableHead>Выплата партнёру</TableHead>
                        <TableHead>Комиссия платформы</TableHead>
                        <TableHead>Конверсий</TableHead>
                        <TableHead>Общий доход</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionData.map((item) => (
                        <TableRow key={item.offerId}>
                          <TableCell>
                            <div className="font-medium">{item.offerName}</div>
                            <div className="text-sm text-gray-500">ID: {item.offerId}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              ${item.advertiserPrice}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-red-600">
                              ${item.partnerPayout}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-blue-600">
                              ${item.platformCommission}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.commissionPercent}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{item.conversions}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold">
                              ${item.totalRevenue?.toLocaleString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'crypto' && (
          <div className="space-y-6">
            {/* Crypto Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cryptoPortfolio.map((crypto: any) => (
                <Card key={crypto.currency} className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-500 rounded-lg">
                          <Bitcoin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {crypto.currency}
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {parseFloat(crypto.balance).toFixed(8)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Заблокировано
                        </p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {parseFloat(crypto.lockedBalance).toFixed(8)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Crypto Wallets Management */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Wallet className="w-5 h-5" />
                      <span>Криптокошельки</span>
                    </CardTitle>
                    <CardDescription>
                      Управление криптокошельками платформы
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => setDepositDialogOpen(true)}
                      data-testid="button-deposit-crypto"
                      title="Пополнить"
                    >
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      Пополнить
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setWithdrawDialogOpen(true)}
                      data-testid="button-withdraw-crypto"
                      title="Вывести"
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Вывести
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      data-testid="button-create-wallet"
                      title="Создать кошелёк"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Новый кошелёк
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex space-x-4">
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Валюта" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                        <SelectItem value="USDT">Tether (USDT)</SelectItem>
                        <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Тип кошелька" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="platform">Платформенный</SelectItem>
                        <SelectItem value="user">Пользовательский</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Активный</SelectItem>
                        <SelectItem value="suspended">Приостановлен</SelectItem>
                        <SelectItem value="maintenance">Обслуживание</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Crypto Wallets Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Валюта</TableHead>
                          <TableHead>Адрес</TableHead>
                          <TableHead>Тип</TableHead>
                          <TableHead>Баланс</TableHead>
                          <TableHead>Заблокировано</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cryptoWallets.map((wallet: any) => (
                          <TableRow key={wallet.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded">
                                  <Bitcoin className="w-4 h-4 text-orange-600" />
                                </div>
                                <span className="font-medium">{wallet.currency}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                  {wallet.address}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText(wallet.address)}
                                  data-testid="button-copy-address"
                                  title="Копировать адрес"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={wallet.walletType === 'platform' ? 'default' : 'secondary'}>
                                {wallet.walletType === 'platform' ? 'Платформенный' : 'Пользовательский'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono">
                              {parseFloat(wallet.balance).toFixed(8)}
                            </TableCell>
                            <TableCell className="font-mono">
                              {parseFloat(wallet.lockedBalance).toFixed(8)}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  wallet.status === 'active' ? 'default' :
                                  wallet.status === 'suspended' ? 'destructive' : 'secondary'
                                }
                              >
                                {wallet.status === 'active' ? 'Активный' :
                                 wallet.status === 'suspended' ? 'Приостановлен' : 'Обслуживание'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  data-testid="button-sync-wallet"
                                  title="Синхронизировать"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  data-testid="button-view-wallet"
                                  title="Просмотр"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  data-testid="button-edit-wallet"
                                  title="Редактировать"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'reports' && (
          <div className="space-y-6">
            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Экспорт транзакций
                  </CardTitle>
                  <CardDescription>
                    Выгрузка всех транзакций в CSV/XLSX
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => {
                      exportData('transactions');
                      toast({
                        title: 'Экспорт транзакций',
                        description: 'Файл с транзакциями готовится для скачивания',
                      });
                    }}
                    className="w-full"
                    title="Экспорт транзакций"
                    data-testid="button-export-transactions"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Скачать транзакции
                  </Button>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Экспорт выплат
                  </CardTitle>
                  <CardDescription>
                    Выгрузка данных о выплатах партнёрам
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => {
                      exportData('payouts');
                      toast({
                        title: 'Экспорт выплат',
                        description: 'Файл с выплатами готовится для скачивания',
                      });
                    }}
                    className="w-full"
                    title="Экспорт выплат"
                    data-testid="button-export-payouts"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Скачать выплаты
                  </Button>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Отчёт по комиссии
                  </CardTitle>
                  <CardDescription>
                    Данные о доходах платформы
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => {
                      exportData('commission');
                      toast({
                        title: 'Экспорт комиссии',
                        description: 'Файл с данными комиссии готовится для скачивания',
                      });
                    }}
                    className="w-full"
                    title="Экспорт комиссии"
                    data-testid="button-export-commission"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Скачать комиссию
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Auto Reports */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Автоматические отчёты</CardTitle>
                <CardDescription>
                  Настройка автоматической генерации отчётов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Месячный отчёт по финансам</div>
                      <div className="text-sm text-gray-500">Автоматическая отправка каждый месяц</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Активен</Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: 'Настройка месячного отчёта',
                            description: 'Открыта панель настройки автоматических отчётов по финансам',
                          });
                        }}
                        data-testid="button-configure-monthly-report"
                        title="Настроить месячный отчёт"
                      >
                        Настроить
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Отчёт для бухгалтера</div>
                      <div className="text-sm text-gray-500">Еженедельная выгрузка данных</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-100 text-gray-800">Неактивен</Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: 'Настройка отчёта для бухгалтера',
                            description: 'Открыта панель настройки еженедельных отчётов',
                          });
                        }}
                        data-testid="button-configure-accounting-report"
                        title="Настроить отчёт для бухгалтера"
                      >
                        Настроить
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Smart-уведомления</div>
                      <div className="text-sm text-gray-500">Уведомления о важных событиях</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Активен</Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: 'Настройка Smart-уведомлений',
                            description: 'Открыта панель настройки умных уведомлений',
                          });
                        }}
                        data-testid="button-configure-smart-notifications"
                        title="Настроить Smart-уведомления"
                      >
                        Настроить
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>

        {/* Crypto Deposit Dialog */}
        <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Пополнение криптокошелька</DialogTitle>
              <DialogDescription>
                Внесение средств на выбранный криптокошелёк
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="deposit-currency">Валюта</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите валюту" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                    <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deposit-amount">Сумма</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  step="0.00000001"
                  placeholder="0.00000000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="deposit-address">Адрес отправителя</Label>
                <Input
                  id="deposit-address"
                  placeholder="Адрес кошелька отправителя"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>
                Отмена
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/crypto-deposit', {
                      method: 'POST',
                      body: JSON.stringify({
                        currency: 'BTC',
                        amount: parseFloat(depositAmount),
                        fromAddress: walletAddress
                      }),
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                      }
                    });
                    
                    if (!response.ok) {throw new Error('Failed to deposit');}
                    
                    toast({
                      title: "Пополнение оформлено",
                      description: `Внесено ${depositAmount} BTC`,
                    });
                    
                    setDepositDialogOpen(false);
                    setDepositAmount('');
                    setWalletAddress('');
                    queryClient.invalidateQueries({ queryKey: ['/api/admin/crypto-portfolio'] });
                  } catch (_error) {
                    toast({
                      title: "Ошибка пополнения",
                      description: "Не удалось внести средства",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Пополнить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Crypto Withdraw Dialog */}
        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Вывод криптовалюты</DialogTitle>
              <DialogDescription>
                Вывод средств с платформенного кошелька
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="withdraw-currency">Валюта</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите валюту" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                    <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="withdraw-amount">Сумма</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  step="0.00000001"
                  placeholder="0.00000000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="withdraw-address">Адрес получателя</Label>
                <Input
                  id="withdraw-address"
                  placeholder="Адрес кошелька получателя"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                Отмена
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/crypto-withdraw', {
                      method: 'POST',
                      body: JSON.stringify({
                        currency: 'BTC',
                        amount: parseFloat(withdrawAmount),
                        toAddress: walletAddress
                      }),
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                      }
                    });
                    
                    if (!response.ok) {throw new Error('Failed to withdraw');}
                    
                    toast({
                      title: "Вывод оформлен",
                      description: `Выведено ${withdrawAmount} BTC`,
                    });
                    
                    setWithdrawDialogOpen(false);
                    setWithdrawAmount('');
                    setWalletAddress('');
                    queryClient.invalidateQueries({ queryKey: ['/api/admin/crypto-portfolio'] });
                  } catch (_error) {
                    toast({
                      title: "Ошибка вывода",
                      description: "Не удалось вывести средства",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Вывести
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </main>
      </div>
    </div>
  );
}