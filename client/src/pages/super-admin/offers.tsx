import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const createOfferSchema = z.object({
  name: z.string().min(1, 'Offer name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  advertiserId: z.string().min(1, 'Advertiser is required'),
  payout: z.string().min(1, 'Payout is required'),
  payoutType: z.enum(['cpa', 'cps', 'cpl']),
  currency: z.string().default('USD'),
  landingPageUrl: z.string().url('Invalid URL').optional(),
  trackingUrl: z.string().url('Invalid URL').optional(),
  restrictions: z.string().optional(),
  kycRequired: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
});

type CreateOfferData = z.infer<typeof createOfferSchema>;

export default function SuperAdminOffers() {
  const [open, setOpen] = useState(false);
  const { token } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateOfferData>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      advertiserId: '',
      payout: '',
      payoutType: 'cpa',
      currency: 'USD',
      landingPageUrl: '',
      trackingUrl: '',
      restrictions: '',
      kycRequired: false,
      isPrivate: false,
    },
  });

  const { data: offers = [], isLoading: offersLoading } = useQuery({
    queryKey: ['/api/offers'],
    queryFn: async () => {
      const response = await fetch('/api/offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json();
    },
  });

  const { data: advertisers = [] } = useQuery({
    queryKey: ['/api/users', 'advertiser'],
    queryFn: async () => {
      const response = await fetch('/api/users?role=advertiser', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch advertisers');
      return response.json();
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: CreateOfferData) => {
      return await apiRequest('POST', '/api/offers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/offers'] });
      setOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Offer created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create offer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateOfferData) => {
    createOfferMutation.mutate(data);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'archived':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPayoutTypeLabel = (type: string) => {
    switch (type) {
      case 'cpa':
        return 'CPA';
      case 'cps':
        return 'CPS';
      case 'cpl':
        return 'CPL';
      default:
        return type.toUpperCase();
    }
  };

  const columns = [
    {
      key: 'name' as const,
      header: 'Offer Name',
    },
    {
      key: 'category' as const,
      header: 'Category',
    },
    {
      key: 'payoutType' as const,
      header: 'Type',
      render: (value: string) => getPayoutTypeLabel(value),
    },
    {
      key: 'payout' as const,
      header: 'Payout',
      render: (value: string, row: any) => `${row.currency || 'USD'} ${value}`,
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: string) => (
        <Badge variant={getStatusBadgeVariant(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'isPrivate' as const,
      header: 'Access',
      render: (value: boolean) => (
        <Badge variant={value ? 'secondary' : 'outline'}>
          {value ? 'Private' : 'Public'}
        </Badge>
      ),
    },
    {
      key: 'kycRequired' as const,
      header: 'KYC',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'outline'}>
          {value ? 'Required' : 'Not Required'}
        </Badge>
      ),
    },
    {
      key: 'createdAt' as const,
      header: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <Header title="offers" subtitle="Manage platform offers">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-offer">
                <i className="fas fa-plus mr-2"></i>
                {t('create_offer')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Offer</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offer Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-offer-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Finance, Health, E-commerce" data-testid="input-category" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} data-testid="input-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="advertiserId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Advertiser *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-advertiser">
                              <SelectValue placeholder="Select an advertiser" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {advertisers.map((advertiser: any) => (
                              <SelectItem key={advertiser.id} value={advertiser.id}>
                                {advertiser.company || advertiser.username} ({advertiser.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="payout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payout *</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" data-testid="input-payout" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="payoutType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payout Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-payout-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cpa">CPA (Cost Per Action)</SelectItem>
                              <SelectItem value="cps">CPS (Cost Per Sale)</SelectItem>
                              <SelectItem value="cpl">CPL (Cost Per Lead)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-currency">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="RUB">RUB</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="landingPageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Landing Page URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/landing" data-testid="input-landing-url" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="trackingUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tracking URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://track.example.com" data-testid="input-tracking-url" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="restrictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restrictions</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} placeholder="Any geo, traffic source, or other restrictions" data-testid="input-restrictions" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="kycRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">KYC Required</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Require identity verification
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-kyc-required"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isPrivate"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Private Offer</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Require approval to access
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-is-private"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createOfferMutation.isPending}
                      data-testid="button-submit"
                    >
                      {createOfferMutation.isPending ? 'Creating...' : 'Create Offer'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </Header>

        <div className="p-6">
          {offersLoading ? (
            <div className="text-center py-8">Loading offers...</div>
          ) : (
            <DataTable
              data={offers}
              columns={columns}
              searchable
              searchPlaceholder="Search offers..."
              emptyMessage="No offers found"
            />
          )}
        </div>
      </main>
    </div>
  );
}
