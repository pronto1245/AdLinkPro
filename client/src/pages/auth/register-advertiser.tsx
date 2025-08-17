import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';

export default function RegisterAdvertiser() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    contactType: '',
    contactDetails: '',
    agreeTerms: false,
    agreePrivacy: false
  });
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();

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

    if (!formData.contactType) {
      toast({
        title: "Ошибка",
        description: "Выберите тип контакта",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      toast({
        title: "Ошибка",
        description: "Необходимо согласиться с условиями использования и политикой конфиденциальности",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implement advertiser registration API call
      console.log('Advertiser registration data:', formData);
      
      toast({
        title: "Регистрация успешна",
        description: "Ваш аккаунт рекламодателя создан. Проверьте email для подтверждения.",
        variant: "default",
      });
      
      // Redirect to login after successful registration
      setTimeout(() => {
        setLocation('/login');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Не удалось создать аккаунт",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-network text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AdLinkPro</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Рекламная платформа</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">🏢 Регистрация рекламодателя</CardTitle>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Имя *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Введите ваше имя"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="company">Компания *</Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  required
                  placeholder="Название вашей компании"
                />
              </div>

              <div>
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  placeholder="Минимум 6 символов"
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  placeholder="Повторите пароль"
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="contactType">Тип контакта *</Label>
                <Select value={formData.contactType} onValueChange={(value) => handleInputChange('contactType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип контакта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="skype">Skype</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contactDetails">Контактные данные *</Label>
                <Input
                  id="contactDetails"
                  type="text"
                  value={formData.contactDetails}
                  onChange={(e) => handleInputChange('contactDetails', e.target.value)}
                  required
                  placeholder={formData.contactType === 'telegram' ? '@username' : 'skype_username'}
                />
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeTerms', !!checked)}
                  />
                  <Label 
                    htmlFor="agreeTerms" 
                    className="text-sm leading-5 cursor-pointer"
                  >
                    Я согласен с{' '}
                    <button
                      type="button"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => {/* TODO: Open terms modal */}}
                    >
                      условиями использования
                    </button>
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreePrivacy"
                    checked={formData.agreePrivacy}
                    onCheckedChange={(checked) => handleInputChange('agreePrivacy', !!checked)}
                  />
                  <Label 
                    htmlFor="agreePrivacy" 
                    className="text-sm leading-5 cursor-pointer"
                  >
                    Я согласен с{' '}
                    <button
                      type="button"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => {/* TODO: Open privacy policy modal */}}
                    >
                      политикой конфиденциальности
                    </button>
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Создание аккаунта...' : 'Зарегистрироваться как рекламодатель'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Уже есть аккаунт?{' '}
                <button
                  onClick={() => setLocation('/login')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Войти
                </button>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Хотите стать партнером?{' '}
                <button
                  onClick={() => setLocation('/register/partner')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Зарегистрироваться как партнер
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}