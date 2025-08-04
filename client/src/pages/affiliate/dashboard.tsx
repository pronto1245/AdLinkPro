import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function AffiliateDashboard() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOffer, setSelectedOffer] = useState('');
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  const { data: offers = [] } = useQuery({
    queryKey: ['/api/offers'],
    queryFn: async () => {
      const response = await fetch('/api/offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json();
    },
  });

  const { data: trackingLinks = [] } = useQuery({
    queryKey: ['/api/tracking-links'],
    queryFn: async () => {
      const response = await fetch('/api/tracking-links', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch tracking links');
      return response.json();
    },
  });

  const { data: statistics = [] } = useQuery({
    queryKey: ['/api/statistics'],
    queryFn: async () => {
      const response = await fetch('/api/statistics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    },
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

  // Calculate metrics from statistics
  const totalClicks = statistics.reduce((sum: number, stat: any) => sum + (stat.clicks || 0), 0);
  const totalConversions = statistics.reduce((sum: number, stat: any) => sum + (stat.conversions || 0), 0);
  const totalRevenue = statistics.reduce((sum: number, stat: any) => sum + parseFloat(stat.payout || 0), 0);
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00';

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
      value: `${conversionRate}%`,
      change: '+0.5%',
      changeType: 'increase' as const,
      icon: 'fas fa-percentage',
      iconBg: 'bg-purple-50',
    },
    {
      label: 'total_earnings',
      value: `$${totalRevenue.toFixed(2)}`,
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
        const offer = offers.find((o: any) => o.id === row.offerId);
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <Header 
          title="dashboard" 
          subtitle="welcome"
        />

        <div className="p-6 space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardMetrics.map((metric, index) => (
              <Card key={index} className="metric-card transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{t(metric.label)}</p>
                      <p className="text-2xl font-bold text-slate-900" data-testid={`metric-${metric.label}-value`}>
                        {metric.value}
                      </p>
                      <div className="flex items-center mt-2">
                        <i className={`fas fa-arrow-${metric.changeType === 'increase' ? 'up' : 'down'} text-${metric.changeType === 'increase' ? 'green' : 'red'}-500 text-xs`}></i>
                        <span className={`text-xs text-${metric.changeType === 'increase' ? 'green' : 'red'}-600 ml-1`}>
                          {metric.change}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">vs last month</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                      <i className={`${metric.icon} text-${metric.iconBg.includes('blue') ? 'blue' : metric.iconBg.includes('green') ? 'green' : metric.iconBg.includes('purple') ? 'purple' : 'orange'}-500`}></i>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
                              {offers.map((offer: any) => (
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
                  {offers.length > 0 ? (
                    offers.slice(0, 5).map((offer: any) => (
                      <div
                        key={offer.id}
                        className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                        data-testid={`offer-${offer.id}`}
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{offer.name}</p>
                          <p className="text-xs text-slate-500">{offer.category} • {offer.payoutType.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {offer.currency} {offer.payout}
                          </p>
                          <Badge variant={getStatusBadgeVariant(offer.status)}>
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-bullseye text-4xl text-slate-300 mb-4"></i>
                      <p className="text-slate-500">No offers available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-mouse-pointer text-blue-600 text-xs"></i>
                      </div>
                      <span className="text-sm font-medium text-slate-900">Clicks Today</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900" data-testid="clicks-today">0</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-check-circle text-green-600 text-xs"></i>
                      </div>
                      <span className="text-sm font-medium text-slate-900">Conversions Today</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900" data-testid="conversions-today">0</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-dollar-sign text-orange-600 text-xs"></i>
                      </div>
                      <span className="text-sm font-medium text-slate-900">Earnings Today</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900" data-testid="earnings-today">$0.00</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-percentage text-purple-600 text-xs"></i>
                      </div>
                      <span className="text-sm font-medium text-slate-900">CR Today</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900" data-testid="cr-today">0.00%</span>
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
              {trackingLinks.length > 0 ? (
                <DataTable
                  data={trackingLinks}
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
      </main>
    </div>
  );
}
