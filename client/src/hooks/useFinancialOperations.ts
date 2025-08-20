import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FinancialError {
  message: string;
  code?: string;
  field?: string;
}

interface FinancialOperationResult<T = any> {
  data?: T;
  error?: FinancialError;
  success: boolean;
}

export const useFinancialOperations = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      successMessage?: string;
      errorMessage?: string;
      showToast?: boolean;
    } = {}
  ): Promise<FinancialOperationResult<T>> => {
    const { 
      successMessage = 'Operation completed successfully',
      errorMessage = 'Operation failed',
      showToast = true 
    } = options;

    setIsLoading(true);
    try {
      const data = await operation();
      
      if (showToast) {
        toast({
          title: 'Success',
          description: successMessage,
          variant: 'default'
        });
      }
      
      return { data, success: true };
    } catch (error: any) {
      const financialError: FinancialError = {
        message: error?.message || errorMessage,
        code: error?.code,
        field: error?.field
      };
      
      if (showToast) {
        toast({
          title: 'Error',
          description: financialError.message,
          variant: 'destructive'
        });
      }
      
      return { error: financialError, success: false };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Specific financial operations
  const processTransaction = useCallback(async (
    transactionId: string, 
    action: 'approve' | 'reject' | 'cancel',
    note?: string
  ) => {
    return handleOperation(
      () => fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: action, note })
      }).then(res => {
        if (!res.ok) throw new Error(`Failed to ${action} transaction`);
        return res.json();
      }),
      {
        successMessage: `Transaction ${action}d successfully`,
        errorMessage: `Failed to ${action} transaction`
      }
    );
  }, [handleOperation]);

  const processPayout = useCallback(async (
    payoutId: string,
    action: 'approve' | 'reject' | 'complete',
    note?: string
  ) => {
    return handleOperation(
      () => fetch(`/api/admin/payouts/${payoutId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ note })
      }).then(res => {
        if (!res.ok) throw new Error(`Failed to ${action} payout`);
        return res.json();
      }),
      {
        successMessage: `Payout ${action}d successfully`,
        errorMessage: `Failed to ${action} payout`
      }
    );
  }, [handleOperation]);

  const createWithdrawal = useCallback(async (data: {
    amount: number;
    method: string;
    details: string;
  }) => {
    return handleOperation(
      () => fetch('/api/partner/finance/withdrawal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create withdrawal request');
        return res.json();
      }),
      {
        successMessage: 'Withdrawal request submitted successfully',
        errorMessage: 'Failed to submit withdrawal request'
      }
    );
  }, [handleOperation]);

  const exportFinancialData = useCallback(async (
    type: 'transactions' | 'payouts' | 'deposits',
    format: 'csv' | 'xlsx' = 'csv',
    filters: Record<string, any> = {}
  ) => {
    return handleOperation(
      async () => {
        const params = new URLSearchParams({
          format,
          type,
          ...filters
        });
        
        const response = await fetch(`/api/admin/finance/export?${params}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to export data');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return { exported: true };
      },
      {
        successMessage: `${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`,
        errorMessage: 'Failed to export data'
      }
    );
  }, [handleOperation]);

  const validateFinancialData = useCallback((data: {
    amount?: string | number;
    currency?: string;
    paymentMethod?: string;
    partnerId?: string;
  }): string[] => {
    const errors: string[] = [];
    
    if (data.amount !== undefined) {
      const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
      if (isNaN(amount) || amount <= 0) {
        errors.push('Please enter a valid amount');
      }
    }
    
    if (data.currency && !['USD', 'EUR', 'USDT', 'BTC'].includes(data.currency)) {
      errors.push('Please select a valid currency');
    }
    
    if (data.paymentMethod && !['bank', 'crypto', 'paypal', 'wise'].includes(data.paymentMethod)) {
      errors.push('Please select a valid payment method');
    }
    
    if (data.partnerId && !data.partnerId.trim()) {
      errors.push('Please select a partner');
    }
    
    return errors;
  }, []);

  return {
    isLoading,
    handleOperation,
    processTransaction,
    processPayout, 
    createWithdrawal,
    exportFinancialData,
    validateFinancialData
  };
};