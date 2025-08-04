import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { 
  Webhook, 
  Plus, 
  Play, 
  Pause, 
  TestTube, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock,
  RotateCcw,
  Settings,
  Code,
  AlertTriangle
} from 'lucide-react';

const globalPostbackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Valid URL is required'),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  macros: z.record(z.string()).optional(),
  headers: z.record(z.string()).optional(),
  retryAttempts: z.number().min(0).max(10).default(3),
  timeout: z.number().min(5).max(120).default(30),
  isActive: z.boolean().default(true),
});

type GlobalPostbackFormData = z.infer<typeof globalPostbackSchema>;

export default function PostbacksManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('postbacks');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPostback, setSelectedPostback] = useState<any>(null);

  // Fetch global postbacks
  const { data: postbacks = [], isLoading: postbacksLoading } = useQuery({
    queryKey: ['/api/admin/global-postbacks'],
    queryFn: async () => {
      const response = await fetch('/api/admin/global-postbacks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch postbacks');
      return response.json();
    },
  });

  // Fetch postback logs
  const { data: postbackLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['/api/admin/postback-logs'],
    queryFn: async () => {
      const response = await fetch('/api/admin/postback-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch postback logs');
      return response.json();
    },
  });

  const createPostbackMutation = useMutation({
    mutationFn: async (data: GlobalPostbackFormData) => {
      return await apiRequest('POST', '/api/admin/global-postbacks', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-postbacks'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: t('success'),
        description: 'Global postback created successfully',
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

  const updatePostbackMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GlobalPostbackFormData> }) => {
      return await apiRequest('PATCH', `/api/admin/global-postbacks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-postbacks'] });
      toast({
        title: t('success'),
        description: 'Postback updated successfully',
      });
    },
  });

  const testPostbackMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('POST', `/api/admin/global-postbacks/${id}/test`);
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: 'Test postback sent successfully',
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

  const form = useForm<GlobalPostbackFormData>({
    resolver: zodResolver(globalPostbackSchema),
    defaultValues: {
      name: '',
      url: '',
      events: [],
      macros: {},
      headers: {},
      retryAttempts: 3,
      timeout: 30,
      isActive: true,
    },
  });

  const availableEvents = [
    { value: 'conversion', label: 'Conversion' },
    { value: 'click', label: 'Click' },
    { value: 'registration', label: 'Registration' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'sale', label: 'Sale' },
    { value: 'lead', label: 'Lead' },
    { value: 'install', label: 'Install' },
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'retry': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'retry': return <RotateCcw className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const isLoading = postbacksLoading || logsLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <Header title="Postbacks Management" />
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
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <Header title="Postbacks Management" />
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="postbacks" className="flex items-center gap-2">
                  <Webhook className="w-4 h-4" />
                  Global Postbacks
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Postback Logs
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {activeTab === 'postbacks' && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2" data-testid="button-create-postback" title="Создать глобальный постбэк">
                      <Plus className="w-4 h-4" />
                      Add Global Postback
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Global Postback</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit((data) => createPostbackMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postback Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., Analytics Postback" data-testid="input-postback-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postback URL</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://example.com/postback" data-testid="input-postback-url" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="events"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Trigger Events</FormLabel>
                              <div className="flex flex-wrap gap-2">
                                {availableEvents.map((event) => (
                                  <label key={event.value} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={field.value.includes(event.value)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          field.onChange([...field.value, event.value]);
                                        } else {
                                          field.onChange(field.value.filter((v) => v !== event.value));
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <span className="text-sm">{event.label}</span>
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
                            name="retryAttempts"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Retry Attempts</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    data-testid="input-retry-attempts" 
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
                                <FormLabel>Timeout (seconds)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
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
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <FormLabel>Active</FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-postback-active"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createPostbackMutation.isPending}>
                            {createPostbackMutation.isPending ? 'Creating...' : 'Create Postback'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <TabsContent value="postbacks" className="space-y-4">
              {postbacks.map((postback: any) => (
                <Card key={postback.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5" />
                          {postback.name}
                        </CardTitle>
                        <CardDescription className="font-mono text-sm">
                          {postback.url}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={postback.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {postback.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testPostbackMutation.mutate(postback.id)}
                          disabled={testPostbackMutation.isPending}
                          data-testid={`button-test-postback-${postback.id}`}
                          title="Тестировать постбэк"
                        >
                          <TestTube className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePostbackMutation.mutate({
                            id: postback.id,
                            data: { isActive: !postback.isActive }
                          })}
                          data-testid={`button-toggle-postback-${postback.id}`}
                          title={postback.isActive ? "Приостановить постбэк" : "Активировать постбэк"}
                        >
                          {postback.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Events</h4>
                        <div className="flex flex-wrap gap-1">
                          {postback.events && Array.isArray(postback.events) ? postback.events.map((event: string) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          )) : (
                            <Badge variant="outline" className="text-xs">No events</Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Settings</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <div>Retry: {postback.retryAttempts} times</div>
                          <div>Timeout: {postback.timeout}s</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Last Updated</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(postback.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {postbacks.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No global postbacks configured
                    </h3>
                    <p className="text-gray-500">
                      Create your first global postback to start receiving webhook notifications.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Postback Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Postback</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>HTTP Code</TableHead>
                        <TableHead>Attempts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {postbackLogs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {log.postbackName || 'Unknown'}
                          </TableCell>
                          <TableCell className="font-mono text-sm max-w-xs truncate">
                            {log.url}
                          </TableCell>
                          <TableCell>
                            <Badge className={`flex items-center gap-1 ${getStatusBadgeColor(log.status)}`}>
                              {getStatusIcon(log.status)}
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`font-mono ${log.httpCode >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                              {log.httpCode || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {log.attempt || 1}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {postbackLogs.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        No postback logs
                      </h3>
                      <p className="text-gray-500">
                        Postback activity will appear here once events start triggering.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Global Postback Settings
                  </CardTitle>
                  <CardDescription>
                    Configure global settings for all postbacks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Default Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Default Retry Attempts</label>
                          <Input type="number" className="w-20" defaultValue="3" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Default Timeout (seconds)</label>
                          <Input type="number" className="w-20" defaultValue="30" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Enable Logging</label>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Security</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Require HTTPS</label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Verify SSL Certificates</label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Rate Limiting</label>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="flex items-center gap-2" title="Сохранить настройки">
                      <Settings className="w-4 h-4" />
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}