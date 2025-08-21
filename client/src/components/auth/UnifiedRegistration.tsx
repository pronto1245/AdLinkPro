import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
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
  MessageCircle
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
import { 
  partnerRegistrationSchema, 
  advertiserRegistrationSchema,
  PartnerRegistrationFormData,
  AdvertiserRegistrationFormData 
} from '@/lib/validation';
import { 
  passwordStrength, 
  RateLimitTracker, 
  CSRFManager,
  sanitizeInput 
} from '@/lib/security';

// Initialize security managers
const rateLimitTracker = new RateLimitTracker();
const csrfManager = CSRFManager.getInstance();

// Role configuration type
export interface RoleConfig {
  role: 'PARTNER' | 'ADVERTISER';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  buttonText: string;
  loginPath: string;
  successMessage: string;
  bgGradient: string;
  iconColor: string;
  requiresCompany: boolean;
}

// Pre-defined role configurations
export const ROLE_CONFIGS: Record<'PARTNER' | 'ADVERTISER', RoleConfig> = {
  PARTNER: {
    role: 'PARTNER',
    title: 'Регистрация партнёра',
    subtitle: 'Присоединяйтесь к нашей партнёрской программе',
    icon: UserCheck,
    buttonText: 'Стать партнёром',
    loginPath: '/login/partner',
    successMessage: 'Ваша заявка партнёра отправлена на рассмотрение. С вами свяжется менеджер в течение 24 часов.',
    bgGradient: 'bg-gradient-to-br from-green-50 to-emerald-100',
    iconColor: 'text-green-600',
    requiresCompany: false,
  },
  ADVERTISER: {
    role: 'ADVERTISER',
    title: 'Регистрация рекламодателя',
    subtitle: 'Создайте аккаунт для размещения рекламных кампаний',
    icon: Building,
    buttonText: 'Зарегистрироваться как рекламодатель',
    loginPath: '/login/advertiser',
    successMessage: 'Ваша заявка рекламодателя отправлена на рассмотрение. С вами свяжется менеджер в течение 24 часов.',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    iconColor: 'text-blue-600',
    requiresCompany: true,
  },
};

interface UnifiedRegistrationProps {
  config: RoleConfig;
}

type FormData = PartnerRegistrationFormData | AdvertiserRegistrationFormData;

export default function UnifiedRegistration({ config }: UnifiedRegistrationProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
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

  // Use appropriate schema based on role
  const schema = config.requiresCompany ? advertiserRegistrationSchema : partnerRegistrationSchema;
  
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      telegram: '',
      password: '',
      confirmPassword: '',
      phone: '',
      company: config.requiresCompany ? '' : undefined,
      contactType: undefined,
      contact: '',
      agreeTerms: false,
      agreePrivacy: false,
      agreeMarketing: false,
    } as FormData,
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

  const handleSubmit = async (data: FormData) => {
    const userIdentifier = data.email;

    // Check rate limiting with user-friendly message
    if (rateLimitTracker.isRateLimited(userIdentifier)) {
      const remaining = rateLimitTracker.getRemainingTime(userIdentifier);
      const minutes = Math.ceil(remaining / 60);
      setRateLimitInfo({ blocked: true, remaining });
      
      toast({
        title: 'Превышен лимит попыток',
        description: `Для безопасности временно заблокированы попытки регистрации. Попробуйте через ${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'}.`,
        variant: 'destructive',
      });
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Record the attempt for rate limiting
      rateLimitTracker.recordAttempt(userIdentifier);

      // Prepare registration data with proper sanitization and field mapping
      const registrationData = {
        name: sanitizeInput.cleanString(data.name), // fullName as per requirements
        email: sanitizeInput.cleanEmail(data.email),
        telegram: sanitizeInput.cleanTelegram(data.telegram),
        password: data.password, // Don't sanitize password
        phone: data.phone ? sanitizeInput.cleanPhone(data.phone) : undefined, // phoneNumber as per requirements
        company: config.requiresCompany && 'company' in data ? 
          sanitizeInput.cleanString(data.company) : undefined, // companyName as per requirements
        contactType: data.contactType,
        contact: data.contact ? sanitizeInput.cleanString(data.contact) : undefined, // contactValue as per requirements
        role: config.role,
        agreeTerms: data.agreeTerms,
        agreePrivacy: data.agreePrivacy,
        agreeMarketing: data.agreeMarketing,
      };

      const result = await secureAuth.register(registrationData, userIdentifier);

      // Reset rate limiting on successful registration
      rateLimitTracker.reset(userIdentifier);

      // Add debugging console.log for server response
      console.log("✅ Registration successful - Server data:", result);

      // Auto-login user and save token to localStorage as required
      if (result.token) {
        localStorage.setItem('authToken', result.token);
        console.log("🔐 Token saved to localStorage");
        
        // Set user data if available
        if (result.user) {
          localStorage.setItem('userData', JSON.stringify(result.user));
        }
      }

      toast({
        title: 'Регистрация успешна!',
        description: result.message || config.successMessage,
      });

      // Redirect based on role as required
      const redirectPath = result.user?.role === 'affiliate' ? '/dashboard/partner' : '/dashboard/advertiser';
      console.log("🔄 Redirecting to:", redirectPath);
      
      setTimeout(() => {
        setLocation(redirectPath);
      }, 2000);

    } catch (err) {
      console.log("❌ Registration error details:", err);
      
      if (err instanceof SecureAPIError) {
        if (err.code === 'RATE_LIMITED') {
          const minutes = Math.ceil((err.retryAfter || 60) / 60);
          setError(`Превышен лимит попыток регистрации. Попробуйте через ${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'}.`);
          setRateLimitInfo({ blocked: true, remaining: err.retryAfter || 60 });
        } else if (err.status === 409 || err.message?.includes('already exists') || err.message?.includes('already in use')) {
          setError('Email already in use');
        } else if (err.message?.includes('Invalid email')) {
          setError('Invalid email format');
        } else if (err.message?.includes('Password')) {
          setError('Password is too weak');
        } else if (err.message?.includes('terms') || err.message?.includes('согласиться')) {
          setError('You must agree to the terms');
        } else {
          setError(err.message || 'Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз.');
        }
      } else {
        // Handle validation errors (passwords do not match, etc.)
        if (err?.message?.includes('not match') || err?.message?.includes('не совпадают')) {
          setError('Passwords do not match');
        } else {
          setError('Произошла неожиданная ошибка. Пожалуйста, попробуйте позже или обратитесь в службу поддержки.');
        }
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

  const strengthLabel = passwordStrength.getStrengthLabel(passwordStrengthInfo.score);
  const IconComponent = config.icon;

  return (
    <div className={`min-h-screen flex items-center justify-center ${config.bgGradient} p-4`}>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <IconComponent className={`h-8 w-8 ${config.iconColor} mr-2`} />
            <CardTitle className="text-2xl font-bold text-gray-900">
              {config.title}
            </CardTitle>
          </div>
          <p className="text-gray-600">
            {config.subtitle}
          </p>
        </CardHeader>

        <CardContent>
          {/* Rate limiting warning with improved UX */}
          {rateLimitInfo.blocked && (
            <Alert className="mb-6" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Превышен лимит попыток регистрации для безопасности. Попробуйте снова через {Math.ceil(rateLimitInfo.remaining / 60)} {Math.ceil(rateLimitInfo.remaining / 60) === 1 ? 'минуту' : 'минуты'}.
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

            {/* Telegram Field (Required) */}
            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram *</Label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="telegram"
                  {...form.register('telegram')}
                  className="pl-10"
                  placeholder="@username"
                  disabled={loading}
                />
              </div>
              {form.formState.errors.telegram && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.telegram.message}
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

            {/* Company Field (Required for advertisers) */}
            {config.requiresCompany && (
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
                  <Select
                    value={form.watch('contactType')}
                    onValueChange={(value) => form.setValue('contactType', value as any)}
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
                  config.buttonText
                )}
              </Button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Уже есть аккаунт?{' '}
                <a 
                  href={config.loginPath} 
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
                <span>Защита от спама</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}