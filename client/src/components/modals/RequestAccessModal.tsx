import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: {
    id: string;
    name: string;
    advertiserId: string;
    advertiser_name?: string;
    advertiser_company?: string;
    payout: string;
    currency: string;
    category: string;
  };
}

export function RequestAccessModal({ isOpen, onClose, offer }: RequestAccessModalProps) {
  const [requestNote, setRequestNote] = useState("");
  const [partnerMessage, setPartnerMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const requestAccessMutation = useMutation({
    mutationFn: async (data: { offerId: string; requestNote?: string; partnerMessage?: string }) => {
      await apiRequest(`/api/offers/${data.offerId}/request-access`, 'POST', {
        requestNote: data.requestNote,
        partnerMessage: data.partnerMessage
      });
    },
    onSuccess: () => {
      toast({
        title: "Запрос отправлен",
        description: "Ваш запрос на доступ к офферу был отправлен рекламодателю",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/offers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/access-requests"] });
      handleClose();
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Ошибка при отправке запроса";
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer?.id) {return;}
    
    requestAccessMutation.mutate({
      offerId: offer.id,
      requestNote: requestNote.trim() || undefined,
      partnerMessage: partnerMessage.trim() || undefined
    });
  };

  const handleClose = () => {
    setRequestNote("");
    setPartnerMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="modal-request-access">
        <DialogHeader>
          <DialogTitle>Запросить доступ к офферу</DialogTitle>
          <DialogDescription>
            Отправьте запрос рекламодателю для получения полного доступа к офферу с ссылками лендингов
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Информация об оффере */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-semibold text-lg mb-2" data-testid="text-offer-name">
              {offer.name}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Рекламодатель:</span>
                <div className="font-medium" data-testid="text-advertiser-name">
                  {offer.advertiser_name}
                  {offer.advertiser_company && (
                    <span className="text-muted-foreground"> ({offer.advertiser_company})</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Выплата:</span>
                <div className="font-medium" data-testid="text-offer-payout">
                  {offer.payout} {offer.currency}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Категория:</span>
                <div className="font-medium" data-testid="text-offer-category">
                  {offer.category}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="partnerMessage">Сообщение рекламодателю</Label>
              <Textarea
                id="partnerMessage"
                placeholder="Расскажите о себе, ваших источниках трафика и планах по продвижению оффера..."
                value={partnerMessage}
                onChange={(e) => setPartnerMessage(e.target.value)}
                rows={4}
                data-testid="textarea-partner-message"
              />
            </div>

            <div>
              <Label htmlFor="requestNote">Дополнительная информация</Label>
              <Textarea
                id="requestNote"
                placeholder="Укажите дополнительные детали или вопросы по офферу..."
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                rows={3}
                data-testid="textarea-request-note"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={requestAccessMutation.isPending}
                data-testid="button-cancel-request"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={requestAccessMutation.isPending || !offer?.id}
                data-testid="button-submit-request"
              >
                {requestAccessMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Отправить запрос
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}