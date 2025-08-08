import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Copy, ExternalLink, Link as LinkIcon, Globe, Trash2 } from 'lucide-react';

interface TrackingLink {
  id: string;
  url: string;
  trackingCode: string;
  customDomain?: string;
  isCustomDomain: boolean;
  clickCount: number;
  createdAt: string;
  isActive: boolean;
  subId1?: string;
  subId2?: string;
  subId3?: string;
  subId4?: string;
  subId5?: string;
  offerName: string;
  offerPayout: string;
}

interface LinkGeneratorProps {
  offerId: string;
  offerName: string;
}

export function LinkGenerator({ offerId, offerName }: LinkGeneratorProps) {
  const [subId1, setSubId1] = useState('');
  const [subId2, setSubId2] = useState('');
  const [subId3, setSubId3] = useState('');
  const [subId4, setSubId4] = useState('');
  const [subId5, setSubId5] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing tracking links for this offer
  const { data: trackingLinks = [], isLoading } = useQuery<TrackingLink[]>({
    queryKey: ['/api/partner/tracking-links', { offerId }],
    queryFn: () => apiRequest(`/api/partner/tracking-links?offerId=${offerId}`)
  });

  // Generate new tracking link
  const generateLinkMutation = useMutation({
    mutationFn: async (params: {
      offerId: string;
      subId1?: string;
      subId2?: string;
      subId3?: string;
      subId4?: string;
      subId5?: string;
    }) => {
      return apiRequest('/api/partner/tracking-links', {
        method: 'POST',
        body: params
      });
    },
    onSuccess: () => {
      toast({
        title: "Ссылка создана",
        description: "Партнёрская ссылка успешно сгенерирована"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/tracking-links'] });
      // Clear form
      setSubId1('');
      setSubId2('');
      setSubId3('');
      setSubId4('');
      setSubId5('');
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать ссылку",
        variant: "destructive"
      });
    }
  });

  // Deactivate tracking link
  const deactivateLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      return apiRequest(`/api/partner/tracking-links/${linkId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Ссылка деактивирована",
        description: "Ссылка успешно деактивирована"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/tracking-links'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось деактивировать ссылку",
        variant: "destructive"
      });
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "Ссылка скопирована в буфер обмена"
    });
  };

  const handleGenerateLink = () => {
    generateLinkMutation.mutate({
      offerId,
      subId1: subId1 || undefined,
      subId2: subId2 || undefined,
      subId3: subId3 || undefined,
      subId4: subId4 || undefined,
      subId5: subId5 || undefined
    });
  };

  const handleDeactivateLink = (linkId: string) => {
    if (window.confirm('Вы уверены, что хотите деактивировать эту ссылку?')) {
      deactivateLinkMutation.mutate(linkId);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Генератор партнёрских ссылок
          </CardTitle>
          <CardDescription>
            Создавайте персонализированные ссылки для оффера "{offerName}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generator">Создать ссылку</TabsTrigger>
              <TabsTrigger value="existing">Мои ссылки</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generator" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subId1">SubID 1</Label>
                  <Input
                    id="subId1"
                    value={subId1}
                    onChange={(e) => setSubId1(e.target.value)}
                    placeholder="Источник трафика"
                    data-testid="input-subid1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subId2">SubID 2</Label>
                  <Input
                    id="subId2"
                    value={subId2}
                    onChange={(e) => setSubId2(e.target.value)}
                    placeholder="Кампания"
                    data-testid="input-subid2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subId3">SubID 3</Label>
                  <Input
                    id="subId3"
                    value={subId3}
                    onChange={(e) => setSubId3(e.target.value)}
                    placeholder="Объявление"
                    data-testid="input-subid3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subId4">SubID 4</Label>
                  <Input
                    id="subId4"
                    value={subId4}
                    onChange={(e) => setSubId4(e.target.value)}
                    placeholder="Ключевое слово"
                    data-testid="input-subid4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subId5">SubID 5</Label>
                  <Input
                    id="subId5"
                    value={subId5}
                    onChange={(e) => setSubId5(e.target.value)}
                    placeholder="Дополнительно"
                    data-testid="input-subid5"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleGenerateLink}
                disabled={generateLinkMutation.isPending}
                className="w-full"
                data-testid="button-generate-link"
              >
                {generateLinkMutation.isPending ? 'Создание...' : 'Создать ссылку'}
              </Button>
            </TabsContent>
            
            <TabsContent value="existing" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Загрузка ссылок...</p>
                </div>
              ) : trackingLinks.length === 0 ? (
                <div className="text-center py-8">
                  <LinkIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">У вас пока нет ссылок для этого оффера</p>
                  <p className="text-sm text-gray-500">Создайте первую ссылку во вкладке "Создать ссылку"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trackingLinks.map((link) => (
                    <Card key={link.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {link.isCustomDomain && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  Кастомный домен
                                </Badge>
                              )}
                              <Badge variant={link.isActive ? "default" : "secondary"}>
                                {link.isActive ? 'Активна' : 'Неактивна'}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {link.clickCount} кликов
                              </span>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md mb-3">
                              <code className="text-sm break-all" data-testid={`text-link-url-${link.id}`}>
                                {link.url}
                              </code>
                            </div>
                            
                            {(link.subId1 || link.subId2 || link.subId3 || link.subId4 || link.subId5) && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {link.subId1 && <Badge variant="outline">sub1: {link.subId1}</Badge>}
                                {link.subId2 && <Badge variant="outline">sub2: {link.subId2}</Badge>}
                                {link.subId3 && <Badge variant="outline">sub3: {link.subId3}</Badge>}
                                {link.subId4 && <Badge variant="outline">sub4: {link.subId4}</Badge>}
                                {link.subId5 && <Badge variant="outline">sub5: {link.subId5}</Badge>}
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-500">
                              Создана: {new Date(link.createdAt).toLocaleString('ru-RU')}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(link.url)}
                              title="Копировать ссылку"
                              data-testid={`button-copy-${link.id}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(link.url, '_blank')}
                              title="Открыть ссылку"
                              data-testid={`button-open-${link.id}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            {link.isActive && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeactivateLink(link.id)}
                                title="Деактивировать ссылку"
                                className="text-red-600 hover:text-red-700"
                                data-testid={`button-deactivate-${link.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}