import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Key, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface ChangePasswordWithOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordWithOtpModal = ({ isOpen, onClose }: ChangePasswordWithOtpModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'password' | 'otp' | 'newPassword'>('password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      isValid: minLength
    };
  };

  const passwordValidation = validatePassword(newPassword);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Введите текущий пароль');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('ebuster_token');
      const response = await fetch(`${API_CONFIG.USER_URL}/password/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Код отправлен',
          description: 'Проверьте вашу почту',
          variant: 'success'
        });
        setStep('otp');
      } else {
        setError(data.error || 'Ошибка отправки кода');
      }
    } catch (err) {
      setError('Произошла ошибка при отправке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    setStep('newPassword');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Заполните все поля');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (!passwordValidation.isValid) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('ebuster_token');
      const response = await fetch(`${API_CONFIG.USER_URL}/password/confirm-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          otpCode, 
          newPassword 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Пароль изменён',
          description: 'Ваш пароль успешно обновлён',
          variant: 'success'
        });
        handleClose();
      } else {
        setError(data.error || 'Ошибка смены пароля');
      }
    } catch (err) {
      setError('Произошла ошибка при смене пароля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('password');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpCode('');
    setError('');
    onClose();
  };

  const PasswordRequirement = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${isValid ? 'text-green-600' : 'text-muted-foreground'}`}>
      {isValid ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      {text}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Key className="h-5 w-5 text-primary" />
            Смена пароля
          </DialogTitle>
          <DialogDescription>
            {step === 'password' && 'Введите текущий пароль для подтверждения'}
            {step === 'otp' && 'Введите код из письма'}
            {step === 'newPassword' && 'Установите новый пароль'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {step === 'password' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Текущий пароль</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Отправка...' : 'Получить код'}
              </Button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Код подтверждения</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Код отправлен на вашу почту
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button onClick={handleVerifyOtp} disabled={otpCode.length !== 6}>
                Продолжить
              </Button>
            </div>
          </div>
        )}

        {step === 'newPassword' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Новый пароль</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {newPassword && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium">Требования к паролю:</p>
                <PasswordRequirement isValid={passwordValidation.minLength} text="Минимум 8 символов" />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading || !passwordValidation.isValid}>
                {isLoading ? 'Сохранение...' : 'Сохранить пароль'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
