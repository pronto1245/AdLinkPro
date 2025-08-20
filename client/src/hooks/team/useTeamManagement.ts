import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { 
  TeamMember, 
  CreateAffiliateTeamMemberData, 
  CreateAdvertiserTeamMemberData,
  ActivityLog 
} from "@/types/team";

// Unified hook for team member management
export function useTeamManagement(type: 'affiliate' | 'advertiser') {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Determine API endpoints based on team type
  const endpoints = {
    affiliate: {
      list: '/api/affiliate/team',
      create: '/api/affiliate/team',
      update: (id: string) => `/api/affiliate/team/${id}`,
      delete: (id: string) => `/api/affiliate/team/${id}`,
      logs: null // Affiliate teams don't have activity logs
    },
    advertiser: {
      list: '/api/advertiser/team/members',
      create: '/api/advertiser/team/members',
      update: (id: string) => `/api/advertiser/team/members/${id}`,
      delete: (id: string) => `/api/advertiser/team/members/${id}`,
      logs: '/api/advertiser/team/activity-logs'
    }
  };

  const api = endpoints[type];
  
  // Query for team members
  const {
    data: teamMembers = [],
    isLoading: isLoadingMembers,
    error: membersError,
    refetch: refetchMembers
  } = useQuery<TeamMember[]>({
    queryKey: [api.list],
    queryFn: () => apiRequest(api.list, 'GET'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for activity logs (advertiser only)
  const {
    data: activityLogs = [],
    isLoading: isLoadingLogs,
    error: logsError
  } = useQuery<ActivityLog[]>({
    queryKey: [api.logs],
    queryFn: () => apiRequest(api.logs!, 'GET'),
    enabled: !!api.logs, // Only fetch if logs endpoint exists
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Create team member mutation
  const createMemberMutation = useMutation({
    mutationFn: (data: CreateAffiliateTeamMemberData | CreateAdvertiserTeamMemberData) =>
      apiRequest(api.create, 'POST', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.list] });
      toast({
        title: "Участник добавлен",
        description: `Новый участник команды ${data.username} успешно добавлен`,
      });
    },
    onError: (error: any) => {
      console.error('Create member error:', error);
      const errorMessage = error?.message || error?.error || "Не удалось добавить участника команды";
      toast({
        title: "Ошибка создания",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Update team member mutation
  const updateMemberMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<TeamMember> & { id: string }) =>
      apiRequest(api.update(id), 'PATCH', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.list] });
      toast({
        title: "Участник обновлён",
        description: `Информация об участнике ${data.username} обновлена`,
      });
    },
    onError: (error: any) => {
      console.error('Update member error:', error);
      toast({
        title: "Ошибка обновления",
        description: error?.message || "Не удалось обновить участника команды",
        variant: "destructive",
      });
    }
  });

  // Delete team member mutation  
  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => apiRequest(api.delete(id), 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.list] });
      toast({
        title: "Участник удалён",
        description: "Участник команды удалён из системы",
      });
    },
    onError: (error: any) => {
      console.error('Delete member error:', error);
      toast({
        title: "Ошибка удаления",
        description: error?.message || "Не удалось удалить участника команды",
        variant: "destructive",
      });
    }
  });

  // Team invite mutation (advertiser only)
  const inviteMemberMutation = useMutation({
    mutationFn: (inviteData: { email: string; role: string }) =>
      apiRequest('/api/advertiser/team/invite', 'POST', inviteData),
    onSuccess: (data) => {
      toast({
        title: "Приглашение отправлено",
        description: `Email-приглашение отправлено на ${data.email}`,
      });
      refetchMembers();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка отправки приглашения", 
        description: error?.message || "Не удалось отправить приглашение",
        variant: "destructive",
      });
    },
  });

  // Helper function to handle member deletion with confirmation
  const handleDeleteMember = (member: TeamMember) => {
    const memberName = type === 'advertiser' && member.firstName && member.lastName 
      ? `${member.firstName} ${member.lastName}` 
      : member.username;
      
    if (confirm(`Вы уверены, что хотите удалить участника ${memberName}?`)) {
      deleteMemberMutation.mutate(member.id);
    }
  };

  // Export team data helper
  const handleExportTeamData = (format: 'csv' | 'json' = 'csv') => {
    const exportData = teamMembers.map((member) => {
      const name = type === 'advertiser' && member.firstName && member.lastName
        ? `${member.firstName} ${member.lastName}`
        : member.username;
        
      return {
        username: member.username,
        email: member.email,
        name,
        role: member.role,
        status: member.status,
        lastActivity: member.lastActivity,
        createdAt: member.createdAt,
        ...(type === 'affiliate' && { subIdPrefix: member.subIdPrefix })
      };
    });

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-team-members-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      const headers = ['Username', 'Email', 'Name', 'Role', 'Status', 'Last Activity', 'Created'];
      if (type === 'affiliate') headers.push('SubID Prefix');
      
      const csvContent = [
        headers.join(','),
        ...exportData.map((row: any) => {
          const baseRow = [
            row.username,
            row.email, 
            row.name,
            row.role,
            row.status,
            row.lastActivity,
            row.createdAt
          ];
          if (type === 'affiliate') baseRow.push(row.subIdPrefix || '');
          return baseRow.join(',');
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-team-members-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Экспорт завершен",
      description: `Данные команды экспортированы в формате ${format.toUpperCase()}`
    });
  };

  return {
    // Data
    teamMembers,
    activityLogs,
    
    // Loading states
    isLoadingMembers,
    isLoadingLogs,
    
    // Errors
    membersError,
    logsError,
    
    // Mutations
    createMemberMutation,
    updateMemberMutation,
    deleteMemberMutation,
    inviteMemberMutation,
    
    // Helpers
    handleDeleteMember,
    handleExportTeamData,
    refetchMembers
  };
}