import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Shield, AlertTriangle, Loader2, CheckCircle, Clock, Smartphone, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

import { secureAuth, SecureAPIError } from "@/lib/secure-api";
import { loginSchema, twoFactorSchema, LoginFormData, TwoFactorFormData } from "@/lib/validation";
import { rateLimitTracker, secureStorage } from "@/lib/security";

function roleToPath(role?: string) {
  const r = (role || "").toLowerCase();
  if (r === "advertiser") return "/dashboard/advertiser";
  if (r === "affiliate" || r === "partner") return "/dashboard/affiliate";
  if (r === "owner") return "/dashboard/owner";
  if (r === "staff") return "/dashboard/staff";
  if (r === "super_admin") return "/dashboard/super-admin";
  return "/dashboard/partner";
}

export default function Login() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rateLimitInfo, setRateLimitInfo] = useState<{ blocked: boolean; remaining: number }>({ blocked: false, remaining: 0 });
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [tempTokenExpiry, setTempTokenExpiry] = useState<number>(0);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // 2FA form
  const twoFactorForm = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: "",
      tempToken: "",
    },
  });

  // Check rate limiting on mount and periodically
  useEffect(() => {
    const checkRateLimit = () => {
      const email = loginForm.getValues("email");
      if (email) {
        const isBlocked = rateLimitTracker.isRateLimited(email);
        const remaining = isBlocked ? rateLimitTracker.getRemainingTime(email) : 0;
        setRateLimitInfo({ blocked: isBlocked, remaining });
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);
    return () => clearInterval(interval);
  }, [loginForm.watch("email")]);

  // Handle temp token expiry countdown
  useEffect(() => {
    if (!tempTokenExpiry) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, tempTokenExpiry - now);
      
      if (remaining === 0) {
        setShow2FA(false);
        setTempToken("");
        setTempTokenExpiry(0);
        setOtpValue("");
        setError("Время сессии истекло. Попробуйте войти снова.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tempTokenExpiry]);

  // Format remaining time for temp token
  const getRemainingTime = () => {
    if (!tempTokenExpiry) return "";
    const remaining = Math.max(0, tempTokenExpiry - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle login form submission
  async function onLogin(data: LoginFormData) {
    if (rateLimitInfo.blocked) {
      toast({
        title: "Слишком много попыток",
        description: `Попробуйте снова через ${rateLimitInfo.remaining} секунд`,
        variant: "destructive",
      });
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await secureAuth.loginWithV2({
        username: data.email,
        password: data.password,
      }, data.email);

      // Check if 2FA is required
      if (result.requires2FA) {
        setTempToken(result.tempToken);
        setTempTokenExpiry(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
        setShow2FA(true);
        setAttempts(0);
        setOtpValue("");
        setOtpError("");
        
        toast({
          title: "2FA требуется",
          description: "Откройте приложение аутентификации и введите 6-значный код",
          duration: 5000,
        });
        return;
      }

      // Login successful
      if (result.token) {
        secureStorage.setToken(result.token);
        
        toast({
          title: "Успешный вход",
          description: "Перенаправляем в панель управления...",
        });

        // Get user info and navigate
        const user = await secureAuth.me();
        navigate(roleToPath(user?.role));
      }

    } catch (err) {
      if (err instanceof SecureAPIError) {
        if (err.code === 'RATE_LIMITED') {
          setError(`Слишком много попыток входа. Попробуйте через ${err.retryAfter} секунд.`);
        } else if (err.status === 401) {
          setError("Неверный email или пароль");
        } else {
          setError(err.statusText || "Ошибка входа");
        }
      } else {
        setError("Ошибка соединения. Проверьте интернет-подключение.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Handle 2FA form submission
  async function on2FA(data: TwoFactorFormData) {
    setError("");
    setOtpError("");
    setLoading(true);

    try {
      const result = await secureAuth.verify2FA({
        tempToken,
        code: data.code,
      });

      if (result.token) {
        secureStorage.setToken(result.token);
        
        toast({
          title: "2FA подтверждён",
          description: "Вход выполнен успешно. Перенаправляем...",
          duration: 3000,
        });

        // Get user info and navigate
        const user = await secureAuth.me();
        navigate(roleToPath(user?.role));
      }

    } catch (err) {
      setAttempts(prev => prev + 1);
      
      if (err instanceof SecureAPIError) {
        if (err.status === 401) {
          const newAttempts = attempts + 1;
          if (newAttempts >= 5) {
            setError("Превышено количество попыток. Начните сначала.");
            setTimeout(() => {
              setShow2FA(false);
              setTempToken("");
              setTempTokenExpiry(0);
              setOtpValue("");
              twoFactorForm.reset();
            }, 2000);
          } else {
            setOtpError(`Неверный код. Осталось попыток: ${5 - newAttempts}`);
            setOtpValue("");
            twoFactorForm.setValue("code", "");
          }
        } else {
          setError(err.statusText || "Ошибка подтверждения");
        }
      } else {
        setError("Ошибка соединения. Проверьте подключение к интернету.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Handle OTP value change
  const handleOtpChange = (value: string) => {
    setOtpValue(value);
    setOtpError("");
    twoFactorForm.setValue("code", value);
    
    // Auto-submit when 6 digits are entered
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      twoFactorForm.handleSubmit(on2FA)();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {show2FA ? (
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-2">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
            ) : (
              <Shield className="h-8 w-8 text-blue-600 mr-2" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {show2FA ? "Двухфакторная аутентификация" : "Вход в систему"}
          </CardTitle>
          <div className="mt-2">
            {show2FA ? (
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  Введите 6-значный код из вашего приложения аутентификации
                </p>
                {tempTokenExpiry > Date.now() && (
                  <div className="flex items-center justify-center text-xs text-orange-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Код действителен ещё: {getRemainingTime()}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">
                Введите свои учётные данные для входа в систему
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Rate limiting warning */}
          {rateLimitInfo.blocked && (
            <Alert className="mb-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Слишком много неудачных попыток. Попробуйте через {rateLimitInfo.remaining} секунд.
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

          {show2FA ? (
            /* Enhanced 2FA Form */
            <div className="space-y-6">
              {/* 2FA Status Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-blue-800 font-medium mb-1">
                      Защита вашего аккаунта активна
                    </p>
                    <p className="text-blue-700">
                      Мы отправили уведомление на ваше устройство. Введите код из приложения аутентификации.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={twoFactorForm.handleSubmit(on2FA)} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="otp-input" className="text-base font-medium">
                    Код аутентификации
                  </Label>
                  
                  <div className="flex flex-col items-center space-y-3">
                    <InputOTP
                      maxLength={6}
                      value={otpValue}
                      onChange={handleOtpChange}
                      disabled={loading}
                      id="otp-input"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <div className="mx-2">
                        <span className="text-gray-300">•</span>
                      </div>
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    
                    {otpError && (
                      <p className="text-sm text-red-600 text-center">{otpError}</p>
                    )}
                    
                    {twoFactorForm.formState.errors.code && !otpError && (
                      <p className="text-sm text-red-600 text-center">
                        {twoFactorForm.formState.errors.code.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Help Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <HelpCircle className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-xs text-gray-600">
                      <p className="font-medium mb-1">Не можете получить код?</p>
                      <p>Убедитесь, что время на устройстве синхронизировано. Код обновляется каждые 30 секунд.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShow2FA(false);
                      setTempToken("");
                      setTempTokenExpiry(0);
                      setOtpValue("");
                      setAttempts(0);
                      twoFactorForm.reset();
                    }}
                    disabled={loading}
                    className="flex-1"
                  >
                    Назад к входу
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || rateLimitInfo.blocked || otpValue.length !== 6} 
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Проверяем...
                      </>
                    ) : (
                      "Подтвердить"
                    )}
                  </Button>
                </div>

                {/* Attempt counter */}
                {attempts > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-orange-600">
                      Попытка {attempts} из 5
                    </p>
                  </div>
                )}
              </form>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  {...loginForm.register("email")}
                  id="email"
                  type="email"
                  placeholder="example@company.com"
                  disabled={loading}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    {...loginForm.register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
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
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={loginForm.watch("rememberMe")}
                  onCheckedChange={(checked) => 
                    loginForm.setValue("rememberMe", checked as boolean)
                  }
                />
                <Label 
                  htmlFor="rememberMe" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Запомнить меня
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || rateLimitInfo.blocked}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Входим...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>

              <div className="text-center">
                <a 
                  href="/auth/forgot-password" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Забыли пароль?
                </a>
              </div>
            </form>
          )}

          {!show2FA && (
            /* Registration CTAs */
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-4">
                Нет аккаунта?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/register/partner')}
                  disabled={loading}
                >
                  Стать партнером
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/register/advertiser')}
                  disabled={loading}
                >
                  Стать рекламодателем
                </Button>
              </div>
            </div>
          )}

          {/* Security indicators */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center text-xs text-gray-500 space-x-4">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                SSL защищено
              </div>
              <div className="flex items-center">
                <Shield className="h-3 w-3 text-blue-500 mr-1" />
                2FA поддерживается
              </div>
            </div>
            {show2FA && (
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-400">
                  🔒 Вход защищён двухфакторной аутентификацией
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
