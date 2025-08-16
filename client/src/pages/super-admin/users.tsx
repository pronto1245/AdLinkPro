import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/auth-context';
import { useTranslation } from 'react-i18next';
import { queryClient } from '../../lib/queryClient';
import Sidebar from '../../components/layout/sidebar';
import Header from '../../components/layout/header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertUserSchema } from '@shared/schema';
import { z } from 'zod';
import { Plus, Search, Edit, Trash2, Shield, Users, DollarSign, Eye, Flag } from 'lucide-react';
import { getCountryFlag, getCountryName } from '../../utils/countries';
import { useLocation } from 'wouter';

export default function UsersManagement() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof insertUserSchema>) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const createUserSchema = insertUserSchema.omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true,
    lastLoginAt: true,
    registrationIp: true,
    geoRestrictions: true,
    timeRestrictions: true,
    isBlocked: true,
    blockReason: true,
    blockedAt: true,
    blockedBy: true,
    isDeleted: true,
    deletedAt: true,
    deletedBy: true,
    ownerId: true,
    advertiserId: true,
    balance: true,
    holdAmount: true,
    registrationApproved: true,
    documentsVerified: true,
    settings: true,
    adminRole: true,
    ipRestrictions: true,
    twoFactorEnabled: true,
    twoFactorSecret: true,
    lastIpAddress: true,
    sessionToken: true,
    telegram: true
  });

  const form = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: 'affiliate' as const,
      firstName: '',
      lastName: '',
      company: '',
      phone: '',
      country: '',
      language: 'en' as const,
      timezone: 'UTC',
      currency: 'USD',
      kycStatus: 'pending' as const,
      isActive: true,
      status: 'active' as const,
      userType: 'affiliate' as const
    },
  });

  const filteredUsers = users?.data?.filter((user: any) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  }) || [];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'advertiser': return 'bg-blue-100 text-blue-800';
      case 'affiliate': return 'bg-green-100 text-green-800';
      case 'staff': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Shield className="w-4 h-4" />;
      case 'advertiser': return <DollarSign className="w-4 h-4" />;
      case 'affiliate': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <Header title={t('users_management')} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('users_management')}</h1>
                <p className="text-gray-600 dark:text-gray-400">{t('manage_platform_users')}</p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-user">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('create_user')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('create_new_user')}</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('username')}</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('email')}</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('password')}</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} data-testid="input-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('role')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-role">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="affiliate">{t('affiliate')}</SelectItem>
                                <SelectItem value="advertiser">{t('advertiser')}</SelectItem>
                                <SelectItem value="staff">{t('staff')}</SelectItem>
                                <SelectItem value="super_admin">{t('super_admin')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('first_name')}</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-first-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('last_name')}</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-last-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          {t('cancel')}
                        </Button>
                        <Button type="submit" disabled={createUserMutation.isPending} data-testid="button-submit-user">
                          {createUserMutation.isPending ? t('creating') : t('create')}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Поиск по имени, email, компании..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-users"
                      title="Поиск пользователей"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-[180px]" data-testid="select-filter-role" title="Фильтр по роли">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all_roles')}</SelectItem>
                      <SelectItem value="super_admin">{t('super_admin')}</SelectItem>
                      <SelectItem value="advertiser">{t('advertiser')}</SelectItem>
                      <SelectItem value="affiliate">{t('affiliate')}</SelectItem>
                      <SelectItem value="staff">{t('staff')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t('users')} ({filteredUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('user')}</TableHead>
                        <TableHead>№ Партнера</TableHead>
                        <TableHead>Гео</TableHead>
                        <TableHead>{t('role')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('kyc_status')}</TableHead>
                        <TableHead>Фрод-риск</TableHead>
                        <TableHead>{t('created_at')}</TableHead>
                        <TableHead>{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user: any) => (
                        <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                {user.firstName?.charAt(0) || user.username.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white" data-testid={`text-username-${user.id}`}>
                                  {user.username}
                                </div>
                                <div className="text-sm text-gray-500" data-testid={`text-email-${user.id}`}>
                                  {user.email}
                                </div>
                                {user.firstName && (
                                  <div className="text-sm text-gray-500">
                                    {user.firstName} {user.lastName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.role === 'affiliate' && user.partnerNumber ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                #{user.partnerNumber}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.country ? (
                              <div className="flex items-center gap-2" title={getCountryName(user.country)}>
                                <span className="text-lg">{getCountryFlag(user.country)}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{user.country}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getRoleBadgeColor(user.role)} flex items-center gap-1 w-fit`}>
                              {getRoleIcon(user.role)}
                              {t(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? 'default' : 'secondary'} data-testid={`status-${user.id}`}>
                              {user.isActive ? t('active') : t('inactive')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.kycStatus === 'approved' ? 'default' : user.kycStatus === 'rejected' ? 'destructive' : 'secondary'}
                              data-testid={`kyc-status-${user.id}`}
                            >
                              {t(user.kycStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Низкий
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setLocation(`/admin/fraud?user=${user.id}`)}
                                title="Фрод-анализ пользователя"
                                className="p-1"
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell data-testid={`text-created-${user.id}`}>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" data-testid={`button-edit-${user.id}`} title="Редактировать пользователя">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => deleteUserMutation.mutate(user.id)}
                                disabled={deleteUserMutation.isPending}
                                data-testid={`button-delete-${user.id}`}
                                title="Удалить пользователя"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setLocation(`/admin/fraud?user=${user.id}`)}
                                title="Пометить как подозрительного"
                                className="p-1"
                              >
                                <Flag className="w-4 h-4 text-orange-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}