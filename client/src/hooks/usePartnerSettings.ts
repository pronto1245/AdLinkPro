import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  type PartnerSettings, 
  type NotificationSettings, 
  type SecuritySettings,
  type GeneralSettings,
  defaultPartnerSettings,
  validatePartnerSettings,
} from '@shared/partner-settings-schema';
import { type User } from '@shared/schema';

interface UsePartnerSettingsReturn {
  // Data
  settings: PartnerSettings | null;
  profileData: User | null;
  isLoading: boolean;
  error: Error | null;

  // Notification settings
  notifications: NotificationSettings;
  updateNotifications: (updates: Partial<NotificationSettings>) => void;
  saveNotifications: () => void;

  // Security settings  
  security: SecuritySettings;
  updateSecurity: (updates: Partial<SecuritySettings>) => void;
  saveSecurity: () => void;

  // General settings
  general: GeneralSettings;
  updateGeneral: (updates: Partial<GeneralSettings>) => void;
  saveGeneral: () => void;

  // Password management
  changePassword: (currentPassword: string, newPassword: string) => void;

  // Loading states
  isUpdatingNotifications: boolean;
  isUpdatingSecurity: boolean;
  isUpdatingGeneral: boolean;
  isChangingPassword: boolean;
}

export function usePartnerSettings(): UsePartnerSettingsReturn {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load profile data which contains settings
  const { data: profileData, isLoading, error } = useQuery<User>({
    queryKey: ['/api/partner/profile'],
    queryFn: async () => await apiRequest('/api/partner/profile', 'GET')
  });

  // Local state for settings
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultPartnerSettings.notifications);
  const [security, setSecurity] = useState<SecuritySettings>(defaultPartnerSettings.security);
  const [general, setGeneral] = useState<GeneralSettings>(defaultPartnerSettings.general);

  // Parse settings from profile data
  const settings = profileData?.settings ? 
    (() => {
      try {
        return validatePartnerSettings(profileData.settings);
      } catch {
        return defaultPartnerSettings;
      }
    })() : 
    defaultPartnerSettings;

  // Update local state when profile data changes
  useEffect(() => {
    if (settings) {
      setNotifications(settings.notifications);
      setSecurity(settings.security);  
      setGeneral(settings.general);
    }
  }, [settings]);

  // Mutation for updating notifications
  const notificationsMutation = useMutation({
    mutationFn: async (data: Partial<NotificationSettings>) => {
      const updatedSettings = {
        ...settings,
        notifications: { ...notifications, ...data },
        lastUpdated: new Date()
      };
      return apiRequest('/api/partner/profile', 'PATCH', { settings: updatedSettings });
    },
    onSuccess: () => {
      toast({
        title: "Настройки уведомлений сохранены",
        description: "Предпочтения уведомлений обновлены.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить настройки уведомлений.",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating security settings
  const securityMutation = useMutation({
    mutationFn: async (data: Partial<SecuritySettings>) => {
      const updatedSettings = {
        ...settings,
        security: { ...security, ...data },
        lastUpdated: new Date()
      };
      return apiRequest('/api/partner/profile', 'PATCH', { settings: updatedSettings });
    },
    onSuccess: () => {
      toast({
        title: "Настройки безопасности сохранены",
        description: "Параметры безопасности обновлены.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить настройки безопасности.",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating general settings
  const generalMutation = useMutation({
    mutationFn: async (data: Partial<GeneralSettings>) => {
      const updatedSettings = {
        ...settings,
        general: { ...general, ...data },
        lastUpdated: new Date()
      };
      return apiRequest('/api/partner/profile', 'PATCH', { settings: updatedSettings });
    },
    onSuccess: () => {
      toast({
        title: "Общие настройки сохранены",
        description: "Настройки языка и интерфейса обновлены.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка", 
        description: error.message || "Не удалось сохранить общие настройки.",
        variant: "destructive",
      });
    }
  });

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return apiRequest('/api/partner/profile/change-password', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Пароль обновлён",
        description: "Ваш пароль успешно изменён.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка смены пароля",
        description: error.message || "Неверный текущий пароль или ошибка сервера.",
        variant: "destructive",
      });
    }
  });

  return {
    // Data
    settings,
    profileData,
    isLoading,
    error,

    // Notification settings
    notifications,
    updateNotifications: setNotifications,
    saveNotifications: () => notificationsMutation.mutate(notifications),

    // Security settings
    security,
    updateSecurity: setSecurity,
    saveSecurity: () => securityMutation.mutate(security),

    // General settings
    general,
    updateGeneral: setGeneral,
    saveGeneral: () => generalMutation.mutate(general),

    // Password management
    changePassword: (currentPassword: string, newPassword: string) => {
      passwordMutation.mutate({ currentPassword, newPassword });
    },

    // Loading states
    isUpdatingNotifications: notificationsMutation.isPending,
    isUpdatingSecurity: securityMutation.isPending,
    isUpdatingGeneral: generalMutation.isPending,
    isChangingPassword: passwordMutation.isPending,
  };
}