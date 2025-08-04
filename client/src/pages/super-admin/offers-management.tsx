import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Sidebar from '@/components/layout/sidebar';
import { useSidebar } from '@/contexts/sidebar-context';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Filter, Eye, Edit, Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import type { Offer } from '@shared/schema';

const createOfferSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  status: z.string().default('draft'),
  payoutType: z.string().default('cpa'),
  currency: z.string().default('USD'),
});

type CreateOfferFormData = z.infer<typeof createOfferSchema>;

interface CreateOfferFormProps {
  onSuccess: () => void;
}

function CreateOfferForm({ onSuccess }: CreateOfferFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<CreateOfferFormData>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      status: 'draft',
      payoutType: 'cpa',
      currency: 'USD',
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: CreateOfferFormData) => {
      const response = await apiRequest('POST', '/api/admin/offers', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      onSuccess();
      toast({
        title: 'Success',
        description: 'Offer created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: CreateOfferFormData) => {
    createOfferMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-offer-category" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-offer-description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={createOfferMutation.isPending}
          data-testid="button-create-offer"
        >
          {createOfferMutation.isPending ? 'Creating...' : 'Create Offer'}
        </Button>
      </form>
    </Form>
  );
}

export default function SuperAdminOffersManagement() {
  const [location, setLocation] = useLocation();
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch all offers
  const { data: allOffers = [], isLoading } = useQuery({
    queryKey: ['/api/admin/offers'],
  });

  // Filter and sort offers
  const offers = (allOffers as Offer[])
    .sort((a: Offer, b: Offer) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter((offer: Offer) => {
      const matchesSearch = !searchTerm || 
        offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof offer.description === 'string' && offer.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || offer.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

  // Delete offer mutation
  const deleteOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/offers/${offerId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offers'] });
      toast({
        title: 'Success',
        description: 'Offer deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleOfferSelect = (offerId: string, checked: boolean) => {
    if (checked) {
      setSelectedOffers(prev => [...prev, offerId]);
    } else {
      setSelectedOffers(prev => prev.filter(id => id !== offerId));
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Offers Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and monitor all affiliate offers</p>
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-offers"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48" data-testid="select-category-filter">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-offer-dialog">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Offer</DialogTitle>
                  <DialogDescription>
                    Create a new affiliate offer
                  </DialogDescription>
                </DialogHeader>
                <CreateOfferForm onSuccess={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle>Offers ({offers.length})</CardTitle>
              <CardDescription>
                Manage all affiliate offers in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading offers...</p>
                  </div>
                </div>
              ) : offers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No offers found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedOffers.length === offers.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedOffers(offers.map(offer => offer.id));
                            } else {
                              setSelectedOffers([]);
                            }
                          }}
                          data-testid="checkbox-select-all"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payout</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offers.map((offer) => (
                      <TableRow key={offer.id} data-testid={`row-offer-${offer.id}`}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedOffers.includes(offer.id)}
                            onCheckedChange={(checked) => handleOfferSelect(offer.id, checked as boolean)}
                            data-testid={`checkbox-select-offer-${offer.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium" data-testid={`text-offer-name-${offer.id}`}>
                          {offer.name}
                        </TableCell>
                        <TableCell data-testid={`text-offer-category-${offer.id}`}>
                          {offer.category}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(offer.status)} data-testid={`badge-offer-status-${offer.id}`}>
                            {offer.status}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-offer-payout-${offer.id}`}>
                          ${offer.payout} {offer.currency}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocation(`/admin/offers/${offer.id}`)}
                              data-testid={`button-view-offer-${offer.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Edit functionality would go here
                                toast({
                                  title: 'Info',
                                  description: 'Edit functionality not yet implemented',
                                });
                              }}
                              data-testid={`button-edit-offer-${offer.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteOfferMutation.mutate(offer.id)}
                              disabled={deleteOfferMutation.isPending}
                              data-testid={`button-delete-offer-${offer.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}