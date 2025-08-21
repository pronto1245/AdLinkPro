import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/components/NotificationToast';
import { usersApi } from '@/lib/api-services';
import { 
  Search, 
  Filter, 
  Users, 
  UserPlus, 
  Eye, 
  Edit, 
  Trash2,
  RefreshCw,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Building
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'partner' | 'advertiser' | 'owner' | 'staff' | 'super_admin';
  status: 'active' | 'inactive' | 'banned';
  phone?: string;
  company?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      partner: 'Партнер',
      advertiser: 'Рекламодатель',
      owner: 'Владелец',
      staff: 'Персонал',
      super_admin: 'Супер-админ',
    };
    return roleLabels[role] || role;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-yellow-600';
      case 'banned': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'inactive': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'banned': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Детали пользователя
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Имя</Label>
                  <p className="text-sm">{user.name || 'Не указано'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Роль</Label>
                  <p className="text-sm">{getRoleLabel(user.role)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Статус</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(user.status)}
                    <span className={`text-sm font-medium ${getStatusColor(user.status)}`}>
                      {user.status === 'active' ? 'Активный' : 
                       user.status === 'inactive' ? 'Неактивный' : 'Заблокирован'}
                    </span>
                  </div>
                </div>
                {user.phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Телефон</Label>
                    <p className="text-sm">{user.phone}</p>
                  </div>
                )}
                {user.company && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Компания</Label>
                    <p className="text-sm">{user.company}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Активность</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Дата регистрации</Label>
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Последний вход</Label>
                  <p className="text-sm">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Никогда'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function OwnerUsers() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Fetch users
  const { 
    data: usersData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['users', { search, role, status, page }],
    queryFn: () => usersApi.getUsers({
      page,
      limit: 10,
      role: role === 'all' ? undefined : role,
      status: status === 'all' ? undefined : status,
      search: search || undefined,
    }),
    keepPreviousData: true,
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'inactive' | 'banned' }) =>
      usersApi.updateUserStatus(userId, status),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Статус обновлен',
        message: 'Статус пользователя успешно изменен',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      showNotification({
        type: 'error',
        title: 'Ошибка',
        message: error.message || 'Не удалось изменить статус пользователя',
      });
    },
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleStatusUpdate = (userId: string, newStatus: 'active' | 'inactive' | 'banned') => {
    updateStatusMutation.mutate({ userId, status: newStatus });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'super_admin': return 'destructive';
      case 'advertiser': return 'default';
      case 'partner': return 'secondary';
      case 'staff': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'banned': return 'destructive';
      default: return 'outline';
    }
  };

  const users = usersData?.data || [];
  const totalPages = Math.ceil((usersData?.total || 0) / 10);

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Ошибка загрузки пользователей</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Управление пользователями</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Управляйте пользователями платформы
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Добавить пользователя
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                <p className="text-2xl font-bold">{usersData?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Активных</p>
                <p className="text-2xl font-bold">
                  {users.filter((u: User) => u.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Неактивных</p>
                <p className="text-2xl font-bold">
                  {users.filter((u: User) => u.status === 'inactive').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Заблокированных</p>
                <p className="text-2xl font-bold">
                  {users.filter((u: User) => u.status === 'banned').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск по имени или email..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Select value={role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="partner">Партнеры</SelectItem>
                  <SelectItem value="advertiser">Рекламодатели</SelectItem>
                  <SelectItem value="owner">Владельцы</SelectItem>
                  <SelectItem value="staff">Персонал</SelectItem>
                  <SelectItem value="super_admin">Супер-админы</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                  <SelectItem value="banned">Заблокированные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата регистрации</TableHead>
                  <TableHead>Последний вход</TableHead>
                  <TableHead className="w-[100px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.name || 'Не указано'}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role === 'partner' ? 'Партнер' : 
                         user.role === 'advertiser' ? 'Рекламодатель' : 
                         user.role === 'owner' ? 'Владелец' : 
                         user.role === 'staff' ? 'Персонал' : 
                         user.role === 'super_admin' ? 'Супер-админ' : user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status === 'active' ? 'Активный' : 
                         user.status === 'inactive' ? 'Неактивный' : 'Заблокирован'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt ? 
                        new Date(user.lastLoginAt).toLocaleDateString('ru-RU') : 
                        'Никогда'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select
                          value={user.status}
                          onValueChange={(value) => 
                            handleStatusUpdate(user.id, value as 'active' | 'inactive' | 'banned')
                          }
                        >
                          <SelectTrigger className="w-[100px] h-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Активный</SelectItem>
                            <SelectItem value="inactive">Неактивный</SelectItem>
                            <SelectItem value="banned">Заблокировать</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Пользователи не найдены</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Попробуйте изменить параметры поиска
              </p>
              <Button variant="outline" onClick={() => {
                setSearch('');
                setRole('all');
                setStatus('all');
                setPage(1);
              }}>
                Сбросить фильтры
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Назад
            </Button>
            <span className="text-sm text-gray-600">
              Страница {page} из {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Далее
            </Button>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}
