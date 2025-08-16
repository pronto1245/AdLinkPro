import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSidebar } from "../../contexts/sidebar-context";
import Sidebar from "../../components/layout/sidebar";
import Header from "../../components/layout/header";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { 
  MoreHorizontal, 
  Search, 
  Plus, 
  Edit,
  Trash2,
  Shield,
  Users,
  Globe,
  Clock,
  MapPin,
  Network,
  DollarSign,
  Target,
  BarChart3,
  Webhook,
  Eye,
  RefreshCw
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../../components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";

interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  advertiserId: string | null;
  ipRestrictions: string[];
  geoRestrictions: string[];
  timeRestrictions: any;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  advertiserName?: string;
  assignedUsers?: number;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
}

const availablePermissions: Permission[] = [
  {
    id: 'view_statistics',
    name: 'Просмотр статистики',
    description: 'Доступ к просмотру аналитики и отчетов',
    category: 'Аналитика',
    icon: BarChart3
  },
  {
    id: 'manage_offers',
    name: 'Управление офферами',
    description: 'Создание, редактирование и удаление офферов',
    category: 'Офферы',
    icon: Target
  },
  {
    id: 'manage_users',
    name: 'Управление пользователями',
    description: 'Создание, редактирование и управление пользователями',
    category: 'Пользователи',
    icon: Users
  },
  {
    id: 'access_finances',
    name: 'Доступ к финансам',
    description: 'Просмотр и управление финансовыми операциями',
    category: 'Финансы',
    icon: DollarSign
  },
  {
    id: 'manage_postbacks',
    name: 'Управление постбеками / API',
    description: 'Настройка постбеков и API интеграций',
    category: 'API',
    icon: Webhook
  },
  {
    id: 'view_fraud_alerts',
    name: 'Просмотр фрод-алертов',
    description: 'Доступ к системе обнаружения мошенничества',
    category: 'Безопасность',
    icon: Shield
  },
  {
    id: 'manage_system',
    name: 'Управление системой',
    description: 'Доступ к системным настройкам',
    category: 'Система',
    icon: Globe
  }
];

export default function RolesManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { collapsed } = useSidebar();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScope, setFilterScope] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    advertiserId: null as string | null,
    ipRestrictions: '',
    geoRestrictions: '',
    timeRestrictions: {
      startTime: '',
      endTime: '',
      allowedDays: [] as string[]
    }
  });

  // Get roles
  const { data: rolesData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/roles', searchTerm, filterScope],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterScope !== 'all') params.append('scope', filterScope);
      
      const response = await fetch(`/api/admin/roles?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    }
  });

  // Calculate statistics
  const stats = {
    total: rolesData?.length || 0,
    global: rolesData?.filter((role: CustomRole) => !role.advertiserId).length || 0,
    advertiser: rolesData?.filter((role: CustomRole) => role.advertiserId).length || 0,
    active: rolesData?.filter((role: CustomRole) => role.isActive).length || 0,
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden ${collapsed ? 'lg:ml-16' : 'lg:ml-64'} transition-all duration-300`}>
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {t('sidebar.roles')}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {t('roles.description')}
                </p>
              </div>
              <Button onClick={() => setShowCreateDialog(true)} className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                {t('roles.createRole')}
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <div className="text-lg font-medium">{t('roles.totalRoles')}: {stats.total}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <Globe className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <div className="text-lg font-medium">{t('roles.globalRoles')}: {stats.global}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <div className="text-lg font-medium">{t('roles.advertiserRoles')}: {stats.advertiser}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <div className="text-lg font-medium">{t('roles.activeRoles')}: {stats.active}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={t('common.search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterScope} onValueChange={setFilterScope}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('roles.allRoles')}</SelectItem>
                      <SelectItem value="global">{t('roles.global')}</SelectItem>
                      <SelectItem value="advertiser">{t('roles.advertiser')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('common.refresh')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Roles Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('common.name')}</TableHead>
                        <TableHead>{t('common.description')}</TableHead>
                        <TableHead>{t('roles.scope')}</TableHead>
                        <TableHead>{t('roles.permissions')}</TableHead>
                        <TableHead>{t('common.status')}</TableHead>
                        <TableHead className="text-right">{t('common.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              {t('common.loading')}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : rolesData?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            {t('roles.noRoles')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        rolesData?.map((role: CustomRole) => (
                          <TableRow key={role.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{role.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {role.id.substring(0, 8)}...
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="max-w-xs truncate">
                                {role.description || t('roles.noDescription')}
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <Badge 
                                variant={role.advertiserId ? 'secondary' : 'default'}
                                className={role.advertiserId ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-blue-100 text-blue-800 border-blue-200'}
                              >
                                {role.advertiserId ? t('roles.advertiserRole') : t('roles.globalRole')}
                              </Badge>
                              {role.advertiserName && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {role.advertiserName}
                                </div>
                              )}
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {role.permissions.slice(0, 3).map((permission) => (
                                  <Badge 
                                    key={permission} 
                                    variant="outline" 
                                    className="text-xs"
                                  >
                                    {permission}
                                  </Badge>
                                ))}
                                {role.permissions.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{role.permissions.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <Badge 
                                variant={role.isActive ? 'default' : 'secondary'}
                                className={role.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}
                              >
                                {role.isActive ? t('common.active') : t('common.inactive')}
                              </Badge>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedRole(role);
                                      setShowViewDialog(true);
                                    }}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      {t('common.view')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedRole(role);
                                      setRoleForm({
                                        name: role.name,
                                        description: role.description,
                                        permissions: role.permissions,
                                        advertiserId: role.advertiserId,
                                        ipRestrictions: role.ipRestrictions.join(', '),
                                        geoRestrictions: role.geoRestrictions.join(', '),
                                        timeRestrictions: role.timeRestrictions || { startTime: '', endTime: '', allowedDays: [] }
                                      });
                                      setShowEditDialog(true);
                                    }}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      {t('common.edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {t('common.delete')}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}