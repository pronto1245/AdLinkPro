import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight,
  CheckCircle, XCircle, Clock, Edit, Plus, Wallet, CreditCard, 
  Building, Smartphone, Banknote, Globe, Bitcoin, Eye, Download
} from 'lucide-react';
import { formatCurrency, getStatusBadgeConfig, FinancialTransaction } from '@/utils/financialUtils';

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: number | string;
  type?: 'currency' | 'percent' | 'number';
  trend?: number;
  icon?: React.ComponentType<{ className?: string }>;
  colorScheme?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  alert?: boolean;
}

export const FinancialMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  type = 'currency',
  trend,
  icon: Icon = DollarSign,
  colorScheme = 'blue',
  alert = false
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (type) {
      case 'currency':
        return formatCurrency(val);
      case 'percent':
        return `${val.toFixed(2)}%`;
      case 'number':
        return val.toLocaleString();
      default:
        return val.toString();
    }
  };

  const colorClasses = {
    green: 'border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-background',
    blue: 'border-l-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-background',
    purple: 'border-l-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-background',
    orange: 'border-l-orange-500 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-background',
    red: 'border-l-red-500 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-background'
  };

  const iconColors = {
    green: 'text-green-600',
    blue: 'text-blue-600', 
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };

  return (
    <Card className={`border-l-4 ${colorClasses[colorScheme]} ${alert ? 'border-red-200 dark:border-red-800' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${colorScheme === 'green' ? 'text-green-700 dark:text-green-300' : 
                                                  colorScheme === 'blue' ? 'text-blue-700 dark:text-blue-300' :
                                                  colorScheme === 'purple' ? 'text-purple-700 dark:text-purple-300' :
                                                  colorScheme === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                                                  'text-red-700 dark:text-red-300'}`}>
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${alert ? 'text-red-500' : iconColors[colorScheme]}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorScheme === 'green' ? 'text-green-700 dark:text-green-300' : 
                                             colorScheme === 'blue' ? 'text-blue-700 dark:text-blue-300' :
                                             colorScheme === 'purple' ? 'text-purple-700 dark:text-purple-300' :
                                             colorScheme === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                                             'text-red-700 dark:text-red-300'} ${alert ? 'text-red-600 dark:text-red-400' : ''}`}>
          {formatValue(value)}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Status Badge Component
interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const FinancialStatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = getStatusBadgeConfig(status);
  
  const getIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Badge variant={config.variant} className={`${config.color} flex items-center gap-1 ${className}`}>
      {getIcon(status)}
      {config.label}
    </Badge>
  );
};

// Transaction Type Icon Component
interface TransactionIconProps {
  type: string;
  className?: string;
}

export const TransactionTypeIcon: React.FC<TransactionIconProps> = ({ type, className = "w-4 h-4" }) => {
  const getIcon = () => {
    switch (type) {
      case 'deposit':
        return <ArrowUpRight className={`${className} text-green-600`} />;
      case 'payout':
        return <ArrowDownRight className={`${className} text-red-600`} />;
      case 'commission':
        return <TrendingUp className={`${className} text-green-500`} />;
      case 'bonus':
        return <Plus className={`${className} text-purple-500`} />;
      case 'refund':
        return <ArrowDownRight className={`${className} text-blue-500`} />;
      case 'adjustment':
        return <Edit className={`${className} text-blue-600`} />;
      case 'hold':
        return <Clock className={`${className} text-yellow-600`} />;
      case 'cancel':
        return <XCircle className={`${className} text-gray-600`} />;
      default:
        return <DollarSign className={`${className} text-gray-600`} />;
    }
  };

  return getIcon();
};

// Payment Method Icon Component
interface PaymentMethodIconProps {
  method: string;
  className?: string;
}

export const PaymentMethodIcon: React.FC<PaymentMethodIconProps> = ({ method, className = "w-4 h-4" }) => {
  const getIcon = () => {
    const normalizedMethod = method?.toLowerCase() || '';
    
    switch (normalizedMethod) {
      case 'usdt':
        return <Bitcoin className={`${className} text-green-600`} />;
      case 'btc':
        return <Bitcoin className={`${className} text-orange-600`} />;
      case 'eth':
        return <Bitcoin className={`${className} text-blue-600`} />;
      case 'crypto':
        return <Bitcoin className={`${className} text-purple-600`} />;
      case 'wire':
      case 'bank':
      case 'bank_transfer':
        return <Building className={`${className} text-blue-600`} />;
      case 'card':
      case 'bank_card':
        return <CreditCard className={`${className} text-green-600`} />;
      case 'payeer':
        return <Wallet className={`${className} text-red-600`} />;
      case 'qiwi':
        return <Smartphone className={`${className} text-orange-600`} />;
      case 'yumoney':
        return <Banknote className={`${className} text-purple-600`} />;
      case 'paypal':
        return <CreditCard className={`${className} text-blue-600`} />;
      case 'wise':
        return <Building className={`${className} text-green-600`} />;
      default:
        return <Globe className={`${className} text-gray-600`} />;
    }
  };

  return getIcon();
};

// Export Buttons Component
interface ExportButtonsProps {
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onExportJSON?: () => void;
  loading?: boolean;
  className?: string;
}

export const FinancialExportButtons: React.FC<ExportButtonsProps> = ({
  onExportCSV,
  onExportExcel,
  onExportJSON,
  loading = false,
  className = ''
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {onExportCSV && (
        <Button 
          variant="outline" 
          onClick={onExportCSV}
          disabled={loading}
          title="Export as CSV"
        >
          <Download className="h-4 w-4 mr-2" />
          CSV
        </Button>
      )}
      {onExportExcel && (
        <Button 
          variant="outline" 
          onClick={onExportExcel}
          disabled={loading}
          title="Export as Excel"
        >
          <Download className="h-4 w-4 mr-2" />
          Excel
        </Button>
      )}
      {onExportJSON && (
        <Button 
          variant="outline" 
          onClick={onExportJSON}
          disabled={loading}
          title="Export as JSON"
        >
          <Download className="h-4 w-4 mr-2" />
          JSON
        </Button>
      )}
    </div>
  );
};

// Empty State Component
interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const FinancialEmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="text-center py-12">
      <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
};