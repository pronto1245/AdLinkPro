import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  BarChart3,
  MousePointer,
  Download
} from "lucide-react";
import { useTeamManagement } from "@/hooks/team/useTeamManagement";
import type { 
  TeamMember, 
  CreateAffiliateTeamMemberData 
} from "@/types/team";
import { 
  AFFILIATE_ROLE_PERMISSIONS, 
  AVAILABLE_AFFILIATE_PERMISSIONS 
} from "@/types/team";

export default function TeamManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [createData, setCreateData] = useState<CreateAffiliateTeamMemberData>({
    email: '',
    username: '',
    password: '',
    role: 'buyer',
    permissions: [],
    subIdPrefix: ''
  });
  const { t } = useTranslation();

  // Use shared team management hook
  const {
    teamMembers,
    isLoadingMembers,
    createMemberMutation,
    updateMemberMutation,
    handleDeleteMember,
    handleExportTeamData
  } = useTeamManagement('affiliate');

  const handleRoleChange = (role: 'buyer' | 'analyst' | 'manager') => {
    const defaultPermissions = AFFILIATE_ROLE_PERMISSIONS[role].defaultPermissions;
    setCreateData(prev => ({
      ...prev,
      role,
      permissions: defaultPermissions
    }));
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setCreateData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const resetCreateForm = () => {
    setCreateData({
      email: '',
      username: '',
      password: '',
      role: 'buyer',
      permissions: [],
      subIdPrefix: ''
    });
    setIsCreateDialogOpen(false);
  };

  if (isLoadingMembers) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('team.title', 'Управление командой')}</h1>
          <p className="text-muted-foreground mt-2">
            Добавляйте байеров, аналитиков и менеджеров для работы с офферами
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExportTeamData('csv')}
            data-testid="button-export-team"
          >
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-team-member">
                <Plus className="h-4 w-4 mr-2" />
                Добавить участника
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Добавить участника команды</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createData.email}
                    onChange={(e) => setCreateData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    data-testid="input-team-member-email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="username">Имя пользователя</Label>
                  <Input
                    id="username"
                    value={createData.username}
                    onChange={(e) => setCreateData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="username"
                    data-testid="input-team-member-username"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={createData.password}
                    onChange={(e) => setCreateData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    data-testid="input-team-member-password"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Роль</Label>
                  <Select value={createData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger data-testid="select-team-member-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AFFILIATE_ROLE_PERMISSIONS).map(([key, role]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <MousePointer className="h-4 w-4" />
                            {role.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subIdPrefix">Префикс SubID</Label>
                  <Input
                    id="subIdPrefix"
                    value={createData.subIdPrefix}
                    onChange={(e) => setCreateData(prev => ({ ...prev, subIdPrefix: e.target.value }))}
                    placeholder="buyer1"
                    data-testid="input-team-member-subid"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Уникальный префикс для идентификации трафика этого участника
                  </p>
                </div>

                <div>
                  <Label>Разрешения</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {AVAILABLE_AFFILIATE_PERMISSIONS.map(permission => (
                      <div key={permission.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={createData.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(permission.id, checked as boolean)
                          }
                          data-testid={`checkbox-permission-${permission.id}`}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label 
                            htmlFor={permission.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.name}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={resetCreateForm}
                    data-testid="button-cancel-team-member"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={() => createMemberMutation.mutate(createData)}
                    disabled={createMemberMutation.isPending}
                    data-testid="button-save-team-member"
                  >
                    {createMemberMutation.isPending ? 'Добавление...' : 'Добавить'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего участников</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Байеров</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter(m => m.role === 'buyer').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Аналитиков</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter(m => m.role === 'analyst').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Активных</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter(m => m.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Участники команды ({teamMembers.length})</CardTitle>
          <CardDescription>
            Управление байерами, аналитиками и менеджерами
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>У вас пока нет участников команды</p>
              <p className="text-sm">Добавьте байеров и аналитиков для эффективной работы</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Участник</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>SubID Prefix</TableHead>
                    <TableHead>Разрешения</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Добавлен</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.username}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={AFFILIATE_ROLE_PERMISSIONS[member.role as keyof typeof AFFILIATE_ROLE_PERMISSIONS].color}>
                          <div className="flex items-center gap-1">
                            <MousePointer className="h-4 w-4" />
                            {AFFILIATE_ROLE_PERMISSIONS[member.role as keyof typeof AFFILIATE_ROLE_PERMISSIONS].name}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {member.subIdPrefix || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {Array.isArray(member.permissions) && member.permissions.slice(0, 2).map(permission => {
                            const perm = AVAILABLE_AFFILIATE_PERMISSIONS.find(p => p.id === permission);
                            return (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {perm?.name.split(' ')[0]}
                              </Badge>
                            );
                          })}
                          {Array.isArray(member.permissions) && member.permissions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.permissions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(member.createdAt).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMember(member)}
                            title="Редактировать"
                            data-testid={`button-edit-${member.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMember(member)}
                            title="Удалить"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`button-delete-${member.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Member Modal */}
      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Редактировать участника команды</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input 
                  value={editingMember.email} 
                  disabled 
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email нельзя изменить
                </p>
              </div>
              
              <div>
                <Label>Имя пользователя</Label>
                <Input 
                  value={editingMember.username} 
                  disabled 
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Имя пользователя нельзя изменить
                </p>
              </div>

              <div>
                <Label htmlFor="editRole">Роль</Label>
                <Select 
                  value={editingMember.role} 
                  onValueChange={(role: 'buyer' | 'analyst' | 'manager') => {
                    const defaultPermissions = AFFILIATE_ROLE_PERMISSIONS[role].defaultPermissions;
                    setEditingMember(prev => prev ? {
                      ...prev,
                      role,
                      permissions: defaultPermissions
                    } : null);
                  }}
                >
                  <SelectTrigger data-testid="select-edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AFFILIATE_ROLE_PERMISSIONS).map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <MousePointer className="h-4 w-4" />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editSubIdPrefix">Префикс SubID</Label>
                <Input
                  id="editSubIdPrefix"
                  value={editingMember.subIdPrefix || ''}
                  onChange={(e) => setEditingMember(prev => prev ? {
                    ...prev,
                    subIdPrefix: e.target.value
                  } : null)}
                  placeholder="buyer1"
                  data-testid="input-edit-subid"
                />
              </div>

              <div>
                <Label htmlFor="editIsActive">Статус</Label>
                <Select 
                  value={editingMember.isActive ? "active" : "inactive"} 
                  onValueChange={(value) => {
                    setEditingMember(prev => prev ? {
                      ...prev,
                      isActive: value === "active"
                    } : null);
                  }}
                >
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        Активен
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center gap-2">
                        <UserX className="h-4 w-4 text-gray-600" />
                        Неактивен
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingMember(null)}
                  data-testid="button-cancel-edit"
                >
                  Отмена
                </Button>
                <Button 
                  onClick={() => {
                    if (editingMember) {
                      updateMemberMutation.mutate({
                        id: editingMember.id,
                        role: editingMember.role,
                        permissions: editingMember.permissions,
                        subIdPrefix: editingMember.subIdPrefix,
                        isActive: editingMember.isActive
                      });
                    }
                  }}
                  disabled={updateMemberMutation.isPending}
                  data-testid="button-save-edit"
                >
                  {updateMemberMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}