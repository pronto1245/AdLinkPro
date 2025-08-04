import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
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
  Activity
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
  role: string;
  status: string;
  userType: string;
  country?: string;
  isBlocked: boolean;
  blockReason?: string;
  lastLoginAt?: string;
  createdAt: string;
  isActive: boolean;
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
  userType: string;
  country: string;
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
    role: '',
    status: '',
    userType: '',
    country: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [userToBlock, setUserToBlock] = useState<string | null>(null);

  // Get users with filters
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/users', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      return apiRequest(`/api/admin/users?${params.toString()}`);
    }
  });

  // Block user mutation
  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return apiRequest(`/api/admin/users/${userId}/block`, {
        method: 'POST',
        body: { reason }
      });
    },
    onSuccess: () => {
      toast({
        title: t.userBlocked || "Пользователь заблокирован",
        description: t.userBlockedSuccess || "Пользователь успешно заблокирован"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowBlockDialog(false);
      setBlockReason('');
    }
  });

  // Unblock user mutation
  const unblockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}/unblock`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: t.userUnblocked || "Пользователь разблокирован",
        description: t.userUnblockedSuccess || "Пользователь успешно разблокирован"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  // Force logout mutation
  const forceLogoutMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}/force-logout`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: t.userLoggedOut || "Сессии завершены",
        description: t.userLoggedOutSuccess || "Все сессии пользователя завершены"
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: t.userDeleted || "Пользователь удален",
        description: t.userDeletedSuccess || "Пользователь успешно удален"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
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
    if (user.isBlocked) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <Ban className="w-3 h-3" />
        {t.blocked || "Заблокирован"}
      </Badge>;
    }
    
    if (!user.isActive) {
      return <Badge variant="secondary">
        {t.inactive || "Неактивен"}
      </Badge>;
    }
    
    return <Badge variant="default" className="bg-green-500">
      {t.active || "Активен"}
    </Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      super_admin: "bg-purple-500",
      advertiser: "bg-blue-500", 
      affiliate: "bg-green-500",
      staff: "bg-orange-500"
    };
    
    return (
      <Badge className={roleColors[role] || "bg-gray-500"}>
        <Shield className="w-3 h-3 mr-1" />
        {t[role] || role}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm', {
      locale: language === 'ru' ? ru : enUS
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.usersManagement || "Управление пользователями"}
          </h1>
          <p className="text-muted-foreground">
            {t.usersManagementDescription || "Управляйте пользователями системы"}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t.addUser || "Добавить пользователя"}
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.totalUsers || "Всего пользователей"}
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersData?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.activeUsers || "Активных пользователей"}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {usersData?.data?.filter((u: User) => u.isActive && !u.isBlocked).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.blockedUsers || "Заблокированных"}
            </CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {usersData?.data?.filter((u: User) => u.isBlocked).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.newUsersToday || "Новых сегодня"}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {usersData?.data?.filter((u: User) => {
                const today = new Date().toDateString();
                return new Date(u.createdAt).toDateString() === today;
              }).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t.searchUsers || "Поиск пользователей..."}
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectRole || "Выберите роль"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все роли</SelectItem>
                <SelectItem value="super_admin">Супер-админ</SelectItem>
                <SelectItem value="advertiser">Рекламодатель</SelectItem>
                <SelectItem value="affiliate">Партнер</SelectItem>
                <SelectItem value="staff">Сотрудник</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectStatus || "Выберите статус"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="blocked">Заблокированные</SelectItem>
                <SelectItem value="inactive">Неактивные</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.userType} onValueChange={(value) => handleFilterChange('userType', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectUserType || "Тип пользователя"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все типы</SelectItem>
                <SelectItem value="affiliate">Партнер</SelectItem>
                <SelectItem value="advertiser">Рекламодатель</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder={t.country || "Страна"}
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead>{t.username || "Имя пользователя"}</TableHead>
                <TableHead>{t.email || "Email"}</TableHead>
                <TableHead>{t.role || "Роль"}</TableHead>
                <TableHead>{t.status || "Статус"}</TableHead>
                <TableHead>{t.country || "Страна"}</TableHead>
                <TableHead>{t.lastActivity || "Последняя активность"}</TableHead>
                <TableHead>{t.registered || "Зарегистрирован"}</TableHead>
                <TableHead className="text-right">{t.actions || "Действия"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {t.loading || "Загрузка..."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : usersData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
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
                    <TableCell className="font-medium">
                      <div>
                        <div>{user.username}</div>
                        {user.firstName && user.lastName && (
                          <div className="text-sm text-muted-foreground">
                            {user.firstName} {user.lastName}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>
                      {user.country && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {user.country}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : t.never || "Никогда"}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            {t.view || "Просмотр"}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            {t.edit || "Редактировать"}
                          </DropdownMenuItem>
                          {user.isBlocked ? (
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
    </div>
  );
}