import { useState } from "react";
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
import { useNotifications } from "@/components/NotificationToast";
import { useAuth } from "@/contexts/auth-context";

import { SecureAPIError } from "@/lib/secure-api";
import { loginSchema, LoginFormData } from "@/lib/validation";

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
  const { showNotification } = useNotifications();
  const { login } = useAuth();

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Handle login form submission
  async function onLogin(data: LoginFormData) {
    setError("");
    setLoading(true);

    try {
      const result = await login(data.email, data.password);

      // Check if 2FA is required
      if (result.requires2FA) {
        showNotification({
          type: 'info',
          title: '2FA требуется',
          message: 'Требуется двухфакторная аутентификация',
        });
        // Here you would redirect to 2FA page or show 2FA modal
        // For now, just show error
        setError("Двухфакторная аутентификация пока не поддерживается в этом интерфейсе");
        return;
      }

      // Login successful
      if (result.token) {
        showNotification({
          type: 'success',
          title: 'Успешный вход',
          message: 'Добро пожаловать в систему!',
        });

        // Redirect based on user role
        const userRole = result.user?.role;
        const redirectPath = roleToPath(userRole);
        navigate(redirectPath);
      } else {
        setError("Ошибка входа. Попробуйте снова.");
      }

    } catch (err) {
      let errorMessage = "Ошибка соединения. Проверьте интернет-подключение.";
      
      if (err instanceof SecureAPIError) {
        if (err.status === 401) {
          errorMessage = "Неверный email или пароль";
        } else if (err.status === 429) {
          errorMessage = `Слишком много попыток входа. Попробуйте через ${err.retryAfter || 60} секунд.`;
        } else {
          errorMessage = err.message || err.statusText || "Ошибка входа";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Ошибка входа',
        message: errorMessage,
      });
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
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Вход в систему
          </CardTitle>
          <div className="mt-2">
            <p className="text-gray-600">
              Введите свои учётные данные для входа в систему
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {/* Error message */}
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
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
              disabled={loading}
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

          {/* Registration CTAs */}
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

          {/* Security indicators */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center text-xs text-gray-500 space-x-4">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                SSL защищено
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
