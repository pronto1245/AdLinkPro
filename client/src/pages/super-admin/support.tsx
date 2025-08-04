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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Pause,
  ArrowRight,
  Mail,
  Phone,
  Settings,
  LifeBuoy,
  Book,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ticketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.string().min(1, 'Priority is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  userId: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function Support() {
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('tickets');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch support tickets
  const { data: supportTickets, isLoading } = useQuery({
    queryKey: ['/api/admin/support/tickets', filterStatus, filterPriority, searchTerm],
  });

  // Fetch support metrics
  const { data: supportMetrics } = useQuery({
    queryKey: ['/api/admin/support/metrics'],
  });

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: '',
      category: '',
      priority: 'medium',
      description: '',
      userId: '',
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const response = await apiRequest('POST', '/api/admin/support/tickets', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support/metrics'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Support ticket created successfully',
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

  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/support/tickets/${ticketId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support/tickets'] });
      toast({
        title: 'Success',
        description: 'Ticket status updated successfully',
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

  const filteredTickets = supportTickets?.filter((ticket: any) => {
    const matchesSearch = searchTerm === '' || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'secondary';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const onSubmit = (data: TicketFormData) => {
    createTicketMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header title="Support Center" />
          <main className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading support data...</p>
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
        <Header title="Support Center" />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <LifeBuoy className="w-8 h-8" />
              Support Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage support tickets and help center resources
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="space-y-6">
              {/* Support Metrics */}
              {supportMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Open Tickets</p>
                          <p className="text-2xl font-bold text-red-600">{supportMetrics.openTickets || 0}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">In Progress</p>
                          <p className="text-2xl font-bold text-orange-600">{supportMetrics.inProgressTickets || 0}</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Resolved Today</p>
                          <p className="text-2xl font-bold text-green-600">{supportMetrics.resolvedToday || 0}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Avg Response Time</p>
                          <p className="text-2xl font-bold text-blue-600">{supportMetrics.avgResponseTime || '0h'}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Filters and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                      data-testid="input-search-tickets"
                    />
                  </div>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48" data-testid="select-status-filter">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-48" data-testid="select-priority-filter">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-ticket">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Ticket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Support Ticket</DialogTitle>
                      <DialogDescription>
                        Create a new support ticket for user assistance
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-ticket-category">
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="billing">Billing</SelectItem>
                                    <SelectItem value="offers">Offers</SelectItem>
                                    <SelectItem value="payouts">Payouts</SelectItem>
                                    <SelectItem value="account">Account</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-ticket-priority">
                                      <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ticket subject" data-testid="input-ticket-subject" />
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
                                <Textarea 
                                  {...field} 
                                  placeholder="Describe the issue or request..." 
                                  rows={4}
                                  data-testid="textarea-ticket-description"
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
                            disabled={createTicketMutation.isPending}
                            data-testid="button-save-ticket"
                          >
                            Create Ticket
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Support Tickets Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>
                    Manage and respond to user support requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.length > 0 ? (
                        filteredTickets.map((ticket: any) => (
                          <TableRow key={ticket.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{ticket.subject}</p>
                                <p className="text-sm text-gray-600">#{ticket.id}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{ticket.user?.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-600">{ticket.user?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{ticket.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(ticket.status)}>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateTicketStatusMutation.mutate({ 
                                    ticketId: ticket.id, 
                                    status: ticket.status === 'open' ? 'in_progress' : 'resolved' 
                                  })}
                                  disabled={updateTicketStatusMutation.isPending}
                                  data-testid={`button-update-status-${ticket.id}`}
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="text-gray-500">
                              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>No support tickets found</p>
                              <p className="text-sm">All caught up!</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Base</CardTitle>
                  <CardDescription>
                    Manage help articles and documentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Book className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Knowledge Base</h3>
                    <p className="text-gray-600 mb-4">Create and manage help articles for users</p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Article
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support Settings</CardTitle>
                  <CardDescription>
                    Configure support system preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Support Configuration</h3>
                    <p className="text-gray-600 mb-4">Configure automated responses, SLA settings, and more</p>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Settings
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