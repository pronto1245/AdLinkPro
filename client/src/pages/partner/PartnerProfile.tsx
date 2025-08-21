import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/components/NotificationToast';
import { useAuth } from '@/contexts/auth-context';
import { profileApi } from '@/lib/api-services';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Globe, 
  Key, 
  Upload, 
  Save,
  Eye,
  EyeOff,
  Camera
} from 'lucide-react';

// Profile schema
const profileSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url('Введите корректный URL').optional().or(z.literal('')),
  country: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  contactType: z.enum(['telegram', 'whatsapp', 'skype']).optional(),
  contactValue: z.string().optional(),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Введите текущий пароль'),
  newPassword: z.string().min(6, 'Новый пароль должен содержать минимум 6 символов'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function PartnerProfile() {
  const { user, refreshUser } = useAuth();
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch profile data
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  });

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      company: profile?.company || '',
      website: profile?.website || '',
      country: profile?.country || '',
      city: profile?.city || '',
      bio: profile?.bio || '',
      contactType: profile?.contactType || 'telegram',
      contactValue: profile?.contactValue || '',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update profile form when data loads
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        company: profile.company || '',
        website: profile.website || '',
        country: profile.country || '',
        city: profile.city || '',
        bio: profile.bio || '',
        contactType: profile.contactType || 'telegram',
        contactValue: profile.contactValue || '',
      });
    }
  }, [profile, profileForm]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Профиль обновлен',
        message: 'Ваш профиль успешно обновлен',
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      refreshUser();
    },
    onError: (error: any) => {
      showNotification({
        type: 'error',
        title: 'Ошибка',
        message: error.message || 'Не удалось обновить профиль',
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      profileApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      showNotification({
        type: 'success',
        title: 'Пароль изменен',
        message: 'Ваш пароль успешно изменен',
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      showNotification({
        type: 'error',
        title: 'Ошибка',
        message: error.message || 'Не удалось изменить пароль',
      });
    },
  });

  const onUpdateProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onChangePassword = (data: PasswordFormData) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
              <Skeleton className="h-4 w-32 mx-auto mb-2" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </CardContent>
          </Card>
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Ошибка загрузки профиля</p>
            <Button onClick={() => window.location.reload()}>
              Обновить страницу
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Профиль</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Управляйте настройками своего аккаунта
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xl">
                    {getInitials(profile?.name || profile?.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <h3 className="font-semibold text-lg">{profile?.name || 'Не указано'}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{profile?.email}</p>
              
              <div className="space-y-2">
                <Badge variant="outline" className="mr-2">
                  {profile?.role === 'partner' ? 'Партнер' : 'Пользователь'}
                </Badge>
                {profile?.status && (
                  <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                    {profile.status === 'active' ? 'Активный' : 'Неактивный'}
                  </Badge>
                )}
              </div>
              
              {profile?.company && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-1" />
                    {profile.company}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Общие данные</TabsTrigger>
              <TabsTrigger value="security">Безопасность</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Полное имя *</Label>
                        <Input
                          {...profileForm.register('name')}
                          id="name"
                          placeholder="Иван Иванов"
                        />
                        {profileForm.formState.errors.name && (
                          <p className="text-sm text-red-600 mt-1">
                            {profileForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          {...profileForm.register('email')}
                          id="email"
                          type="email"
                          placeholder="example@company.com"
                        />
                        {profileForm.formState.errors.email && (
                          <p className="text-sm text-red-600 mt-1">
                            {profileForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone">Телефон</Label>
                        <Input
                          {...profileForm.register('phone')}
                          id="phone"
                          placeholder="+7 (900) 000-00-00"
                        />
                      </div>

                      <div>
                        <Label htmlFor="company">Компания</Label>
                        <Input
                          {...profileForm.register('company')}
                          id="company"
                          placeholder="ООО Моя Компания"
                        />
                      </div>

                      <div>
                        <Label htmlFor="website">Веб-сайт</Label>
                        <Input
                          {...profileForm.register('website')}
                          id="website"
                          placeholder="https://example.com"
                        />
                        {profileForm.formState.errors.website && (
                          <p className="text-sm text-red-600 mt-1">
                            {profileForm.formState.errors.website.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="country">Страна</Label>
                        <Input
                          {...profileForm.register('country')}
                          id="country"
                          placeholder="Россия"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="city">Город</Label>
                        <Input
                          {...profileForm.register('city')}
                          id="city"
                          placeholder="Москва"
                        />
                      </div>
                    </div>

                    {/* Contact preferences */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-4">Предпочитаемый способ связи</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactType">Способ связи</Label>
                          <Select
                            value={profileForm.watch('contactType')}
                            onValueChange={(value) => 
                              profileForm.setValue('contactType', value as any)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите способ связи" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="telegram">Telegram</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="skype">Skype</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="contactValue">Контакт</Label>
                          <Input
                            {...profileForm.register('contactValue')}
                            id="contactValue"
                            placeholder="@username или номер"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <Label htmlFor="bio">О себе</Label>
                      <Textarea
                        {...profileForm.register('bio')}
                        id="bio"
                        placeholder="Расскажите о себе..."
                        rows={4}
                      />
                    </div>

                    <Button 
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Изменить пароль</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Текущий пароль</Label>
                      <div className="relative">
                        <Input
                          {...passwordForm.register('currentPassword')}
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Введите текущий пароль"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-600 mt-1">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="newPassword">Новый пароль</Label>
                      <div className="relative">
                        <Input
                          {...passwordForm.register('newPassword')}
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Введите новый пароль"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-600 mt-1">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                      <div className="relative">
                        <Input
                          {...passwordForm.register('confirmPassword')}
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Повторите новый пароль"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      {changePasswordMutation.isPending ? 'Изменение...' : 'Изменить пароль'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
