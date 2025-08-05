import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      
      // Small delay to ensure user data is set before redirect
      setTimeout(() => {
        setLocation('/');
      }, 100);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-network text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">FraudGuard</h1>
              <p className="text-sm text-slate-600">Anti-Fraud Platform</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t('login')}</CardTitle>
            <div className="flex justify-center">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-sm border border-slate-200 rounded px-3 py-1"
                data-testid="language-select"
              >
                <option value="en">🇺🇸 English</option>
                <option value="ru">🇷🇺 Русский</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
              <div className="font-medium text-blue-800 mb-2">Быстрый вход:</div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => { setUsername('superadmin'); setPassword('admin'); }}
                  className="block w-full text-left p-2 text-blue-700 hover:bg-blue-100 rounded text-xs"
                >
                  <strong>👑 Супер-админ:</strong> superadmin / admin
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('advertiser1'); setPassword('admin'); }}
                  className="block w-full text-left p-2 text-blue-700 hover:bg-blue-100 rounded text-xs"
                >
                  <strong>🏢 Рекламодатель:</strong> advertiser1 / admin
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('test_affiliate'); setPassword('admin'); }}
                  className="block w-full text-left p-2 text-blue-700 hover:bg-blue-100 rounded text-xs"
                >
                  <strong>🤝 Партнер:</strong> test_affiliate / admin
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
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
