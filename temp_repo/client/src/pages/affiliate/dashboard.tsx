import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AffiliateDashboard() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOffer, setSelectedOffer] = useState('');
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  // Fetch partner dashboard data from new API
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/affiliate/dashboard'],
    enabled: !!user && !!token
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['/api/offers'],
    enabled: !!user && !!token
  });

  const { data: trackingLinks = [] } = useQuery({
    queryKey: ['/api/tracking-links'],
    enabled: !!user && !!token
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: { offerId: string; subId1?: string; subId2?: string }) => {
      return await apiRequest('POST', '/api/tracking-links', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracking-links'] });
      setLinkModalOpen(false);
      setSelectedOffer('');
      toast({
        title: "Success",
        description: "Tracking link created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tracking link",
        variant: "destructive",
      });
    },
  });

  const handleCreateLink = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createLinkMutation.mutate({
      offerId: selectedOffer,
      subId1: formData.get('subId1') as string,
      subId2: formData.get('subId2') as string,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Get metrics from API or fallback
  const metrics = (dashboardData as any)?.metrics || {};
  const chartData = (dashboardData as any)?.chartData || {};
  const { 
    totalRevenue = 0, 
    totalConversions = 0, 
    totalClicks = 0, 
    avgCR = 0, 
    epc = 0,
    activeOffers = 0,
    postbacksSent = 0,
    confirmedRevenue = 0
  } = metrics;

  const dashboardMetrics = [
    {
      label: 'total_clicks',
      value: totalClicks.toLocaleString(),
      change: '+8.3%',
      changeType: 'increase' as const,
      icon: 'fas fa-mouse-pointer',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'total_conversions',
      value: totalConversions.toLocaleString(),
      change: '+12.1%',
      changeType: 'increase' as const,
      icon: 'fas fa-check-circle',
      iconBg: 'bg-green-50',
    },
    {
      label: 'conversion_rate',
      value: `${avgCR.toFixed(2)}%`,
      change: '+0.5%',
      changeType: 'increase' as const,
      icon: 'fas fa-percentage',
      iconBg: 'bg-purple-50',
    },
    {
      label: 'total_earnings',
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+15.2%',
      changeType: 'increase' as const,
      icon: 'fas fa-dollar-sign',
      iconBg: 'bg-orange-50',
    },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const trackingLinkColumns = [
    {
      key: 'trackingCode' as const,
      header: 'Tracking Code',
    },
    {
      key: 'offer' as const,
      header: 'Offer',
      render: (value: any, row: any) => {
        const offer = (offers as any[]).find((o: any) => o.id === row.offerId);
        return offer?.name || 'Unknown Offer';
      },
    },
    {
      key: 'url' as const,
      header: 'URL',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600 truncate max-w-xs">{value}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigator.clipboard.writeText(value)}
            data-testid={`copy-link-${value}`}
          >
            <i className="fas fa-copy text-xs"></i>
          </Button>
        </div>
      ),
    },
    {
      key: 'subId1' as const,
      header: 'Sub ID 1',
      render: (value: string) => value || '-',
    },
    {
      key: 'createdAt' as const,
      header: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.partnerTitle')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('dashboard.partnerWelcome')}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium">{metric.label.replace('_', ' ')}</div>
                  <div className={`w-8 h-8 ${metric.iconBg} rounded-full flex items-center justify-center`}>
                    <i className={`${metric.icon} text-sm`}></i>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className={`text-xs ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                    <i className={`fas fa-arrow-${metric.changeType === 'increase' ? 'up' : 'down'} mr-1`}></i>
                    {metric.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        {chartData.revenue && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CR & EPC</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.crEpc}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cr" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="epc" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Available Offers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Available Offers</CardTitle>
                <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-generate-link">
                      <i className="fas fa-link mr-2"></i>
                      Generate Link
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Tracking Link</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateLink} className="space-y-4">
                      <div>
                        <Label htmlFor="offer-select">Select Offer</Label>
                        <Select value={selectedOffer} onValueChange={setSelectedOffer} required>
                          <SelectTrigger id="offer-select" data-testid="select-offer">
                            <SelectValue placeholder="Choose an offer" />
                          </SelectTrigger>
                          <SelectContent>
                            {(offers as any[]).map((offer: any) => (
                              <SelectItem key={offer.id} value={offer.id}>
                                {offer.name} - {offer.currency} {offer.payout}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="subId1">Sub ID 1 (Optional)</Label>
                        <Input
                          id="subId1"
                          name="subId1"
                          placeholder="Custom tracking parameter"
                          data-testid="input-sub-id-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subId2">Sub ID 2 (Optional)</Label>
                        <Input
                          id="subId2"
                          name="subId2"
                          placeholder="Additional tracking parameter"
                          data-testid="input-sub-id-2"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setLinkModalOpen(false)}
                          data-testid="button-cancel-link"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createLinkMutation.isPending || !selectedOffer}
                          data-testid="button-create-link"
                        >
                          {createLinkMutation.isPending ? 'Creating...' : 'Create Link'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(offers as any[]).length > 0 ? (
                  (offers as any[]).slice(0, 5).map((offer: any) => (
                    <div
                      key={offer.id}
                      className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                      data-testid={`offer-${offer.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Badge variant={getStatusBadgeVariant(offer.status)}>
                            {offer.status}
                          </Badge>
                          <h4 className="font-medium">{offer.name}</h4>
                        </div>
                        <div className="mt-2 text-sm text-slate-600 space-x-4">
                          <span>Payout: <span className="font-medium">${offer.payout}</span></span>
                          <span>Category: <span className="font-medium">{offer.category}</span></span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {setSelectedOffer(offer.id); setLinkModalOpen(true)}}
                        data-testid={`generate-link-${offer.id}`}
                      >
                        <i className="fas fa-link mr-2"></i>
                        Generate
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-inbox text-4xl text-slate-300 mb-4"></i>
                    <p className="text-slate-500">No offers available</p>
                    <p className="text-sm text-slate-400 mt-1">Request access to offers to start promoting</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center">
                        <i className="fas fa-dollar-sign text-green-600 text-xs"></i>
                      </div>
                      <span className="text-sm font-medium text-slate-900">EPC</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900" data-testid="epc-value">${epc.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
                        <i className="fas fa-chart-line text-blue-600 text-xs"></i>
                      </div>
                      <span className="text-sm font-medium text-slate-900">Active Offers</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900" data-testid="active-offers">{activeOffers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-yellow-50 rounded-full flex items-center justify-center">
                        <i className="fas fa-paper-plane text-yellow-600 text-xs"></i>
                      </div>
                      <span className="text-sm font-medium text-slate-900">Postbacks</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900" data-testid="postbacks-sent">{postbacksSent}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center">
                        <i className="fas fa-check-circle text-indigo-600 text-xs"></i>
                      </div>
                      <span className="text-sm font-medium text-slate-900">Confirmed</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900" data-testid="confirmed-revenue">${confirmedRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-50 rounded-full flex items-center justify-center">
                        <i className="fas fa-percentage text-purple-600 text-xs"></i>
                      </div>
                      <span className="text-sm font-medium text-slate-900">CR Today</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900" data-testid="cr-today">{avgCR.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tracking Links */}
        <Card>
          <CardHeader>
            <CardTitle>My Tracking Links</CardTitle>
          </CardHeader>
          <CardContent>
            {(trackingLinks as any[]).length > 0 ? (
              <DataTable
                data={trackingLinks as any[]}
                columns={trackingLinkColumns}
                searchable
                searchPlaceholder="Search tracking links..."
                emptyMessage="No tracking links found"
              />
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-link text-4xl text-slate-300 mb-4"></i>
                <p className="text-slate-500">No tracking links created yet</p>
                <p className="text-sm text-slate-400 mt-1">Generate your first tracking link to start promoting offers</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}