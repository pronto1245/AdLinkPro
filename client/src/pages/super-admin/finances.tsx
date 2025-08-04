import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { queryClient } from '@/lib/queryClient';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  Search, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const { token } = useAuth();

  const { data: finances } = useQuery({
    queryKey: ['/api/admin/finances'],
    queryFn: async () => {
      const response = await fetch('/api/admin/finances', {
        headers: token,
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
  });

  // Filter transactions based on search term and filters
  const transactions = allTransactions?.filter((transaction: any) => {
    const matchesSearch = searchTerm === '' || 
      transaction.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    const transactionDate = new Date(transaction.createdAt);
    const matchesStartDate = !startDate || transactionDate >= startDate;
    const matchesEndDate = !endDate || transactionDate <= endDate;
    
    return matchesSearch && matchesStatus && matchesType && matchesStartDate && matchesEndDate;
  }) || [];

    queryKey: ['/api/admin/financial-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/financial-metrics', {
        headers: token,
      });
      if (!response.ok) throw new Error('Failed to fetch financial metrics');
      return response.json();
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, status }: { transactionId: string; status: string }) => {
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer $token`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update transaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/finances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/financial-metrics'] });
    },
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'commission': return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'payout': return <ArrowDownLeft className="w-4 h-4 text-red-600" />;
      case 'bonus': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'penalty': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const metrics = [
    {
      label: 'total_revenue',
      value: `$${financialMetrics?.totalRevenue || '0'}`,
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: <DollarSign className="w-5 h-5" />,
      iconBg: 'bg-green-50',
    },
    {
      label: 'pending_payouts',
      value: `$${financialMetrics?.pendingPayouts || '0'}`,
      change: '+8.2%',
      changeType: 'increase' as const,
      icon: <Wallet className="w-5 h-5" />,
      iconBg: 'bg-blue-50',
    },
    {
      label: 'total_commissions',
      value: `$${financialMetrics?.totalCommissions || '0'}`,
      change: '+15.3%',
      changeType: 'increase' as const,
      icon: <TrendingUp className="w-5 h-5" />,
      iconBg: 'bg-purple-50',
    },
    {
      label: 'failed_transactions',
      value: financialMetrics?.failedTransactions?.toString() || '0',
      change: '-2.1%',
      changeType: 'decrease' as const,
      icon: <AlertCircle className="w-5 h-5" />,
      iconBg: 'bg-red-50',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <Header title="Loading..." />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loading...</h1>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {metrics.map((metric, index) => (
                <Card key={index} data-testid={`metric-card-${metric.label}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {metric.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid={`metric-value-${metric.label}`}>
                          {metric.value}
                        </p>
                        <p className={`text-sm flex items-center gap-1 mt-1 ${
                          metric.changeType === 'increase' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {metric.changeType === 'increase' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {metric.change}
                        </p>
                      </div>
                      <div className={`${metric.iconBg} p-3 rounded-lg`}>
                        {metric.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Поиск по пользователю, ID, типу..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-transactions"
                      title="Поиск транзакций"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger>
                    <SelectTrigger data-testid="select-filter-status" title="Фильтр по статусу">
                      <SelectValue placeholder="Loading..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Loading...</SelectItem>
                      <SelectItem value="completed">Loading...</SelectItem>
                      <SelectItem value="pending">Loading...</SelectItem>
                      <SelectItem value="processing">Loading...</SelectItem>
                      <SelectItem value="failed">Loading...</SelectItem>
                      <SelectItem value="cancelled">Loading...</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger>
                    <SelectTrigger data-testid="select-filter-type" title="Фильтр по типу">
                      <SelectValue placeholder="Loading..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Loading...</SelectItem>
                      <SelectItem value="commission">Loading...</SelectItem>
                      <SelectItem value="payout">Loading...</SelectItem>
                      <SelectItem value="bonus">Loading...</SelectItem>
                      <SelectItem value="penalty">Loading...</SelectItem>
                    </SelectContent>
                  </Select>

                  <DatePicker
                    selected={startDate}
                    onSelect={setStartDate}
                  />

                  <DatePicker
                    selected={endDate}
                    onSelect={setEndDate}
                  />

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterType('all');
                      setStartDate(undefined);
                      setEndDate(undefined);
                    }}
                    data-testid="button-clear-filters"
                    title="Очистить фильтры"
                  >
                    Loading...
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  (Users)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loading...</TableHead>
                        <TableHead>Loading...</TableHead>
                        <TableHead>Loading...</TableHead>
                        <TableHead>Loading...</TableHead>
                        <TableHead>Loading...</TableHead>
                        <TableHead>Loading...</TableHead>
                        <TableHead>Loading...</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions?.map((transaction: any) => (
                        <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                          <TableCell className="font-mono text-sm" data-testid={`text-id-${transaction.id}`}>
                            {transaction.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                {transaction.user?.firstName?.charA0 || transaction.user?.username?.charA0 || 'U'}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white" data-testid={`text-username-${transaction.id}`}>
                                  {transaction.user?.username || 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {transaction.user?.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(transaction.type)}
                              <span className="capitalize" data-testid={`text-type-${transaction.id}`}>
                                {transaction.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium" data-testid={`text-amount-${transaction.id}`}>
                              {transaction.amount > 0 ? '+' : ''}${transaction.amount} {transaction.currency}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusBadgeColor(transaction.status)} flex items-center gap-1 w-fit`} data-testid={`status-${transaction.id}`}>
                              {getStatusIcon(transaction.status)}
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-date-${transaction.id}`}>
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {transaction.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateTransactionMutation.mutate({
                                      transactionId: transaction.id,
                                      status: 'completed'
                                    })}
                                    disabled={updateTransactionMutation.isPending}
                                    data-testid={`button-approve-${transaction.id}`}
                                  >
                                    Loading...
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateTransactionMutation.mutate({
                                      transactionId: transaction.id,
                                      status: 'failed'
                                    })}
                                    disabled={updateTransactionMutation.isPending}
                                    data-testid={`button-reject-${transaction.id}`}
                                  >
                                    Loading...
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}