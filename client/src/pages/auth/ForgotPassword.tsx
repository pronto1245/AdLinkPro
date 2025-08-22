import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

import { secureAuth, SecureAPIError } from "@/lib/secure-api";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validation";
import { rateLimitTracker } from "@/lib/security";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { toast } = useToast();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    setLoading(true);
    setError("");

    // Check rate limiting
    const isRateLimited = rateLimitTracker.isRateLimited(data.email);
    if (isRateLimited) {
      const remainingTime = rateLimitTracker.getRemainingTime(data.email);
      setError(`Слишком много попыток. Попробуйте через ${Math.ceil(remainingTime / 1000)} секунд.`);
      setLoading(false);
      return;
    }

    try {
      await secureAuth.resetPassword(data, data.email);
      
      setSubmittedEmail(data.email);
      setSuccess(true);
      
      toast({
        title: "Письмо отправлено",
        description: "Проверьте почту для дальнейших инструкций",
      });

    } catch (err: any) {
      if (err instanceof SecureAPIError) {
        if (err.code === 'RATE_LIMITED') {
          setError(`Слишком много попыток. Попробуйте через ${Math.ceil(err.retryAfter! / 1000)} секунд.`);
        } else {
          setError(err.message || "Произошла ошибка при отправке письма");
        }
      } else {
        setError("Произошла ошибка. Проверьте подключение к интернету.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 px-4">
        <Card className="w-full max-w-md shadow-2xl border-2 border-white/50 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 dark:border-slate-700/50">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Письмо отправлено</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-muted-foreground">
              <p>
                Мы отправили инструкции по восстановлению пароля на адрес:
              </p>
              <p className="font-medium text-foreground mt-2">{submittedEmail}</p>
              <p className="mt-2">
                Проверьте почту и следуйте указанным в письме инструкциям.
              </p>
            </div>
            
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Не получили письмо?</p>
              <p>• Проверьте папку "Спам"</p>
              <p>• Убедитесь, что email введен правильно</p>
              <p>• Подождите несколько минут</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setSuccess(false);
                  setSubmittedEmail("");
                  form.reset();
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Отправить еще раз
              </Button>
              <Button 
                className="w-full"
                onClick={() => window.location.href = '/login'}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться ко входу
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 px-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-white/50 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 dark:border-slate-700/50">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Восстановление пароля</CardTitle>
          <p className="text-muted-foreground">
            Укажите email, на который зарегистрирован аккаунт
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email адрес</Label>
              <Input
                {...form.register("email")}
                id="email"
                type="email"
                placeholder="Введите ваш email"
                disabled={loading}
                className="w-full"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправляем инструкции...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Отправить инструкции
                  </>
                )}
              </Button>

              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => window.location.href = '/login'}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться ко входу
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>Мы отправим письмо с инструкциями на указанный адрес,</p>
              <p>если такой аккаунт существует в системе.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
