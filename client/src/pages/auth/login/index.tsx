import { useState } from 'react';
import { useLocation } from 'wouter';
import { Eye, EyeOff, Shield, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useLoginForm } from '@/hooks/useLoginForm';

export default function Login() {
  const [, navigate] = useLocation();

  // Extract redirectTo parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTo = urlParams.get('next') || undefined;

  const {
    form,
    loading,
    showPassword,
    error,
    handleSubmit,
    togglePasswordVisibility,
  } = useLoginForm({ redirectTo });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 px-4 py-8">
      <Card className="w-full max-w-md shadow-2xl border-2 border-white/50 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 dark:border-slate-700/50">
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
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                {...form.register('email')}
                id="email"
                type="email"
                placeholder="example@company.com"
                disabled={loading}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  {...form.register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={form.watch('rememberMe')}
                onCheckedChange={(checked) =>
                  form.setValue('rememberMe', checked as boolean)
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Входим...
                </>
              ) : (
                'Войти'
              )}
            </Button>

            <div className="text-center">
              <a
                href="/forgot-password"
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
                className="flex-1 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 font-medium dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
                onClick={() => navigate('/register?role=partner')}
                disabled={loading}
              >
                Стать партнёром
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 font-medium dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900/20"
                onClick={() => navigate('/register?role=advertiser')}
                disabled={loading}
              >
                Стать рекламодателем
              </Button>
            </div>
          </div>

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
