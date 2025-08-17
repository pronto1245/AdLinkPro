import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function RegisterAdvertiser() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    contactType: '',
    contact: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false
  });
  const [loading, setLoading] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
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

    if (!formData.contactType || !formData.contact) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, укажите тип контакта и контактные данные",
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
      await apiRequest('/api/auth/register/advertiser', {
        method: 'POST',
        body: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          company: formData.company,
          phone: formData.phone,
          contactType: formData.contactType,
          contact: formData.contact,
          agreeTerms: formData.agreeTerms,
          agreePrivacy: formData.agreePrivacy,
          agreeMarketing: formData.agreeMarketing
        }
      });

      toast({
        title: "Регистрация успешна",
        description: "Ваш аккаунт рекламодателя создан. Проверьте email для подтверждения.",
      });

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

  const updateFormData = (field: string, value: string | boolean) => {
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
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">FraudGuard</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Anti-Fraud Platform</p>
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
                <Label htmlFor="name">Имя *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Введите ваше имя"
                  required
                  data-testid="input-name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="advertiser@company.com"
                  required
                  data-testid="input-email"
                />
              </div>

              <div>
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  placeholder="Минимум 8 символов"
                  required
                  minLength={8}
                  data-testid="input-password"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Подтверждение пароля *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  placeholder="Повторите пароль"
                  required
                  minLength={8}
                  data-testid="input-confirm-password"
                />
              </div>

              <div>
                <Label htmlFor="company">Компания *</Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  placeholder="ООО Ваша компания"
                  required
                  data-testid="input-company"
                />
              </div>

              <div>
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  required
                  data-testid="input-phone"
                />
              </div>

              <div>
                <Label htmlFor="contactType">Тип контакта *</Label>
                <Select value={formData.contactType} onValueChange={(value) => updateFormData('contactType', value)}>
                  <SelectTrigger data-testid="select-contact-type">
                    <SelectValue placeholder="Выберите тип контакта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telegram">📱 Telegram</SelectItem>
                    <SelectItem value="skype">💬 Skype</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contact">Контакт *</Label>
                <Input
                  id="contact"
                  type="text"
                  value={formData.contact}
                  onChange={(e) => updateFormData('contact', e.target.value)}
                  placeholder={
                    formData.contactType === 'telegram' 
                      ? '@username или номер телефона' 
                      : formData.contactType === 'skype'
                      ? 'Skype ID'
                      : 'Укажите ваш контакт'
                  }
                  required
                  data-testid="input-contact"
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => updateFormData('agreeTerms', checked as boolean)}
                    data-testid="checkbox-agree-terms"
                  />
                  <Label htmlFor="agreeTerms" className="text-sm">
                    Я согласен с <a href="#" className="text-blue-600 hover:underline">условиями использования</a> *
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreePrivacy"
                    checked={formData.agreePrivacy}
                    onCheckedChange={(checked) => updateFormData('agreePrivacy', checked as boolean)}
                    data-testid="checkbox-agree-privacy"
                  />
                  <Label htmlFor="agreePrivacy" className="text-sm">
                    Я согласен с <a href="#" className="text-blue-600 hover:underline">политикой конфиденциальности</a> *
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeMarketing"
                    checked={formData.agreeMarketing}
                    onCheckedChange={(checked) => updateFormData('agreeMarketing', checked as boolean)}
                    data-testid="checkbox-agree-marketing"
                  />
                  <Label htmlFor="agreeMarketing" className="text-sm">
                    Согласен получать маркетинговые материалы
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-testid="button-register"
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setLocation('/login')}
                data-testid="button-back-to-login"
              >
                ← Вернуться ко входу
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}