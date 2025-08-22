import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Shield, AlertTriangle, Loader2, CheckCircle, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotifications } from "@/components/NotificationToast";

import { secureAuth, SecureAPIError } from "@/lib/secure-api";

// Registration schema
const registerSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  username: z.string().min(3, "Логин должен содержать минимум 3 символа").optional(),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  company: z.string().optional(),
  contactType: z.enum(["telegram", "whatsapp", "skype"]).optional(),
  contact: z.string().optional(),
  role: z.enum(["advertiser", "partner"]),
  agreeTerms: z.boolean().refine(val => val === true, "Необходимо согласиться с условиями"),
  agreePrivacy: z.boolean().refine(val => val === true, "Необходимо согласиться с политикой конфиденциальности"),
  agreeMarketing: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [location, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const { showNotification } = useNotifications();

  // Get role from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const roleFromUrl = urlParams.get('role') as 'partner' | 'advertiser' | null;
  const defaultRole = roleFromUrl || 'advertiser';

  // Registration form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      phone: "",
      company: "",
      contactType: "telegram",
      contact: "",
      role: defaultRole,
      agreeTerms: false,
      agreePrivacy: false,
      agreeMarketing: false,
    },
  });



  // Handle registration form submission
  async function onRegister(data: RegisterFormData) {
    setError("");
    setLoading(true);

    try {
      await secureAuth.register(data, data.email);

      showNotification({
        type: 'success',
        title: 'Регистрация успешна',
        message: 'Аккаунт создан. Перенаправляем на страницу входа...',
      });

      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      let errorMessage = "Ошибка регистрации. Попробуйте позже.";
      
      if (err instanceof SecureAPIError) {
        if (err.status === 409) {
          errorMessage = "Пользователь с таким email уже существует";
        } else if (err.status === 422) {
          errorMessage = "Некорректные данные. Проверьте форму.";
        } else if (err.status === 429) {
          errorMessage = `Слишком много попыток. Попробуйте через ${err.retryAfter || 60} секунд.`;
        } else {
          errorMessage = err.message || err.statusText || "Ошибка регистрации";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Ошибка регистрации',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-blue-600 mr-2" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Регистрация {defaultRole === 'partner' ? 'партнёра' : 'рекламодателя'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {defaultRole === 'partner' 
              ? 'Партнёры продвигают офферы рекламодателей и получают комиссию за результат'
              : 'Рекламодатели создают офферы и работают с партнёрами для продвижения своих продуктов'
            }
          </p>
        </CardHeader>

        <CardContent>
          {/* Error message */}
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Registration Form */}
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <Label htmlFor="name">Полное имя *</Label>
                <Input
                  {...registerForm.register("name")}
                  id="name"
                  placeholder="Иван Иванов"
                  disabled={loading}
                />
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  {...registerForm.register("email")}
                  id="email"
                  type="email"
                  placeholder="example@company.com"
                  disabled={loading}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Username (optional) */}
              <div>
                <Label htmlFor="username">Логин (необязательно)</Label>
                <Input
                  {...registerForm.register("username")}
                  id="username"
                  placeholder="myusername"
                  disabled={loading}
                />
                {registerForm.formState.errors.username && (
                  <p className="text-sm text-red-600 mt-1">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Телефон (необязательно)</Label>
                <Input
                  {...registerForm.register("phone")}
                  id="phone"
                  type="tel"
                  placeholder="+7 (900) 000-00-00"
                  disabled={loading}
                />
              </div>

              {/* Company */}
              <div className="md:col-span-2">
                <Label htmlFor="company">Компания (необязательно)</Label>
                <Input
                  {...registerForm.register("company")}
                  id="company"
                  placeholder="ООО Моя Компания"
                  disabled={loading}
                />
              </div>

              {/* Contact type and contact */}
              <div>
                <Label htmlFor="contactType">Способ связи</Label>
                <Select
                  value={registerForm.watch("contactType")}
                  onValueChange={(value) => registerForm.setValue("contactType", value as any)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите способ связи" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="skype">Skype</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contact">Контакт</Label>
                <Input
                  {...registerForm.register("contact")}
                  id="contact"
                  placeholder="@username или номер"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Пароль *</Label>
                <div className="relative">
                  <Input
                    {...registerForm.register("password")}
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
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
                <div className="relative">
                  <Input
                    {...registerForm.register("confirmPassword")}
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
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
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Agreement checkboxes */}
            <div className="space-y-3 pt-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={registerForm.watch("agreeTerms")}
                  onCheckedChange={(checked) => 
                    registerForm.setValue("agreeTerms", checked as boolean)
                  }
                />
                <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                  Я согласен с{" "}
                  <a href="/terms" target="_blank" className="text-blue-600 underline">
                    условиями использования
                  </a>{" "}
                  *
                </Label>
              </div>
              {registerForm.formState.errors.agreeTerms && (
                <p className="text-sm text-red-600">
                  {registerForm.formState.errors.agreeTerms.message}
                </p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreePrivacy"
                  checked={registerForm.watch("agreePrivacy")}
                  onCheckedChange={(checked) => 
                    registerForm.setValue("agreePrivacy", checked as boolean)
                  }
                />
                <Label htmlFor="agreePrivacy" className="text-sm leading-relaxed">
                  Я согласен с{" "}
                  <a href="/privacy" target="_blank" className="text-blue-600 underline">
                    политикой конфиденциальности
                  </a>{" "}
                  *
                </Label>
              </div>
              {registerForm.formState.errors.agreePrivacy && (
                <p className="text-sm text-red-600">
                  {registerForm.formState.errors.agreePrivacy.message}
                </p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeMarketing"
                  checked={registerForm.watch("agreeMarketing")}
                  onCheckedChange={(checked) => 
                    registerForm.setValue("agreeMarketing", checked as boolean)
                  }
                />
                <Label htmlFor="agreeMarketing" className="text-sm leading-relaxed">
                  Согласие на получение маркетинговых материалов
                </Label>
              </div>
            </div>

            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создаем аккаунт...
                </>
              ) : (
                "Создать аккаунт"
              )}
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Уже есть аккаунт?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal text-blue-600"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Войти в систему
              </Button>
            </p>
          </div>

          {/* Security indicators */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center text-xs text-gray-500 space-x-4">
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                SSL защищено
              </div>
              <div className="flex items-center">
                <Shield className="h-3 w-3 text-green-500 mr-1" />
                Данные защищены
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}