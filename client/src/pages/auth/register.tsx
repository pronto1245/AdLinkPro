import { useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { AuthService } from '@/lib/auth';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

export default function Register() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();

  // Parse URL parameters
  const urlParams = new URLSearchParams(searchString);
  const initialRole = (urlParams.get('role') as 'affiliate' | 'advertiser') || 'affiliate';
  const referralCode = urlParams.get('ref');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
    role: initialRole
  });

  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Ошибка",
        description: "Пароль должен содержать минимум 6 символов",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Build registration URL with referral code if present
      let registrationUrl = '/api/auth/register';
      if (referralCode) {
        registrationUrl += `?ref=${encodeURIComponent(referralCode)}`;
      }

      const response = await fetch(registrationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Show success message from server
      setSuccessMessage(data.message || 'Регистрация прошла успешно. С вами свяжется наш менеджер для активации аккаунта в течение 24 часов.');
      setRegistered(true);

      // Auto-redirect to login after 5 seconds
      setTimeout(() => {
        setLocation('/login');
      }, 5000);

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Произошла ошибка при регистрации",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="text-2xl font-bold text-green-600">Регистрация завершена!</h2>
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {successMessage}
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground">
                  Вы будете перенаправлены на страницу входа через несколько секунд...
                </p>
                <Button onClick={() => setLocation('/login')} className="w-full">
                  Перейти к входу
                </Button>
              </div>
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
            <CardTitle className="text-center">
              Регистрация {formData.role === 'affiliate' ? 'партнёра' : 'рекламодателя'}
            </CardTitle>
            <div className="flex justify-center">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ru')}
                className="text-sm border border-slate-200 dark:border-slate-700 rounded px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="en">🇺🇸 English</option>
                <option value="ru">🇷🇺 Русский</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {referralCode && (
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  Вы регистрируетесь по реферальной ссылке
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="role">Тип аккаунта</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип аккаунта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="affiliate">Партнёр</SelectItem>
                    <SelectItem value="advertiser">Рекламодатель</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Имя</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="username">Имя пользователя</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="company">Компания (необязательно)</Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Уже есть аккаунт? </span>
                <button
                  type="button"
                  onClick={() => setLocation('/login')}
                  className="text-blue-600 hover:underline"
                >
                  Войти
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}