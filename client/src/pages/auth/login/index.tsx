import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Shield, AlertTriangle, Loader2, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        setShow2FA(true);
        toast({
          title: "2FA требуется",
          description: "Введите код из приложения аутентификации",
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
          description: "Перенаправляем в панель управления...",
        });

        // Get user info and navigate
        const user = await secureAuth.me();
        navigate(roleToPath(user?.role));
      }

    } catch (err) {
      if (err instanceof SecureAPIError) {
        if (err.status === 401) {
          setError("Неверный 2FA код или истёк срок действия");
        } else {
          setError(err.statusText || "Ошибка подтверждения");
        }
      } else {
        setError("Ошибка соединения");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-2" />
            <CardTitle className="text-2xl font-bold text-gray-900">
              {show2FA ? "Подтверждение 2FA" : "Вход в систему"}
            </CardTitle>
          </div>
          <p className="text-gray-600">
            {show2FA 
              ? "Введите 6-значный код из приложения аутентификации" 
              : "Введите свои учётные данные для входа"
            }
          </p>
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
            /* 2FA Form */
            <form onSubmit={twoFactorForm.handleSubmit(on2FA)} className="space-y-4">
              <div>
                <Label htmlFor="code">2FA код</Label>
                <Input
                  {...twoFactorForm.register("code")}
                  id="code"
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  disabled={loading}
                />
                {twoFactorForm.formState.errors.code && (
                  <p className="text-sm text-red-600 mt-1">
                    {twoFactorForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShow2FA(false);
                    setTempToken("");
                    twoFactorForm.reset();
                  }}
                  disabled={loading}
                  className="flex-1"
                >
                  Назад
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || rateLimitInfo.blocked} 
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
            </form>
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
                SSL защита
              </div>
              <div className="flex items-center">
                <Shield className="h-3 w-3 text-blue-500 mr-1" />
                2FA поддержка
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
