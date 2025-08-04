import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/layout/sidebar';
import { useSidebar } from '@/contexts/sidebar-context';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Calendar as CalendarIcon,
  FileText,
  User,
  Settings,
  Activity,
  Download
} from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function AuditLogs() {
  const { isCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  // Fetch audit logs
  const { data: auditLogs, isLoading, error } = useQuery({
    queryKey: ['/api/admin/audit-logs', searchTerm, actionFilter, resourceFilter, userFilter, dateRange],
  });

  // Fetch users for filter
  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const actions = [
    { value: 'all', label: 'All Actions' },
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'approve', label: 'Approve' },
    { value: 'reject', label: 'Reject' },
  ];

  const resources = [
    { value: 'all', label: 'All Resources' },
    { value: 'user', label: 'Users' },
    { value: 'offer', label: 'Offers' },
    { value: 'campaign', label: 'Campaigns' },
    { value: 'payout', label: 'Payouts' },
    { value: 'system', label: 'System' },
  ];

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      case 'login': return 'outline';
      case 'logout': return 'outline';
      default: return 'secondary';
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'user': return <User className="w-4 h-4" />;
      case 'offer': return <FileText className="w-4 h-4" />;
      case 'campaign': return <Activity className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header title="Audit Logs" />
          <main className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading audit logs...</p>
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
        <Header title="Audit Logs" />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track system activities and user actions
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-logs"
                  />
                </div>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger data-testid="select-action-filter">
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={resourceFilter} onValueChange={setResourceFilter}>
                  <SelectTrigger data-testid="select-resource-filter">
                    <SelectValue placeholder="All Resources" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((resource) => (
                      <SelectItem key={resource.value} value={resource.value}>
                        {resource.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger data-testid="select-user-filter">
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users && users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setActionFilter('all');
                    setResourceFilter('all');
                    setUserFilter('all');
                    setDateRange({
                      from: addDays(new Date(), -7),
                      to: new Date(),
                    });
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>

                <Button variant="outline" data-testid="button-export-logs">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Recent system activities and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs && auditLogs.length > 0 ? (
                    auditLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {log.user?.email || 'System'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getResourceIcon(log.resourceType)}
                            {log.resourceType}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.details || '-'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.ipAddress || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">
                          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No audit logs found</p>
                          <p className="text-sm">Try adjusting your filters</p>
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