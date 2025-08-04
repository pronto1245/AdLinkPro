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
import { Switch } from '@/components/ui/switch';
import { 
  Webhook, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  CheckCircle,
  XCircle,
  Activity,
  Settings,
  Search
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const postbackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Invalid URL format'),
  method: z.enum(['GET', 'POST']).default('POST'),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  parameters: z.string().optional(),
  headers: z.string().optional(),
  isActive: z.boolean().default(true),
  retryCount: z.number().min(0).max(10).default(3),
  timeout: z.number().min(1000).max(30000).default(5000),
});

type PostbackFormData = z.infer<typeof postbackSchema>;

export default function PostbacksManagement() {
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPostback, setEditingPostback] = useState<any>(null);

  // Fetch postbacks
  const { data: postbacks, isLoading } = useQuery({
    queryKey: ['/api/admin/postbacks'],
  });

  // Fetch global postbacks
  const { data: globalPostbacks } = useQuery({
    queryKey: ['/api/admin/global-postbacks'],
  });

  // Fetch postback events
  const { data: events } = useQuery({
    queryKey: ['/api/admin/postback-events'],
  });

  const form = useForm<PostbackFormData>({
    resolver: zodResolver(postbackSchema),
    defaultValues: {
      name: '',
      url: '',
      method: 'POST',
      events: [],
      parameters: '',
      headers: '',
      isActive: true,
      retryCount: 3,
      timeout: 5000,
    },
  });

  // Create postback mutation
  const createPostbackMutation = useMutation({
    mutationFn: async (data: PostbackFormData) => {
      const response = await apiRequest('POST', '/api/admin/postbacks', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/postbacks'] });
      toast({
        title: 'Success',
        description: 'Postback created successfully',
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update postback mutation
  const updatePostbackMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PostbackFormData }) => {
      const response = await apiRequest('PUT', `/api/admin/postbacks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/postbacks'] });
      toast({
        title: 'Success',
        description: 'Postback updated successfully',
      });
      setEditingPostback(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete postback mutation
  const deletePostbackMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/postbacks/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/postbacks'] });
      toast({
        title: 'Success',
        description: 'Postback deleted successfully',
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

  // Toggle postback status
  const togglePostbackMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/admin/postbacks/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/postbacks'] });
      toast({
        title: 'Success',
        description: 'Postback status updated',
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

  const filteredPostbacks = postbacks?.filter((postback: any) =>
    postback.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    postback.url.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const availableEvents = [
    'conversion',
    'click',
    'lead',
    'sale',
    'install',
    'registration',
    'deposit',
    'ftd',
    'chargeback',
    'refund'
  ];

  const onSubmit = (data: PostbackFormData) => {
    if (editingPostback) {
      updatePostbackMutation.mutate({ id: editingPostback.id, data });
    } else {
      createPostbackMutation.mutate(data);
    }
  };

  const openEditDialog = (postback: any) => {
    setEditingPostback(postback);
    form.reset({
      name: postback.name,
      url: postback.url,
      method: postback.method,
      events: postback.events || [],
      parameters: postback.parameters || '',
      headers: postback.headers || '',
      isActive: postback.isActive,
      retryCount: postback.retryCount || 3,
      timeout: postback.timeout || 5000,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header title="Postbacks Management" />
          <main className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading postbacks...</p>
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
        <Header title="Postbacks Management" />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Webhook className="w-8 h-8" />
              Postbacks Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure and manage webhook postbacks for tracking events
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search postbacks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-postbacks"
              />
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-postback">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Postback
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPostback ? 'Edit Postback' : 'Create New Postback'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure webhook settings for tracking events
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Postback name" data-testid="input-postback-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HTTP Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-postback-method">
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/webhook" data-testid="input-postback-url" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="events"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Events</FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                            {availableEvents.map((event) => (
                              <label key={event} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value.includes(event)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      field.onChange([...field.value, event]);
                                    } else {
                                      field.onChange(field.value.filter((v) => v !== event));
                                    }
                                  }}
                                  data-testid={`checkbox-event-${event}`}
                                />
                                <span className="text-sm capitalize">{event}</span>
                              </label>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="retryCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Retry Count</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="0" 
                                max="10" 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                data-testid="input-retry-count"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timeout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timeout (ms)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="1000" 
                                max="30000" 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                data-testid="input-timeout"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="parameters"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parameters (JSON)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder='{"key": "value"}' 
                              rows={3}
                              data-testid="textarea-parameters"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="headers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Headers (JSON)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder='{"Content-Type": "application/json"}' 
                              rows={3}
                              data-testid="textarea-headers"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Enable this postback for event tracking
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-postback-active"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreateDialogOpen(false);
                          setEditingPostback(null);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createPostbackMutation.isPending || updatePostbackMutation.isPending}
                        data-testid="button-save-postback"
                      >
                        {editingPostback ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Postbacks Table */}
          <Card>
            <CardHeader>
              <CardTitle>Postback URLs</CardTitle>
              <CardDescription>
                Manage webhook endpoints for tracking conversions and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPostbacks.length > 0 ? (
                    filteredPostbacks.map((postback: any) => (
                      <TableRow key={postback.id}>
                        <TableCell className="font-medium">{postback.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{postback.url}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{postback.method}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {postback.events?.slice(0, 3).map((event: string) => (
                              <Badge key={event} variant="secondary" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                            {postback.events?.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{postback.events.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={postback.isActive ? 'default' : 'secondary'}
                              className="flex items-center gap-1"
                            >
                              {postback.isActive ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {postback.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePostbackMutation.mutate({ 
                                id: postback.id, 
                                isActive: !postback.isActive 
                              })}
                              disabled={togglePostbackMutation.isPending}
                              data-testid={`button-toggle-${postback.id}`}
                            >
                              {postback.isActive ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(postback)}
                                  data-testid={`button-edit-${postback.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Postback</DialogTitle>
                                  <DialogDescription>
                                    Update webhook configuration
                                  </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    {/* Same form fields as create dialog */}
                                    <div className="flex justify-end space-x-2">
                                      <Button type="button" variant="outline">Cancel</Button>
                                      <Button type="submit">Update</Button>
                                    </div>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePostbackMutation.mutate(postback.id)}
                              disabled={deletePostbackMutation.isPending}
                              data-testid={`button-delete-${postback.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">
                          <Webhook className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No postbacks found</p>
                          <p className="text-sm">Create your first postback to start tracking events</p>
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