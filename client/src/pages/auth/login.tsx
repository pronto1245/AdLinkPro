import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { getRoleBasedRedirect } from '@/lib/auth';

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
      console.log('🔐 Login form submitted for user:', username);
      
      await login(username, password);
      
      // Get the user's role to determine redirect path
      const token = localStorage.getItem('token');
      if (token) {
        // Decode token to get role for redirect
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);
          const redirectPath = getRoleBasedRedirect(payload.role);
          
          console.log('✅ Login successful, redirecting to:', redirectPath);
          
          toast({
            title: "Login Successful",
            description: `Welcome back! Redirecting to ${payload.role} dashboard...`,
            variant: "default",
          });
          
          // Small delay to ensure auth state is fully updated
          setTimeout(() => {
            setLocation(redirectPath);
          }, 100);
        } catch (decodeError) {
          console.error('Failed to decode token for redirect:', decodeError);
          // Fallback to default redirect
          setLocation('/');
        }
      } else {
        // Fallback if no token found
        setLocation('/');
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      let errorMessage = "Invalid credentials";
      
      // Handle different types of errors
      if (error.message) {
        if (error.message.includes('HTTP 401')) {
          errorMessage = "Invalid username or password";
        } else if (error.message.includes('HTTP 429')) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.message.includes('No token received')) {
          errorMessage = "Authentication failed. Please try again.";
        } else if (error.message.includes('expired token')) {
          errorMessage = "Session expired. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
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
