import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { i18n, t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const language = i18n.language || 'ru';
  const setLanguage = (lang: string) => i18n.changeLanguage(lang);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      
      // Redirect immediately after successful login
      setLocation('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Ошибка входа",
        description: error.message || "Неверные учетные данные",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-network text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">FraudGuard</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Anti-Fraud Platform</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t('login')}</CardTitle>
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
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
              <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">Быстрый вход:</div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => { setUsername('superadmin'); setPassword('password123'); }}
                  className="block w-full text-left p-2 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded text-xs"
                >
                  <strong>👑 Супер-админ:</strong> superadmin / password123
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('advertiser1'); setPassword('password123'); }}
                  className="block w-full text-left p-2 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded text-xs"
                >
                  <strong>🏢 Рекламодатель:</strong> advertiser1 / password123
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('test_affiliate'); setPassword('password123'); }}
                  className="block w-full text-left p-2 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded text-xs"
                >
                  <strong>🤝 Партнер:</strong> test_affiliate / password123
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">{t('username')} / {t('email')}</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  data-testid="input-username"
                />
              </div>
              <div>
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  data-testid="input-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-testid="button-sign-in"
              >
                {loading ? 'Loading...' : t('sign_in')}
              </Button>

              <div className="mt-6 space-y-2">
                <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Нет аккаунта?
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-sm" 
                    onClick={() => window.location.href = '/auth/register-partner'}
                    data-testid="register-partner-button"
                  >
                    Стать партнером
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-sm" 
                    onClick={() => window.location.href = '/auth/register-advertiser'}
                    data-testid="register-advertiser-button"
                  >
                    Стать рекламодателем
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
