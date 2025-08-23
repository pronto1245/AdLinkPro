import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/auth-context';
import { Link } from 'wouter';
import { 
  HeadphonesIcon, 
  MessageSquare, 
  Users, 
  AlertCircle, 
  Clock, 
  CheckCircle,
  FileText,
  Search,
  UserCheck
} from 'lucide-react';

export default function StaffDashboard() {
  const { t } = useTranslation();
  const { token, user } = useAuth();

  // Fetch staff metrics
  const { data: staffMetrics, isLoading } = useQuery({
    queryKey: ['/api/staff/metrics'],
    queryFn: async () => {
      const response = await fetch('/api/staff/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {throw new Error('Failed to fetch staff metrics');}
      return response.json();
    },
    enabled: !!token
  });

  // Fetch pending tickets
  const { data: pendingTickets = [] } = useQuery({
    queryKey: ['/api/staff/tickets'],
    queryFn: async () => {
      const response = await fetch('/api/staff/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {throw new Error('Failed to fetch tickets');}
      return response.json();
    },
    enabled: !!token
  });

  const getTicketPriorityVariant = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTicketStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <Header 
          title="Staff Dashboard" 
          subtitle="Support and assistance tools"
        />

        <div className="p-6 space-y-6">
          {/* Staff Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Open Tickets</p>
                    <p className="text-2xl font-bold text-slate-900" data-testid="open-tickets">
                      {staffMetrics?.openTickets || 0}
                    </p>
                    <p className="text-xs text-slate-500">Need attention</p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">In Progress</p>
                    <p className="text-2xl font-bold text-slate-900" data-testid="in-progress-tickets">
                      {staffMetrics?.inProgressTickets || 0}
                    </p>
                    <p className="text-xs text-slate-500">Being worked on</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Resolved Today</p>
                    <p className="text-2xl font-bold text-slate-900" data-testid="resolved-today">
                      {staffMetrics?.resolvedToday || 0}
                    </p>
                    <p className="text-xs text-slate-500">Completed</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Response Time</p>
                    <p className="text-2xl font-bold text-slate-900" data-testid="avg-response-time">
                      {staffMetrics?.avgResponseTime || '0'}min
                    </p>
                    <p className="text-xs text-slate-500">Average</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-sm">
                  <HeadphonesIcon className="w-4 h-4 mr-2" />
                  Customer Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" data-testid="button-view-tickets">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Tickets
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-create-ticket">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Ticket
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-knowledge-base">
                  <Search className="w-4 h-4 mr-2" />
                  Knowledge Base
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  User Assistance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" data-testid="button-user-search">
                  <Search className="w-4 h-4 mr-2" />
                  Search Users
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-account-help">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Account Help
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-verification">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verification
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" data-testid="button-user-guides">
                  <FileText className="w-4 h-4 mr-2" />
                  User Guides
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-faq-management">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  FAQ Management
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-help-articles">
                  <FileText className="w-4 h-4 mr-2" />
                  Help Articles
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-sm">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Issue Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" data-testid="button-escalation">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Escalation
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-follow-up">
                  <Clock className="w-4 h-4 mr-2" />
                  Follow-up
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-reports">
                  <FileText className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Pending Tickets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending Tickets</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTickets.length > 0 ? (
                  pendingTickets.slice(0, 8).map((ticket: any) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors"
                      data-testid={`ticket-${ticket.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{ticket.subject}</p>
                          <p className="text-xs text-slate-500">
                            {ticket.user} • {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getTicketPriorityVariant(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant={getTicketStatusVariant(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No pending tickets</p>
                    <p className="text-sm text-slate-400 mt-1">All caught up!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}