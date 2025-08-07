import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: {
    id: string;
    name: string;
    advertiserName?: string;
  };
}

export function RequestAccessModal({ isOpen, onClose, offer }: RequestAccessModalProps) {
  const [formData, setFormData] = useState({
    requestNote: '',
    partnerMessage: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const requestAccessMutation = useMutation({
    mutationFn: async (data: { requestNote: string; partnerMessage: string }) => {
      return apiRequest(`/api/offers/${offer.id}/request-access`, 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Запрос отправлен",
        description: "Ваш запрос на доступ к офферу успешно отправлен рекламодателю",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/access-requests'] });
      onClose();
      setFormData({ requestNote: '', partnerMessage: '' });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить запрос",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partnerMessage.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, добавьте сообщение для рекламодателя",
        variant: "destructive",
      });
      return;
    }
    requestAccessMutation.mutate(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Запрос доступа к офферу
          </DialogTitle>
          <DialogDescription>
            Отправьте запрос рекламодателю для получения доступа к офферу "{offer.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="offer-info">Информация об оффере</Label>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-sm">{offer.name}</p>
              {offer.advertiserName && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Рекламодатель: {offer.advertiserName}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partnerMessage">
              Сообщение рекламодателю <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="partnerMessage"
              data-testid="textarea-partner-message"
              placeholder="Расскажите о себе, вашем опыте, трафике и планах работы с данным оффером..."
              value={formData.partnerMessage}
              onChange={(e) => handleChange('partnerMessage', e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestNote">Дополнительная информация</Label>
            <Textarea
              id="requestNote"
              data-testid="textarea-request-note"
              placeholder="Дополнительные комментарии или вопросы (необязательно)"
              value={formData.requestNote}
              onChange={(e) => handleChange('requestNote', e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={requestAccessMutation.isPending}
              data-testid="button-cancel-request"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={requestAccessMutation.isPending}
              data-testid="button-submit-request"
            >
              {requestAccessMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Отправить запрос
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}