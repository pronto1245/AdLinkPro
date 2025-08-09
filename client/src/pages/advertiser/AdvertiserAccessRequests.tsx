import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { OfferLogo } from "@/components/ui/offer-logo";
import { 
  Check, 
  X, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare,
  Clock,
  UserCheck,
  UserX,
  Calendar,
  Target,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from "lucide-react";

interface OfferAccessRequest {
  id: string;
  offerId: string;
  partnerId: string;
  advertiserId: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  createdAt: string;
  approvedAt?: string | null;
  updatedAt: string;
  
  // Обогащенные данные из API
  partnerName: string;
  partnerUsername: string;
  partnerEmail: string;
  offerName: string;
  offerPayout: string;
  offerCurrency: string;
  offerLogo?: string | null;
}

export default function AdvertiserAccessRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<OfferAccessRequest | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseAction, setResponseAction] = useState<'approve' | 'reject'>('approve');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Загрузка запросов доступа
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["/api/advertiser/access-requests"],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutation для ответа на запрос доступа
  const respondToRequestMutation = useMutation({
    mutationFn: async (data: { 
      requestId: string; 
      action: 'approve' | 'reject'; 
      message?: string 
    }) => {
      return await apiRequest(`/api/advertiser/access-requests/${data.requestId}/respond`, "POST", {
        action: data.action,
        message: data.message
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.action === 'approve' ? "Запрос одобрен" : "Запрос отклонен",
        description: variables.action === 'approve' 
          ? "Партнер получил доступ к офферу" 
          : "Запрос был отклонен",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/advertiser/access-requests"] });
      setShowResponseDialog(false);
      setSelectedRequest(null);
      setResponseMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обработать запрос",
        variant: "destructive",
      });
    },
  });

  // Фильтрация и поиск запросов
  const filteredRequests = useMemo(() => {
    return (requests as OfferAccessRequest[]).filter((request: OfferAccessRequest) => {
      const matchesSearch = 
        request.offerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.partnerUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.partnerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  // Обработчики
  const handleResponseClick = (request: OfferAccessRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setResponseAction(action);
    setShowResponseDialog(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedRequest) return;
    
    respondToRequestMutation.mutate({
      requestId: selectedRequest.id,
      action: responseAction,
      message: responseMessage.trim() || undefined
    });
  };

  // Получение свойств значка статуса
  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
          label: "Ожидает"
        };
      case 'approved':
        return {
          className: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
          label: "Одобрено"
        };
      case 'rejected':
        return {
          className: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
          label: "Отклонено"
        };
      default:
        return {
          className: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Clock,
          label: status
        };
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Сегодня в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Вчера в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
          <p>Загрузка запросов доступа...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и метрики */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Запросы доступа</h1>
          <p className="text-muted-foreground">
            Управление запросами партнеров на доступ к офферам
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(requests as OfferAccessRequest[]).filter((r: OfferAccessRequest) => r.status === 'pending').length}
              </div>
              <div className="text-xs text-muted-foreground">Ожидают</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(requests as OfferAccessRequest[]).filter((r: OfferAccessRequest) => r.status === 'approved').length}
              </div>
              <div className="text-xs text-muted-foreground">Одобрено</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {(requests as OfferAccessRequest[]).filter((r: OfferAccessRequest) => r.status === 'rejected').length}
              </div>
              <div className="text-xs text-muted-foreground">Отклонено</div>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Поиск по офферу, партнеру, email или компании..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-requests"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-filter-status">
                  <Filter className="h-4 w-4" />
                  {statusFilter === "all" ? "Все статусы" : 
                   statusFilter === "pending" ? "Ожидают" :
                   statusFilter === "approved" ? "Одобрено" : "Отклонено"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  Все статусы
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Ожидают
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("approved")}>
                  Одобрено
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
                  Отклонено
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Таблица запросов */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Оффер</TableHead>
                  <TableHead>Партнер</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата запроса</TableHead>
                  <TableHead>Сообщение</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Target className="h-8 w-8" />
                        <p>Запросы не найдены</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request: OfferAccessRequest) => {
                    const statusProps = getStatusBadgeProps(request.status);
                    const StatusIcon = statusProps.icon;
                    
                    return (
                      <TableRow key={request.id} className="hover:bg-gray-50/50">
                        {/* Оффер */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <OfferLogo 
                              name={request.offerName}
                              logo={request.offerLogo}
                              size="md"
                              showTooltip={true}
                            />
                            <div>
                              <div className="font-medium">{request.offerName}</div>
                              <div className="text-sm text-muted-foreground">
                                {request.offerPayout} {request.offerCurrency}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Партнер */}
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.partnerUsername}</div>
                            <div className="text-sm text-muted-foreground">
                              {request.partnerName || request.partnerEmail}
                            </div>
                          </div>
                        </TableCell>

                        {/* Статус */}
                        <TableCell>
                          <Badge variant="outline" className={statusProps.className}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusProps.label}
                          </Badge>
                        </TableCell>

                        {/* Дата запроса */}
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {formatDate(request.createdAt)}
                          </div>
                        </TableCell>

                        {/* Сообщение */}
                        <TableCell>
                          {request.requestNote ? (
                            <div className="max-w-xs truncate text-sm" title={request.requestNote}>
                              {request.requestNote}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Без сообщения</span>
                          )}
                        </TableCell>

                        {/* Действия */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {request.status === 'pending' ? (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleResponseClick(request, 'approve')}
                                  data-testid={`button-approve-${request.id}`}
                                  title="Одобрить запрос"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleResponseClick(request, 'reject')}
                                  data-testid={`button-reject-${request.id}`}
                                  title="Отклонить запрос"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2">
                                {request.approvedAt && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(request.approvedAt)}
                                  </span>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" data-testid={`button-menu-${request.id}`}>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedRequest(request)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Детали
                                    </DropdownMenuItem>
                                    {request.message && (
                                      <DropdownMenuItem>
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Ответ
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Диалог ответа на запрос */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {responseAction === 'approve' ? 'Одобрить запрос' : 'Отклонить запрос'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedRequest && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                    <Target className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">{selectedRequest.offerName}</div>
                    <div className="text-sm text-muted-foreground">
                      Запрос от {selectedRequest.partnerUsername}
                    </div>
                  </div>
                </div>
                
                {selectedRequest.message && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-700 mb-1">Сообщение партнера:</div>
                    <div className="text-sm text-gray-600">{selectedRequest.message}</div>
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium block mb-2">
                Ответное сообщение (необязательно)
              </label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder={responseAction === 'approve' 
                  ? "Добро пожаловать! Желаем успешного трафика..." 
                  : "К сожалению, ваш запрос не может быть одобрен..."
                }
                rows={3}
                data-testid="textarea-response-message"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleSubmitResponse}
                disabled={respondToRequestMutation.isPending}
                className={responseAction === 'approve' ? 
                  "bg-green-600 hover:bg-green-700" : 
                  "bg-red-600 hover:bg-red-700"
                }
                data-testid="button-submit-response"
              >
                {respondToRequestMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary mr-2" />
                ) : responseAction === 'approve' ? (
                  <UserCheck className="h-4 w-4 mr-2" />
                ) : (
                  <UserX className="h-4 w-4 mr-2" />
                )}
                {responseAction === 'approve' ? 'Одобрить' : 'Отклонить'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowResponseDialog(false);
                  setResponseMessage("");
                }}
                data-testid="button-cancel-response"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}