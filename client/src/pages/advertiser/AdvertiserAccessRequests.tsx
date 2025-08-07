import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, User, Calendar, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface AccessRequest {
  id: string;
  offerId: string;
  partnerId: string;
  advertiserId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestNote: string | null;
  responseNote: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  // Offer details
  offerName: string;
  offerCategory: string;
  offerPayout: string;
  offerPayoutType: 'CPA' | 'CPL' | 'CPS' | 'CPI';
  // Partner details
  partnerUsername: string;
  partnerEmail: string;
  partnerFirstName: string | null;
  partnerLastName: string | null;
}

export default function AdvertiserAccessRequests() {
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch access requests
  const { data: requests = [], isLoading } = useQuery<AccessRequest[]>({
    queryKey: ["/api/advertiser/access-requests"],
    staleTime: 30 * 1000, // 30 seconds
  });

  // Respond to access request mutation
  const respondMutation = useMutation({
    mutationFn: async ({ requestId, action, responseMessage }: {
      requestId: string;
      action: 'approve' | 'reject';
      responseMessage?: string;
    }) => {
      const response = await fetch(`/api/advertiser/access-requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action, responseMessage })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action} request`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.action === 'approve' ? "Запрос одобрен" : "Запрос отклонён",
        description: `Партнёр получит уведомление о вашем решении`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/advertiser/access-requests"] });
      setSelectedRequest(null);
      setResponseMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleResponse = (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;
    
    respondMutation.mutate({
      requestId: selectedRequest.id,
      action,
      responseMessage: responseMessage.trim() || undefined
    });
  };

  const getStatusBadge = (status: AccessRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />В ожидании</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Одобрен</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Отклонён</Badge>;
    }
  };

  const getPayoutTypeBadge = (type: string) => {
    const colors = {
      'CPA': 'bg-blue-100 text-blue-800',
      'CPL': 'bg-green-100 text-green-800', 
      'CPS': 'bg-purple-100 text-purple-800',
      'CPI': 'bg-orange-100 text-orange-800'
    };
    return <Badge variant="secondary" className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  const formatPartnerName = (request: AccessRequest) => {
    const fullName = [request.partnerFirstName, request.partnerLastName].filter(Boolean).join(' ');
    return fullName || request.partnerUsername;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
          <p>Загрузка запросов...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Запросы доступа</h1>
          <p className="text-muted-foreground mt-2">
            Управление запросами партнёров на доступ к вашим офферам
          </p>
        </div>
        
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
            <div className="text-muted-foreground">Ожидают</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'approved').length}</div>
            <div className="text-muted-foreground">Одобрено</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{requests.filter(r => r.status === 'rejected').length}</div>
            <div className="text-muted-foreground">Отклонено</div>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Запросов пока нет</p>
              <p className="text-sm">Когда партнёры будут запрашивать доступ к вашим офферам, они появятся здесь</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-yellow-600 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Ожидают решения ({pendingRequests.length})
              </h2>
              
              <div className="grid gap-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id} className="border-yellow-200">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{formatPartnerName(request)}</span>
                            <Badge variant="outline">{request.partnerEmail}</Badge>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-sm text-muted-foreground">Оффер:</span>
                              <span className="ml-2 font-medium">{request.offerName}</span>
                            </div>
                            <div className="flex gap-2">
                              {getPayoutTypeBadge(request.offerPayoutType)}
                              <Badge variant="secondary">{request.offerCategory}</Badge>
                            </div>
                          </div>
                          
                          {request.requestNote && (
                            <div className="bg-muted p-3 rounded-lg">
                              <span className="text-sm text-muted-foreground">Сообщение партнёра:</span>
                              <p className="text-sm mt-1">{request.requestNote}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Запрошено {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true, locale: ru })}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => setSelectedRequest(request)}
                            disabled={respondMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Отклонить
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                            disabled={respondMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Одобрить
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Reviewed Requests */}
          {reviewedRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                История решений ({reviewedRequests.length})
              </h2>
              
              <div className="grid gap-4">
                {reviewedRequests.map((request) => (
                  <Card key={request.id} className="opacity-75">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{formatPartnerName(request)}</span>
                            <Badge variant="outline">{request.partnerEmail}</Badge>
                            {getStatusBadge(request.status)}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-sm text-muted-foreground">Оффер:</span>
                              <span className="ml-2 font-medium">{request.offerName}</span>
                            </div>
                            <div className="flex gap-2">
                              {getPayoutTypeBadge(request.offerPayoutType)}
                              <Badge variant="secondary">{request.offerCategory}</Badge>
                            </div>
                          </div>
                          
                          {request.responseNote && (
                            <div className="bg-muted p-3 rounded-lg">
                              <span className="text-sm text-muted-foreground">Ваш ответ:</span>
                              <p className="text-sm mt-1">{request.responseNote}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Решение принято {formatDistanceToNow(new Date(request.reviewedAt!), { addSuffix: true, locale: ru })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Response Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRequest && (
                <span>
                  Ответ на запрос от {formatPartnerName(selectedRequest)}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Оффер: <strong>{selectedRequest.offerName}</strong>
                  <br />
                  Партнёр получит уведомление о вашем решении
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedRequest?.requestNote && (
              <div>
                <Label>Сообщение партнёра:</Label>
                <div className="bg-muted p-3 rounded-lg text-sm mt-1">
                  {selectedRequest.requestNote}
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="response">Ваш ответ (необязательно):</Label>
              <Textarea
                id="response"
                placeholder="Добавьте комментарий к своему решению..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={() => handleResponse('reject')}
              disabled={respondMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Отклонить запрос
            </Button>
            <Button 
              onClick={() => handleResponse('approve')}
              disabled={respondMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Одобрить запрос
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}