import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Check } from "lucide-react";

interface TwoFactorAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (code: string) => Promise<boolean>;
  action: string;
  description?: string;
}

export default function TwoFactorAuth({ 
  isOpen, 
  onClose, 
  onConfirm, 
  action, 
  description 
}: TwoFactorAuthProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [codeSent, setCodeSent] = useState(false);

  const sendVerificationCode = async () => {
    try {
      setIsVerifying(true);
      
      // Send verification code via email/SMS
      const response = await fetch('/api/auth/send-2fa-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          action,
          method: 'email' // or 'sms'
        })
      });

      if (response.ok) {
        setCodeSent(true);
        setStep('verify');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Не удалось отправить код');
      }
    } catch (error) {
      setError('Ошибка сети');
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');

      // First verify the 2FA code
      const verifyResponse = await fetch('/api/auth/verify-2fa-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          code,
          action
        })
      });

      if (verifyResponse.ok) {
        // If 2FA verification successful, proceed with the actual action
        const success = await onConfirm(code);
        if (success) {
          onClose();
          setCode('');
          setStep('send');
          setCodeSent(false);
        } else {
          setError('Операция не выполнена');
        }
      } else {
        const errorData = await verifyResponse.json();
        setError(errorData.error || 'Неверный код');
      }
    } catch (error) {
      setError('Ошибка верификации');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError('');
    setStep('send');
    setCodeSent(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Двухфакторная аутентификация
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Критическая операция:</strong> {action}
              {description && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {description}
                </div>
              )}
            </AlertDescription>
          </Alert>

          {step === 'send' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Для выполнения этой операции требуется подтверждение. 
                Мы отправим код безопасности на вашу почту.
              </p>
              
              <Button 
                onClick={sendVerificationCode} 
                disabled={isVerifying}
                className="w-full"
              >
                {isVerifying ? 'Отправка...' : 'Отправить код подтверждения'}
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              {codeSent && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    Код подтверждения отправлен на вашу электронную почту
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="verification-code">Код подтверждения</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="Введите 6-значный код"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                  }}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('send')}
                  className="flex-1"
                >
                  Отправить повторно
                </Button>
                <Button 
                  onClick={verifyCode} 
                  disabled={isVerifying || code.length !== 6}
                  className="flex-1"
                >
                  {isVerifying ? 'Проверка...' : 'Подтвердить'}
                </Button>
              </div>
            </div>
          )}

          <Button variant="ghost" onClick={handleClose} className="w-full">
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}