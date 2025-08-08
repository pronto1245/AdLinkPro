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
import { 
  Send, 
  Search, 
  Filter, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Calendar,
  DollarSign,
  Globe,
  MoreHorizontal,
  RefreshCw
} from "lucide-react";

interface AccessRequest {
  id: string;
  offerId: string;
  partnerId: string;
  advertiserId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestNote?: string;
  responseNote?: string;
  createdAt: string;
  updatedAt: string;
  
  offer?: {
    id: string;
    name: string;
    category: string;
    payoutType: string;
    payoutAmount: number;
    currency: string;
    logo?: string;
    description?: string;
  };
  
  advertiser?: {
    id: string;
    username: string;
    company?: string;
  };
}

export default function AccessRequestsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [newRequestOfferId, setNewRequestOfferId] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Загрузка запросов доступа партнера
  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/partner/access-requests"],
    staleTime: 2 * 60 * 1000,
  });

  // Загрузка доступных офферов для запроса доступа
  const { data: availableOffers = [] } = useQuery({
    queryKey: ["/api/partner/offers/available"],
    staleTime: 5 * 60 * 1000,
  });

  // Mutation для создания запроса доступа
  const createRequestMutation = useMutation({
    mutationFn: async (data: { offerId: string; message?: string }) => {
      return await apiRequest("/api/partner/offer-access-request", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Запрос отправлен",
        description: "Ваш запрос на доступ к офферу был отправлен рекламодателю",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/access-requests"] });
      setShowRequestDialog(false);
      setNewRequestOfferId("");
      setRequestMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить запрос",
        variant: "destructive",
      });
    },
  });

  // Фильтрация и поиск запросов
  const filteredRequests = useMemo(() => {
    return (requests as AccessRequest[]).filter((request: AccessRequest) => {
      const matchesSearch = 
        request.offer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.advertiser?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.advertiser?.company?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  // Обработчики
  const handleCreateRequest = () => {
    if (!newRequestOfferId) {
      toast({
        title: "Ошибка",
        description: "Выберите оффер для запроса доступа",
        variant: "destructive",
      });
      return;
    }
    
    createRequestMutation.mutate({
      offerId: newRequestOfferId,
      message: requestMessage.trim() || undefined
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
          <h1 className="text-3xl font-bold">Мои запросы доступа</h1>
          <p className="text-muted-foreground">
            Управление запросами на доступ к офферам рекламодателей
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setShowRequestDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-new-request"
          >
            <Send className="h-4 w-4 mr-2" />
            Новый запрос
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            data-testid="button-refresh"
            title="Обновить список"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">
                {(requests as AccessRequest[]).length}
              </div>
              <div className="text-sm text-muted-foreground">Всего запросов</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-yellow-600">
                {(requests as AccessRequest[]).filter((r: AccessRequest) => r.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Ожидает</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">
                {(requests as AccessRequest[]).filter((r: AccessRequest) => r.status === 'approved').length}
              </div>
              <div className="text-sm text-muted-foreground">Одобрено</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-red-600">
                {(requests as AccessRequest[]).filter((r: AccessRequest) => r.status === 'rejected').length}
              </div>
              <div className="text-sm text-muted-foreground">Отклонено</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Поиск по офферу, рекламодателю..."
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
                   statusFilter === "pending" ? "Ожидает" :
                   statusFilter === "approved" ? "Одобрено" : "Отклонено"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  Все статусы
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Ожидает
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
                  <TableHead>Рекламодатель</TableHead>
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
                  filteredRequests.map((request: AccessRequest) => {
                    const statusProps = getStatusBadgeProps(request.status);
                    const StatusIcon = statusProps.icon;
                    
                    return (
                      <TableRow key={request.id} className="hover:bg-gray-50/50">
                        {/* Оффер */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {request.offer?.logo ? (
                              <img 
                                src={request.offer.logo} 
                                alt={request.offer.name}
                                className="w-10 h-10 rounded object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                                <Target className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{request.offer?.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <span>{request.offer?.category}</span>
                                {request.offer?.payoutAmount && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      {request.offer.payoutAmount} {request.offer.currency}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Рекламодатель */}
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.advertiser?.username}</div>
                            {request.advertiser?.company && (
                              <div className="text-sm text-muted-foreground">
                                {request.advertiser.company}
                              </div>
                            )}
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
                            {request.status === 'approved' && request.offer && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => window.location.href = `/affiliate/offers/${request.offer?.id}`}
                                data-testid={`button-get-link-${request.id}`}
                              >
                                Забрать ссылку
                              </Button>
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
                                {request.status === 'approved' && request.offer && (
                                  <DropdownMenuItem onClick={() => window.location.href = `/affiliate/offers/${request.offer?.id}`}>
                                    <Globe className="h-4 w-4 mr-2" />
                                    Перейти к офферу
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      {/* Диалог создания нового запроса */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новый запрос доступа</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Выберите оффер
              </label>
              <select
                value={newRequestOfferId}
                onChange={(e) => setNewRequestOfferId(e.target.value)}
                className="w-full p-2 border rounded-md"
                data-testid="select-offer"
              >
                <option value="">Выберите оффер...</option>
                {(availableOffers as any[]).map((offer: any) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.name} - {offer.payoutAmount} {offer.currency}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">
                Сообщение (необязательно)
              </label>
              <Textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Опишите почему вы хотите работать с этим оффером..."
                rows={3}
                data-testid="textarea-request-message"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleCreateRequest}
                disabled={createRequestMutation.isPending || !newRequestOfferId}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-submit-request"
              >
                {createRequestMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Отправить запрос
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRequestDialog(false);
                  setNewRequestOfferId("");
                  setRequestMessage("");
                }}
                data-testid="button-cancel-request"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог деталей запроса */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Детали запроса</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Информация об оффере */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  {selectedRequest.offer?.logo ? (
                    <img 
                      src={selectedRequest.offer.logo} 
                      alt={selectedRequest.offer.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                      <Target className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-lg">{selectedRequest.offer?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedRequest.offer?.category} • {selectedRequest.offer?.payoutType}
                    </div>
                  </div>
                </div>
                
                {selectedRequest.offer?.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedRequest.offer.description}
                  </p>
                )}
              </div>
              
              {/* Статус и даты */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Статус</label>
                  <div className="mt-1">
                    <Badge variant="outline" className={getStatusBadgeProps(selectedRequest.status).className}>
                      {getStatusBadgeProps(selectedRequest.status).label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Дата запроса</label>
                  <div className="mt-1 text-sm">{formatDate(selectedRequest.createdAt)}</div>
                </div>
              </div>
              
              {/* Сообщения */}
              {selectedRequest.requestNote && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Ваше сообщение</label>
                  <div className="mt-1 p-3 bg-blue-50 rounded border text-sm">
                    {selectedRequest.requestNote}
                  </div>
                </div>
              )}
              
              {selectedRequest.responseNote && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Ответ рекламодателя</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                    {selectedRequest.responseNote}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}