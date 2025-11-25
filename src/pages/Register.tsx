import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Loader2, Mail, Lock, User, ArrowLeft, Check, X, Hash, Type, CaseSensitive, Shield, RefreshCw, Eye, EyeOff, Gift } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Проверяем реферальный код из localStorage или URL
  useEffect(() => {
    const savedRefCode = localStorage.getItem('referral_code');
    const urlRefCode = searchParams.get('ref');
    
    if (urlRefCode) {
      setReferralCode(urlRefCode);
      localStorage.setItem('referral_code', urlRefCode);
    } else if (savedRefCode) {
      setReferralCode(savedRefCode);
    }
  }, [searchParams]);

  // Password validation
  const passwordRequirements = [
    { 
      text: 'Минимум 8 символов', 
      icon: Hash,
      test: (pwd: string) => pwd.length >= 8 
    },
    { 
      text: 'Заглавная буква', 
      icon: Type,
      test: (pwd: string) => /[A-Z]/.test(pwd) 
    },
    { 
      text: 'Строчная буква', 
      icon: CaseSensitive,
      test: (pwd: string) => /[a-z]/.test(pwd) 
    },
    { 
      text: 'Цифра', 
      icon: Hash,
      test: (pwd: string) => /\d/.test(pwd) 
    },
    { 
      text: 'Спецсимвол (!@#$%^&*)', 
      icon: Shield,
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) 
    },
  ];

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;
  const allRequirementsMet = passwordRequirements.every(req => req.test(formData.password));

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Гарантируем наличие хотя бы одного символа каждого типа
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
    
    // Заполняем остальные символы
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Перемешиваем символы
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setGeneratedPassword(password);
    setFormData(prev => ({
      ...prev,
      password: password,
      confirmPassword: password
    }));
    
    // Копируем в буфер обмена
    try {
      navigator.clipboard?.writeText(password).catch(() => {});
    } catch {}
    
    toast({
      title: "Пароль сгенерирован!",
      description: "Пароль скопирован в буфер обмена",
    });
    
    return password;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.fullName) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    if (!allRequirementsMet) {
      toast({
        title: "Ошибка",
        description: "Пароль не соответствует требованиям",
        variant: "destructive"
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(formData.email, formData.password, formData.fullName);
      
      if (result.error) {
        toast({
          title: "Ошибка регистрации",
          description: result.error.message || "Не удалось зарегистрироваться",
          variant: "destructive"
        });
      } else {
        // Сохраняем email для будущих входов
        localStorage.setItem('lastEmail', formData.email);
        
        // Сохраняем реферальный код для применения после подтверждения email
        if (referralCode && referralCode.length > 0) {
          localStorage.setItem('pending_referral_code', referralCode);
        }
        
        // Очищаем временный код
        localStorage.removeItem('referral_code');
      }
      // Успешная регистрация обрабатывается в CustomAuthContext
      // и перенаправляет на /verify-otp
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось зарегистрироваться. Попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-[#808080] hover:text-white hover:bg-[#1a1a1a]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          На главную
        </Button>

        <Card className="bg-[#1a1a1a] border-[#2d2d2d]">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl font-bold text-center text-white">
              Регистрация
            </CardTitle>
            <CardDescription className="text-center text-[#808080]">
              Создайте аккаунт для доступа к EBUSTER
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {/* Реферальный код (если есть) */}
              {referralCode && (
                <div className="bg-[#2d2d2d] border border-[#404040] rounded-lg p-3">
                  <p className="text-sm font-medium text-[#d9d9d9] flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Реферальный код: {referralCode}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-white">Полное имя *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#808080]" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Иван Иванов"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="pl-10 bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#808080] focus:border-[#404040]"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#808080]" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#808080] focus:border-[#404040]"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-white">Пароль *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      generatePassword();
                    }}
                    className="h-8 px-3 text-xs bg-[#111111] border-[#2d2d2d] text-[#808080] hover:bg-[#2d2d2d] hover:text-white"
                    disabled={loading}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Генерировать
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#808080]" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#808080] focus:border-[#404040]"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent text-[#808080] hover:text-[#d9d9d9]"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Password requirements */}
                {formData.password && (
                  <div className="mt-3 p-4 bg-[#111111] border border-[#2d2d2d] rounded-lg space-y-2">
                    <p className="text-sm font-semibold text-white mb-3">Требования к паролю:</p>
                    <div className="space-y-2">
                      {passwordRequirements.map((req, index) => {
                        const Icon = req.icon;
                        const met = req.test(formData.password);
                        return (
                          <div 
                            key={index}
                            className={`flex items-center gap-2 text-sm ${
                              met ? 'text-[#d9d9d9]' : 'text-[#808080]'
                            }`}
                          >
                            {met ? (
                              <Check className="h-4 w-4 text-[#d9d9d9]" />
                            ) : (
                              <X className="h-4 w-4 text-[#808080]" />
                            )}
                            <Icon className="h-3 w-3" />
                            <span>{req.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">Подтвердите пароль *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#808080]" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#808080] focus:border-[#404040]"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent text-[#808080] hover:text-[#d9d9d9]"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Password match indicator */}
                {formData.confirmPassword && (
                  <div className={`flex items-center gap-2 text-sm mt-2 ${
                    passwordsMatch ? 'text-[#d9d9d9]' : 'text-[#808080]'
                  }`}>
                    {passwordsMatch ? (
                      <>
                        <Check className="h-4 w-4 text-[#d9d9d9]" />
                        <span className="font-medium">Пароли совпадают</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-[#808080]" />
                        <span className="font-medium">Пароли не совпадают</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Реферальный код */}
              {!referralCode && (
                <div className="space-y-2">
                  <Label htmlFor="referralCodeInput" className="text-sm font-medium text-white flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Реферальный код (опционально)
                  </Label>
                  <div className="relative">
                    <Input
                      id="referralCodeInput"
                      name="referralCodeInput"
                      type="text"
                      placeholder="Введите код, если есть"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      className="pl-4 uppercase bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#808080] focus:border-[#404040]"
                      disabled={loading}
                    />
                  </div>
                  {referralCode && (
                    <p className="text-xs text-[#d9d9d9] flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Вы получите скидку при использовании этого кода!
                    </p>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#404040] text-white hover:bg-[#4d4d4d] transition-colors" 
                disabled={loading || !allRequirementsMet || !passwordsMatch}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Регистрация...
                  </>
                ) : (
                  'Зарегистрироваться'
                )}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-sm text-center text-[#808080]">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-[#d9d9d9] hover:text-white hover:underline font-medium transition-colors">
                Войти
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
