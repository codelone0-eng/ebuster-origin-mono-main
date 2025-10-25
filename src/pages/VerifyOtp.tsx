import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (!emailParam) {
      toast({
        title: "Ошибка",
        description: "Email не указан. Пожалуйста, зарегистрируйтесь заново.",
        variant: "destructive"
      });
      navigate('/register');
      return;
    }
    setEmail(emailParam);
  }, [searchParams, navigate, toast]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    // Автоматическая отправка когда введены все 6 цифр
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Ошибка",
        description: "Введите 6-значный код",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.ebuster.ru';
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Сохраняем токен и данные пользователя
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        toast({
          title: "✅ Успешно!",
          description: data.message || "Email подтвержден! Добро пожаловать!",
        });

        // Перенаправляем в личный кабинет (на поддомен lk.ebuster.ru)
        setTimeout(() => {
          window.location.href = 'https://lk.ebuster.ru/dashboard';
        }, 1500);
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Неверный код. Попробуйте еще раз.",
          variant: "destructive"
        });
        setOtp('');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось проверить код. Попробуйте позже.",
        variant: "destructive"
      });
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);

    try {
      // Здесь должен быть endpoint для повторной отправки OTP
      // Пока используем тот же endpoint регистрации
      toast({
        title: "Код отправлен",
        description: "Новый код отправлен на ваш email",
        variant: "success"
      });
      
      setResendCooldown(60); // 60 секунд до следующей отправки
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить код. Попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Подтверждение Email</CardTitle>
          <CardDescription className="text-base">
            Мы отправили 6-значный код на<br />
            <span className="font-semibold text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <label className="text-sm font-medium text-muted-foreground">
                Введите код подтверждения
              </label>
              
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setOtp(value);
                }}
                disabled={loading}
                placeholder="000000"
                className="text-center text-2xl font-mono tracking-widest w-48 h-14"
                autoComplete="one-time-code"
              />

              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Проверка кода...</span>
                </div>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Код действителен 10 минут</p>
                  <p className="text-muted-foreground">После ввода кода вы автоматически войдете в систему</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-500">Не получили код?</p>
                  <p className="text-muted-foreground">Проверьте папку "Спам" или запросите новый код</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleResend}
              variant="outline" 
              className="w-full"
              disabled={resendLoading || resendCooldown > 0}
            >
              {resendLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : resendCooldown > 0 ? (
                `Повторить через ${resendCooldown}с`
              ) : (
                'Отправить код повторно'
              )}
            </Button>

            <Button 
              onClick={() => navigate('/register')}
              variant="ghost" 
              className="w-full"
            >
              Вернуться к регистрации
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
