import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Shield, AlertTriangle, Loader2, CheckCircle, User, Building, Mail, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

import { secureAuth, SecureAPIError } from '@/lib/secure-api';
import { registrationSchema, RegistrationFormData } from '@/lib/validation';
import { passwordStrength, rateLimitTracker } from '@/lib/security';

export default function RegisterPartner() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Determine registration type from URL
  const isAdvertiser = location.includes('/register/advertiser');
  const registrationType = isAdvertiser ? 'advertiser' : 'affiliate';
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{ blocked: boolean; remaining: number }>({ blocked: false, remaining: 0 });
  const [passwordStrengthInfo, setPasswordStrengthInfo] = useState<{ score: number; feedback: string[] }>({ score: 0, feedback: [] });

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      company: isAdvertiser ? '' : undefined,
      contactType: undefined,
      contact: '',
      agreeTerms: false,
      agreePrivacy: false,
      agreeMarketing: false,
    },
  });

  // Watch password for strength calculation
  const password = form.watch('password');
  const email = form.watch('email');

  useEffect(() => {
    if (password) {
      setPasswordStrengthInfo(passwordStrength.calculate(password));
    }
  }, [password]);

  // Check rate limiting
  useEffect(() => {
    const checkRateLimit = () => {
      if (email) {
        const isBlocked = rateLimitTracker.isRateLimited(email);
        const remaining = isBlocked ? rateLimitTracker.getRemainingTime(email) : 0;
        setRateLimitInfo({ blocked: isBlocked, remaining });
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);
    return () => clearInterval(interval);
  }, [email]);

  const handleSubmit = async (data: RegistrationFormData) => {
    if (rateLimitInfo.blocked) {
      toast({
        title: 'Слишком много попыток',
        description: `Попробуйте снова через ${rateLimitInfo.remaining} секунд`,
        variant: 'destructive',
      });
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Prepare registration data
      const registrationData = {
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password,
        phone: data.phone,
        company: data.company,
        contactType: data.contactType,
        contact: data.contact,
        role: isAdvertiser ? 'ADVERTISER' : 'PARTNER',
        agreeTerms: data.agreeTerms,
        agreePrivacy: data.agreePrivacy,
        agreeMarketing: data.agreeMarketing,
      };

      const result = await secureAuth.register(registrationData, data.email);

      toast({
        title: 'Регистрация успешна!',
        description: result.message || 'Ваша заявка отправлена на рассмотрение. С вами свяжется менеджер в течение 24 часов.',
      });

      // Redirect to login page
      setTimeout(() => {
        setLocation('/auth/login');
      }, 2000);

    } catch (err) {
      if (err instanceof SecureAPIError) {
        if (err.code === 'RATE_LIMITED') {
          setError(`Слишком много попыток регистрации. Попробуйте через ${err.retryAfter} секунд.`);
        } else if (err.status === 409) {
          setError('Пользователь с таким email уже существует');
        } else if (err.status === 400) {
          setError('Проверьте правильность заполнения формы');
        } else {
          setError(err.statusText || 'Ошибка регистрации');
        }
      } else {
        setError('Ошибка соединения. Проверьте интернет-подключение.');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrengthLabel = passwordStrength.getStrengthLabel(passwordStrengthInfo.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              {isAdvertiser ? (
                <Building className="h-8 w-8 text-blue-600 mr-2" />
              ) : (
                <User className="h-8 w-8 text-green-600 mr-2" />
              )}
              <CardTitle className="text-2xl font-bold text-gray-900">
                {isAdvertiser ? 'Регистрация рекламодателя' : 'Регистрация партнёра'}
              </CardTitle>
            </div>
            <p className="text-gray-600">
              {isAdvertiser 
                ? 'Создайте аккаунт для размещения рекламных кампаний'
                : 'Присоединяйтесь к нашей партнёрской программе'
              }
            </p>
          </CardHeader>

          <CardContent>
            {/* Rate limiting warning */}
            {rateLimitInfo.blocked && (
              <Alert className="mb-4" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Слишком много попыток регистрации. Попробуйте через {rateLimitInfo.remaining} секунд.
                </AlertDescription>
              </Alert>
            )}

            {/* Error message */}
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Личная информация
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Полное имя *</Label>
                    <Input
                      {...form.register('name')}
                      id="name"
                      placeholder="Иван Иванов"
                      disabled={loading}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      {...form.register('email')}
                      id="email"
                      type="email"
                      placeholder="ivan@company.com"
                      disabled={loading}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Имя пользователя</Label>
                    <Input
                      {...form.register('username')}
                      id="username"
                      placeholder="ivan_ivanov"
                      disabled={loading}
                    />
                    {form.formState.errors.username && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      {...form.register('phone')}
                      id="phone"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      disabled={loading}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                {isAdvertiser && (
                  <div>
                    <Label htmlFor="company">Название компании *</Label>
                    <Input
                      {...form.register('company')}
                      id="company"
                      placeholder="ООО 'Ваша компания'"
                      disabled={loading}
                    />
                    {form.formState.errors.company && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.company.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Контактная информация
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactType">Предпочтительный способ связи</Label>
                    <Controller
                      name="contactType"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите способ связи" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Телефон</SelectItem>
                            <SelectItem value="telegram">Telegram</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact">Контактные данные</Label>
                    <Input
                      {...form.register('contact')}
                      id="contact"
                      placeholder="@username или номер телефона"
                      disabled={loading}
                    />
                    {form.formState.errors.contact && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.contact.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Безопасность
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Пароль *</Label>
                    <div className="relative">
                      <Input
                        {...form.register('password')}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Создайте надёжный пароль"
                        disabled={loading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Сила пароля:</span>
                          <span className={passwordStrengthLabel.color}>
                            {passwordStrengthLabel.label}
                          </span>
                        </div>
                        <Progress 
                          value={(passwordStrengthInfo.score / 6) * 100} 
                          className="h-2 mt-1"
                        />
                        {passwordStrengthInfo.feedback.length > 0 && (
                          <ul className="text-xs text-gray-500 mt-1">
                            {passwordStrengthInfo.feedback.map((item, index) => (
                              <li key={index}>• {item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
                    <div className="relative">
                      <Input
                        {...form.register('confirmPassword')}
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Повторите пароль"
                        disabled={loading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Agreements */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeTerms"
                    checked={form.watch('agreeTerms')}
                    onCheckedChange={(checked) => 
                      form.setValue('agreeTerms', checked as boolean)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="agreeTerms" className="text-sm">
                    Я согласен с{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      условиями использования
                    </a>{' '}
                    *
                  </Label>
                </div>
                {form.formState.errors.agreeTerms && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.agreeTerms.message}
                  </p>
                )}

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreePrivacy"
                    checked={form.watch('agreePrivacy')}
                    onCheckedChange={(checked) => 
                      form.setValue('agreePrivacy', checked as boolean)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="agreePrivacy" className="text-sm">
                    Я согласен с{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      политикой конфиденциальности
                    </a>{' '}
                    *
                  </Label>
                </div>
                {form.formState.errors.agreePrivacy && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.agreePrivacy.message}
                  </p>
                )}

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeMarketing"
                    checked={form.watch('agreeMarketing')}
                    onCheckedChange={(checked) => 
                      form.setValue('agreeMarketing', checked as boolean)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="agreeMarketing" className="text-sm">
                    Я согласен на получение маркетинговых материалов
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || rateLimitInfo.blocked}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Регистрируем...
                    </>
                  ) : (
                    `${isAdvertiser ? 'Зарегистрироваться как рекламодатель' : 'Стать партнёром'}`
                  )}
                </Button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  Уже есть аккаунт?{' '}
                  <a href="/auth/login" className="text-blue-600 hover:underline">
                    Войти в систему
                  </a>
                </p>
              </div>
            </form>

            {/* Security indicators */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center text-xs text-gray-500 space-x-4">
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                  Данные защищены SSL
                </div>
                <div className="flex items-center">
                  <Shield className="h-3 w-3 text-blue-500 mr-1" />
                  GDPR совместимость
                </div>
                <div className="flex items-center">
                  <Mail className="h-3 w-3 text-purple-500 mr-1" />
                  Email подтверждение
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}