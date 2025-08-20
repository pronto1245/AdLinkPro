/**
 * Shared financial utilities for frontend components
 */

export interface FinancialTransaction {
  id: string;
  type: 'deposit' | 'payout' | 'commission' | 'refund' | 'bonus' | 'adjustment';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'cancelled' | 'failed' | 'processing';
  description?: string;
  paymentMethod?: string;
  createdAt: string;
  processedAt?: string;
  txHash?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
}

export interface PayoutRequest {
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

export interface FinancialMetrics {
  platformBalance: number;
  advertiserRevenue: number;
  partnerPayouts: number;
  platformCommission: number;
  paidOut: number;
  onHold: number;
  pendingPayouts: number;
  totalPlatformRevenue: number;
  averageCommission: number;
  profitMargin: string | number;
  currencyDistribution: Array<{ name: string; value: number }>;
  paymentMethods: Array<{ name: string; amount: number; count: number }>;
}

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  if (isNaN(amount)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Get transaction status badge configuration
 */
export const getStatusBadgeConfig = (status: string) => {
  const configs = {
    completed: { 
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', 
      label: 'Completed',
      variant: 'default' as const
    },
    pending: { 
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', 
      label: 'Pending',
      variant: 'secondary' as const
    },
    processing: { 
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', 
      label: 'Processing',
      variant: 'outline' as const
    },
    failed: { 
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', 
      label: 'Failed',
      variant: 'destructive' as const
    },
    cancelled: { 
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', 
      label: 'Cancelled',
      variant: 'outline' as const
    },
    approved: { 
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', 
      label: 'Approved',
      variant: 'default' as const
    },
    rejected: { 
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', 
      label: 'Rejected',
      variant: 'destructive' as const
    }
  };

  return configs[status as keyof typeof configs] || configs.pending;
};

/**
 * Get transaction type icon class
 */
export const getTransactionTypeIcon = (type: string): string => {
  const icons = {
    deposit: 'ArrowUpRight',
    payout: 'ArrowDownRight', 
    commission: 'TrendingUp',
    refund: 'ArrowDownRight',
    bonus: 'Plus',
    adjustment: 'Edit',
    hold: 'Clock',
    cancel: 'XCircle',
    correction: 'Edit'
  };
  
  return icons[type as keyof typeof icons] || 'DollarSign';
};

/**
 * Get payment method icon
 */
export const getPaymentMethodIcon = (method: string): string => {
  const icons = {
    USDT: 'Bitcoin',
    BTC: 'Bitcoin',
    ETH: 'Bitcoin', 
    Crypto: 'Bitcoin',
    Wire: 'Building',
    Card: 'CreditCard',
    Payeer: 'Wallet',
    Qiwi: 'Smartphone',
    YuMoney: 'Banknote',
    bank: 'Building',
    crypto: 'Bitcoin',
    paypal: 'CreditCard',
    wise: 'Building'
  };
  
  return icons[method as keyof typeof icons] || 'Globe';
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Get date range for period filter
 */
export const getDateRangeForPeriod = (period: string): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }
  
  return { startDate, endDate };
};

/**
 * Format number with locale-specific formatting
 */
export const formatNumber = (num: number, decimals = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

/**
 * Format percentage with sign
 */
export const formatPercentage = (percentage: number, decimals = 1): string => {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(decimals)}%`;
};

/**
 * Export data as CSV
 */
export const exportToCSV = (data: any[], filename: string, headers: string[]) => {
  const csvContent = [
    headers.join(','),
    ...data.map(item => 
      headers.map(header => {
        const key = header.toLowerCase().replace(' ', '_');
        const value = item[key] || '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Validate financial form data
 */
export const validateFinancialForm = (data: {
  amount?: string;
  currency?: string;
  paymentMethod?: string;
  partnerId?: string;
}): string[] => {
  const errors: string[] = [];
  
  if (!data.amount || isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
    errors.push('Please enter a valid amount');
  }
  
  if (!data.currency) {
    errors.push('Please select a currency');
  }
  
  if (!data.paymentMethod) {
    errors.push('Please select a payment method');
  }
  
  if (!data.partnerId) {
    errors.push('Please select a partner');
  }
  
  return errors;
};

/**
 * Generate mock financial data for testing
 */
export const generateMockFinancialData = (count = 10): FinancialTransaction[] => {
  const types = ['payout', 'commission', 'bonus', 'refund'];
  const statuses = ['completed', 'pending', 'processing'];
  const methods = ['USDT', 'bank', 'paypal', 'crypto'];
  const currencies = ['USD', 'EUR', 'USDT'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `ft-${Date.now()}-${i}`,
    type: types[Math.floor(Math.random() * types.length)] as any,
    amount: Math.floor(Math.random() * 5000) + 100,
    currency: currencies[Math.floor(Math.random() * currencies.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)] as any,
    description: `Transaction ${i + 1}`,
    paymentMethod: methods[Math.floor(Math.random() * methods.length)],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: `user-${i}`,
      username: `user${i}`,
      email: `user${i}@example.com`,
      role: 'affiliate'
    }
  }));
};