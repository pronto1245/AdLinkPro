import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Copy, 
  FileText, 
  Database,
  RefreshCw,
  Plus
} from 'lucide-react';

interface Domain {
  id: string;
  domain: string;
  status: 'pending' | 'verified' | 'failed';
  verificationCode?: string;
  verificationMethod?: 'dns' | 'file';
  verifiedAt?: string;
  createdAt: string;
}

interface VerificationInstructions {
  dns: {
    title: string;
    description: string;
    record: {
      type: string;
      name: string;
      value: string;
      ttl?: string;
    };
    note: string;
  };
  file: {
    title: string;
    description: string;
    file: {
      path: string;
      content: string;
    };
    note: string;
  };
}

export default function DomainVerification() {
  const [newDomain, setNewDomain] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [instructions, setInstructions] = useState<VerificationInstructions | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing domains
  const { data: domains = [], isLoading } = useQuery<Domain[]>({
    queryKey: ['/api/advertiser/domains'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Add new domain mutation
  const addDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      return apiRequest('/api/advertiser/domains/verify', 'POST', { domain });
    },
    onSuccess: (data) => {
      toast({
        title: "Домен добавлен",
        description: "Домен успешно добавлен. Теперь подтвердите владение им."
      });
      setSelectedDomain(data.domain);
      setInstructions(data.instructions);
      setNewDomain('');
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/domains'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось добавить домен",
        variant: "destructive"
      });
    }
  });

  // Check domain verification mutation
  const checkVerificationMutation = useMutation({
    mutationFn: async (domainId: string) => {
      return apiRequest(`/api/advertiser/domains/${domainId}/check`, 'POST');
    },
    onSuccess: (data, _domainId) => {
      if (data.success) {
        toast({
          title: "Домен подтверждён!",
          description: `Домен успешно подтверждён методом ${data.method === 'dns' ? 'DNS TXT записи' : 'загрузки файла'}`,
        });
      } else {
        toast({
          title: "Подтверждение не удалось",
          description: data.message || "Проверьте правильность настройки DNS записи или файла",
          variant: "destructive"
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/domains'] });
    },
    onError: () => {
      toast({
        title: "Ошибка проверки",
        description: "Не удалось проверить статус домена",
        variant: "destructive"
      });
    }
  });

  // Get instructions for domain
  const getInstructions = async (domain: Domain) => {
    try {
      const data = await apiRequest(`/api/advertiser/domains/${domain.id}/instructions`);
      setInstructions(data.instructions);
      setSelectedDomain(domain);
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось получить инструкции",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: `${label} скопировано в буфер обмена`
    });
  };

  const handleAddDomain = () => {
    if (!newDomain.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название домена",
        variant: "destructive"
      });
      return;
    }

    // Basic domain validation
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomain)) {
      toast({
        title: "Неверный формат",
        description: "Введите корректное название домена (например: track.yoursite.com)",
        variant: "destructive"
      });
      return;
    }

    addDomainMutation.mutate(newDomain);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle2 className="w-3 h-3 mr-1" />Подтверждён</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><AlertCircle className="w-3 h-3 mr-1" />Ожидает подтверждения</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Ошибка</Badge>;
      default:
        return <Badge variant="secondary">Неизвестно</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Добавить кастомный домен
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="domain">Домен для трекинга</Label>
              <Input
                id="domain"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="track.yoursite.com"
                data-testid="input-domain"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Укажите поддомен для создания white-label ссылок
              </p>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddDomain}
                disabled={addDomainMutation.isPending}
                data-testid="button-add-domain"
              >
                {addDomainMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Добавить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Domains */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Мои домены
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Загрузка доменов...</p>
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>У вас пока нет добавленных доменов</p>
              <p className="text-sm">Добавьте первый домен выше</p>
            </div>
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => (
                <div key={domain.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="font-medium" data-testid={`text-domain-${domain.id}`}>
                          {domain.domain}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Добавлен {new Date(domain.createdAt).toLocaleDateString('ru-RU')}
                          {domain.verifiedAt && ` • Подтверждён ${new Date(domain.verifiedAt).toLocaleDateString('ru-RU')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(domain.status)}
                      {domain.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => getInstructions(domain)}
                            data-testid={`button-instructions-${domain.id}`}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Инструкции
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => checkVerificationMutation.mutate(domain.id)}
                            disabled={checkVerificationMutation.isPending}
                            data-testid={`button-check-${domain.id}`}
                          >
                            {checkVerificationMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Проверить
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Instructions */}
      {selectedDomain && instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Инструкции по подтверждению домена: {selectedDomain.domain}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dns" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dns" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  DNS TXT запись
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Загрузка файла
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dns" className="space-y-4">
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    {instructions.dns.description}
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Тип записи</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="px-2 py-1 bg-muted rounded text-sm">
                          {instructions.dns.record.type}
                        </code>
                      </div>
                    </div>
                    <div>
                      <Label>TTL (опционально)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="px-2 py-1 bg-muted rounded text-sm">
                          {instructions.dns.record.ttl || '300'}
                        </code>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Имя записи</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-sm">
                        {instructions.dns.record.name}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(instructions.dns.record.name, "Имя записи")}
                        data-testid="button-copy-dns-name"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Значение записи</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-sm">
                        {instructions.dns.record.value}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(instructions.dns.record.value, "Значение записи")}
                        data-testid="button-copy-dns-value"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {instructions.dns.note}
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              <TabsContent value="file" className="space-y-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    {instructions.file.description}
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <div>
                    <Label>Путь к файлу</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-sm">
                        {instructions.file.file.path}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(instructions.file.file.path, "Путь к файлу")}
                        data-testid="button-copy-file-path"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Содержимое файла</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-sm">
                        {instructions.file.file.content}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(instructions.file.file.content, "Содержимое файла")}
                        data-testid="button-copy-file-content"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {instructions.file.note}
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={() => checkVerificationMutation.mutate(selectedDomain.id)}
                disabled={checkVerificationMutation.isPending}
                className="w-full"
                data-testid="button-verify-domain"
              >
                {checkVerificationMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Проверить подтверждение домена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}