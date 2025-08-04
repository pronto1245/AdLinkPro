import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import Sidebar from '@/components/layout/sidebar';
import { useSidebar } from '@/contexts/sidebar-context';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Offer } from '@shared/schema';

export default function SuperAdminOfferDetails() {
  const params = useParams();
  const offerId = params.id;
  const [location, setLocation] = useLocation();
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch offer details
  const { data: offer, isLoading, error } = useQuery({
    queryKey: ['/api/admin/offers', offerId],
    enabled: !!offerId,
  });

  // Fetch offer statistics
  const { data: offerStats } = useQuery({
    queryKey: ['/api/admin/offer-stats', offerId],
    enabled: !!offerId,
  });

  // Delete offer mutation
  const deleteOfferMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/admin/offers/${offerId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      toast({
        title: 'Success',
        description: 'Offer deleted successfully',
      });
      setLocation('/admin/offers');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header title="Offer Details" />
          <main className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading offer details...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header />
          <main className="p-6">
            <div className="text-center py-8">
              <p className="text-red-600">Error loading offer details</p>
              <Button onClick={() => setLocation('/admin/offers')} className="mt-4">
                Back to Offers
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'finance': 'bg-green-100 text-green-800',
      'gaming': 'bg-indigo-100 text-indigo-800',
      'ecommerce': 'bg-blue-100 text-blue-800',
      'health': 'bg-emerald-100 text-emerald-800',
      'crypto': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/admin/offers')}
                data-testid="button-back-to-offers"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Offers
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {offer.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Offer ID: {offer.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                data-testid="button-edit-offer"
                onClick={() => {
                  toast({
                    title: 'Info',
                    description: 'Edit functionality not yet implemented',
                  });
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteOfferMutation.mutate()}
                disabled={deleteOfferMutation.isPending}
                data-testid="button-delete-offer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteOfferMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>

          {/* Offer Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-lg font-semibold" data-testid="text-offer-name">
                        {offer.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(offer.status)} data-testid="badge-offer-status">
                          {offer.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(offer.category)}`}
                              data-testid="badge-offer-category">
                          {offer.category}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payout</label>
                      <p className="text-lg font-semibold" data-testid="text-offer-payout">
                        ${offer.payout} {offer.currency}
                      </p>
                    </div>
                  </div>
                  
                  {offer.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="mt-1 text-gray-700 dark:text-gray-300" data-testid="text-offer-description">
                        {typeof offer.description === 'string' 
                          ? offer.description 
                          : JSON.stringify(offer.description)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                  <CardDescription>Performance metrics for this offer</CardDescription>
                </CardHeader>
                <CardContent>
                  {offerStats ? (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{offerStats.clicks || 0}</p>
                        <p className="text-sm text-gray-600">Total Clicks</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{offerStats.conversions || 0}</p>
                        <p className="text-sm text-gray-600">Conversions</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {offerStats.conversionRate || '0'}%
                        </p>
                        <p className="text-sm text-gray-600">Conversion Rate</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No statistics available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Landing Pages */}
          {offer.landingPages && Array.isArray(offer.landingPages) && offer.landingPages.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Landing Pages</CardTitle>
                <CardDescription>Available landing pages for this offer</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Payout</TableHead>
                      <TableHead>Geo</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offer.landingPages.map((page: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{page.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{page.url}</TableCell>
                        <TableCell>${page.payoutAmount} {page.currency}</TableCell>
                        <TableCell>{page.geo || 'All'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(page.url, '_blank')}
                              data-testid={`button-view-landing-${index}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(page.url);
                                toast({
                                  title: 'Copied',
                                  description: 'URL copied to clipboard',
                                });
                              }}
                              data-testid={`button-copy-url-${index}`}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payout Type</span>
                  <span className="text-sm font-medium">{offer.payoutType?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Antifraud Enabled</span>
                  <span className="text-sm font-medium">
                    {offer.antifraudEnabled ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Auto Approve Partners</span>
                  <span className="text-sm font-medium">
                    {offer.autoApprovePartners ? 'Yes' : 'No'}
                  </span>
                </div>
                {offer.dailyLimit && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Daily Limit</span>
                    <span className="text-sm font-medium">{offer.dailyLimit}</span>
                  </div>
                )}
                {offer.monthlyLimit && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Limit</span>
                    <span className="text-sm font-medium">{offer.monthlyLimit}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium">
                    {new Date(offer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Updated</span>
                  <span className="text-sm font-medium">
                    {new Date(offer.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}