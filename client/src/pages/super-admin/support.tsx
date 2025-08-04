import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
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

const ticketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.string().min(1, 'Priority is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  userId: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function Support() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('tickets');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock support tickets data
  const supportTickets = [
    {
      id: '1',
      subject: 'Payment not processed',
      category: 'Finance',
      priority: 'high',
      status: 'open',
      createdAt: '2024-08-04T10:30:00Z',
      updatedAt: '2024-08-04T14:20:00Z',
      user: { name: 'John Doe', email: 'john@example.com', role: 'affiliate' },
      description: 'My payment has been pending for 3 days...',
      responses: 2,
    },
    {
      id: '2',
      subject: 'Offer approval request',
      category: 'Offers',
      priority: 'medium',
      status: 'in_progress',
      createdAt: '2024-08-03T09:15:00Z',
      updatedAt: '2024-08-04T11:45:00Z',
      user: { name: 'Jane Smith', email: 'jane@example.com', role: 'advertiser' },
      description: 'Need to get my new offer approved quickly...',
      responses: 5,
    },
    {
      id: '3',
      subject: 'Account verification issue',
      category: 'Account',
      priority: 'low',
      status: 'resolved',
      createdAt: '2024-08-02T16:20:00Z',
      updatedAt: '2024-08-03T10:30:00Z',
      user: { name: 'Mike Johnson', email: 'mike@example.com', role: 'affiliate' },
      description: 'Cannot verify my account documents...',
      responses: 3,
    },
  ];

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: '',
      category: 'general',
      priority: 'medium',
      description: '',
    },
  });

  const categories = [
    'general', 'account', 'finance', 'offers', 'technical', 'billing'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
  ];

  const statuses = [
    { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
  ];

  const getStatusBadge = (status: string) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj : statuses[0];
  };

  const getPriorityBadge = (priority: string) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj : priorities[1];
  };

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const supportResources = [
    {
      title: 'Knowledge Base',
      description: 'Find answers to common questions',
      icon: <Book className="w-6 h-6" />,
      link: '#',
      articles: 45,
    },
    {
      title: 'API Documentation',
      description: 'Technical integration guides',
      icon: <Settings className="w-6 h-6" />,
      link: '#',
      articles: 12,
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      icon: <LifeBuoy className="w-6 h-6" />,
      link: '#',
      articles: 23,
    },
    {
      title: 'FAQ',
      description: 'Frequently asked questions',
      icon: <HelpCircle className="w-6 h-6" />,
      link: '#',
      articles: 38,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <Header title="Support Center" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Center</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage support tickets and help resources</p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-ticket">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Support Ticket</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => console.log(data))} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Brief description of the issue" data-testid="input-subject" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-category">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map(category => (
                                    <SelectItem key={category} value={category}>
                                      {category.charAt(0).toUpperCase() + category.slice(1)}
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
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-priority">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {priorities.map(priority => (
                                    <SelectItem key={priority.value} value={priority.value}>
                                      {priority.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                              <Textarea 
                                {...field} 
                                placeholder="Detailed description of the issue"
                                rows={4}
                                data-testid="textarea-description"
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
                        <Button type="submit" data-testid="button-submit-ticket">
                          Create Ticket
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="tickets" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Support Tickets
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  Resources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tickets" className="space-y-6">
                {/* Filters */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Поиск по тикетам, пользователям..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                          data-testid="input-search-tickets"
                          title="Поиск тикетов поддержки"
                        />
                      </div>
                      
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[140px]" data-testid="select-filter-status" title="Фильтр по статусу тикета">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          {statuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-[140px]" data-testid="select-filter-priority" title="Фильтр по приоритету">
                          <SelectValue placeholder="All Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priority</SelectItem>
                          {priorities.map(priority => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Tickets List */}
                <div className="grid gap-4">
                  {filteredTickets.map((ticket) => (
                    <Card key={ticket.id} data-testid={`ticket-card-${ticket.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {ticket.subject}
                              </h3>
                              <Badge className={getStatusBadge(ticket.status).color}>
                                {getStatusBadge(ticket.status).label}
                              </Badge>
                              <Badge className={getPriorityBadge(ticket.priority).color}>
                                {getPriorityBadge(ticket.priority).label}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {ticket.user.name} ({ticket.user.role})
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {ticket.responses} responses
                              </div>
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {ticket.description}
                            </p>
                          </div>
                          
                          <Button variant="outline" size="sm" data-testid={`button-view-ticket-${ticket.id}`}>
                            View
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {supportResources.map((resource, index) => (
                    <Card key={index} data-testid={`resource-card-${index}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-blue-600">
                            {resource.icon}
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {resource.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {resource.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {resource.articles} articles
                          </span>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}