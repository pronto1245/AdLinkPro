import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export default function RegisterAdvertiser() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    contactType: '',
    contactDetails: '',
    agreeTerms: false,
    agreePrivacy: false
  });
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Ошибка",
        description: t('auth.passwordsDoNotMatch'),
        variant: "destructive",
      });
      return;
    }

    if (!formData.contactType) {
      toast({
        title: "Ошибка",
        description: t('auth.selectContactTypeError'),
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      toast({
        title: "Ошибка",
        description: t('auth.agreeToTermsError'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implement advertiser registration API call
      console.log('Advertiser registration data:', formData);
      
      toast({
        title: t('auth.registrationSuccess'),
        description: t('auth.registrationSuccessDesc'),
        variant: "default",
      });
      
      // Redirect to login after successful registration
      setTimeout(() => {
        setLocation('/login');
      }, 2000);
    } catch (error: any) {
      toast({
        title: t('auth.registrationError'),
        description: error.message || t('auth.registrationErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-network text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AdLinkPro</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Рекламная платформа</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">🏢 {t('auth.advertiserRegistration')}</CardTitle>
            <div className="flex justify-center">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ru')}
                className="text-sm border border-slate-200 dark:border-slate-700 rounded px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="en">🇺🇸 English</option>
                <option value="ru">🇷🇺 Русский</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Имя *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder={t('auth.enterName')}
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="company">{t('auth.company')} *</Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  required
                  placeholder={t('auth.enterCompany')}
                />
              </div>

              <div>
                <Label htmlFor="password">{t('auth.password')} *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  placeholder={t('auth.minCharacters')}
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')} *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  placeholder={t('auth.repeatPassword')}
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="contactType">{t('auth.contactType')} *</Label>
                <Select value={formData.contactType} onValueChange={(value) => handleInputChange('contactType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('auth.selectContactType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telegram">{t('auth.telegram')}</SelectItem>
                    <SelectItem value="skype">{t('auth.skype')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contactDetails">{t('auth.contactDetails')} *</Label>
                <Input
                  id="contactDetails"
                  type="text"
                  value={formData.contactDetails}
                  onChange={(e) => handleInputChange('contactDetails', e.target.value)}
                  required
                  placeholder={formData.contactType === 'telegram' ? '@username' : 'skype_username'}
                />
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeTerms', !!checked)}
                  />
                  <Label 
                    htmlFor="agreeTerms" 
                    className="text-sm leading-5 cursor-pointer"
                  >
                    Я согласен с{' '}
                    <button
                      type="button"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => {/* TODO: Open terms modal */}}
                    >
                      {t('auth.termsOfService')}
                    </button>
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreePrivacy"
                    checked={formData.agreePrivacy}
                    onCheckedChange={(checked) => handleInputChange('agreePrivacy', !!checked)}
                  />
                  <Label 
                    htmlFor="agreePrivacy" 
                    className="text-sm leading-5 cursor-pointer"
                  >
                    Я согласен с{' '}
                    <button
                      type="button"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => {/* TODO: Open privacy policy modal */}}
                    >
                      {t('auth.privacyPolicy')}
                    </button>
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? t('auth.creatingAccount') : t('auth.registerAsAdvertiser')}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('auth.alreadyHaveAccount')}{' '}
                <button
                  onClick={() => setLocation('/login')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Войти
                </button>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {t('auth.wantToBePartner')}{' '}
                <button
                  onClick={() => setLocation('/register/partner')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('auth.registerAsPartner')}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}