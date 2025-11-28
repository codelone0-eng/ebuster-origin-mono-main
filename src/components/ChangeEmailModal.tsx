import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';
import { Mail, CheckCircle, AlertCircle, Shield } from 'lucide-react';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

export const ChangeEmailModal = ({ isOpen, onClose, currentEmail }: ChangeEmailModalProps) => {
  const { t } = useLanguage();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'verification'>('email');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newEmail || !password) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    if (!validateEmail(newEmail)) {
      setError('Введите корректный email адрес');
      return;
    }

    if (newEmail === currentEmail) {
      setError('Новый email должен отличаться от текущего');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Move to verification step
      setStep('verification');
    } catch (err) {
      setError('Произошла ошибка при отправке запроса');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success - close modal and reset form
      onClose();
      setNewEmail('');
      setPassword('');
      setStep('email');
    } catch (err) {
      setError('Произошла ошибка при подтверждении email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError('Произошла ошибка при повторной отправке кода');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mail className="h-5 w-5 text-primary" />
            Смена email адреса
          </DialogTitle>
          <DialogDescription>
            {step === 'email' 
              ? 'Введите новый email адрес и подтвердите паролем'
              : 'Подтвердите новый email адрес кодом из письма'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'email' ? (
          <form onSubmit={handleSubmitEmail} className="space-y-6">
            {/* Current Email Display */}
            <div className="space-y-2">
              <Label>Текущий email</Label>
              <div className="p-3 bg-muted/20 border border-border/30 rounded-lg">
                <p className="text-sm text-foreground">{currentEmail}</p>
              </div>
            </div>

            {/* New Email */}
            <div className="space-y-2">
              <Label htmlFor="newEmail">Новый email адрес</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-card border-border/30 focus:border-primary/50 focus:ring-primary/20"
                placeholder="Введите новый email"
              />
            </div>

            {/* Password Confirmation */}
            <div className="space-y-2">
              <Label htmlFor="password">Подтвердите паролем</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-card border-border/30 focus:border-primary/50 focus:ring-primary/20"
                placeholder="Введите текущий пароль"
              />
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-muted/20 border border-border/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Безопасность</p>
                  <p>На новый email будет отправлено письмо с кодом подтверждения</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90"
                disabled={isLoading || !newEmail || !password}
              >
                {isLoading ? 'Отправка...' : 'Отправить код'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Verification Info */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Проверьте почту</h3>
              <p className="text-sm text-muted-foreground">
                Мы отправили код подтверждения на адрес <strong>{newEmail}</strong>
              </p>
            </div>

            {/* Verification Code Input */}
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Код подтверждения</Label>
              <Input
                id="verificationCode"
                type="text"
                className="bg-card border-border/30 focus:border-primary/50 focus:ring-primary/20 text-center text-lg tracking-widest"
                placeholder="Введите 6-значный код"
                maxLength={6}
              />
            </div>

            {/* Resend Code */}
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-sm"
              >
                Не получили код? Отправить повторно
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('email')}
                className="flex-1"
                disabled={isLoading}
              >
                Назад
              </Button>
              <Button
                onClick={handleVerifyEmail}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90"
                disabled={isLoading}
              >
                {isLoading ? 'Подтверждение...' : 'Подтвердить'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
