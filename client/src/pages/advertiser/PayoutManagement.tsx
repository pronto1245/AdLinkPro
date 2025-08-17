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
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  MoreHorizontal,
  Eye,
  Check,
  X,
  RefreshCw,
  Download,
  Settings,
  CreditCard,
  Zap,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

// Types
interface PayoutRequest {
  id: string;
  partnerId: string;
  partnerUsername: string;
  partnerEmail: string;
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
  gatewayType?: string;
  gatewayTransactionId?: string;
  processedAmount?: string;
  gatewayFee?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  processedAt?: string;
  rejectedAt?: string;
}

interface PayoutSummary {
  totalRequests: number;
  totalAmount: number;
  averageAmount: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
  totalAmount: number;
}

interface PayoutData {
  requests: PayoutRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: PayoutSummary;
  statusBreakdown: StatusBreakdown[];
}

interface GatewayConfig {
  id: string;
  gatewayType: 'stripe' | 'coinbase' | 'binance' | 'manual';
  isActive: boolean;
  isDefault: boolean;
  supportedCurrencies: string[];
  minimumAmount?: string;
  maximumAmount?: string;
  feePercentage?: string;
  fixedFee?: string;
  processingTime?: string;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

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

export default function AdvertiserPayouts() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'process' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('requests');

  // Fetch payout requests
  const { data: payoutData, isLoading: isRequestsLoading, refetch } = useQuery({
    queryKey: ['advertiser', 'payout-requests', statusFilter],
    queryFn: async (): Promise<PayoutData> => {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/advertiser/payout-requests?${params}`, {
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

  // Fetch gateway configurations
  const { data: gatewayConfigs, isLoading: isGatewayLoading } = useQuery({
    queryKey: ['advertiser', 'gateway-configs'],
    queryFn: async (): Promise<{ configs: GatewayConfig[] }> => {
      const response = await fetch('/api/advertiser/gateway-configs', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch gateway configurations');
      }
      return response.json();
    },
  });

  // Update payout status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status, adminNotes, rejectionReason }: {
      requestId: string;
      status: string;
      adminNotes?: string;
      rejectionReason?: string;
    }) => {
      const response = await fetch(`/api/advertiser/payout-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, adminNotes, rejectionReason }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update payout request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertiser', 'payout-requests'] });
      toast({
        title: "Success",
        description: "Payout request updated successfully",
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

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ requestIds, action, adminNotes, rejectionReason }: {
      requestIds: string[];
      action: string;
      adminNotes?: string;
      rejectionReason?: string;
    }) => {
      const response = await fetch('/api/advertiser/payout-requests/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ requestIds, action, adminNotes, rejectionReason }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to perform bulk action');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertiser', 'payout-requests'] });
      setSelectedRequests([]);
      setBulkAction(null);
      setActionNotes('');
      setRejectionReason('');
      toast({
        title: "Success",
        description: "Bulk action completed successfully",
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

  const handleStatusUpdate = (requestId: string, status: string, adminNotes?: string, rejectionReason?: string) => {
    updateStatusMutation.mutate({ requestId, status, adminNotes, rejectionReason });
    setSelectedRequest(null);
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedRequests.length === 0) return;
    
    bulkActionMutation.mutate({
      requestIds: selectedRequests,
      action: bulkAction,
      adminNotes: actionNotes || undefined,
      rejectionReason: bulkAction === 'reject' ? rejectionReason : undefined,
    });
  };

  const toggleRequestSelection = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const toggleSelectAll = () => {
    if (!payoutData?.requests) return;
    
    if (selectedRequests.length === payoutData.requests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(payoutData.requests.map(r => r.id));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payout Management</h1>
          <p className="text-muted-foreground">Manage partner payout requests and configure payment gateways</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">Payout Requests</TabsTrigger>
          <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">
                      {isRequestsLoading ? <Skeleton className="h-8 w-16" /> : payoutData?.summary.totalRequests || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold">
                      {isRequestsLoading ? <Skeleton className="h-8 w-20" /> : `$${payoutData?.summary.totalAmount.toFixed(2) || '0.00'}`}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Amount</p>
                    <p className="text-2xl font-bold">
                      {isRequestsLoading ? <Skeleton className="h-8 w-20" /> : `$${payoutData?.summary.averageAmount.toFixed(2) || '0.00'}`}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">
                      {isRequestsLoading ? <Skeleton className="h-8 w-12" /> : 
                        payoutData?.statusBreakdown.find(s => s.status === 'pending')?.count || 0}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Bulk Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4 items-center">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
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
                  
                  {selectedRequests.length > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setBulkAction('approve')}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve ({selectedRequests.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setBulkAction('reject')}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject ({selectedRequests.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setBulkAction('process')}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Process ({selectedRequests.length})
                      </Button>
                    </div>
                  )}
                </div>
                
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Payout Requests Table */}
              {isRequestsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : payoutData?.requests.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRequests.length === payoutData.requests.length && payoutData.requests.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutData.requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRequests.includes(request.id)}
                            onCheckedChange={() => toggleRequestSelection(request.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.partnerUsername}</p>
                            <p className="text-sm text-muted-foreground">{request.partnerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.amount} {request.currency}
                        </TableCell>
                        <TableCell className="capitalize">
                          {request.paymentMethod.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setSelectedRequest(request)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {request.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusUpdate(request.id, 'approved')}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusUpdate(request.id, 'rejected', '', 'Rejected by admin')}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {request.status === 'approved' && (
                                <DropdownMenuItem 
                                  onClick={() => handleStatusUpdate(request.id, 'processing')}
                                >
                                  <Zap className="h-4 w-4 mr-2" />
                                  Process
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No payout requests found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gateways" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Configurations</CardTitle>
              <CardDescription>
                Configure and manage payment gateways for automated payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isGatewayLoading ? (
                  [...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))
                ) : gatewayConfigs?.configs.length ? (
                  gatewayConfigs.configs.map((config) => (
                    <Card key={config.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="capitalize">{config.gatewayType}</CardTitle>
                          <Badge variant={config.isActive ? "default" : "secondary"}>
                            {config.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Currencies:</span>
                            <p>{config.supportedCurrencies.join(', ')}</p>
                          </div>
                          {config.processingTime && (
                            <div>
                              <span className="text-muted-foreground">Processing:</span>
                              <p>{config.processingTime}</p>
                            </div>
                          )}
                          {config.isDefault && (
                            <Badge variant="outline" className="w-fit">
                              Default Gateway
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No payment gateways configured</p>
                    <Button className="mt-4">Add Gateway</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {payoutData?.statusBreakdown.map((status) => (
                  <div key={status.status} className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold">{status.count}</p>
                    <p className="text-sm text-muted-foreground capitalize">{status.status}</p>
                    <p className="text-sm font-medium">${status.totalAmount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payout Request Details</DialogTitle>
            <DialogDescription>
              Request ID: {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Partner Information</Label>
                    <div className="mt-1">
                      <p className="font-medium">{selectedRequest.partnerUsername}</p>
                      <p className="text-sm text-muted-foreground">{selectedRequest.partnerEmail}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Amount & Currency</Label>
                    <p className="text-xl font-bold">{selectedRequest.amount} {selectedRequest.currency}</p>
                  </div>

                  <div>
                    <Label>Payment Method</Label>
                    <p className="capitalize">{selectedRequest.paymentMethod.replace('_', ' ')}</p>
                  </div>

                  {selectedRequest.walletAddress && (
                    <div>
                      <Label>Wallet Address</Label>
                      <p className="font-mono text-sm break-all">{selectedRequest.walletAddress}</p>
                      {selectedRequest.walletNetwork && (
                        <p className="text-sm text-muted-foreground">Network: {selectedRequest.walletNetwork}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1 capitalize">{selectedRequest.status}</span>
                    </Badge>
                  </div>

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

                  {selectedRequest.gatewayType && (
                    <div>
                      <Label>Payment Gateway</Label>
                      <p className="capitalize">{selectedRequest.gatewayType}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.partnerNote && (
                <div>
                  <Label>Partner Note</Label>
                  <p className="mt-1 p-3 bg-muted rounded">{selectedRequest.partnerNote}</p>
                </div>
              )}

              {selectedRequest.adminNotes && (
                <div>
                  <Label>Admin Notes</Label>
                  <p className="mt-1 p-3 bg-muted rounded">{selectedRequest.adminNotes}</p>
                </div>
              )}

              {selectedRequest.rejectionReason && (
                <div>
                  <Label>Rejection Reason</Label>
                  <p className="mt-1 p-3 bg-red-50 text-red-800 rounded">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected', '', 'Rejected by admin')}
                    disabled={updateStatusMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={!!bulkAction} onOpenChange={() => setBulkAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Bulk {bulkAction === 'approve' ? 'Approve' : bulkAction === 'reject' ? 'Reject' : 'Process'} Requests
            </DialogTitle>
            <DialogDescription>
              This action will be applied to {selectedRequests.length} selected requests.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {bulkAction === 'reject' && (
              <div>
                <Label>Rejection Reason *</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection"
                  required
                />
              </div>
            )}
            <div>
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Add any additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAction(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              disabled={bulkActionMutation.isPending || (bulkAction === 'reject' && !rejectionReason.trim())}
            >
              {bulkActionMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Confirm {bulkAction === 'approve' ? 'Approval' : bulkAction === 'reject' ? 'Rejection' : 'Processing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}