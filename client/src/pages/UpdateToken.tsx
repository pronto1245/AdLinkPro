import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Key, CheckCircle, AlertCircle } from "lucide-react";

export default function UpdateToken() {
  const { toast } = useToast();
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setCurrentToken(token);
  }, []);

  const updateToken = async () => {
    setIsUpdating(true);
    
    try {
      const response = await fetch('/api/get-fresh-token');
      
      if (!response.ok) {
        const errorText = await response.text();
        // Тихо обрабатываем ошибки API
        throw new Error(`Ошибка API: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received token data:', data);
      
      // Очищаем старый токен
      localStorage.removeItem('token');
      
      // Устанавливаем новый токен
      localStorage.setItem('token', data.token);
      
      setCurrentToken(data.token);
      setIsSuccess(true);
      
      toast({
        title: "Успешно!",
        description: "Токен обновлен. Перенаправление...",
        duration: 2000
      });
      
      // Принудительная очистка кеша
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }
      
      setTimeout(() => {
        window.location.href = '/affiliate/statistics';
      }, 2000);
      
    } catch (error) {
      // Тихо обрабатываем ошибки обновления токена
      toast({
        title: "Ошибка",
        description: "Не удалось обновить токен",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Обновление токена</CardTitle>
          <p className="text-muted-foreground">
            Для работы партнерской аналитики необходимо обновить токен аутентификации
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Текущий токен */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Текущий токен:</label>
            <div className="p-3 bg-gray-100 rounded-md font-mono text-xs break-all">
              {currentToken ? (
                <>
                  <Badge variant="outline" className="mb-2">
                    {currentToken.length > 20 ? 'Найден' : 'Короткий'}
                  </Badge>
                  <div>{currentToken.substring(0, 50)}...</div>
                </>
              ) : (
                <div className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Токен не найден
                </div>
              )}
            </div>
          </div>

          {/* Кнопка обновления */}
          <Button 
            onClick={updateToken} 
            disabled={isUpdating || isSuccess}
            className="w-full"
            size="lg"
          >
            {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSuccess && <CheckCircle className="w-4 h-4 mr-2 text-green-500" />}
            {isUpdating ? 'Обновляем...' : isSuccess ? 'Готово!' : 'Обновить токен'}
          </Button>

          {isSuccess && (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="text-green-800 font-medium">
                ✓ Токен успешно обновлен!
              </div>
              <div className="text-green-600 text-sm mt-1">
                Перенаправление на страницу статистики...
              </div>
            </div>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            После обновления вы будете автоматически перенаправлены<br />
            на страницу партнерской аналитики
          </div>
        </CardContent>
      </Card>
    </div>
  );
}