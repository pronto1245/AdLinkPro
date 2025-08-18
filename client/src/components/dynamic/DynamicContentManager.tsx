import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Users,
  Activity,
  TrendingUp,
  DollarSign,
  Globe,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'offer' | 'banner' | 'landing' | 'user' | 'report';
  status: 'active' | 'paused' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

interface DynamicContentManagerProps {
  userRole: 'super_admin' | 'advertiser' | 'partner' | 'owner';
  contentType?: string;
  showAdvancedFeatures?: boolean;
}

export default function DynamicContentManager({ 
  userRole, 
  contentType = 'all',
  showAdvancedFeatures = true 
}: DynamicContentManagerProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const { toast } = useToast();

  // Mock data based on user role
  useEffect(() => {
    const mockItems: ContentItem[] = [];
    
    if (userRole === 'super_admin') {
      mockItems.push(
        {
          id: '1',
          title: 'Gaming Offers Campaign',
          description: 'High-converting gaming offers for tier-1 countries',
          type: 'offer',
          status: 'active',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          metadata: { countries: ['US', 'UK', 'DE'], payout: '$50' }
        },
        {
          id: '2', 
          title: 'Finance Landing Page',
          description: 'Optimized landing page for crypto offers',
          type: 'landing',
          status: 'active',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18'
        }
      );
    } else if (userRole === 'advertiser') {
      mockItems.push(
        {
          id: '3',
          title: 'E-commerce Banner Set',
          description: 'Seasonal banners for fashion campaigns',
          type: 'banner',
          status: 'draft',
          createdAt: '2024-01-12',
          updatedAt: '2024-01-19'
        }
      );
    } else if (userRole === 'partner') {
      mockItems.push(
        {
          id: '4',
          title: 'Affiliate Statistics Report',
          description: 'Weekly performance report',
          type: 'report',
          status: 'active',
          createdAt: '2024-01-14',
          updatedAt: '2024-01-21'
        }
      );
    }

    setItems(mockItems);
  }, [userRole]);

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Role-based permissions
  const canCreate = ['super_admin', 'advertiser'].includes(userRole);
  const canEdit = ['super_admin', 'advertiser', 'owner'].includes(userRole);
  const canDelete = ['super_admin', 'owner'].includes(userRole);
  const canBulkActions = ['super_admin', 'advertiser'].includes(userRole);

  const handleSelectItem = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'pause' | 'delete') => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: `Bulk ${action} completed`,
        description: `${selectedItems.size} items processed successfully.`,
      });
      
      setSelectedItems(new Set());
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to perform bulk ${action}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      paused: 'secondary',
      draft: 'outline',
      archived: 'destructive'
    };
    
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      offer: Activity,
      banner: Globe,
      landing: TrendingUp,
      user: Users,
      report: DollarSign
    };
    
    const Icon = icons[type] || Activity;
    return <Icon className="h-4 w-4" />;
  };

  const renderRoleSpecificActions = () => {
    if (userRole === 'super_admin') {
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-1" />
            System Settings
          </Button>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-1" />
            Manage Users
          </Button>
        </div>
      );
    } else if (userRole === 'advertiser') {
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Globe className="h-4 w-4 mr-1" />
            Campaign Tools
          </Button>
        </div>
      );
    } else if (userRole === 'partner') {
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-1" />
            Earnings
          </Button>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-1" />
            Statistics
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with role-specific actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            {userRole === 'super_admin' && 'System-wide content and user management'}
            {userRole === 'advertiser' && 'Manage your campaigns and creative assets'}
            {userRole === 'partner' && 'Access your affiliate resources and reports'}
            {userRole === 'owner' && 'Platform oversight and administration'}
          </p>
        </div>
        {renderRoleSpecificActions()}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="offer">Offers</SelectItem>
              <SelectItem value="banner">Banners</SelectItem>
              <SelectItem value="landing">Landing Pages</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="report">Reports</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {canCreate && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        )}
      </div>

      {/* Bulk Actions */}
      {canBulkActions && selectedItems.size > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedItems.size} item(s) selected
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('activate')}
                disabled={isLoading}
              >
                Activate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('pause')}
                disabled={isLoading}
              >
                Pause
              </Button>
              {canDelete && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="relative">
            {canBulkActions && (
              <div className="absolute top-4 right-4">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className="rounded border-gray-300"
                />
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                {getTypeIcon(item.type)}
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {item.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between mb-4">
                {getStatusBadge(item.status)}
                <span className="text-xs text-muted-foreground">
                  {item.updatedAt}
                </span>
              </div>

              {item.metadata && (
                <div className="text-xs text-muted-foreground mb-4">
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <div key={key}>
                      {key}: {Array.isArray(value) ? value.join(', ') : value}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                {canEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No content found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first content item'
            }
          </p>
          {canCreate && !searchTerm && filterStatus === 'all' && filterType === 'all' && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Item
            </Button>
          )}
        </Card>
      )}

      {/* Role-specific info panel */}
      <Card className="p-4 bg-muted/50">
        <div className="text-sm">
          <strong>Access Level: </strong>
          {userRole === 'super_admin' && 'Full system access - can manage all content and users'}
          {userRole === 'advertiser' && 'Campaign management - can create and edit your campaigns'}
          {userRole === 'partner' && 'View access - can access assigned content and reports'}
          {userRole === 'owner' && 'Platform oversight - can view and moderate all content'}
        </div>
      </Card>
    </div>
  );
}