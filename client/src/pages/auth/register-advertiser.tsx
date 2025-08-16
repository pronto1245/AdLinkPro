import { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { useLocation } from 'wouter';
import { useToast } from '../../hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';

export default function RegisterAdvertiser() {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    contactType: '',
    contact: '',
    agreeTerms: false,
    agreePrivacy: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const { i18n, t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const language = i18n.language || 'ru';
  const setLanguage = (lang: string) => i18n.changeLanguage(lang);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно для заполнения';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Пароль обязателен для заполнения';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Подтверждение пароля обязательно';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Компания обязательна для заполнения';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен для заполнения';
    }

    if (!formData.contactType) {
      newErrors.contactType = 'Тип контакта обязателен для выбора';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = 'Контакт обязателен для заполнения';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Необходимо согласиться с условиями использования';
    }

    if (!formData.agreePrivacy) {
      newErrors.agreePrivacy = 'Необходимо согласиться с политикой конфиденциальности';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        username: formData.email, // Use email as username
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        company: formData.company,
        phone: formData.phone,
        role: 'advertiser',
        userType: 'advertiser',
        settings: JSON.stringify({
          contactType: formData.contactType,
          contact: formData.contact,
          agreeTerms: formData.agreeTerms,
          agreePrivacy: formData.agreePrivacy
        })
      };

      await register(userData);
      
      toast({
        title: "Регистрация успешна!",
        description: "Добро пожаловать в платформу рекламодателей",
        variant: "default",
      });

      // Redirect to advertiser dashboard
      setLocation('/advertiser/dashboard');
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-network text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AdLinkPro</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Платформа рекламодателей</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Регистрация рекламодателя</CardTitle>
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
                <Label htmlFor="firstName">Имя *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Введите ваше имя"
                  data-testid="input-firstName"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <Label htmlFor="email">Эл. почта *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Введите ваш email"
                  data-testid="input-email"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Введите пароль"
                  data-testid="input-password"
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Подтверждение пароля *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Подтвердите пароль"
                  data-testid="input-confirmPassword"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <div>
                <Label htmlFor="company">Компания *</Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Введите название компании"
                  data-testid="input-company"
                  className={errors.company ? 'border-red-500' : ''}
                />
                {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Введите номер телефона"
                  data-testid="input-phone"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="contactType">Тип контакта *</Label>
                <Select value={formData.contactType} onValueChange={(value) => handleInputChange('contactType', value)}>
                  <SelectTrigger className={errors.contactType ? 'border-red-500' : ''} data-testid="select-contactType">
                    <SelectValue placeholder="Выберите тип контакта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telegram">Телеграмм</SelectItem>
                    <SelectItem value="skype">Скайп</SelectItem>
                  </SelectContent>
                </Select>
                {errors.contactType && <p className="text-red-500 text-sm mt-1">{errors.contactType}</p>}
              </div>

              <div>
                <Label htmlFor="contact">Контакт *</Label>
                <Input
                  id="contact"
                  type="text"
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  placeholder={formData.contactType === 'telegram' ? '@username' : 'Skype ID'}
                  data-testid="input-contact"
                  className={errors.contact ? 'border-red-500' : ''}
                />
                {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeTerms', !!checked)}
                    data-testid="checkbox-agreeTerms"
                    className={errors.agreeTerms ? 'border-red-500' : ''}
                  />
                  <Label htmlFor="agreeTerms" className="text-sm">
                    Согласен с условиями использования *
                  </Label>
                </div>
                {errors.agreeTerms && <p className="text-red-500 text-sm">{errors.agreeTerms}</p>}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreePrivacy"
                    checked={formData.agreePrivacy}
                    onCheckedChange={(checked) => handleInputChange('agreePrivacy', !!checked)}
                    data-testid="checkbox-agreePrivacy"
                    className={errors.agreePrivacy ? 'border-red-500' : ''}
                  />
                  <Label htmlFor="agreePrivacy" className="text-sm">
                    Согласен с политикой конфиденциальности *
                  </Label>
                </div>
                {errors.agreePrivacy && <p className="text-red-500 text-sm">{errors.agreePrivacy}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                data-testid="button-register"
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>

              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                Уже есть аккаунт?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  Войти
                </Link>
              </div>

              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                Хотите стать партнером?{' '}
                <Link href="/auth/register-partner" className="text-blue-600 hover:underline">
                  Регистрация партнера
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}