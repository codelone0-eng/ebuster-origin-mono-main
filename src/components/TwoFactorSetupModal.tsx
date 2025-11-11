import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/useLanguage';
import { Shield, Smartphone, QrCode, CheckCircle, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const TwoFactorSetupModal = ({ isOpen, onClose, onComplete }: TwoFactorSetupModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Mock QR code and secret - в реальности получаем с бэкенда
  const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/EBUSTER:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=EBUSTER';
  const secretKey = 'JBSWY3DPEHPK3PXP';

  const steps = [
    { title: 'Установка приложения', description: 'Установите приложение для двухфакторной аутентификации' },
    { title: 'Сканирование QR-кода', description: 'Отсканируйте QR-код в приложении' },
    { title: 'Подтверждение', description: 'Введите код из приложения' },
    { title: 'Резервные коды', description: 'Сохраните резервные коды доступа' }
  ];

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedSecret(true);
    toast({
      title: 'Скопировано',
      description: 'Секретный ключ скопирован в буфер обмена',
      variant: 'success'
    });
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    toast({
      title: 'Скопировано',
      description: 'Резервные коды скопированы в буфер обмена',
      variant: 'success'
    });
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'Ошибка',
        description: 'Введите 6-значный код',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate backup codes
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );
      setBackupCodes(codes);

      toast({
        title: 'Успешно',
        description: 'Код подтверждён',
        variant: 'success'
      });

      nextStep();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Неверный код. Попробуйте еще раз.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
    setCurrentStep(1);
    setVerificationCode('');
    setBackupCodes([]);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Установите приложение-аутентификатор
                </h3>
                <p className="text-sm text-muted-foreground">
                  Для настройки двухфакторной аутентификации вам понадобится приложение-аутентификатор на вашем смартфоне
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-card/60 border border-border/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Рекомендуемые приложения:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Google Authenticator (iOS, Android)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Microsoft Authenticator (iOS, Android)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Authy (iOS, Android, Desktop)
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-600">
                    <p className="font-medium">Важно</p>
                    <p>Убедитесь, что у вас установлено одно из этих приложений перед продолжением</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <QrCode className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Отсканируйте QR-код
                </h3>
                <p className="text-sm text-muted-foreground">
                  Откройте приложение-аутентификатор и отсканируйте этот QR-код
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>

              <div className="w-full space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Не можете отсканировать? Введите код вручную:
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={secretKey}
                    readOnly
                    className="font-mono text-center bg-card/60 border-border/30"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopySecret}
                  >
                    {copiedSecret ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Подтвердите настройку
                </h3>
                <p className="text-sm text-muted-foreground">
                  Введите 6-значный код из вашего приложения-аутентификатора
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Код подтверждения</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest font-mono bg-card/60 border-border/30"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="p-3 bg-muted/20 border border-border/30 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  💡 Код обновляется каждые 30 секунд. Если код не подходит, подождите новый код.
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Сохраните резервные коды
                </h3>
                <p className="text-sm text-muted-foreground">
                  Эти коды помогут вам восстановить доступ, если вы потеряете устройство
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-card/60 border border-border/30 rounded-lg">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="p-2 bg-muted/20 rounded text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyBackupCodes}
              >
                {copiedBackup ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Скопировано
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Скопировать все коды
                  </>
                )}
              </Button>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-600">
                    <p className="font-medium">Важно!</p>
                    <p>Сохраните эти коды в безопасном месте. Каждый код можно использовать только один раз.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border border-border/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            Настройка двухфакторной аутентификации
          </DialogTitle>
          <DialogDescription>
            {steps[currentStep - 1].description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">
                Шаг {currentStep} из {totalSteps}
              </span>
              <span className="text-muted-foreground">
                {steps[currentStep - 1].title}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onClose : prevStep}
              disabled={isLoading}
              className="flex-1"
            >
              {currentStep === 1 ? (
                'Отмена'
              ) : (
                <>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Назад
                </>
              )}
            </Button>
            <Button
              onClick={currentStep === 3 ? handleVerifyCode : currentStep === 4 ? handleComplete : nextStep}
              disabled={isLoading || (currentStep === 3 && verificationCode.length !== 6)}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90"
            >
              {isLoading ? (
                'Проверка...'
              ) : currentStep === 4 ? (
                'Завершить'
              ) : currentStep === 3 ? (
                'Подтвердить'
              ) : (
                <>
                  Далее
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
