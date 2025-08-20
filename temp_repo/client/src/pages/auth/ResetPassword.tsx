import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { secureAuth, SecureAPIError } from '@/lib/secure-api';

interface PasswordStrengthIndicatorProps {
  password: string;
}

function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const getStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: '', color: '' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    const indicators = [
      { score: 0, text: 'Очень слабый', color: 'bg-red-500' },
      { score: 1, text: 'Слабый', color: 'bg-red-400' },
      { score: 2, text: 'Средний', color: 'bg-yellow-400' },
      { score: 3, text: 'Хороший', color: 'bg-blue-400' },
      { score: 4, text: 'Отличный', color: 'bg-green-500' },
      { score: 5, text: 'Превосходный', color: 'bg-green-600' }
    ];
    
    return indicators[score] || indicators[0];
  };
  
  const strength = getStrength(password);
  
  return (
    <div className="mt-2">
      <div className="flex justify-between text-sm mb-1">
        <span>Надежность пароля:</span>
        <span className={`font-medium ${strength.score >= 3 ? 'text-green-600' : strength.score >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
          {strength.text}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute('/auth/reset-password');
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      setToken(urlToken);
      validateToken(urlToken);
    } else {
      setValidatingToken(false);
      setErrors({ token: 'Токен для сброса пароля не найден в ссылке.' });
    }
  }, []);

  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await secureAuth.validateResetToken(tokenToValidate);
      setTokenValid(response.valid);
      if (!response.valid) {
        setErrors({ token: 'Недействительный или истекший токен для сброса пароля.' });
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      setTokenValid(false);
      setErrors({ token: 'Ошибка при проверке токена.' });
    } finally {
      setValidatingToken(false);
    }
  };

  const validatePasswords = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!newPassword) {
      newErrors.newPassword = 'Новый пароль обязателен';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Пароль должен содержать минимум 8 символов';
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = 'Пароль должен содержать заглавную букву';
    } else if (!/[a-z]/.test(newPassword)) {
      newErrors.newPassword = 'Пароль должен содержать строчную букву';
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = 'Пароль должен содержать цифру';
    } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
      newErrors.newPassword = 'Пароль должен содержать специальный символ';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Подтверждение пароля обязательно';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) return;
    
    setLoading(true);
    
    try {
      const response = await secureAuth.completePasswordReset(token, newPassword);
      
      if (response.success) {
        setSuccess(true);
        toast({
          title: "Пароль изменен",
          description: "Ваш пароль успешно изменен. Теперь вы можете войти с новым паролем.",
        });
      } else {
        setErrors({ general: response.message || 'Не удалось сбросить пароль' });
      }
    } catch (error: any) {
      if (error instanceof SecureAPIError) {
        setErrors({ general: error.message || 'Произошла ошибка при сбросе пароля' });
      } else {
        setErrors({ general: 'Произошла ошибка. Проверьте подключение к интернету.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span>Проверка ссылки...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Ошибка</CardTitle>
            <CardDescription>
              {errors.token || 'Недействительная ссылка для сброса пароля'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Возможные причины:</p>
              <p>• Ссылка истекла (действительна 2 часа)</p>
              <p>• Ссылка уже была использована</p>
              <p>• Неверная ссылка</p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setLocation('/auth/forgot-password')}
              >
                Запросить новую ссылку
              </Button>
              <Button 
                className="flex-1"
                onClick={() => setLocation('/auth/login')}
              >
                Вернуться к входу
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Пароль изменен</CardTitle>
            <CardDescription>
              Ваш пароль успешно изменен
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-muted-foreground">
              <p>Теперь вы можете войти в систему с новым паролем.</p>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => setLocation('/auth/login')}
            >
              Войти в систему
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Новый пароль</CardTitle>
          <CardDescription>
            Введите новый пароль для вашего аккаунта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{errors.general}</span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="newPassword">Новый пароль</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={errors.newPassword ? 'border-red-300' : ''}
                  placeholder="Введите новый пароль"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
              {newPassword && <PasswordStrengthIndicator password={newPassword} />}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? 'border-red-300' : ''}
                  placeholder="Повторите новый пароль"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Изменение пароля...
                </>
              ) : (
                'Изменить пароль'
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/auth/login')}
              >
                Вернуться к входу
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}