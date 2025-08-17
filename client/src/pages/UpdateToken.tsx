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
    // Check for token in both formats for backward compatibility, prefer auth_token
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    setCurrentToken(token);
    
    // If we found an old format token, migrate it
    if (!localStorage.getItem('auth_token') && localStorage.getItem('token')) {
      const oldToken = localStorage.getItem('token');
      if (oldToken) {
        localStorage.setItem('auth_token', oldToken);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const updateToken = async () => {
    setIsUpdating(true);
    
    try {
      const response = await fetch('/api/get-fresh-token');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        
        // Provide more specific error messages
        if (response.status === 401) {
          throw new Error('Необходима повторная авторизация');
        } else if (response.status === 403) {
          throw new Error('Нет доступа к обновлению токена');
        } else if (response.status >= 500) {
          throw new Error('Ошибка сервера. Попробуйте позже');
        } else {
          throw new Error(`Ошибка API: ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log('Received token data:', data);
      
      // Validate that we received a valid token
      if (!data.token || data.token === 'null' || data.token === 'undefined' || data.token.trim() === '') {
        throw new Error('Получен некорректный токен от сервера');
      }
      
      // Clear any old token formats and set the standard token
      localStorage.removeItem('token');
      localStorage.setItem('auth_token', data.token);
      
      setCurrentToken(data.token);
      setIsSuccess(true);
      
      toast({
        title: "Успешно!",
        description: "Токен обновлен. Перенаправление...",
        duration: 2000
      });
      
      // Clear cache for fresh data with new token
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }
      
      // Clear React Query cache as well
      if ((window as any).queryClient) {
        (window as any).queryClient.clear();
      }
      
      setTimeout(() => {
        window.location.href = '/affiliate/statistics';
      }, 2000);
      
    } catch (error) {
      console.error('Update token error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      toast({
        title: "Ошибка обновления токена",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
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
                  <Badge 
                    variant="outline" 
                    className={`mb-2 ${currentToken.length > 20 ? 'border-green-500 text-green-700' : 'border-yellow-500 text-yellow-700'}`}
                  >
                    {currentToken.length > 20 ? 'Токен найден' : 'Короткий токен'}
                  </Badge>
                  <div>{currentToken.substring(0, 50)}{currentToken.length > 50 ? '...' : ''}</div>
                  {currentToken.length > 20 && (
                    <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Формат токена корректен
                    </div>
                  )}
                </>
              ) : (
                <div className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Токен не найден или недействителен
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