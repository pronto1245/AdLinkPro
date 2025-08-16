import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSidebar } from "../../contexts/sidebar-context";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
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
  Filter, 
  Download, 
  Plus, 
  Ban, 
  ShieldCheck,
  LogOut,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  Calendar,
  User,
  Shield,
  Globe,
  Activity
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
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";

interface User {
  id: string;
  userType: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
  lastLoginIP: string;
  advertiserName?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
  userType: string;
  country: string;
  dateFrom: string;
  dateTo: string;
  lastActivityFrom: string;
  lastActivityTo: string;
  geoIP: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function UsersManagement() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { toast } = useToast();
  const { collapsed: isCollapsed } = useSidebar();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    userType: 'all',
    country: '',
    dateFrom: '',
    dateTo: '',
    lastActivityFrom: '',
    lastActivityTo: '',
    geoIP: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [userToBlock, setUserToBlock] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');
  const [bulkAction, setBulkAction] = useState<'block' | 'unblock' | 'delete'>('block');
  const [bulkReason, setBulkReason] = useState('');
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'affiliate',
    country: '',
    isActive: true,
    twoFactorEnabled: false,
    ipRestrictions: '',
    geoRestrictions: '',
    advertiserName: ''
  });
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'affiliate',
    userType: 'affiliate',
    country: '',
    advertiserName: ''
  });

  // Helper functions
  const handleSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const handleSort = (field: string) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters({ ...filters, sortBy: field, sortOrder: newOrder });
  };

  const getSortIcon = (field: string) => {
    if (filters.sortBy !== field) return '↕️';
    return filters.sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleBlockUser = (userId: string) => {
    setUserToBlock(userId);
    setShowBlockDialog(true);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm', {
      locale: language === 'ru' ? ru : enUS
    });
  };

  // Get users with filters
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/users', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value.toString());
      });
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // Block user mutation
  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return apiRequest(`/api/admin/users/${userId}/block`, 'POST', { reason });
    },
    onSuccess: () => {
      toast({
        title: "Пользователь заблокирован",
        description: "Пользователь успешно заблокирован"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowBlockDialog(false);
      setBlockReason('');
    }
  });

  // Unblock user mutation
  const unblockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}/unblock`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Пользователь разблокирован",
        description: "Пользователь успешно разблокирован"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  // Force logout mutation
  const forceLogoutMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}/force-logout`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Сессии завершены",
        description: "Все сессии пользователя успешно завершены"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}/reset-password`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Пароль сброшен",
        description: "Новый пароль отправлен на email пользователя"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: any }) => {
      return apiRequest(`/api/admin/users/${userId}`, 'PATCH', userData);
    },
    onSuccess: () => {
      toast({
        title: "Пользователь обновлен",
        description: "Данные пользователя успешно обновлены"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowEditDialog(false);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, type }: { userId: string; type: 'soft' | 'hard' }) => {
      return apiRequest(`/api/admin/users/${userId}`, 'DELETE', { deleteType: type });
    },
    onSuccess: () => {
      toast({
        title: "Пользователь удален",
        description: deleteType === 'soft' ? "Пользователь перемещен в архив" : "Пользователь полностью удален"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowDeleteDialog(false);
    }
  });

  // Toggle 2FA mutation
  const toggle2FAMutation = useMutation({
    mutationFn: async ({ userId, enabled }: { userId: string; enabled: boolean }) => {
      return apiRequest(`/api/admin/users/${userId}/2fa`, 'PATCH', { enabled });
    },
    onSuccess: () => {
      toast({
        title: "2FA настроена",
        description: "Настройки двухфакторной аутентификации обновлены"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  // Set IP/GEO restrictions mutation
  const setRestrictionsMutation = useMutation({
    mutationFn: async ({ userId, restrictions }: { userId: string; restrictions: any }) => {
      return apiRequest(`/api/admin/users/${userId}/restrictions`, 'PATCH', restrictions);
    },
    onSuccess: () => {
      toast({
        title: "Ограничения обновлены",
        description: "IP и GEO ограничения успешно применены"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  const confirmBlockUser = () => {
    if (userToBlock && blockReason.trim()) {
      blockUserMutation.mutate({ userId: userToBlock, reason: blockReason });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      role: user.role,
      country: user.country || '',
      isActive: user.isActive,
      twoFactorEnabled: false, // будет загружено с сервера
      ipRestrictions: '',
      geoRestrictions: '',
      advertiserName: user.advertiserName || ''
    });
    setShowEditDialog(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate({ userId: selectedUser.id, type: deleteType });
    }
  };

  const handleSaveEdit = () => {
    if (selectedUser) {
      editUserMutation.mutate({ 
        userId: selectedUser.id, 
        userData: editForm 
      });
    }
  };

  const handleCreateUser = () => {
    createUserMutation.mutate(createForm);
  };

  const handleBulkAction = () => {
    if (selectedUsers.length === 0) return;
    
    bulkOperationMutation.mutate({
      action: bulkAction,
      userIds: selectedUsers,
      reason: bulkReason
    });
  };

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest('/api/admin/users', 'POST', userData);
    },
    onSuccess: () => {
      toast({
        title: "Пользователь создан",
        description: "Новый пользователь успешно создан"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowCreateDialog(false);
      setCreateForm({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'affiliate',
        userType: 'affiliate',
        country: '',
        advertiserName: ''
      });
    }
  });

  // Bulk operations mutation
  const bulkOperationMutation = useMutation({
    mutationFn: async ({ action, userIds, reason }: { action: string; userIds: string[]; reason?: string }) => {
      switch (action) {
        case 'block':
          return apiRequest('/api/admin/users/bulk-block', 'POST', { userIds, reason });
        case 'unblock':
          return apiRequest('/api/admin/users/bulk-unblock', 'POST', { userIds });
        case 'delete':
          return apiRequest('/api/admin/users/bulk-delete', 'POST', { userIds, deleteType: 'soft' });
        default:
          throw new Error('Unknown bulk action');
      }
    },
    onSuccess: () => {
      toast({
        title: "Массовая операция завершена",
        description: `Операция выполнена для ${selectedUsers.length} пользователей`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setSelectedUsers([]);
      setShowBulkDialog(false);
      setBulkReason('');
    }
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64'
      }`}>
        <Header title="Управление пользователями" />
        <main className="flex-1 overflow-auto">
          <div className="space-y-6 p-4 sm:p-6 max-w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Управление пользователями
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Управляйте пользователями системы, их ролями и настройками
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Создать пользователя
          </Button>
          {selectedUsers.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setShowBulkDialog(true)}
              className="border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <Shield className="mr-2 h-4 w-4" />
              Массовые действия ({selectedUsers.length})
            </Button>
          )}
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего пользователей
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(usersData?.data) ? usersData.data.length : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активных
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Array.isArray(usersData?.data) ? usersData.data.filter((u: User) => u.isActive).length : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Заблокированных
            </CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {Array.isArray(usersData?.data) ? usersData.data.filter((u: User) => !u.isActive).length : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Новых сегодня
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Array.isArray(usersData?.data) ? usersData.data.filter((u: User) => {
                const today = new Date().toDateString();
                return new Date(u.createdAt).toDateString() === today;
              }).length : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Первая строка фильтров */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск по email, ID, имени..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="super_admin">Супер-админ</SelectItem>
                  <SelectItem value="advertiser">Рекламодатель</SelectItem>
                  <SelectItem value="affiliate">Партнер</SelectItem>
                  <SelectItem value="staff">Сотрудник</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="blocked">Заблокированные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.userType} onValueChange={(value) => handleFilterChange('userType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Тип пользователя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="affiliate">Партнер</SelectItem>
                  <SelectItem value="advertiser">Рекламодатель</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Страна"
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              />

              <Input
                placeholder="Geo IP"
                value={filters.geoIP}
                onChange={(e) => handleFilterChange('geoIP', e.target.value)}
              />
            </div>

            {/* Вторая строка - фильтры по датам */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              <div>
                <label className="text-sm text-muted-foreground">Дата регистрации от:</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Дата регистрации до:</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Последний вход от:</label>
                <Input
                  type="date"
                  value={filters.lastActivityFrom}
                  onChange={(e) => handleFilterChange('lastActivityFrom', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Последний вход до:</label>
                <Input
                  type="date"
                  value={filters.lastActivityTo}
                  onChange={(e) => handleFilterChange('lastActivityTo', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-end gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setFilters({
                    search: '',
                    role: 'all',
                    status: 'all',
                    userType: 'all',
                    country: '',
                    dateFrom: '',
                    dateTo: '',
                    lastActivityFrom: '',
                    lastActivityTo: '',
                    geoIP: '',
                    page: 1,
                    limit: 20,
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                  });
                }}>
                  <Filter className="h-4 w-4 mr-1" />
                  Сбросить
                </Button>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Обновить
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Экспорт
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={selectedUsers.length === usersData?.data?.length && usersData?.data?.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(usersData?.data?.map((u: User) => u.id) || []);
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('id')}
                >
                  ID {getSortIcon('id')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('userType')}
                >
                  Тип {getSortIcon('userType')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('username')}
                >
                  Название аккаунта / Имя {getSortIcon('username')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('email')}
                >
                  Email / Telegram {getSortIcon('email')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('role')}
                >
                  Роль {getSortIcon('role')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('status')}
                >
                  Статус {getSortIcon('status')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('createdAt')}
                >
                  Дата регистрации {getSortIcon('createdAt')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('lastLoginAt')}
                >
                  Последний вход (IP) {getSortIcon('lastLoginAt')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('advertiserName')}
                >
                  Привязанный рекламодатель {getSortIcon('advertiserName')}
                </TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Загрузка...
                    </div>
                  </TableCell>
                </TableRow>
              ) : usersData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    Пользователи не найдены
                  </TableCell>
                </TableRow>
              ) : (
                usersData?.data?.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                      />
                    </TableCell>
                    
                    {/* ID пользователя */}
                    <TableCell className="font-mono text-xs">
                      {user.id.substring(0, 8)}...
                    </TableCell>
                    
                    {/* Тип пользователя */}
                    <TableCell>
                      <Badge variant={
                        user.userType === 'advertiser' ? 'default' :
                        user.userType === 'affiliate' ? 'secondary' :
                        user.userType === 'staff' ? 'outline' :
                        'destructive'
                      }>
                        {user.userType === 'advertiser' ? 'Рекламодатель' :
                         user.userType === 'affiliate' ? 'Партнёр' :
                         user.userType === 'staff' ? 'Сотрудник' : 'Админ'}
                      </Badge>
                    </TableCell>
                    
                    {/* Название аккаунта */}
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        {(user.firstName || user.lastName) && (
                          <div className="text-sm text-muted-foreground">
                            {user.firstName} {user.lastName}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Email */}
                    <TableCell>
                      <div className="text-sm">{user.email}</div>
                    </TableCell>
                    
                    {/* Роль */}
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          user.role === 'super_admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          user.role === 'advertiser' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          user.role === 'affiliate' ? 'bg-green-100 text-green-800 border-green-200' :
                          user.role === 'staff' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {user.role === 'super_admin' ? 'Супер-админ' :
                         user.role === 'advertiser' ? 'Рекламодатель' :
                         user.role === 'affiliate' ? 'Партнёр' :
                         user.role === 'staff' ? 'Сотрудник' : user.role}
                      </Badge>
                    </TableCell>
                    
                    {/* Статус */}
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? 'Активен' : 'Заблокирован'}
                      </Badge>
                    </TableCell>
                    
                    {/* Дата регистрации */}
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    
                    {/* Последний вход */}
                    <TableCell>
                      <div className="text-sm">
                        {user.lastLoginAt ? (
                          <>
                            <div>{formatDate(user.lastLoginAt)}</div>
                            {user.lastLoginIP && (
                              <div className="text-xs text-muted-foreground font-mono">
                                {user.lastLoginIP}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Никогда</span>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Привязанный рекламодатель */}
                    <TableCell>
                      {user.advertiserName ? (
                        <Badge 
                          variant="outline" 
                          className="bg-indigo-100 text-indigo-800 border-indigo-200"
                        >
                          {user.advertiserName}
                        </Badge>
                      ) : (
                        <Badge 
                          variant="outline" 
                          className="bg-gray-100 text-gray-500 border-gray-200"
                        >
                          Не привязан
                        </Badge>
                      )}
                    </TableCell>

                    {/* Действия */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setShowViewDialog(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Просмотр
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          {!user.isActive ? (
                            <DropdownMenuItem onClick={() => unblockUserMutation.mutate(user.id)}>
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Разблокировать
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleBlockUser(user.id)}>
                              <Ban className="mr-2 h-4 w-4" />
                              Заблокировать
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => forceLogoutMutation.mutate(user.id)}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Завершить сессии
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => resetPasswordMutation.mutate(user.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Сбросить пароль
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
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

      {/* Block User Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заблокировать пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="blockReason">Причина блокировки</Label>
              <Textarea
                id="blockReason"
                placeholder="Укажите причину блокировки..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
                Отмена
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmBlockUser}
                disabled={!blockReason.trim() || blockUserMutation.isPending}
              >
                {blockUserMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Заблокировать"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Имя</Label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                  placeholder="Введите имя"
                />
              </div>
              <div>
                <Label>Фамилия</Label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                  placeholder="Введите фамилию"
                />
              </div>
            </div>
            
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Роль</Label>
                <Select value={editForm.role} onValueChange={(value) => setEditForm({...editForm, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Супер-админ</SelectItem>
                    <SelectItem value="advertiser">Рекламодатель</SelectItem>
                    <SelectItem value="affiliate">Партнер</SelectItem>
                    <SelectItem value="staff">Сотрудник</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Страна</Label>
                <Input
                  value={editForm.country}
                  onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                  placeholder="Россия"
                />
              </div>
            </div>

            <div>
              <Label>Привязанный рекламодатель</Label>
              <Input
                value={editForm.advertiserName}
                onChange={(e) => setEditForm({...editForm, advertiserName: e.target.value})}
                placeholder="Название рекламодателя"
              />
            </div>

            <div className="space-y-2">
              <Label>IP ограничения (через запятую)</Label>
              <Textarea
                value={editForm.ipRestrictions}
                onChange={(e) => setEditForm({...editForm, ipRestrictions: e.target.value})}
                placeholder="192.168.1.1, 10.0.0.0/24"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>GEO ограничения (коды стран через запятую)</Label>
              <Textarea
                value={editForm.geoRestrictions}
                onChange={(e) => setEditForm({...editForm, geoRestrictions: e.target.value})}
                placeholder="RU, BY, KZ"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                />
                <Label htmlFor="isActive">Активный пользователь</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="twoFactorEnabled"
                  checked={editForm.twoFactorEnabled}
                  onChange={(e) => setEditForm({...editForm, twoFactorEnabled: e.target.checked})}
                />
                <Label htmlFor="twoFactorEnabled">2FA включена</Label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit} disabled={editUserMutation.isPending}>
              {editUserMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Профиль пользователя</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID пользователя</Label>
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {selectedUser.id}
                  </div>
                </div>
                <div>
                  <Label>Имя пользователя</Label>
                  <div className="font-medium">{selectedUser.username}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <div>{selectedUser.email}</div>
                </div>
                <div>
                  <Label>Роль</Label>
                  <Badge variant="outline">{selectedUser.role}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Статус</Label>
                  <Badge variant={selectedUser.isActive ? 'default' : 'destructive'}>
                    {selectedUser.isActive ? 'Активен' : 'Заблокирован'}
                  </Badge>
                </div>
                <div>
                  <Label>Страна</Label>
                  <div>{selectedUser.country || 'Не указана'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Дата регистрации</Label>
                  <div>{formatDate(selectedUser.createdAt)}</div>
                </div>
                <div>
                  <Label>Последний вход</Label>
                  <div>
                    {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Никогда'}
                    {selectedUser.lastLoginIP && (
                      <div className="text-xs text-muted-foreground font-mono">
                        {selectedUser.lastLoginIP}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label>Привязанный рекламодатель</Label>
                <div>{selectedUser.advertiserName || 'Не привязан'}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удаление пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Выберите тип удаления для пользователя: <strong>{selectedUser?.username}</strong>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="soft-delete"
                  name="deleteType"
                  checked={deleteType === 'soft'}
                  onChange={() => setDeleteType('soft')}
                />
                <Label htmlFor="soft-delete" className="flex-1">
                  <div className="font-medium">Мягкое удаление (архив)</div>
                  <div className="text-sm text-muted-foreground">
                    Пользователь будет перемещен в архив, данные сохранятся
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="hard-delete"
                  name="deleteType"
                  checked={deleteType === 'hard'}
                  onChange={() => setDeleteType('hard')}
                />
                <Label htmlFor="hard-delete" className="flex-1">
                  <div className="font-medium text-red-600">Полное удаление</div>
                  <div className="text-sm text-muted-foreground">
                    Все данные пользователя будут безвозвратно удалены
                  </div>
                </Label>
              </div>
            </div>

            {deleteType === 'hard' && (
              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <div className="text-sm text-red-800">
                  ⚠️ Внимание! Это действие нельзя отменить. Все данные пользователя, включая статистику и историю, будут полностью удалены.
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Отмена
            </Button>
            <Button 
              variant={deleteType === 'hard' ? 'destructive' : 'default'}
              onClick={confirmDelete}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {deleteType === 'soft' ? 'В архив' : 'Удалить навсегда'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Создать нового пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Имя пользователя *</Label>
                <Input
                  value={createForm.username}
                  onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                  placeholder="username"
                  required
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Пароль *</Label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                placeholder="Введите пароль"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Имя</Label>
                <Input
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm({...createForm, firstName: e.target.value})}
                  placeholder="Введите имя"
                />
              </div>
              <div>
                <Label>Фамилия</Label>
                <Input
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm({...createForm, lastName: e.target.value})}
                  placeholder="Введите фамилию"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Роль</Label>
                <Select value={createForm.role} onValueChange={(value) => setCreateForm({...createForm, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Супер-админ</SelectItem>
                    <SelectItem value="advertiser">Рекламодатель</SelectItem>
                    <SelectItem value="affiliate">Партнер</SelectItem>
                    <SelectItem value="staff">Сотрудник</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Тип пользователя</Label>
                <Select value={createForm.userType} onValueChange={(value) => setCreateForm({...createForm, userType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advertiser">Рекламодатель</SelectItem>
                    <SelectItem value="affiliate">Партнер</SelectItem>
                    <SelectItem value="staff">Сотрудник</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Страна</Label>
                <Input
                  value={createForm.country}
                  onChange={(e) => setCreateForm({...createForm, country: e.target.value})}
                  placeholder="Россия"
                />
              </div>
              <div>
                <Label>Привязанный рекламодатель</Label>
                <Input
                  value={createForm.advertiserName}
                  onChange={(e) => setCreateForm({...createForm, advertiserName: e.target.value})}
                  placeholder="Название рекламодателя"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleCreateUser} 
              disabled={createUserMutation.isPending || !createForm.username || !createForm.email || !createForm.password}
            >
              {createUserMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Создать пользователя
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Массовые действия</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Выбрано пользователей: <strong>{selectedUsers.length}</strong>
            </div>
            
            <div>
              <Label>Выберите действие</Label>
              <Select value={bulkAction} onValueChange={(value: 'block' | 'unblock' | 'delete') => setBulkAction(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Заблокировать пользователей</SelectItem>
                  <SelectItem value="unblock">Разблокировать пользователей</SelectItem>
                  <SelectItem value="delete">Удалить пользователей (в архив)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(bulkAction === 'block' || bulkAction === 'delete') && (
              <div>
                <Label>Причина</Label>
                <Textarea
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  placeholder="Укажите причину..."
                  required={bulkAction === 'block'}
                />
              </div>
            )}

            {bulkAction === 'delete' && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                <div className="text-sm text-yellow-800">
                  ⚠️ Пользователи будут перемещены в архив (мягкое удаление)
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Отмена
            </Button>
            <Button 
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              onClick={handleBulkAction}
              disabled={bulkOperationMutation.isPending || (bulkAction === 'block' && !bulkReason.trim())}
            >
              {bulkOperationMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {bulkAction === 'block' ? 'Заблокировать' : 
               bulkAction === 'unblock' ? 'Разблокировать' : 
               'Удалить в архив'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
        </main>
      </div>
    </div>
  );
}