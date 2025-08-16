import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from "../../hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { MessageCircle, Clock, AlertCircle, HelpCircle, DollarSign, Target } from "lucide-react";

interface ContactManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const urgencyLevels = [
  { value: "low", label: "Низкий", icon: MessageCircle, color: "text-blue-500" },
  { value: "medium", label: "Средний", icon: Clock, color: "text-yellow-500" },
  { value: "high", label: "Высокий", icon: AlertCircle, color: "text-orange-500" },
  { value: "critical", label: "Критический", icon: AlertCircle, color: "text-red-500" }
];

const categories = [
  { value: "technical", label: "Техническая поддержка", icon: HelpCircle },
  { value: "financial", label: "Финансовые вопросы", icon: DollarSign },
  { value: "offers", label: "Вопросы по офферам", icon: Target },
  { value: "general", label: "Общие вопросы", icon: MessageCircle }
];

export function ContactManagerModal({ isOpen, onClose }: ContactManagerModalProps) {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "",
    urgency: "medium",
    contactMethod: "email"
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTicketMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/partner/support/tickets', 'POST', data);
    },
    onSuccess: (response) => {
      toast({
        title: "Обращение отправлено",
        description: `Ваше обращение #${response.ticketNumber} получено. Менеджер свяжется с вами в течение 24 часов.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partner/support/tickets'] });
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка отправки",
        description: error.message || "Не удалось отправить обращение. Попробуйте позже.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      subject: "",
      message: "",
      category: "",
      urgency: "medium",
      contactMethod: "email"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim() || !formData.category) {
      toast({
        title: "Заполните все поля",
        description: "Пожалуйста, укажите тему, категорию и опишите ваш вопрос.",
        variant: "destructive",
      });
      return;
    }

    createTicketMutation.mutate(formData);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Связь с менеджером
          </DialogTitle>
          <DialogDescription>
            Создайте обращение к менеджеру. Мы ответим вам в течение указанного времени.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Категория обращения *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Urgency Level */}
          <div className="space-y-2">
            <Label htmlFor="urgency">Уровень срочности</Label>
            <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map((level) => {
                  const Icon = level.icon;
                  return (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${level.color}`} />
                        {level.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Тема обращения *</Label>
            <Input
              id="subject"
              placeholder="Кратко опишите суть вопроса"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              maxLength={100}
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.subject.length}/100
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Подробное описание *</Label>
            <Textarea
              id="message"
              placeholder="Опишите ваш вопрос подробно. Укажите ID офферов, суммы, даты и другие важные детали."
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows={6}
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.message.length}/1000
            </div>
          </div>

          {/* Contact Method */}
          <div className="space-y-2">
            <Label htmlFor="contactMethod">Предпочтительный способ связи</Label>
            <Select value={formData.contactMethod} onValueChange={(value) => setFormData({...formData, contactMethod: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email (в течение 24 часов)</SelectItem>
                <SelectItem value="telegram">Telegram (в течение 2-4 часов)</SelectItem>
                <SelectItem value="whatsapp">WhatsApp (в течение 2-4 часов)</SelectItem>
                <SelectItem value="phone">Телефонный звонок (в рабочее время)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Response Time Info */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Время ответа менеджера
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-300 mt-1 space-y-1">
                  <li>• Критические вопросы: до 2 часов</li>
                  <li>• Высокий приоритет: до 6 часов</li>
                  <li>• Обычные вопросы: до 24 часов</li>
                  <li>• Консультации: до 48 часов</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="sm:w-auto"
            >
              Отменить
            </Button>
            <Button
              type="submit"
              disabled={createTicketMutation.isPending}
              className="sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {createTicketMutation.isPending ? "Отправляем..." : "Отправить обращение"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}