import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  AlertTriangle, 
  Loader2, 
  CheckCircle, 
  User, 
  Building, 
  Mail, 
  Phone,
  UserCheck,
  ArrowLeft
} from 'lucide-react';

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
import { 
  passwordStrength, 
  RateLimitTracker, 
  CSRFManager,
  sanitizeInput 
} from '@/lib/security';

type Props = {
  role?: 'partner' | 'advertiser';
  params?: any; // Added for Route compatibility
};

// Initialize security managers
const rateLimitTracker = new RateLimitTracker();
const csrfManager = CSRFManager.getInstance();

export default function RegisterUnified({ role, ...props }: Props) {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Role selection state - if no role provided, allow user to select
  const [selectedRole, setSelectedRole] = useState<'partner' | 'advertiser'>(
    role || (location.includes('/register/advertiser') ? 'advertiser' : 'partner')
  );
  const [showRoleSelection, setShowRoleSelection] = useState(!role && !location.includes('/register/'));
  
  // Form and UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{ 
    blocked: boolean; 
    remaining: number 
  }>({ blocked: false, remaining: 0 });
  const [passwordStrengthInfo, setPasswordStrengthInfo] = useState<{ 
    score: number; 
    feedback: string[] 
  }>({ score: 0, feedback: [] });

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      company: selectedRole === 'advertiser' ? '' : undefined,
      contactType: undefined,
      contact: '',
      agreeTerms: false,
      agreePrivacy: false,
      agreeMarketing: false,
    },
  });

  // Generate CSRF token on component mount
  useEffect(() => {
    csrfManager.generateToken();
  }, []);

  // Check rate limiting on component mount
  useEffect(() => {
    const userIdentifier = form.watch('email') || 'anonymous';
    const isLimited = rateLimitTracker.isRateLimited(userIdentifier);
    if (isLimited) {
      const remaining = rateLimitTracker.getRemainingTime(userIdentifier);
      setRateLimitInfo({ blocked: true, remaining });
    }
  }, [form.watch('email')]);

  // Update company field requirement based on role
  useEffect(() => {
    if (selectedRole === 'advertiser') {
      form.setValue('company', '');
    } else {
      form.setValue('company', undefined);
    }
  }, [selectedRole, form]);

  // Password strength monitoring
  const watchedPassword = form.watch('password');
  useEffect(() => {
    if (watchedPassword) {
      const strength = passwordStrength.calculate(watchedPassword);
      setPasswordStrengthInfo(strength);
    } else {
      setPasswordStrengthInfo({ score: 0, feedback: [] });
    }
  }, [watchedPassword]);

  const handleRoleSelection = (newRole: 'partner' | 'advertiser') => {
    setSelectedRole(newRole);
    setShowRoleSelection(false);
    
    // Update URL to reflect selected role
    const newPath = `/register/${newRole}`;
    setLocation(newPath);
  };

  const handleSubmit = async (data: RegistrationFormData) => {
    const userIdentifier = data.email;

    // Check rate limiting
    if (rateLimitTracker.isRateLimited(userIdentifier)) {
      const remaining = rateLimitTracker.getRemainingTime(userIdentifier);
      setRateLimitInfo({ blocked: true, remaining });
      toast({
        title: 'Слишком много попыток',
        description: `Попробуйте снова через ${remaining} секунд`,
        variant: 'destructive',
      });
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Record the attempt for rate limiting
      rateLimitTracker.recordAttempt(userIdentifier);

      // Prepare registration data with proper sanitization
      const registrationData = {
        name: sanitizeInput.cleanString(data.name),
        email: sanitizeInput.cleanEmail(data.email),
        username: data.username ? sanitizeInput.cleanUsername(data.username) : undefined,
        password: data.password, // Don't sanitize password
        phone: data.phone ? sanitizeInput.cleanPhone(data.phone) : undefined,
        company: data.company ? sanitizeInput.cleanString(data.company) : undefined,
        contactType: data.contactType,
        contact: data.contact ? sanitizeInput.cleanString(data.contact) : undefined,
        role: selectedRole.toUpperCase(),
        agreeTerms: data.agreeTerms,
        agreePrivacy: data.agreePrivacy,
        agreeMarketing: data.agreeMarketing,
      };

      const result = await secureAuth.register(registrationData, userIdentifier);

      // Reset rate limiting on successful registration
      rateLimitTracker.reset(userIdentifier);

      toast({
        title: 'Регистрация успешна!',
        description: result.message || `Ваша заявка ${selectedRole === 'advertiser' ? 'рекламодателя' : 'партнёра'} отправлена на рассмотрение. С вами свяжется менеджер в течение 24 часов.`,
      });

      // Redirect to login page after a short delay
      setTimeout(() => {
        setLocation(`/login/${selectedRole}`);
      }, 2000);

    } catch (err) {
      if (err instanceof SecureAPIError) {
        if (err.code === 'RATE_LIMITED') {
          setError(`Слишком много попыток регистрации. Попробуйте через ${err.retryAfter} секунд.`);
          setRateLimitInfo({ blocked: true, remaining: err.retryAfter || 60 });
        } else if (err.status === 409) {
          setError('Пользователь с таким email уже существует. Попробуйте войти в систему.');
        } else {
          setError(err.message || 'Произошла ошибка при регистрации. Попробуйте еще раз.');
        }
      } else {
        setError('Произошла неожиданная ошибка. Пожалуйста, попробуйте позже.');
      }

      toast({
        title: 'Ошибка регистрации',
        description: error || 'Не удалось зарегистрироваться. Проверьте данные и попробуйте снова.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show role selection screen if no role is determined
  if (showRoleSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Выберите тип аккаунта
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Выберите роль для регистрации в системе AdLinkPro
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => handleRoleSelection('advertiser')}
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 border-2"
            >
              <Building className="h-8 w-8 text-blue-600" />
              <div className="text-center">
                <div className="font-semibold">Рекламодатель</div>
                <div className="text-sm text-gray-500">Размещаю рекламные кампании</div>
              </div>
            </Button>
            <Button
              onClick={() => handleRoleSelection('partner')}
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-green-50 border-2"
            >
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="text-center">
                <div className="font-semibold">Партнёр</div>
                <div className="text-sm text-gray-500">Продвигаю рекламные предложения</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdvertiser = selectedRole === 'advertiser';
  const strengthLabel = passwordStrength.getStrengthLabel(passwordStrengthInfo.score);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-6">
          {!role && (
            <Button
              variant="ghost"
              size="sm"
              className="self-start mb-4"
              onClick={() => setShowRoleSelection(true)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Изменить роль
            </Button>
          )}
          <div className="flex items-center justify-center mb-4">
            {isAdvertiser ? (
              <Building className="h-8 w-8 text-blue-600 mr-2" />
            ) : (
              <UserCheck className="h-8 w-8 text-green-600 mr-2" />
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
            <Alert className="mb-6" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Слишком много попыток регистрации. Попробуйте снова через {rateLimitInfo.remaining} секунд.
              </AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Полное имя *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  {...form.register('name')}
                  className="pl-10"
                  placeholder="Введите ваше полное имя"
                  disabled={loading}
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email адрес *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  className="pl-10"
                  placeholder="example@domain.com"
                  disabled={loading}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Username Field (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                {...form.register('username')}
                placeholder="Уникальное имя пользователя (необязательно)"
                disabled={loading}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Пароль *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...form.register('password')}
                  placeholder="Введите надежный пароль"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {watchedPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Сила пароля:</span>
                    <span className={strengthLabel.color}>{strengthLabel.label}</span>
                  </div>
                  <Progress 
                    value={(passwordStrengthInfo.score / 6) * 100} 
                    className="h-2"
                  />
                  {passwordStrengthInfo.feedback.length > 0 && (
                    <ul className="text-xs text-gray-500 space-y-1">
                      {passwordStrengthInfo.feedback.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...form.register('confirmPassword')}
                  placeholder="Повторите пароль"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  {...form.register('phone')}
                  className="pl-10"
                  placeholder="+7 (999) 123-45-67"
                  disabled={loading}
                />
              </div>
              {form.formState.errors.phone && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* Company Field (for advertisers) */}
            {isAdvertiser && (
              <div className="space-y-2">
                <Label htmlFor="company">Название компании *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="company"
                    {...form.register('company')}
                    className="pl-10"
                    placeholder="ООО 'Ваша компания'"
                    disabled={loading}
                  />
                </div>
                {form.formState.errors.company && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.company.message}
                  </p>
                )}
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип контакта</Label>
                  <Controller
                    name="contactType"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип" />
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
                <div className="space-y-2">
                  <Label htmlFor="contact">Контактные данные</Label>
                  <Input
                    id="contact"
                    {...form.register('contact')}
                    placeholder="Введите контакт"
                    disabled={loading}
                  />
                </div>
              </div>
              {form.formState.errors.contact && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.contact.message}
                </p>
              )}
            </div>

            {/* Agreement Checkboxes */}
            <div className="space-y-4">
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
                    пользовательским соглашением
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
                <a 
                  href={`/login/${selectedRole}`} 
                  className="text-blue-600 hover:underline"
                >
                  Войти в систему
                </a>
              </p>
            </div>
          </form>

          {/* Security indicators */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Shield className="h-3 w-3 mr-1 text-green-500" />
                <span>SSL шифрование</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                <span>CSRF защита</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-3 w-3 mr-1 text-blue-500" />
                <span>Rate limiting</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}