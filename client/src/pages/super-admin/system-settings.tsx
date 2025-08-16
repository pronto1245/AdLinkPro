import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from 'react-i18next';

import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Settings, Database, Shield, DollarSign, Globe, Zap, Plus, Edit, Save, Trash2, Search } from 'lucide-react';

const systemSettingSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.any(),
  description: z.string().optional(),
  category: z.enum(['fraud', 'finance', 'general', 'security', 'integration', 'ui']),
  isPublic: z.boolean().default(false),
});

type SystemSettingFormData = z.infer<typeof systemSettingSchema>;

export default function SystemSettings() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<any>(null);

  // Fetch system settings
  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['/api/admin/system-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/system-settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  const createSettingMutation = useMutation({
    mutationFn: async (data: SystemSettingFormData) => {
      return await apiRequest('POST', '/api/admin/system-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system-settings'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: t('success'),
        description: 'System setting created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SystemSettingFormData> }) => {
      return await apiRequest('PATCH', `/api/admin/system-settings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system-settings'] });
      setEditingSetting(null);
      toast({
        title: t('success'),
        description: 'System setting updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteSettingMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/admin/system-settings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system-settings'] });
      toast({
        title: t('success'),
        description: 'System setting deleted successfully',
      });
    },
  });

  const form = useForm<SystemSettingFormData>({
    resolver: zodResolver(systemSettingSchema),
    defaultValues: {
      key: '',
      value: '',
      description: '',
      category: 'general',
      isPublic: false,
    },
  });

  const categories = [
    { value: 'all', label: 'All Categories', icon: <Settings className="w-4 h-4" /> },
    { value: 'fraud', label: 'Fraud Prevention', icon: <Shield className="w-4 h-4" /> },
    { value: 'finance', label: 'Financial', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { value: 'integration', label: 'Integrations', icon: <Zap className="w-4 h-4" /> },
    { value: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { value: 'ui', label: 'User Interface', icon: <Globe className="w-4 h-4" /> },
  ];

  const filteredSettings = settings.filter((setting: any) => {
    const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'fraud': return 'bg-red-100 text-red-800';
      case 'finance': return 'bg-green-100 text-green-800';
      case 'security': return 'bg-yellow-100 text-yellow-800';
      case 'integration': return 'bg-blue-100 text-blue-800';
      case 'ui': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
          <Header title="System Settings" />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        <Header title="System Settings" />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Category Tabs and Search */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full grid-cols-7">
                {categories.map((category) => (
                  <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-2" title={`Фильтр по категории: ${category.label}`}>
                    {category.icon}
                    <span className="hidden sm:inline">{category.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2" data-testid="button-create-setting" title="Создать новую настройку">
                    <Plus className="w-4 h-4" />
                    Add Setting
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create System Setting</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => createSettingMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="key"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Setting Key</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., fraud.max_clicks_per_hour" data-testid="input-setting-key" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-setting-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.slice(1).map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Setting value (JSON for objects)" data-testid="input-setting-value" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Setting description" data-testid="input-setting-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isPublic"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel>Public Setting</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-setting-public"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createSettingMutation.isPending}>
                          {createSettingMutation.isPending ? 'Creating...' : 'Create Setting'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search Filter */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск по ключу, описанию, значению..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-settings"
                    title="Поиск системных настроек"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Settings List */}
            <div className="grid gap-4">
              {filteredSettings.map((setting: any) => (
                <Card key={setting.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-mono">{setting.key}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryBadgeColor(setting.category)}>
                            {setting.category}
                          </Badge>
                          {setting.isPublic && (
                            <Badge variant="outline">Public</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSetting(setting)}
                          data-testid={`button-edit-setting-${setting.id}`}
                          title="Редактировать настройку"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSettingMutation.mutate(setting.id)}
                          data-testid={`button-delete-setting-${setting.id}`}
                          title="Удалить настройку"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {setting.description && (
                      <CardDescription>{setting.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                      <pre className="text-sm whitespace-pre-wrap">
                        {formatValue(setting.value)}
                      </pre>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Last updated: {new Date(setting.updatedAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredSettings.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No settings found
                    </h3>
                    <p className="text-gray-500">
                      {selectedCategory === 'all' 
                        ? 'No system settings have been configured yet.'
                        : `No settings found in the ${selectedCategory} category.`
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </Tabs>

          {/* Edit Dialog */}
          {editingSetting && (
            <Dialog open={!!editingSetting} onOpenChange={() => setEditingSetting(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit System Setting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Key</label>
                    <div className="font-mono text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      {editingSetting.key}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Value</label>
                    <Textarea
                      value={formatValue(editingSetting.value)}
                      onChange={(e) => setEditingSetting({
                        ...editingSetting,
                        value: e.target.value
                      })}
                      data-testid="input-edit-setting-value"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingSetting(null)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => updateSettingMutation.mutate({
                        id: editingSetting.id,
                        data: { value: editingSetting.value }
                      })}
                      disabled={updateSettingMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateSettingMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </div>
  );
}