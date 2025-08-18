import { useState } from 'react';
import { loginV2 } from '@/lib/api';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, Shield, ArrowLeft } from 'lucide-react';

export default function LoginV2() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<any>(null);
  
  const { t, language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginV2(username, password);
      
      // Check if 2FA is required
      if (result?.requires2FA) {
        setPendingAuth(result);
        setShow2FA(true);
        setLoading(false);
        return;
      }
      
      // If login was successful
      if (result?.success) {
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в систему!",
        });
        
        // Small delay to ensure user data is set before redirect
        setTimeout(() => {
          setLocation('/');
        }, 100);
      } else {
        throw new Error(result?.error || "Неверные учетные данные");
      }
    } catch (error: any) {
      toast({
        title: "Ошибка входа",
        description: error.message || "Неверные учетные данные",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim() || !pendingAuth) return;
    
    setTwoFactorLoading(true);
    
    try {
      // Verify 2FA code
      const response = await fetch('/api/auth/v2/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: pendingAuth.tempToken,
          code: twoFactorCode
        })
      });
      
      if (!response.ok) {
        throw new Error('Неверный код двухфакторной аутентификации');
      }
      
      const data = await response.json();
      
      // Complete login
      localStorage.setItem('token', data.token);
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать в систему!",
      });
      
      setTimeout(() => {
        setLocation('/');
      }, 100);
      
    } catch (error: any) {
      toast({
        title: "Ошибка 2FA",
        description: error.message || "Неверный код двухфакторной аутентификации",
        variant: "destructive",
      });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    
    setRecoveryLoading(true);
    
    try {
      const response = await fetch('/api/auth/v2/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail })
      });
      
      if (!response.ok) {
        throw new Error('Не удалось отправить письмо для сброса пароля');
      }
      
      toast({
        title: "Письмо отправлено",
        description: "Проверьте вашу почту для инструкций по сбросу пароля",
      });
      
      setShowPasswordRecovery(false);
      setRecoveryEmail('');
      
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить письмо",
        variant: "destructive",
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const back2FA = () => {
    setShow2FA(false);
    setPendingAuth(null);
    setTwoFactorCode('');
  };

  // 2FA Form
  if (show2FA) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AdLinkPro</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Двухфакторная аутентификация</p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Код подтверждения</span>
              </CardTitle>
              <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                Введите код из вашего приложения-аутентификатора
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handle2FASubmit} className="space-y-4">
                <div>
                  <Label htmlFor="twoFactorCode">6-значный код</Label>
                  <Input
                    id="twoFactorCode"
                    type="text"
                    placeholder="000000"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    className="text-center text-lg tracking-widest"
                    data-testid="input-2fa-code"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={back2FA}
                    data-testid="button-back-2fa"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад
                  </Button>
                  <Button
                    type="submit"
                    disabled={twoFactorLoading || twoFactorCode.length !== 6}
                    onClick={handle2FASubmit}
                    data-testid="button-verify-2fa"
                  >
                    {twoFactorLoading ? 'Проверка...' : 'Подтвердить'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-network text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AdLinkPro</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Партнерская платформа</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Вход в систему</CardTitle>
            <div className="flex justify-center">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ru')}
                className="text-sm border border-slate-200 dark:border-slate-700 rounded px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                data-testid="language-select"
              >
                <option value="en">🇺🇸 English</option>
                <option value="ru">🇷🇺 Русский</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Логин / Email</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите логин или email"
                  required
                  data-testid="input-username"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Пароль</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    required
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Dialog open={showPasswordRecovery} onOpenChange={setShowPasswordRecovery}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      data-testid="button-forgot-password"
                    >
                      Забыли пароль?
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Восстановление пароля</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePasswordRecovery} className="space-y-4">
                      <div>
                        <Label htmlFor="recoveryEmail">Email адрес</Label>
                        <Input
                          id="recoveryEmail"
                          type="email"
                          placeholder="Введите ваш email"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          required
                          data-testid="input-recovery-email"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPasswordRecovery(false)}
                          className="flex-1"
                        >
                          Отмена
                        </Button>
                        <Button
                          type="submit"
                          disabled={recoveryLoading}
                          className="flex-1"
                          onClick={handlePasswordRecovery}
                          data-testid="button-send-recovery"
                        >
                          {recoveryLoading ? 'Отправка...' : 'Отправить'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                onClick={handleSubmit}
                data-testid="button-sign-in"
              >
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </form>
            
            <div className="mt-6 space-y-3">
              <div className="text-sm text-center text-slate-600 dark:text-slate-400">
                Еще нет аккаунта?
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation('/register/partner')}
                  data-testid="button-become-partner"
                >
                  🤝 Стать партнёром
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation('/register/advertiser')}
                  data-testid="button-become-advertiser"
                >
                  🏢 Стать рекламодателем
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}