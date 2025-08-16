import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useToast } from "../../hooks/use-toast";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User,
  Mail,
  Calendar,
  MessageSquare,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

// Безопасная функция для форматирования дат
const safeFormatDistanceToNow = (dateString: string) => {
  try {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return 'неизвестно когда';
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date for formatting:', dateString);
      return 'неизвестно когда';
    }
    
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ru 
    });
  } catch (error) {
    console.error('Error formatting date distance:', error, dateString);
    return 'неизвестно когда';
  }
};

interface AccessRequest {
  id: string;
  partner_id: string;
  partner_username: string;
  partner_email: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  request_note?: string;
  partner_message?: string;
  requested_at: string;
  reviewed_at?: string;
  response_note?: string;
  expires_at: string;
}

interface AccessRequestsManagerProps {
  offerId: string;
  offerName: string;
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

export function AccessRequestsManager({ offerId, offerName }: AccessRequestsManagerProps) {
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    action: '',
    responseNote: '',
    advertiserResponse: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery<AccessRequest[]>({
    queryKey: [`/api/offers/${offerId}/access-requests`],
    enabled: !!offerId
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: {
      requestId: string;
      action: string;
      responseNote: string;
      advertiserResponse: string;
    }) => {
      return apiRequest(`/api/offers/${offerId}/access-requests/${data.requestId}`, 'PATCH', {
        action: data.action,
        responseNote: data.responseNote,
        advertiserResponse: data.advertiserResponse
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Запрос обработан",
        description: `Запрос успешно ${variables.action === 'approve' ? 'одобрен' : 'отклонён'}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/offers/${offerId}/access-requests`] });
      setReviewModal(false);
      setSelectedRequest(null);
      setReviewData({ action: '', responseNote: '', advertiserResponse: '' });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обработать запрос",
        variant: "destructive",
      });
    }
  });

  const handleReviewRequest = (request: AccessRequest, action: string) => {
    setSelectedRequest(request);
    setReviewData({ action, responseNote: '', advertiserResponse: '' });
    setReviewModal(true);
  };

  const handleSubmitReview = () => {
    if (!selectedRequest || !reviewData.action) return;
    
    reviewMutation.mutate({
      requestId: selectedRequest.id,
      action: reviewData.action,
      responseNote: reviewData.responseNote,
      advertiserResponse: reviewData.advertiserResponse
    });
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Загрузка запросов...</span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Пока нет запросов на доступ к этому офферу
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Запросы доступа к офферу "{offerName}"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{request.partner_username}</span>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-3 h-3" />
                    <span>{request.partner_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Запрошено {safeFormatDistanceToNow(request.requested_at)}
                    </span>
                  </div>
                </div>
                
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleReviewRequest(request, 'approve')}
                      data-testid={`button-approve-${request.id}`}
                      title="Одобрить запрос"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Одобрить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleReviewRequest(request, 'reject')}
                      data-testid={`button-reject-${request.id}`}
                      title="Отклонить запрос"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Отклонить
                    </Button>
                  </div>
                )}
              </div>

              {request.partner_message && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Сообщение от партнёра:
                  </Label>
                  <p className="text-sm mt-1">{request.partner_message}</p>
                </div>
              )}

              {request.request_note && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Дополнительная информация:
                  </Label>
                  <p className="text-sm mt-1">{request.request_note}</p>
                </div>
              )}

              {request.response_note && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <Label className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Ваш ответ:
                  </Label>
                  <p className="text-sm mt-1">{request.response_note}</p>
                  {request.reviewed_at && (
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                      Обработано {safeFormatDistanceToNow(request.reviewed_at)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={reviewModal} onOpenChange={setReviewModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {reviewData.action === 'approve' ? 'Одобрить запрос' : 'Отклонить запрос'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && `От партнёра: ${selectedRequest.partner_username}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedRequest?.partner_message && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Label className="text-xs font-medium">Сообщение партнёра:</Label>
                <p className="text-sm mt-1">{selectedRequest.partner_message}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="advertiserResponse">
                Ответ партнёру {reviewData.action === 'approve' ? '' : ' (обязательно)'}
              </Label>
              <Textarea
                id="advertiserResponse"
                data-testid="textarea-advertiser-response"
                placeholder={
                  reviewData.action === 'approve' 
                    ? "Дополнительные инструкции или комментарии для партнёра..."
                    : "Объясните причину отклонения запроса..."
                }
                value={reviewData.advertiserResponse}
                onChange={(e) => setReviewData(prev => ({ ...prev, advertiserResponse: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responseNote">Внутренняя заметка</Label>
              <Textarea
                id="responseNote"
                data-testid="textarea-response-note"
                placeholder="Внутренние комментарии (не видны партнёру)"
                value={reviewData.responseNote}
                onChange={(e) => setReviewData(prev => ({ ...prev, responseNote: e.target.value }))}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewModal(false)}
              disabled={reviewMutation.isPending}
              data-testid="button-cancel-review"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={
                reviewMutation.isPending || 
                (reviewData.action === 'reject' && !reviewData.advertiserResponse.trim())
              }
              className={reviewData.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              data-testid="button-submit-review"
            >
              {reviewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {reviewData.action === 'approve' ? 'Одобрить' : 'Отклонить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}