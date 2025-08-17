import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  History,
  RefreshCw,
  Eye,
  Copy,
} from "lucide-react";
import { format } from "date-fns";

// Types
interface Balance {
  balance: number;
  holdAmount: number;
  availableBalance: number;
  pendingPayouts: number;
  currency: string;
}

interface PayoutRequest {
  id: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  walletAddress?: string;
  walletNetwork?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed' | 'cancelled';
  partnerNote?: string;
  adminNotes?: string;
  rejectionReason?: string;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  processedAt?: string;
}

interface PayoutFormData {
  amount: number;
  currency: string;
  paymentMethod: string;
  walletAddress?: string;
  walletNetwork?: string;
  bankDetails?: {
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    accountName?: string;
    iban?: string;
    swift?: string;
  };
  partnerNote?: string;
}

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', type: 'fiat' },
  { value: 'EUR', label: 'EUR (€)', type: 'fiat' },
  { value: 'BTC', label: 'Bitcoin (BTC)', type: 'crypto' },
  { value: 'ETH', label: 'Ethereum (ETH)', type: 'crypto' },
  { value: 'USDT', label: 'Tether (USDT)', type: 'crypto' },
  { value: 'USDC', label: 'USD Coin (USDC)', type: 'crypto' },
  { value: 'TRX', label: 'TRON (TRX)', type: 'crypto' },
];

const PAYMENT_METHODS = [
  { value: 'crypto', label: 'Cryptocurrency', supportedCurrencies: ['BTC', 'ETH', 'USDT', 'USDC', 'TRX'] },
  { value: 'bank_transfer', label: 'Bank Transfer', supportedCurrencies: ['USD', 'EUR'] },
  { value: 'paypal', label: 'PayPal', supportedCurrencies: ['USD', 'EUR'] },
  { value: 'stripe', label: 'Stripe', supportedCurrencies: ['USD', 'EUR'] },
];

const WALLET_NETWORKS = {
  ETH: ['ETH', 'ERC20'],
  USDT: ['ETH', 'TRC20', 'BEP20'],
  USDC: ['ETH', 'TRC20', 'BEP20'],
  TRX: ['TRC20'],
  BTC: ['BTC'],
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'approved':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'pending':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    case 'rejected':
    case 'failed':
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'approved':
    case 'processing':
      return <Clock className="h-4 w-4" />;
    case 'rejected':
    case 'failed':
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export default function PayoutRequests() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<PayoutFormData>({
    amount: 0,
    currency: 'USD',
    paymentMethod: 'crypto',
    partnerNote: '',
  });

  // Fetch partner balance
  const { data: balance, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['affiliate', 'balance'],
    queryFn: async (): Promise<Balance> => {
      const response = await fetch('/api/affiliate/balance', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      return response.json();
    },
  });

  // Fetch payout requests
  const { data: payoutRequests, isLoading: isRequestsLoading, refetch } = useQuery({
    queryKey: ['affiliate', 'payout-requests', statusFilter],
    queryFn: async (): Promise<{ requests: PayoutRequest[], pagination: any }> => {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
      });
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/affiliate/payout-requests?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch payout requests');
      }
      return response.json();
    },
  });

  // Create payout request mutation
  const createPayoutMutation = useMutation({
    mutationFn: async (data: PayoutFormData) => {
      const response = await fetch('/api/affiliate/payout-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payout request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate', 'payout-requests'] });
      queryClient.invalidateQueries({ queryKey: ['affiliate', 'balance'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Payout request created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      amount: 0,
      currency: 'USD',
      paymentMethod: 'crypto',
      partnerNote: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (balance && formData.amount > balance.availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `Available balance: ${balance.availableBalance} ${balance.currency}`,
        variant: "destructive",
      });
      return;
    }

    // Validate crypto wallet address
    if (formData.paymentMethod === 'crypto' && formData.currency !== 'USD' && formData.currency !== 'EUR') {
      if (!formData.walletAddress) {
        toast({
          title: "Validation Error",
          description: "Wallet address is required for crypto payments",
          variant: "destructive",
        });
        return;
      }
    }

    createPayoutMutation.mutate(formData);
  };

  const selectedCurrency = CURRENCIES.find(c => c.value === formData.currency);
  const availablePaymentMethods = PAYMENT_METHODS.filter(pm => 
    pm.supportedCurrencies.includes(formData.currency)
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payout Requests</h1>
          <p className="text-muted-foreground">Manage your payout requests and track payments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Payout Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Payout Request</DialogTitle>
              <DialogDescription>
                Request a payout from your available balance
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePaymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.paymentMethod === 'crypto' && selectedCurrency?.type === 'crypto' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Wallet Address *</Label>
                    <Input
                      id="walletAddress"
                      value={formData.walletAddress || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
                      placeholder="Enter wallet address"
                      required
                    />
                  </div>

                  {WALLET_NETWORKS[formData.currency as keyof typeof WALLET_NETWORKS] && (
                    <div className="space-y-2">
                      <Label htmlFor="walletNetwork">Network</Label>
                      <Select 
                        value={formData.walletNetwork || ''} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, walletNetwork: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                        <SelectContent>
                          {WALLET_NETWORKS[formData.currency as keyof typeof WALLET_NETWORKS]?.map((network) => (
                            <SelectItem key={network} value={network}>
                              {network}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="partnerNote">Note (Optional)</Label>
                <Textarea
                  id="partnerNote"
                  value={formData.partnerNote || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, partnerNote: e.target.value }))}
                  placeholder="Add any additional notes or comments"
                  rows={3}
                />
              </div>

              {balance && (
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Available Balance:</span>
                    <span className="font-medium">{balance.availableBalance} {balance.currency}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Pending Payouts:</span>
                    <span>{balance.pendingPayouts} {balance.currency}</span>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPayoutMutation.isPending}>
                  {createPayoutMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Create Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Account Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isBalanceLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : balance ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">{balance.balance} {balance.currency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-xl font-semibold text-green-600">{balance.availableBalance} {balance.currency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-xl font-semibold text-yellow-600">{balance.pendingPayouts} {balance.currency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Hold</p>
                <p className="text-xl font-semibold text-red-600">{balance.holdAmount} {balance.currency}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Failed to load balance</p>
          )}
        </CardContent>
      </Card>

      {/* Payout Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Payout History</CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isRequestsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : payoutRequests?.requests.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutRequests.requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.amount}</TableCell>
                    <TableCell>{request.currency}</TableCell>
                    <TableCell className="capitalize">{request.paymentMethod.replace('_', ' ')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payout requests yet</p>
              <p className="text-sm text-muted-foreground">Create your first payout request to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payout Request Details</DialogTitle>
            <DialogDescription>
              Request ID: {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium">{selectedRequest.amount} {selectedRequest.currency}</p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p className="font-medium capitalize">{selectedRequest.paymentMethod.replace('_', ' ')}</p>
                </div>
              </div>

              {selectedRequest.walletAddress && (
                <div>
                  <Label>Wallet Address</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{selectedRequest.walletAddress}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedRequest.walletAddress!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedRequest.walletNetwork && (
                    <p className="text-sm text-muted-foreground">Network: {selectedRequest.walletNetwork}</p>
                  )}
                </div>
              )}

              <div>
                <Label>Status</Label>
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {getStatusIcon(selectedRequest.status)}
                  <span className="ml-1 capitalize">{selectedRequest.status}</span>
                </Badge>
              </div>

              {selectedRequest.partnerNote && (
                <div>
                  <Label>Your Note</Label>
                  <p>{selectedRequest.partnerNote}</p>
                </div>
              )}

              {selectedRequest.adminNotes && (
                <div>
                  <Label>Admin Notes</Label>
                  <p>{selectedRequest.adminNotes}</p>
                </div>
              )}

              {selectedRequest.rejectionReason && (
                <div>
                  <Label>Rejection Reason</Label>
                  <p className="text-red-600">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <Label>Created</Label>
                  <p>{format(new Date(selectedRequest.createdAt), 'PPpp')}</p>
                </div>
                {selectedRequest.processedAt && (
                  <div>
                    <Label>Processed</Label>
                    <p>{format(new Date(selectedRequest.processedAt), 'PPpp')}</p>
                  </div>
                )}
              </div>

              {selectedRequest.invoiceId && (
                <div className="bg-muted p-3 rounded">
                  <Label>Invoice Generated</Label>
                  <p className="text-sm">Invoice ID: {selectedRequest.invoiceId}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}