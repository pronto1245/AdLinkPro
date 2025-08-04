import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { 
  Shield, 
  Plus, 
  Search, 
  Trash2, 
  Globe, 
  Smartphone, 
  MousePointer, 
  User, 
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const blacklistEntrySchema = z.object({
  type: z.enum(['ip', 'clickid', 'subid', 'device_id', 'user_agent', 'domain']),
  value: z.string().min(1, 'Value is required'),
  reason: z.string().optional(),
  expiresAt: z.date().optional(),
});

type BlacklistEntryFormData = z.infer<typeof blacklistEntrySchema>;

export default function BlacklistManagement() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch blacklist entries
  const { data: blacklistEntries = [], isLoading } = useQuery({
    queryKey: ['/api/admin/blacklist', searchTerm, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await fetch(`/api/admin/blacklist?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch blacklist');
      return response.json();
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: BlacklistEntryFormData) => {
      return await apiRequest('POST', '/api/admin/blacklist', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blacklist'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: t('success'),
        description: 'Blacklist entry added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/admin/blacklist/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blacklist'] });
      toast({
        title: t('success'),
        description: 'Blacklist entry removed successfully',
      });
    },
  });

  const toggleEntryMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest('PATCH', `/api/admin/blacklist/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blacklist'] });
      toast({
        title: t('success'),
        description: 'Blacklist entry updated successfully',
      });
    },
  });

  const form = useForm<BlacklistEntryFormData>({
    resolver: zodResolver(blacklistEntrySchema),
    defaultValues: {
      type: 'ip',
      value: '',
      reason: '',
    },
  });

  const entryTypes = [
    { value: 'all', label: 'All Types', icon: <Shield className="w-4 h-4" /> },
    { value: 'ip', label: 'IP Address', icon: <Globe className="w-4 h-4" /> },
    { value: 'clickid', label: 'Click ID', icon: <MousePointer className="w-4 h-4" /> },
    { value: 'subid', label: 'Sub ID', icon: <User className="w-4 h-4" /> },
    { value: 'device_id', label: 'Device ID', icon: <Smartphone className="w-4 h-4" /> },
    { value: 'user_agent', label: 'User Agent', icon: <Globe className="w-4 h-4" /> },
    { value: 'domain', label: 'Domain', icon: <Globe className="w-4 h-4" /> },
  ];

  const getTypeIcon = (type: string) => {
    const typeObj = entryTypes.find(t => t.value === type);
    return typeObj?.icon || <Shield className="w-4 h-4" />;
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'ip': return 'bg-red-100 text-red-800';
      case 'clickid': return 'bg-orange-100 text-orange-800';
      case 'subid': return 'bg-yellow-100 text-yellow-800';
      case 'device_id': return 'bg-blue-100 text-blue-800';
      case 'user_agent': return 'bg-purple-100 text-purple-800';
      case 'domain': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (expiresAt: string | null) => {
    return expiresAt && new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <Header title="Blacklist Management" />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <Header title="Blacklist Management" />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header and Filters */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Fraud Prevention Blacklist
                  </CardTitle>
                  <CardDescription>
                    Manage blocked IPs, click IDs, and other fraud indicators
                  </CardDescription>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2" data-testid="button-add-blacklist">
                      <Plus className="w-4 h-4" />
                      Add to Blacklist
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Blacklist Entry</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit((data) => createEntryMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Entry Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-blacklist-type">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {entryTypes.slice(1).map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex items-center gap-2">
                                        {type.icon}
                                        {type.label}
                                      </div>
                                    </SelectItem>
                                  ))}
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
                                <Input 
                                  {...field} 
                                  placeholder="e.g., 192.168.1.1 or click_id_123" 
                                  data-testid="input-blacklist-value" 
                                />
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
                                  placeholder="Why is this being blacklisted?" 
                                  data-testid="input-blacklist-reason" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="expiresAt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiration Date (Optional)</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className="w-full pl-3 text-left font-normal"
                                      data-testid="button-select-expiry"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>No expiration</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createEntryMutation.isPending}>
                            {createEntryMutation.isPending ? 'Adding...' : 'Add Entry'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search blacklist entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-blacklist"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48" data-testid="select-type-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {entryTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Blacklist Table */}
          <Card>
            <CardHeader>
              <CardTitle>Blocked Entries ({blacklistEntries.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blacklistEntries.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Badge className={`flex items-center gap-1 ${getTypeBadgeColor(entry.type)}`}>
                          {getTypeIcon(entry.type)}
                          {entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm max-w-xs truncate">
                        {entry.value}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {entry.reason || 'No reason provided'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.isActive && !isExpired(entry.expiresAt) ? (
                            <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Active
                            </Badge>
                          ) : isExpired(entry.expiresAt) ? (
                            <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Expired
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(entry.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {entry.expiresAt ? format(new Date(entry.expiresAt), 'MMM dd, yyyy') : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleEntryMutation.mutate({
                              id: entry.id,
                              isActive: !entry.isActive
                            })}
                            disabled={isExpired(entry.expiresAt)}
                            data-testid={`button-toggle-${entry.id}`}
                          >
                            {entry.isActive ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteEntryMutation.mutate(entry.id)}
                            data-testid={`button-delete-${entry.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {blacklistEntries.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No blacklist entries
                  </h3>
                  <p className="text-gray-500">
                    {typeFilter === 'all' 
                      ? 'No entries have been added to the blacklist yet.'
                      : `No ${typeFilter} entries found in the blacklist.`
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}