import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User,
  Calendar,
  MessageSquare,
  Loader2,
  Send,
  Building2,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AccessRequest {
  id: string;
  offer_id: string;
  offer_name: string;
  advertiser_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  request_note?: string;
  partner_message?: string;
  requested_at: string;
  reviewed_at?: string;
  response_note?: string;
  advertiser_response?: string;
  expires_at: string;
}

const statusConfig = {
  pending: {
    label: 'Ожидает',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    icon: Clock
  },
  approved: {
    label: 'Одобрен',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: CheckCircle
  },
  rejected: {
    label: 'Отклонён',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: XCircle
  },
  cancelled: {
    label: 'Отменён',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: XCircle
  }
};

export default function AccessRequests() {
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery<AccessRequest[]>({
    queryKey: ['/api/partner/access-requests']
  });

  const cancelMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiRequest(`/api/partner/access-requests/${requestId}/cancel`, 'PATCH');
    },
    onSuccess: () => {
      toast({
        title: "Запрос отменён",
        description: "Ваш запрос на доступ успешно отменён",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/access-requests'] });
      setCancelModal(false);
      setSelectedRequest(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отменить запрос",
        variant: "destructive",
      });
    }
  });

  const handleCancelRequest = (request: AccessRequest) => {
    setSelectedRequest(request);
    setCancelModal(true);
  };

  const handleViewDetails = (request: AccessRequest) => {
    setSelectedRequest(request);
    setDetailsModal(true);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) {return null;}

    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-3">Загрузка запросов...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Send className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Запросы доступа к офферам</h1>
          </div>

          {requests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Пока нет запросов</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Вы ещё не отправляли запросы на доступ к приватным офферам.
                  Найдите интересный оффер и отправьте запрос рекламодателю.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const expired = isExpired(request.expires_at);
                
                return (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{request.offer_name}</h3>
                            {getStatusBadge(request.status)}
                            {expired && request.status === 'pending' && (
                              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Истёк
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              <span>{request.advertiser_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Отправлено {formatDistanceToNow(new Date(request.requested_at), { 
                                  addSuffix: true, 
                                  locale: ru 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                            data-testid={`button-details-${request.id}`}
                          >
                            Подробнее
                          </Button>
                          
                          {request.status === 'pending' && !expired && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleCancelRequest(request)}
                              data-testid={`button-cancel-${request.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Отменить
                            </Button>
                          )}
                        </div>
                      </div>

                      {request.partner_message && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Ваше сообщение:</strong> {request.partner_message}
                          </p>
                        </div>
                      )}

                      {request.advertiser_response && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                          <p className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>Ответ рекламодателя:</strong> {request.advertiser_response}
                          </p>
                        </div>
                      )}

                      {request.reviewed_at && (
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                          Обработано {formatDistanceToNow(new Date(request.reviewed_at), { 
                            addSuffix: true, 
                            locale: ru 
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={detailsModal} onOpenChange={setDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Детали запроса доступа</DialogTitle>
            <DialogDescription>
              {selectedRequest && `Запрос к офферу: ${selectedRequest.offer_name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Статус</h4>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Рекламодатель</h4>
                  <p className="mt-1">{selectedRequest.advertiser_name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Дата отправки</h4>
                  <p className="mt-1 text-sm">
                    {new Date(selectedRequest.requested_at).toLocaleString('ru')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Истекает</h4>
                  <p className="mt-1 text-sm">
                    {new Date(selectedRequest.expires_at).toLocaleString('ru')}
                  </p>
                </div>
              </div>

              {selectedRequest.partner_message && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Ваше сообщение рекламодателю
                  </h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm">{selectedRequest.partner_message}</p>
                  </div>
                </div>
              )}

              {selectedRequest.request_note && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Дополнительная информация
                  </h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm">{selectedRequest.request_note}</p>
                  </div>
                </div>
              )}

              {selectedRequest.advertiser_response && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Ответ рекламодателя
                  </h4>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-sm">{selectedRequest.advertiser_response}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailsModal(false)} data-testid="button-close-details">
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Modal */}
      <Dialog open={cancelModal} onOpenChange={setCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отменить запрос доступа</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите отменить запрос к офферу "{selectedRequest?.offer_name}"?
              Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelModal(false)}
              disabled={cancelMutation.isPending}
              data-testid="button-cancel-modal"
            >
              Нет, оставить
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRequest && cancelMutation.mutate(selectedRequest.id)}
              disabled={cancelMutation.isPending}
              data-testid="button-confirm-cancel"
            >
              {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Да, отменить запрос
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}