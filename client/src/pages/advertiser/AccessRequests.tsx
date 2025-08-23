import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  Calendar,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AccessRequest {
  id: string;
  offer_id: string;
  partner_id: string;
  partner_username: string;
  partner_email: string;
  offer_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  request_note?: string;
  partner_message?: string;
  requested_at: string;
  reviewed_at?: string;
  response_note?: string;
  expires_at?: string;
}

export default function AccessRequests() {
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [responseNote, setResponseNote] = useState('');
  const [advertiserResponse, setAdvertiserResponse] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery<AccessRequest[]>({
    queryKey: ['/api/advertiser/access-requests'],
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: {
      offerId: string;
      requestId: string;
      action: 'approve' | 'reject';
      responseNote?: string;
      advertiserResponse?: string;
    }) => {
      await apiRequest(`/api/offers/${data.offerId}/access-requests/${data.requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          action: data.action,
          responseNote: data.responseNote,
          advertiserResponse: data.advertiserResponse
        })
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.action === 'approve' ? 'Запрос одобрен' : 'Запрос отклонен',
        description: `Запрос успешно ${variables.action === 'approve' ? 'одобрен' : 'отклонен'}. Партнер получит уведомление.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertiser/access-requests'] });
      handleCloseReviewModal();
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Ошибка при обработке запроса',
        variant: 'destructive',
      });
    },
  });

  const handleReview = (request: AccessRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) {return;}

    reviewMutation.mutate({
      offerId: selectedRequest.offer_id,
      requestId: selectedRequest.id,
      action: reviewAction,
      responseNote: responseNote.trim() || undefined,
      advertiserResponse: advertiserResponse.trim() || undefined
    });
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedRequest(null);
    setResponseNote('');
    setAdvertiserResponse('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Ожидание
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Одобрено
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            <XCircle className="w-3 h-3 mr-1" />
            Отклонено
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Отменено
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка запросов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-access-requests">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Запросы доступа к офферам</h1>
          <p className="text-muted-foreground mt-2">
            Управляйте запросами партнеров на доступ к вашим офферам
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {pendingRequests.length}
            </div>
            <p className="text-sm text-muted-foreground">Ожидают ответа</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <p className="text-sm text-muted-foreground">Одобрено</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.status === 'rejected').length}
            </div>
            <p className="text-sm text-muted-foreground">Отклонено</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {requests.length}
            </div>
            <p className="text-sm text-muted-foreground">Всего запросов</p>
          </CardContent>
        </Card>
      </div>

      {/* Ожидающие запросы */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-yellow-600">
              Запросы, ожидающие рассмотрения ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Оффер</TableHead>
                  <TableHead>Партнер</TableHead>
                  <TableHead>Запрошено</TableHead>
                  <TableHead>Сообщение</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id} data-testid={`row-pending-${request.id}`}>
                    <TableCell className="font-medium">
                      <div data-testid={`text-offer-name-${request.id}`}>
                        {request.offer_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {request.partner_username}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.partner_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDistance(new Date(request.requested_at), new Date(), {
                          addSuffix: true,
                          locale: ru
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(request.partner_message || request.request_note) ? (
                        <div className="max-w-xs">
                          <div className="text-sm text-muted-foreground truncate">
                            {request.partner_message || request.request_note}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs p-0 h-auto text-blue-500"
                            onClick={() => {
                              setSelectedRequest(request);
                              // Показать полное сообщение в диалоге
                            }}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Читать полностью
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleReview(request, 'approve')}
                          data-testid={`button-approve-${request.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Одобрить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleReview(request, 'reject')}
                          data-testid={`button-reject-${request.id}`}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Отклонить
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* История запросов */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>История запросов ({processedRequests.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Оффер</TableHead>
                  <TableHead>Партнер</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Запрошено</TableHead>
                  <TableHead>Рассмотрено</TableHead>
                  <TableHead>Ответ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedRequests.map((request) => (
                  <TableRow key={request.id} data-testid={`row-processed-${request.id}`}>
                    <TableCell className="font-medium">
                      {request.offer_name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.partner_username}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.partner_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDistance(new Date(request.requested_at), new Date(), {
                          addSuffix: true,
                          locale: ru
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.reviewed_at ? (
                        <div className="text-sm text-muted-foreground">
                          {formatDistance(new Date(request.reviewed_at), new Date(), {
                            addSuffix: true,
                            locale: ru
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.response_note || request.advertiser_response ? (
                        <div className="max-w-xs">
                          <div className="text-sm truncate">
                            {request.advertiser_response || request.response_note}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              Запросы на доступ к офферам не найдены
            </div>
          </CardContent>
        </Card>
      )}

      {/* Модальное окно рассмотрения запроса */}
      <Dialog open={reviewModalOpen} onOpenChange={handleCloseReviewModal}>
        <DialogContent className="sm:max-w-[600px]" data-testid="modal-review-request">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Одобрить запрос' : 'Отклонить запрос'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? 'Одобрить доступ партнера к офферу со всеми ссылками лендингов'
                : 'Отклонить запрос партнера на доступ к офферу'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              {/* Информация о запросе */}
              <div className="rounded-lg border p-4 bg-muted/50">
                <h3 className="font-semibold text-lg mb-2">
                  {selectedRequest.offer_name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Партнер:</span>
                    <div className="font-medium">
                      {selectedRequest.partner_username} ({selectedRequest.partner_email})
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Запрошено:</span>
                    <div className="font-medium">
                      {formatDistance(new Date(selectedRequest.requested_at), new Date(), {
                        addSuffix: true,
                        locale: ru
                      })}
                    </div>
                  </div>
                </div>

                {/* Сообщения от партнера */}
                {selectedRequest.partner_message && (
                  <div className="mt-4">
                    <span className="text-muted-foreground text-sm">Сообщение партнера:</span>
                    <div className="mt-1 p-3 bg-background border rounded text-sm">
                      {selectedRequest.partner_message}
                    </div>
                  </div>
                )}

                {selectedRequest.request_note && (
                  <div className="mt-4">
                    <span className="text-muted-foreground text-sm">Дополнительная информация:</span>
                    <div className="mt-1 p-3 bg-background border rounded text-sm">
                      {selectedRequest.request_note}
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <Label htmlFor="advertiserResponse">Ответ партнеру</Label>
                  <Textarea
                    id="advertiserResponse"
                    placeholder={reviewAction === 'approve'
                      ? 'Добро пожаловать! Доступ к офферу открыт...'
                      : 'К сожалению, мы не можем предоставить доступ по следующим причинам...'
                    }
                    value={advertiserResponse}
                    onChange={(e) => setAdvertiserResponse(e.target.value)}
                    rows={3}
                    data-testid="textarea-advertiser-response"
                  />
                </div>

                <div>
                  <Label htmlFor="responseNote">Внутренняя заметка</Label>
                  <Textarea
                    id="responseNote"
                    placeholder="Внутренняя заметка для команды (не видна партнеру)"
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    rows={2}
                    data-testid="textarea-response-note"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseReviewModal}
                    disabled={reviewMutation.isPending}
                    data-testid="button-cancel-review"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    className={reviewAction === 'approve' ?
                      'bg-green-500 hover:bg-green-600' :
                      'bg-red-500 hover:bg-red-600'
                    }
                    disabled={reviewMutation.isPending}
                    data-testid="button-submit-review"
                  >
                    {reviewMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {reviewAction === 'approve' ? 'Одобрить доступ' : 'Отклонить запрос'}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
