import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSidebar } from '@/contexts/sidebar-context';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Plus, 
  Trash2, 
  Globe, 
  Smartphone, 
  MousePointer, 
  User, 
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const blacklistEntrySchema = z.object({
  type: z.enum(['ip', 'clickid', 'subid', 'device_id', 'user_agent', 'domain']),
  value: z.string().min(1, 'Value is required'),
  reason: z.string().optional(),
  expiresAt: z.date().optional(),
});

type BlacklistEntryFormData = z.infer<typeof blacklistEntrySchema>;

export default function BlacklistManagement() {
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch blacklist entries
  const { data: blacklistEntries, isLoading } = useQuery({
    queryKey: ['/api/admin/blacklist', searchTerm, typeFilter],
  });

  const form = useForm<BlacklistEntryFormData>({
    resolver: zodResolver(blacklistEntrySchema),
    defaultValues: {
      type: 'ip',
      value: '',
      reason: '',
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: BlacklistEntryFormData) => {
      const response = await apiRequest('POST', '/api/admin/blacklist', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blacklist'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Blacklist entry created successfully',
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

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/blacklist/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blacklist'] });
      toast({
        title: 'Success',
        description: 'Blacklist entry removed successfully',
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

  const filteredEntries = blacklistEntries?.filter((entry: any) => {
    const matchesSearch = searchTerm === '' || 
      entry.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    
    return matchesSearch && matchesType;
  }) || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip': return <Globe className="w-4 h-4" />;
      case 'device_id': return <Smartphone className="w-4 h-4" />;
      case 'clickid': return <MousePointer className="w-4 h-4" />;
      case 'subid': return <User className="w-4 h-4" />;
      case 'user_agent': return <Globe className="w-4 h-4" />;
      case 'domain': return <Globe className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'ip': return 'destructive';
      case 'device_id': return 'secondary';
      case 'clickid': return 'outline';
      case 'subid': return 'default';
      default: return 'secondary';
    }
  };

  const onSubmit = (data: BlacklistEntryFormData) => {
    createEntryMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header title="Blacklist Management" />
          <main className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading blacklist...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header title="Blacklist Management" />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Shield className="w-8 h-8" />
              Blacklist Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage blocked IPs, domains, and other security filters
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search blacklist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                  data-testid="input-search-blacklist"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48" data-testid="select-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ip">IP Address</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="device_id">Device ID</SelectItem>
                  <SelectItem value="clickid">Click ID</SelectItem>
                  <SelectItem value="subid">Sub ID</SelectItem>
                  <SelectItem value="user_agent">User Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-blacklist-entry">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Blacklist Entry</DialogTitle>
                  <DialogDescription>
                    Block specific IPs, domains, or other identifiers
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-entry-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ip">IP Address</SelectItem>
                              <SelectItem value="domain">Domain</SelectItem>
                              <SelectItem value="device_id">Device ID</SelectItem>
                              <SelectItem value="clickid">Click ID</SelectItem>
                              <SelectItem value="subid">Sub ID</SelectItem>
                              <SelectItem value="user_agent">User Agent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter value to block" data-testid="input-blacklist-value" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Reason for blocking..." 
                              rows={3}
                              data-testid="textarea-blacklist-reason"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createEntryMutation.isPending}
                        data-testid="button-save-blacklist-entry"
                      >
                        Add Entry
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Blacklist Table */}
          <Card>
            <CardHeader>
              <CardTitle>Blacklist Entries</CardTitle>
              <CardDescription>
                Currently blocked items and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(entry.type)}
                            <Badge variant={getTypeBadgeVariant(entry.type)}>
                              {entry.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {entry.value}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {entry.reason || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(entry.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={entry.expiresAt && new Date(entry.expiresAt) < new Date() ? 'outline' : 'destructive'}
                            className="flex items-center gap-1 w-fit"
                          >
                            {entry.expiresAt && new Date(entry.expiresAt) < new Date() ? (
                              <>
                                <Clock className="w-3 h-3" />
                                Expired
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEntryMutation.mutate(entry.id)}
                            disabled={deleteEntryMutation.isPending}
                            data-testid={`button-delete-${entry.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">
                          <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No blacklist entries found</p>
                          <p className="text-sm">Add entries to block specific traffic</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}