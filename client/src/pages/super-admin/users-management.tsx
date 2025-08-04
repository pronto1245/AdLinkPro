import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
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
  Activity,
  Save
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  telegram?: string;
  role: string;
  userType?: string;
  country?: string;
  status?: string;
  kycStatus?: string;
  isBlocked?: boolean;
  blockReason?: string;
  lastLoginAt?: string;
  lastIpAddress?: string;
  registrationIp?: string;
  advertiserId?: string;
  advertiserName?: string;
  createdAt: string;
  isActive: boolean;
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
  const { t, language } = useLanguage();
  const { toast } = useToast();
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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'block' | 'unblock' | 'delete'>('block');

  // Utility functions for sorting
  const handleSort = (field: string) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters({ ...filters, sortBy: field, sortOrder: newOrder });
  };

  const getSortIcon = (field: string) => {
    if (filters.sortBy !== field) return '↕️';
    return filters.sortOrder === 'asc' ? '↑' : '↓';
  };
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    role: 'affiliate',
    country: '',
    isActive: true
  });

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
        description: "Все сессии пользователя завершены"
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Пользователь удален",
        description: "Пользователь успешно удален"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest('/api/admin/users', 'POST', userData);
    },
    onSuccess: () => {
      toast({
        title: "Пользователь создан",
        description: "Пользователь успешно создан"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowCreateDialog(false);
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
        description: "Пользователь успешно обновлен"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowEditDialog(false);
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}/reset-password`, 'POST');
    },
    onSuccess: (data: any) => {
      toast({
        title: "Пароль сброшен",
        description: `Новый пароль: ${data.newPassword}`
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
          return apiRequest('/api/admin/users/bulk-delete', 'POST', { userIds, hardDelete: false });
        default:
          throw new Error('Unknown bulk action');
      }
    },
    onSuccess: (data: any) => {
      toast({
        title: "Массовая операция завершена",
        description: `Успешно: ${data.success}, Ошибок: ${data.failed}`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setSelectedUsers([]);
      setShowBulkDialog(false);
    }
  });

  const handleFilterChange = (key: keyof UserFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleBlockUser = (userId: string) => {
    setUserToBlock(userId);
    setShowBlockDialog(true);
  };

  const confirmBlockUser = () => {
    if (userToBlock && blockReason.trim()) {
      blockUserMutation.mutate({ userId: userToBlock, reason: blockReason });
    }
  };

  const getStatusBadge = (user: User) => {
    // Use isActive field since isBlocked might not exist yet
    if (!user.isActive) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <Ban className="w-3 h-3" />
        Заблокирован
      </Badge>;
    }
    
    return <Badge variant="default" className="bg-green-500">
      Активен
    </Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      super_admin: "bg-purple-500",
      advertiser: "bg-blue-500", 
      affiliate: "bg-green-500",
      staff: "bg-orange-500"
    };
    
    const roleNames: Record<string, string> = {
      super_admin: "Супер-админ",
      advertiser: "Рекламодатель",
      affiliate: "Партнер",
      staff: "Сотрудник"
    };
    
    return (
      <Badge className={roleColors[role] || "bg-gray-500"}>
        <Shield className="w-3 h-3 mr-1" />
        {roleNames[role] || role}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm', {
      locale: language === 'ru' ? ru : enUS
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-0 lg:ml-64">
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
            Добавить пользователя
          </Button>
          
          {selectedUsers.length > 0 && (
            <Button variant="outline" onClick={() => setShowBulkDialog(true)}>
              Массовые операции ({selectedUsers.length})
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => {
              const params = new URLSearchParams(filters as any);
              window.open(`/api/admin/users/export?${params.toString()}&format=csv`, '_blank');
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
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
            <div className="text-2xl font-bold">{Array.isArray(usersData) ? usersData.length : 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активных пользователей
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Array.isArray(usersData) ? usersData.filter((u: User) => u.isActive).length : 0}
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
              {Array.isArray(usersData) ? usersData.filter((u: User) => !u.isActive).length : 0}
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
              {Array.isArray(usersData) ? usersData.filter((u: User) => {
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Поиск пользователей..."
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

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
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
                      {t.loading || "Загрузка..."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : usersData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    {t.noUsers || "Пользователи не найдены"}
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
                         user.userType === 'staff' ? 'Сотрудник' :
                         user.userType === 'admin' ? 'Админ' : user.userType || 'Партнёр'}
                      </Badge>
                    </TableCell>
                    
                    {/* Название аккаунта / Имя */}
                    <TableCell className="font-medium">
                      {user.company || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
                    </TableCell>
                    
                    {/* Email / Telegram */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{user.email}</div>
                        {user.telegram && (
                          <div className="text-xs text-muted-foreground">
                            TG: {user.telegram}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Роль */}
                    <TableCell>
                      <Badge variant={
                        user.role === 'super_admin' ? 'destructive' :
                        user.role === 'advertiser' ? 'default' :
                        user.role === 'affiliate' ? 'secondary' :
                        'outline'
                      }>
                        {user.role === 'super_admin' ? 'Супер-админ' :
                         user.role === 'advertiser' ? 'Рекламодатель' :
                         user.role === 'affiliate' ? 'Партнер' :
                         user.role === 'staff' ? 'Сотрудник' : user.role}
                      </Badge>
                    </TableCell>
                    
                    {/* Статус */}
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={user.isActive ? 'default' : 'destructive'}>
                          {user.isBlocked ? 'Заблокирован' : 
                           user.isActive ? 'Активен' : 'Неактивен'}
                        </Badge>
                        {user.kycStatus && (
                          <div className="text-xs text-muted-foreground">
                            KYC: {user.kycStatus === 'approved' ? 'Одобрен' :
                                  user.kycStatus === 'rejected' ? 'Отклонен' : 'Ожидает'}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Дата регистрации */}
                    <TableCell>
                      {format(new Date(user.createdAt), 'dd.MM.yyyy', { 
                        locale: language === 'ru' ? ru : enUS 
                      })}
                    </TableCell>
                    
                    {/* Последний вход (IP) */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {user.lastLoginAt ? 
                            format(new Date(user.lastLoginAt), 'dd.MM.yyyy HH:mm', { 
                              locale: language === 'ru' ? ru : enUS 
                            }) : 
                            'Никогда'
                          }
                        </div>
                        {user.lastIpAddress && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {user.lastIpAddress}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Привязанный рекламодатель */}
                    <TableCell>
                      {user.advertiserName ? (
                        <span className="text-sm">{user.advertiserName}</span>
                      ) : user.advertiserId ? (
                        <span className="text-xs text-muted-foreground font-mono">
                          {user.advertiserId.substring(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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
                            setSelectedUser(user);
                            setShowViewDialog(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t.view || "Просмотр"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setEditForm({
                              firstName: user.firstName || '',
                              lastName: user.lastName || '',
                              role: user.role,
                              country: user.country || '',
                              isActive: user.isActive
                            });
                            setShowEditDialog(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t.edit || "Редактировать"}
                          </DropdownMenuItem>
                          {!user.isActive ? (
                            <DropdownMenuItem onClick={() => unblockUserMutation.mutate(user.id)}>
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              {t.unblock || "Разблокировать"}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleBlockUser(user.id)}>
                              <Ban className="mr-2 h-4 w-4" />
                              {t.block || "Заблокировать"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => forceLogoutMutation.mutate(user.id)}>
                            <LogOut className="mr-2 h-4 w-4" />
                            {t.forceLogout || "Завершить сессии"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => resetPasswordMutation.mutate(user.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t.resetPassword || "Сбросить пароль"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t.delete || "Удалить"}
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
            <DialogTitle>{t.blockUser || "Заблокировать пользователя"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="blockReason">{t.blockReason || "Причина блокировки"}</Label>
              <Textarea
                id="blockReason"
                placeholder={t.enterBlockReason || "Укажите причину блокировки..."}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
                {t.cancel || "Отмена"}
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmBlockUser}
                disabled={!blockReason.trim() || blockUserMutation.isPending}
              >
                {blockUserMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="mr-2 h-4 w-4" />
                )}
                {t.block || "Заблокировать"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.createUser || "Создать пользователя"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.username || "Имя пользователя"}</Label>
                <Input id="username" placeholder="john_doe" />
              </div>
              <div>
                <Label>{t.email || "Email"}</Label>
                <Input id="email" type="email" placeholder="user@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.firstName || "Имя"}</Label>
                <Input id="firstName" placeholder="Иван" />
              </div>
              <div>
                <Label>{t.lastName || "Фамилия"}</Label>
                <Input id="lastName" placeholder="Иванов" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.role || "Роль"}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="affiliate">Партнер</SelectItem>
                    <SelectItem value="advertiser">Рекламодатель</SelectItem>
                    <SelectItem value="staff">Сотрудник</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.country || "Страна"}</Label>
                <Input id="country" placeholder="RU" />
              </div>
            </div>
            <div>
              <Label>{t.password || "Пароль"}</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {t.cancel || "Отмена"}
            </Button>
            <Button onClick={() => {
              const formData = {
                username: (document.getElementById('username') as HTMLInputElement)?.value,
                email: (document.getElementById('email') as HTMLInputElement)?.value,
                firstName: (document.getElementById('firstName') as HTMLInputElement)?.value,
                lastName: (document.getElementById('lastName') as HTMLInputElement)?.value,
                password: (document.getElementById('password') as HTMLInputElement)?.value,
                country: (document.getElementById('country') as HTMLInputElement)?.value,
                role: 'affiliate'
              };
              createUserMutation.mutate(formData);
            }}>
              {createUserMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {t.create || "Создать"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.userProfile || "Профиль пользователя"}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ID</Label>
                  <p className="text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t.username || "Имя пользователя"}</Label>
                  <p className="text-sm">{selectedUser.username}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t.email || "Email"}</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t.role || "Роль"}</Label>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t.status || "Статус"}</Label>
                  <div className="mt-1">{getStatusBadge(selectedUser)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t.country || "Страна"}</Label>
                  <p className="text-sm">{selectedUser.country || 'Не указано'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t.registered || "Зарегистрирован"}</Label>
                  <p className="text-sm">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t.lastActivity || "Последняя активность"}</Label>
                  <p className="text-sm">{selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Никогда'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.editUser || "Редактировать пользователя"}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.firstName || "Имя"}</Label>
                  <Input 
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    placeholder="Иван" 
                  />
                </div>
                <div>
                  <Label>{t.lastName || "Фамилия"}</Label>
                  <Input 
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    placeholder="Иванов" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.role || "Роль"}</Label>
                  <Select 
                    value={editForm.role} 
                    onValueChange={(value) => setEditForm({...editForm, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="affiliate">Партнер</SelectItem>
                      <SelectItem value="advertiser">Рекламодатель</SelectItem>
                      <SelectItem value="staff">Сотрудник</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.country || "Страна"}</Label>
                  <Input 
                    value={editForm.country}
                    onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                    placeholder="RU" 
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                  className="rounded"
                />
                <Label>{t.activeUser || "Активный пользователь"}</Label>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {t.cancel || "Отмена"}
            </Button>
            <Button onClick={() => {
              if (!selectedUser) return;
              
              editUserMutation.mutate({ 
                userId: selectedUser.id, 
                userData: editForm 
              });
            }}>
              {editUserMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {t.save || "Сохранить"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.bulkActions || "Массовые операции"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Выбрано пользователей: {selectedUsers.length}
            </p>
            
            <div>
              <Label>{t.selectAction || "Выберите действие"}</Label>
              <Select value={bulkAction} onValueChange={(value: any) => setBulkAction(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Заблокировать</SelectItem>
                  <SelectItem value="unblock">Разблокировать</SelectItem>
                  <SelectItem value="delete">Удалить</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bulkAction === 'block' && (
              <div>
                <Label>{t.reason || "Причина"}</Label>
                <Textarea
                  placeholder="Укажите причину..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                {t.cancel || "Отмена"}
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  bulkOperationMutation.mutate({
                    action: bulkAction,
                    userIds: selectedUsers,
                    reason: bulkAction === 'block' ? blockReason : undefined
                  });
                }}
                disabled={bulkOperationMutation.isPending || (bulkAction === 'block' && !blockReason.trim())}
              >
                {bulkOperationMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t.execute || "Выполнить"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}