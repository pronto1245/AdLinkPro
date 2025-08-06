import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  Clock,
  MapPin,
  Bell,
  Activity,
  Key,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download
} from 'lucide-react';

// Типы данных
interface TeamMember {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'manager' | 'analyst' | 'financier' | 'support';
  status: 'active' | 'inactive' | 'blocked';
  permissions: TeamPermissions;
  restrictions: TeamRestrictions;
  telegramNotifications: boolean;
  telegramUserId?: string;
  lastActivity: string;
  createdAt: string;
  createdBy: string;
}

interface TeamPermissions {
  manageOffers: boolean;
  managePartners: boolean;
  viewStatistics: boolean;
  financialOperations: boolean;
  postbacksApi: boolean;
}

interface TeamRestrictions {
  ipWhitelist: string[];
  geoRestrictions: string[];
  timeRestrictions: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
    workingDays: number[];
  };
}

interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  result: 'success' | 'failed' | 'warning';
}

// Роли и их права по умолчанию
const DEFAULT_PERMISSIONS = {
  manager: {
    manageOffers: true,
    managePartners: true,
    viewStatistics: true,
    financialOperations: false,
    postbacksApi: false
  },
  analyst: {
    manageOffers: false,
    managePartners: false,
    viewStatistics: true,
    financialOperations: false,
    postbacksApi: false
  },
  financier: {
    manageOffers: false,
    managePartners: false,
    viewStatistics: false,
    financialOperations: true,
    postbacksApi: false
  },
  support: {
    manageOffers: true,
    managePartners: false,
    viewStatistics: true,
    financialOperations: false,
    postbacksApi: true
  }
};

const ROLE_LABELS = {
  manager: 'Менеджер',
  analyst: 'Аналитик',
  financier: 'Финансист',
  support: 'Техподдержка'
};

const ROLE_COLORS = {
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  analyst: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  financier: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  support: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
};

export default function TeamManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Состояния
  const [activeTab, setActiveTab] = useState('members');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all'
  });

  // Форма добавления/редактирования сотрудника
  const [memberForm, setMemberForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'manager' as keyof typeof DEFAULT_PERMISSIONS,
    permissions: DEFAULT_PERMISSIONS.manager,
    restrictions: {
      ipWhitelist: [] as string[],
      geoRestrictions: [] as string[],
      timeRestrictions: {
        enabled: false,
        startTime: '09:00',
        endTime: '18:00',
        timezone: 'UTC',
        workingDays: [1, 2, 3, 4, 5]
      }
    },
    telegramNotifications: false,
    telegramUserId: ''
  });

  // Загрузка команды - интеграция с реальными API данными
  const { data: teamMembers = [], isLoading: membersLoading, refetch: refetchMembers, error: membersError } = useQuery({
    queryKey: ['/api/advertiser/team/members', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/advertiser/team/members', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Ошибка загрузки команды');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Загрузка логов активности
  const { data: activityLogs = [], isLoading: logsLoading, error: logsError } = useQuery({
    queryKey: ['/api/advertiser/team/activity-logs', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/advertiser/team/activity-logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Ошибка загрузки логов');
      return response.json();
    },
    enabled: !!user?.id
  });

  // Мутации для полной функциональной интеграции
  const inviteMemberMutation = useMutation({
    mutationFn: async (inviteData: { email: string; role: string }) => {
      const response = await fetch('/api/advertiser/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(inviteData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка отправки приглашения');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Приглашение отправлено",
        description: `Email-приглашение отправлено на ${data.email}`,
      });
      refetchMembers();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка отправки приглашения",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: async (memberData: any) => {
      const response = await fetch('/api/advertiser/team/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(memberData)
      });
      if (!response.ok) throw new Error('Ошибка создания сотрудника');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/team/members'] });
      setIsAddMemberOpen(false);
      resetForm();
      toast({
        title: "Сотрудник добавлен",
        description: "Новый сотрудник успешно добавлен в команду"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка добавления",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/advertiser/team/members/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Ошибка обновления сотрудника');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/team/members'] });
      setEditingMember(null);
      resetForm();
      toast({
        title: "Данные обновлены",
        description: "Информация о сотруднике успешно обновлена"
      });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/advertiser/team/members/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Ошибка удаления сотрудника');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/team/members'] });
      toast({
        title: "Сотрудник удалён",
        description: "Сотрудник успешно удалён из команды"
      });
    }
  });

  // Функции-обработчики для полной интеграции с действиями пользователя
  const handleInviteMember = () => {
    if (!memberForm.email || !memberForm.role) {
      toast({
        title: "Ошибка валидации",
        description: "Email и роль обязательны для заполнения",
        variant: "destructive"
      });
      return;
    }

    inviteMemberMutation.mutate({
      email: memberForm.email,
      role: memberForm.role
    });
  };

  const handleBulkActions = (action: 'activate' | 'block' | 'delete', memberIds: string[]) => {
    // Массовые операции с участниками команды
    const confirmMessage = action === 'delete' 
      ? `Удалить ${memberIds.length} участников?`
      : `${action === 'block' ? 'Заблокировать' : 'Активировать'} ${memberIds.length} участников?`;

    if (confirm(confirmMessage)) {
      // В реальном приложении здесь будет API вызов
      memberIds.forEach(id => {
        if (action === 'delete') {
          deleteMemberMutation.mutate(id);
        } else {
          updateMemberMutation.mutate({ 
            id, 
            data: { status: action === 'block' ? 'blocked' : 'active' }
          });
        }
      });
    }
  };

  const handleExportTeamData = (format: 'csv' | 'json' = 'csv') => {
    // Экспорт данных команды
    const exportData = teamMembers.map(member => ({
      email: member.email,
      name: `${member.firstName} ${member.lastName}`,
      role: ROLE_LABELS[member.role],
      status: member.status,
      lastActivity: member.lastActivity,
      createdAt: member.createdAt
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-members-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else {
      // CSV export
      const headers = ['Email', 'Name', 'Role', 'Status', 'Last Activity', 'Added Date'];
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => [
          row.email,
          row.name,
          row.role,
          row.status,
          row.lastActivity,
          row.createdAt
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-members-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }

    toast({
      title: "Экспорт завершен",
      description: `Данные команды экспортированы в формате ${format.toUpperCase()}`
    });
  };

  // Сброс формы
  const resetForm = () => {
    setMemberForm({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'manager',
      permissions: DEFAULT_PERMISSIONS.manager,
      restrictions: {
        ipWhitelist: [] as string[],
        geoRestrictions: [] as string[],
        timeRestrictions: {
          enabled: false,
          startTime: '09:00',
          endTime: '18:00',
          timezone: 'UTC',
          workingDays: [1, 2, 3, 4, 5]
        }
      },
      telegramNotifications: false,
      telegramUserId: ''
    });
  };

  // Обработка изменения роли
  const handleRoleChange = (role: keyof typeof DEFAULT_PERMISSIONS) => {
    setMemberForm(prev => ({
      ...prev,
      role,
      permissions: DEFAULT_PERMISSIONS[role]
    }));
  };

  // Фильтрация команды
  const filteredMembers = teamMembers.filter((member: TeamMember) => {
    const matchesSearch = 
      member.username.toLowerCase().includes(filters.search.toLowerCase()) ||
      member.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesRole = filters.role === 'all' || member.role === filters.role;
    const matchesStatus = filters.status === 'all' || member.status === filters.status;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!user) return <div>Загрузка...</div>;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Командный режим</h1>
          <p className="text-muted-foreground">
            Управление командой и разграничение прав доступа
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setIsAddMemberOpen(true)}
            data-testid="button-add-member"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить сотрудника
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleExportTeamData('csv')}
            data-testid="button-export-team"
          >
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Статистика команды */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Всего сотрудников</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Активных</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter((m: TeamMember) => m.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">С ограничениями</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter((m: TeamMember) => 
                    m.restrictions.ipWhitelist.length > 0 || 
                    m.restrictions.geoRestrictions.length > 0 ||
                    m.restrictions.timeRestrictions.enabled
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Telegram уведомления</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter((m: TeamMember) => m.telegramNotifications).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Вкладки */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Сотрудники</TabsTrigger>
          <TabsTrigger value="roles">Роли и права</TabsTrigger>
          <TabsTrigger value="activity">Логи действий</TabsTrigger>
        </TabsList>

        {/* Вкладка: Сотрудники */}
        <TabsContent value="members" className="space-y-4">
          {/* Фильтры */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Фильтры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Поиск</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Имя, email, username..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8"
                      data-testid="input-search-members"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Роль</Label>
                  <Select
                    value={filters.role}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger data-testid="select-role-filter">
                      <SelectValue placeholder="Все роли" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все роли</SelectItem>
                      <SelectItem value="manager">Менеджер</SelectItem>
                      <SelectItem value="analyst">Аналитик</SelectItem>
                      <SelectItem value="financier">Финансист</SelectItem>
                      <SelectItem value="support">Техподдержка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue placeholder="Все статусы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="active">Активный</SelectItem>
                      <SelectItem value="inactive">Неактивный</SelectItem>
                      <SelectItem value="blocked">Заблокирован</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Таблица сотрудников */}
          <Card>
            <CardHeader>
              <CardTitle>Список сотрудников ({filteredMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Сотрудник</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Последняя активность</TableHead>
                      <TableHead>Уведомления</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membersLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Загрузка...
                        </TableCell>
                      </TableRow>
                    ) : filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Сотрудники не найдены
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member: TeamMember) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {member.firstName} {member.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                @{member.username} • {member.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={ROLE_COLORS[member.role]}>
                              {ROLE_LABELS[member.role]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {member.status === 'active' && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {member.status === 'inactive' && (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                              {member.status === 'blocked' && (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="capitalize">{member.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(member.lastActivity).toLocaleString('ru-RU')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {member.telegramNotifications ? (
                              <Badge variant="outline" className="text-green-600">
                                <Bell className="h-3 w-3 mr-1" />
                                Включены
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">
                                Отключены
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingMember(member);
                                  setMemberForm({
                                    username: member.username,
                                    email: member.email,
                                    firstName: member.firstName,
                                    lastName: member.lastName,
                                    role: member.role,
                                    permissions: member.permissions,
                                    restrictions: member.restrictions,
                                    telegramNotifications: member.telegramNotifications,
                                    telegramUserId: member.telegramUserId || ''
                                  });
                                }}
                                data-testid={`button-edit-member-${member.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteMemberMutation.mutate(member.id)}
                                data-testid={`button-delete-member-${member.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
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
        </TabsContent>

        {/* Вкладка: Роли и права */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Таблица ролей и разрешений</CardTitle>
              <p className="text-sm text-muted-foreground">
                Права доступа для каждой роли в системе
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Функция</TableHead>
                      <TableHead className="text-center">Менеджер</TableHead>
                      <TableHead className="text-center">Аналитик</TableHead>
                      <TableHead className="text-center">Финансист</TableHead>
                      <TableHead className="text-center">Техподдержка</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Управление офферами</TableCell>
                      <TableCell className="text-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Управление партнёрами</TableCell>
                      <TableCell className="text-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Просмотр статистики</TableCell>
                      <TableCell className="text-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Финансовые операции</TableCell>
                      <TableCell className="text-center">
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Постбеки и API</TableCell>
                      <TableCell className="text-center">
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка: Логи действий */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Логи действий команды
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                История действий всех сотрудников команды
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Время</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Действие</TableHead>
                      <TableHead>Ресурс</TableHead>
                      <TableHead>IP адрес</TableHead>
                      <TableHead>Результат</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Загрузка логов...
                        </TableCell>
                      </TableRow>
                    ) : activityLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Логи активности не найдены
                        </TableCell>
                      </TableRow>
                    ) : (
                      activityLogs.slice(0, 50).map((log: ActivityLog) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(log.timestamp).toLocaleString('ru-RU')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{log.username}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.resource}</TableCell>
                          <TableCell>
                            <code className="text-xs">{log.ipAddress}</code>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {log.result === 'success' && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {log.result === 'failed' && (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              {log.result === 'warning' && (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="capitalize text-sm">{log.result}</span>
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
        </TabsContent>
      </Tabs>

      {/* Диалог добавления/редактирования сотрудника */}
      <Dialog open={isAddMemberOpen || !!editingMember} onOpenChange={(open) => {
        if (!open) {
          setIsAddMemberOpen(false);
          setEditingMember(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Основная информация */}
            <div className="space-y-4">
              <h3 className="font-medium">Основная информация</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={memberForm.username}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="username"
                    data-testid="input-member-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    data-testid="input-member-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя *</Label>
                  <Input
                    id="firstName"
                    value={memberForm.firstName}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Иван"
                    data-testid="input-member-firstname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input
                    id="lastName"
                    value={memberForm.lastName}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Иванов"
                    data-testid="input-member-lastname"
                  />
                </div>
              </div>
            </div>

            {/* Роль и права */}
            <div className="space-y-4">
              <h3 className="font-medium">Роль и права доступа</h3>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select
                  value={memberForm.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger data-testid="select-member-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Менеджер</SelectItem>
                    <SelectItem value="analyst">Аналитик</SelectItem>
                    <SelectItem value="financier">Финансист</SelectItem>
                    <SelectItem value="support">Техподдержка</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Разрешения</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="manageOffers" className="text-sm">Управление офферами</Label>
                    <Switch
                      id="manageOffers"
                      checked={memberForm.permissions.manageOffers}
                      onCheckedChange={(checked) => 
                        setMemberForm(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, manageOffers: checked }
                        }))
                      }
                      data-testid="switch-manage-offers"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="managePartners" className="text-sm">Управление партнёрами</Label>
                    <Switch
                      id="managePartners"
                      checked={memberForm.permissions.managePartners}
                      onCheckedChange={(checked) => 
                        setMemberForm(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, managePartners: checked }
                        }))
                      }
                      data-testid="switch-manage-partners"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="viewStatistics" className="text-sm">Просмотр статистики</Label>
                    <Switch
                      id="viewStatistics"
                      checked={memberForm.permissions.viewStatistics}
                      onCheckedChange={(checked) => 
                        setMemberForm(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, viewStatistics: checked }
                        }))
                      }
                      data-testid="switch-view-statistics"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="financialOperations" className="text-sm">Финансовые операции</Label>
                    <Switch
                      id="financialOperations"
                      checked={memberForm.permissions.financialOperations}
                      onCheckedChange={(checked) => 
                        setMemberForm(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, financialOperations: checked }
                        }))
                      }
                      data-testid="switch-financial-operations"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="postbacksApi" className="text-sm">Постбеки и API</Label>
                    <Switch
                      id="postbacksApi"
                      checked={memberForm.permissions.postbacksApi}
                      onCheckedChange={(checked) => 
                        setMemberForm(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, postbacksApi: checked }
                        }))
                      }
                      data-testid="switch-postbacks-api"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ограничения */}
            <div className="space-y-4">
              <h3 className="font-medium">Ограничения доступа</h3>
              
              <div className="space-y-2">
                <Label htmlFor="ipWhitelist">IP белый список (через запятую)</Label>
                <Textarea
                  id="ipWhitelist"
                  value={memberForm.restrictions.ipWhitelist.join(', ')}
                  onChange={(e) => 
                    setMemberForm(prev => ({
                      ...prev,
                      restrictions: {
                        ...prev.restrictions,
                        ipWhitelist: e.target.value.split(',').map(ip => ip.trim()).filter(Boolean)
                      }
                    }))
                  }
                  placeholder="192.168.1.1, 10.0.0.1"
                  data-testid="textarea-ip-whitelist"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="geoRestrictions">GEO ограничения (коды стран через запятую)</Label>
                <Input
                  id="geoRestrictions"
                  value={memberForm.restrictions.geoRestrictions.join(', ')}
                  onChange={(e) => 
                    setMemberForm(prev => ({
                      ...prev,
                      restrictions: {
                        ...prev.restrictions,
                        geoRestrictions: e.target.value.split(',').map(geo => geo.trim()).filter(Boolean)
                      }
                    }))
                  }
                  placeholder="RU, US, DE"
                  data-testid="input-geo-restrictions"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Временные ограничения</Label>
                  <Switch
                    checked={memberForm.restrictions.timeRestrictions.enabled}
                    onCheckedChange={(checked) => 
                      setMemberForm(prev => ({
                        ...prev,
                        restrictions: {
                          ...prev.restrictions,
                          timeRestrictions: { ...prev.restrictions.timeRestrictions, enabled: checked }
                        }
                      }))
                    }
                    data-testid="switch-time-restrictions"
                  />
                </div>
                
                {memberForm.restrictions.timeRestrictions.enabled && (
                  <div className="grid grid-cols-2 gap-4 pl-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Начало работы</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={memberForm.restrictions.timeRestrictions.startTime}
                        onChange={(e) => 
                          setMemberForm(prev => ({
                            ...prev,
                            restrictions: {
                              ...prev.restrictions,
                              timeRestrictions: { ...prev.restrictions.timeRestrictions, startTime: e.target.value }
                            }
                          }))
                        }
                        data-testid="input-start-time"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">Конец работы</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={memberForm.restrictions.timeRestrictions.endTime}
                        onChange={(e) => 
                          setMemberForm(prev => ({
                            ...prev,
                            restrictions: {
                              ...prev.restrictions,
                              timeRestrictions: { ...prev.restrictions.timeRestrictions, endTime: e.target.value }
                            }
                          }))
                        }
                        data-testid="input-end-time"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Telegram уведомления */}
            <div className="space-y-4">
              <h3 className="font-medium">Telegram уведомления</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="telegramNotifications">Включить Telegram уведомления</Label>
                <Switch
                  id="telegramNotifications"
                  checked={memberForm.telegramNotifications}
                  onCheckedChange={(checked) => 
                    setMemberForm(prev => ({ ...prev, telegramNotifications: checked }))
                  }
                  data-testid="switch-telegram-notifications"
                />
              </div>
              
              {memberForm.telegramNotifications && (
                <div className="space-y-2">
                  <Label htmlFor="telegramUserId">Telegram User ID</Label>
                  <Input
                    id="telegramUserId"
                    value={memberForm.telegramUserId}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, telegramUserId: e.target.value }))}
                    placeholder="123456789"
                    data-testid="input-telegram-user-id"
                  />
                </div>
              )}
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddMemberOpen(false);
                  setEditingMember(null);
                  resetForm();
                }}
                data-testid="button-cancel-member"
              >
                Отмена
              </Button>
              <Button
                onClick={() => {
                  if (editingMember) {
                    updateMemberMutation.mutate({ id: editingMember.id, data: memberForm });
                  } else if (memberForm.username && memberForm.firstName && memberForm.lastName) {
                    createMemberMutation.mutate(memberForm);
                  } else {
                    handleInviteMember();
                  }
                }}
                disabled={createMemberMutation.isPending || updateMemberMutation.isPending || inviteMemberMutation.isPending}
                data-testid="button-save-member"
              >
                {(createMemberMutation.isPending || updateMemberMutation.isPending || inviteMemberMutation.isPending) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {editingMember 
                  ? 'Сохранить' 
                  : (memberForm.username ? 'Добавить' : 'Пригласить')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}