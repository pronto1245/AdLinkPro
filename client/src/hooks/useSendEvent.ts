import { fetchJSON } from '@/lib/fetchJSON';
import { useToast } from '@/hooks/use-toast';

export type SendEventPayload = {
  type: "reg" | "purchase";
  clickid: string;
  txid: string;
  value?: number;
  currency?: string;
  meta?: Record<string, unknown>;
};

export type EventResponse = {
  id: string;
  status: string;
  created?: boolean;
};

export async function sendEvent(payload: SendEventPayload): Promise<EventResponse> {
  return fetchJSON<EventResponse>("/api/v3/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export function useSendEvent() {
  const { toast } = useToast();

  const handleSendEvent = async (payload: SendEventPayload) => {
    try {
      const result = await sendEvent(payload);
      
      toast({
        title: "Событие отправлено",
        description: `Conversion ID: ${result.id} (${result.status})`,
        variant: "default"
      });
      
      return result;
    } catch (_) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      toast({
        title: "Ошибка отправки события",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  return { sendEvent: handleSendEvent };
}