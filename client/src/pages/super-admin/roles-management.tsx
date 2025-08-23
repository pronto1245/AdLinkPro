import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
import { useSidebar } from "@/contexts/sidebar-context";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Translations for the roles management page
const translations = {
  ru: {
    rolesManagement: "Управление ролями",
    rolesDescription: "Создание и настройка пользовательских ролей с правами доступа",
    createRole: "Создать роль",
    totalRoles: "Всего ролей",
    globalRoles: "Глобальные роли",
    advertiserRoles: "Роли рекламодателей",
    activeRoles: "Активные роли",
    searchPlaceholder: "Поиск ролей...",
    allRoles: "Все роли",
    global: "Глобальные",
    advertiser: "Рекламодателей",
    name: "Название",
    description: "Описание",
    scope: "Область действия",
    permissions: "Права доступа",
    restrictions: "Ограничения",
    assignedUsers: "Назначенные пользователи",
    status: "Статус",
    actions: "Действия",
    view: "Просмотр",
    edit: "Редактировать",
    delete: "Удалить",
    active: "Активна",
    inactive: "Неактивна",
    globalRole: "Глобальная",
    advertiserRole: "Рекламодателя",
    ipRestrictions: "IP ограничения",
    geoRestrictions: "Гео ограничения",
    timeRestrictions: "Временные ограничения",
    noRoles: "Роли не найдены",
    noRolesDescription: "Роли, соответствующие критериям поиска, не найдены.",
    roleCreated: "Роль создана",
    roleCreatedDescription: "Новая роль успешно создана",
    roleUpdated: "Роль обновлена",
    roleUpdatedDescription: "Роль успешно обновлена",
    roleDeleted: "Роль удалена",
    roleDeletedDescription: "Роль успешно удалена",
    permissionCategories: {
      analytics: "Аналитика",
      offers: "Офферы",
      users: "Пользователи",
      finances: "Финансы",
      api: "API",
      security: "Безопасность",
      system: "Система"
    },
    permissionNames: {
      view_statistics: "Просмотр статистики",
      manage_offers: "Управление офферами",
      manage_users: "Управление пользователями",
      access_finances: "Доступ к финансам",
      manage_postbacks: "Управление постбеками / API",
      view_fraud_alerts: "Просмотр фрод-алертов",
      manage_system: "Управление системой"
    },
    permissionDescriptions: {
      view_statistics: "Доступ к просмотру аналитики и отчетов",
      manage_offers: "Создание, редактирование и удаление офферов",
      manage_users: "Создание, редактирование и управление пользователями",
      access_finances: "Просмотр и управление финансовыми операциями",
      manage_postbacks: "Настройка постбеков и API интеграций",
      view_fraud_alerts: "Доступ к системе обнаружения мошенничества",
      manage_system: "Доступ к системным настройкам"
    }
  },
  en: {
    rolesManagement: "Roles Management",
    rolesDescription: "Create and configure user roles with access permissions",
    createRole: "Create Role",
    totalRoles: "Total Roles",
    globalRoles: "Global Roles",
    advertiserRoles: "Advertiser Roles",
    activeRoles: "Active Roles",
    searchPlaceholder: "Search roles...",
    allRoles: "All Roles",
    global: "Global",
    advertiser: "Advertiser",
    name: "Name",
    description: "Description",
    scope: "Scope",
    permissions: "Permissions",
    restrictions: "Restrictions",
    assignedUsers: "Assigned Users",
    status: "Status",
    actions: "Actions",
    view: "View",
    edit: "Edit",
    delete: "Delete",
    active: "Active",
    inactive: "Inactive",
    globalRole: "Global",
    advertiserRole: "Advertiser",
    ipRestrictions: "IP Restrictions",
    geoRestrictions: "Geo Restrictions",
    timeRestrictions: "Time Restrictions",
    noRoles: "No roles found",
    noRolesDescription: "No roles matching the search criteria were found.",
    roleCreated: "Role Created",
    roleCreatedDescription: "New role successfully created",
    roleUpdated: "Role Updated",
    roleUpdatedDescription: "Role successfully updated",
    roleDeleted: "Role Deleted",
    roleDeletedDescription: "Role successfully deleted",
    permissionCategories: {
      analytics: "Analytics",
      offers: "Offers",
      users: "Users",
      finances: "Finances",
      api: "API",
      security: "Security",
      system: "System"
    },
    permissionNames: {
      view_statistics: "View Statistics",
      manage_offers: "Manage Offers",
      manage_users: "Manage Users",
      access_finances: "Access Finances",
      manage_postbacks: "Manage Postbacks / API",
      view_fraud_alerts: "View Fraud Alerts",
      manage_system: "Manage System"
    },
    permissionDescriptions: {
      view_statistics: "Access to view analytics and reports",
      manage_offers: "Create, edit and delete offers",
      manage_users: "Create, edit and manage users",
      access_finances: "View and manage financial operations",
      manage_postbacks: "Configure postbacks and API integrations",
      view_fraud_alerts: "Access to fraud detection system",
      manage_system: "Access to system settings"
    }
  }
};

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
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { isCollapsed } = useSidebar();
  const queryClient = useQueryClient();
  const tr = translations[language as keyof typeof translations];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScope, setFilterScope] = useState('all'); // all, global, advertiser
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
      if (searchTerm) {params.append('search', searchTerm);}
      if (filterScope !== 'all') {params.append('scope', filterScope);}
      
      const response = await fetch(`/api/admin/roles?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) {throw new Error('Failed to fetch roles');}
      return response.json();
    }
  });

  // Get advertisers for role assignment
  const { data: advertisersData } = useQuery({
    queryKey: ['/api/admin/users', { role: 'advertiser' }],
    queryFn: async () => {
      const response = await fetch('/api/admin/users?role=advertiser', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) {throw new Error('Failed to fetch advertisers');}
      return response.json();
    }
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      return apiRequest('/api/admin/roles', 'POST', roleData);
    },
    onSuccess: () => {
      toast({
        title: tr.roleCreated,
        description: tr.roleCreatedDescription
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/roles'] });
      setShowCreateDialog(false);
      resetForm();
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, roleData }: { roleId: string; roleData: any }) => {
      return apiRequest(`/api/admin/roles/${roleId}`, 'PATCH', roleData);
    },
    onSuccess: () => {
      toast({
        title: tr.roleUpdated,
        description: tr.roleUpdatedDescription
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/roles'] });
      setShowEditDialog(false);
    }
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      return apiRequest(`/api/admin/roles/${roleId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: tr.roleDeleted,
        description: tr.roleDeletedDescription
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/roles'] });
    }
  });

  const resetForm = () => {
    setRoleForm({
      name: '',
      description: '',
      permissions: [],
      advertiserId: null,
      ipRestrictions: '',
      geoRestrictions: '',
      timeRestrictions: {
        startTime: '',
        endTime: '',
        allowedDays: []
      }
    });
  };

  const handleCreateRole = () => {
    const formattedData = {
      ...roleForm,
      ipRestrictions: roleForm.ipRestrictions.split(',').map(ip => ip.trim()).filter(Boolean),
      geoRestrictions: roleForm.geoRestrictions.split(',').map(geo => geo.trim()).filter(Boolean)
    };
    createRoleMutation.mutate(formattedData);
  };

  const handleEditRole = (role: CustomRole) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      advertiserId: role.advertiserId,
      ipRestrictions: role.ipRestrictions?.join(', ') || '',
      geoRestrictions: role.geoRestrictions?.join(', ') || '',
      timeRestrictions: role.timeRestrictions || {
        startTime: '',
        endTime: '',
        allowedDays: []
      }
    });
    setShowEditDialog(true);
  };

  const handleUpdateRole = () => {
    if (!selectedRole) {return;}
    
    const formattedData = {
      ...roleForm,
      ipRestrictions: roleForm.ipRestrictions.split(',').map(ip => ip.trim()).filter(Boolean),
      geoRestrictions: roleForm.geoRestrictions.split(',').map(geo => geo.trim()).filter(Boolean)
    };
    updateRoleMutation.mutate({ roleId: selectedRole.id, roleData: formattedData });
  };

  const handlePermissionToggle = (permissionId: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64'
      }`}>
        <Header title={tr.rolesManagement} />
        <main className="flex-1 overflow-auto">
          <div className="space-y-6 p-4 sm:p-6 max-w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {tr.rolesManagement}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {tr.rolesDescription}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {tr.createRole}
                </Button>
              </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {tr.totalRoles}
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {rolesData?.length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {tr.globalRoles}
                  </CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {rolesData?.filter((role: CustomRole) => !role.advertiserId).length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {tr.advertiserRoles}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {rolesData?.filter((role: CustomRole) => role.advertiserId).length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {tr.activeRoles}
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {rolesData?.filter((role: CustomRole) => role.isActive).length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder={tr.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterScope} onValueChange={setFilterScope}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Область действия" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{tr.allRoles}</SelectItem>
                      <SelectItem value="global">{tr.global}</SelectItem>
                      <SelectItem value="advertiser">{tr.advertiser}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {language === 'ru' ? 'Обновить' : 'Refresh'}
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
                        <TableHead>{tr.name}</TableHead>
                        <TableHead>{tr.description}</TableHead>
                        <TableHead>{tr.scope}</TableHead>
                        <TableHead>{tr.permissions}</TableHead>
                        <TableHead>{tr.restrictions}</TableHead>
                        <TableHead>{tr.assignedUsers}</TableHead>
                        <TableHead>{tr.status}</TableHead>
                        <TableHead className="text-right">{tr.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              {language === 'ru' ? 'Загрузка...' : 'Loading...'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : rolesData?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            {tr.noRoles}
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
                                {role.description || 'Описание отсутствует'}
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <Badge 
                                variant={role.advertiserId ? 'secondary' : 'default'}
                                className={role.advertiserId ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-blue-100 text-blue-800 border-blue-200'}
                              >
                                {role.advertiserId ? tr.advertiserRole : tr.globalRole}
                              </Badge>
                              {role.advertiserName && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {role.advertiserName}
                                </div>
                              )}
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {role.permissions.slice(0, 3).map((permission) => {
                                  const getPermissionColor = (perm: string) => {
                                    if (perm.includes('statistics')) {return 'bg-green-100 text-green-800 border-green-200';}
                                    if (perm.includes('offers')) {return 'bg-purple-100 text-purple-800 border-purple-200';}
                                    if (perm.includes('users')) {return 'bg-blue-100 text-blue-800 border-blue-200';}
                                    if (perm.includes('finance')) {return 'bg-yellow-100 text-yellow-800 border-yellow-200';}
                                    if (perm.includes('api')) {return 'bg-red-100 text-red-800 border-red-200';}
                                    return 'bg-gray-100 text-gray-800 border-gray-200';
                                  };
                                  
                                  return (
                                    <Badge 
                                      key={permission} 
                                      variant="outline" 
                                      className={`text-xs ${getPermissionColor(permission)}`}
                                    >
                                      {availablePermissions.find(p => p.id === permission)?.name.split(' ')[0] || permission}
                                    </Badge>
                                  );
                                })}
                                {role.permissions.length > 3 && (
                                  <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800 border-gray-200">
                                    +{role.permissions.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex gap-1">
                                {role.ipRestrictions?.length > 0 && (
                                  <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-200">
                                    <Network className="h-3 w-3 mr-1" />
                                    IP
                                  </Badge>
                                )}
                                {role.geoRestrictions?.length > 0 && (
                                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    GEO
                                  </Badge>
                                )}
                                {role.timeRestrictions && (
                                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Время
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    (role.assignedUsers || 0) > 10 ? 'bg-green-100 text-green-800 border-green-200' :
                                    (role.assignedUsers || 0) > 5 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    (role.assignedUsers || 0) > 0 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    'bg-gray-100 text-gray-800 border-gray-200'
                                  }`}
                                >
                                  {role.assignedUsers || 0}
                                </Badge>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <Badge 
                                variant={role.isActive ? 'default' : 'destructive'}
                                className={`text-xs ${
                                  role.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                                }`}
                              >
                                {role.isActive ? tr.active : tr.inactive}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedRole(role);
                                    setShowViewDialog(true);
                                  }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    {tr.view}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    {tr.edit}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => deleteRoleMutation.mutate(role.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {tr.delete}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Create Role Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{tr.createRole}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Основная информация</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Название роли *</Label>
                        <Input
                          value={roleForm.name}
                          onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                          placeholder="Менеджер партнёров"
                          required
                        />
                      </div>
                      <div>
                        <Label>Область действия</Label>
                        <Select 
                          value={roleForm.advertiserId || 'global'} 
                          onValueChange={(value) => setRoleForm({
                            ...roleForm, 
                            advertiserId: value === 'global' ? null : value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global">Глобальная роль</SelectItem>
                            {advertisersData?.data?.map((advertiser: any) => (
                              <SelectItem key={advertiser.id} value={advertiser.id}>
                                {advertiser.username} ({advertiser.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Описание</Label>
                      <Textarea
                        value={roleForm.description}
                        onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                        placeholder="Описание роли и её назначения..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Права доступа</h3>
                    
                    <div className="grid gap-6">
                      {Object.entries(groupedPermissions).map(([category, permissions]) => (
                        <div key={category} className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                          <div className="grid gap-3">
                            {permissions.map((permission) => {
                              const Icon = permission.icon;
                              return (
                                <div key={permission.id} className="flex items-start space-x-3">
                                  <Checkbox
                                    id={permission.id}
                                    checked={roleForm.permissions.includes(permission.id)}
                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                  />
                                  <div className="flex items-start space-x-2 flex-1">
                                    <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                      <Label htmlFor={permission.id} className="font-medium">
                                        {permission.name}
                                      </Label>
                                      <p className="text-sm text-muted-foreground">
                                        {permission.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Ограничения доступа</h3>
                    
                    <div className="grid gap-4">
                      <div>
                        <Label>IP ограничения</Label>
                        <Input
                          value={roleForm.ipRestrictions}
                          onChange={(e) => setRoleForm({...roleForm, ipRestrictions: e.target.value})}
                          placeholder="192.168.1.1, 10.0.0.0/24 (через запятую)"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Оставьте пустым для доступа с любых IP-адресов
                        </p>
                      </div>

                      <div>
                        <Label>GEO ограничения</Label>
                        <Input
                          value={roleForm.geoRestrictions}
                          onChange={(e) => setRoleForm({...roleForm, geoRestrictions: e.target.value})}
                          placeholder="RU, BY, KZ (коды стран через запятую)"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Оставьте пустым для доступа из любых стран
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Время входа с</Label>
                          <Input
                            type="time"
                            value={roleForm.timeRestrictions.startTime}
                            onChange={(e) => setRoleForm({
                              ...roleForm,
                              timeRestrictions: {
                                ...roleForm.timeRestrictions,
                                startTime: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label>Время входа до</Label>
                          <Input
                            type="time"
                            value={roleForm.timeRestrictions.endTime}
                            onChange={(e) => setRoleForm({
                              ...roleForm,
                              timeRestrictions: {
                                ...roleForm.timeRestrictions,
                                endTime: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Отмена
                  </Button>
                  <Button 
                    onClick={handleCreateRole}
                    disabled={createRoleMutation.isPending || !roleForm.name || roleForm.permissions.length === 0}
                  >
                    {createRoleMutation.isPending ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Создать роль
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Role Dialog - Similar structure to Create */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Редактировать роль</DialogTitle>
                </DialogHeader>
                
                {/* Same content as create dialog but with update logic */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Основная информация</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Название роли *</Label>
                        <Input
                          value={roleForm.name}
                          onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                          placeholder="Менеджер партнёров"
                          required
                        />
                      </div>
                      <div>
                        <Label>Область действия</Label>
                        <Select 
                          value={roleForm.advertiserId || 'global'} 
                          onValueChange={(value) => setRoleForm({
                            ...roleForm, 
                            advertiserId: value === 'global' ? null : value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global">Глобальная роль</SelectItem>
                            {advertisersData?.data?.map((advertiser: any) => (
                              <SelectItem key={advertiser.id} value={advertiser.id}>
                                {advertiser.username} ({advertiser.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Описание</Label>
                      <Textarea
                        value={roleForm.description}
                        onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                        placeholder="Описание роли и её назначения..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Permissions (same as create) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Права доступа</h3>
                    
                    <div className="grid gap-6">
                      {Object.entries(groupedPermissions).map(([category, permissions]) => (
                        <div key={category} className="space-y-3">
                          <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                          <div className="grid gap-3">
                            {permissions.map((permission) => {
                              const Icon = permission.icon;
                              return (
                                <div key={permission.id} className="flex items-start space-x-3">
                                  <Checkbox
                                    id={`edit-${permission.id}`}
                                    checked={roleForm.permissions.includes(permission.id)}
                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                  />
                                  <div className="flex items-start space-x-2 flex-1">
                                    <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                      <Label htmlFor={`edit-${permission.id}`} className="font-medium">
                                        {permission.name}
                                      </Label>
                                      <p className="text-sm text-muted-foreground">
                                        {permission.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Restrictions (same as create) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Ограничения доступа</h3>
                    
                    <div className="grid gap-4">
                      <div>
                        <Label>IP ограничения</Label>
                        <Input
                          value={roleForm.ipRestrictions}
                          onChange={(e) => setRoleForm({...roleForm, ipRestrictions: e.target.value})}
                          placeholder="192.168.1.1, 10.0.0.0/24 (через запятую)"
                        />
                      </div>

                      <div>
                        <Label>GEO ограничения</Label>
                        <Input
                          value={roleForm.geoRestrictions}
                          onChange={(e) => setRoleForm({...roleForm, geoRestrictions: e.target.value})}
                          placeholder="RU, BY, KZ (коды стран через запятую)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Отмена
                  </Button>
                  <Button 
                    onClick={handleUpdateRole}
                    disabled={updateRoleMutation.isPending || !roleForm.name || roleForm.permissions.length === 0}
                  >
                    {updateRoleMutation.isPending ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Обновить роль
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* View Role Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Детали роли</DialogTitle>
                </DialogHeader>
                {selectedRole && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Название</Label>
                        <div className="font-medium">{selectedRole.name}</div>
                      </div>
                      <div>
                        <Label>Область действия</Label>
                        <Badge variant={selectedRole.advertiserId ? 'secondary' : 'default'}>
                          {selectedRole.advertiserId ? 'Рекламодатель' : 'Глобальная'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Описание</Label>
                      <div>{selectedRole.description || 'Описание отсутствует'}</div>
                    </div>

                    <div>
                      <Label>Права доступа</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedRole.permissions.map((permission) => (
                          <Badge key={permission} variant="outline">
                            {availablePermissions.find(p => p.id === permission)?.name || permission}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Ограничения</Label>
                      <div className="space-y-2 mt-2">
                        {selectedRole.ipRestrictions?.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">IP: </span>
                            <span className="text-sm">{selectedRole.ipRestrictions.join(', ')}</span>
                          </div>
                        )}
                        {selectedRole.geoRestrictions?.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">GEO: </span>
                            <span className="text-sm">{selectedRole.geoRestrictions.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}