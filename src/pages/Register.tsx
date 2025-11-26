import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Loader2, Mail, Lock, User, Check, X, Hash, Type, CaseSensitive, Shield, RefreshCw, Eye, EyeOff, Gift } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import Silk from '@/components/Silk';
import { BeamsUpstream } from '@/components/ui/beams-upstream';

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
    
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
    
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setGeneratedPassword(password);
    setFormData(prev => ({
      ...prev,
      password: password,
      confirmPassword: password
    }));
    
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
        localStorage.setItem('lastEmail', formData.email);
        
        if (referralCode && referralCode.length > 0) {
          localStorage.setItem('pending_referral_code', referralCode);
        }
        
        localStorage.removeItem('referral_code');
      }
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
    <div className="min-h-screen bg-black overflow-x-hidden text-white">
      {/* Silk background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk speed={5} scale={1} color="#ffffff" noiseIntensity={4.3} rotation={0} />
      </div>
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-[1] pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="glass-effect glass-hover rounded-xl border border-white/10 bg-white/[0.02] p-12 backdrop-blur-sm">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold text-white" style={{ 
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}>
                Регистрация
              </h1>
              <p className="text-white/60 text-lg">
                Создайте аккаунт для доступа к EBUSTER
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {referralCode && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-sm font-medium text-white flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Реферальный код: {referralCode}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white/80 text-sm font-medium">Полное имя *</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Иван Иванов"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="pl-12 h-14 bg-white/[0.02] border-white/10 text-white placeholder:text-white/40 focus:border-white/30"
                    style={{
                      WebkitTextFillColor: 'white',
                      WebkitBoxShadow: '0 0 0px 1000px rgba(255, 255, 255, 0.02) inset'
                    }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80 text-sm font-medium">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-12 h-14 bg-white/[0.02] border-white/10 text-white placeholder:text-white/40 focus:border-white/30"
                    style={{
                      WebkitTextFillColor: 'white',
                      WebkitBoxShadow: '0 0 0px 1000px rgba(255, 255, 255, 0.02) inset'
                    }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/80 text-sm font-medium">Пароль *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      generatePassword();
                    }}
                    className="h-8 px-3 text-xs bg-transparent border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
                    disabled={loading}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Генерировать
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-12 pr-12 h-14 bg-white/[0.02] border-white/10 text-white placeholder:text-white/40 focus:border-white/30"
                    style={{
                      WebkitTextFillColor: 'white',
                      WebkitBoxShadow: '0 0 0px 1000px rgba(255, 255, 255, 0.02) inset'
                    }}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-white/5 text-white/60 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {formData.password && (
                  <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
                    <p className="text-sm font-semibold text-white">Требования к паролю:</p>
                    <div className="space-y-2">
                      {passwordRequirements.map((req, index) => {
                        const Icon = req.icon;
                        const met = req.test(formData.password);
                        return (
                          <div 
                            key={index}
                            className={`flex items-center gap-2 text-sm ${
                              met ? 'text-white' : 'text-white/40'
                            }`}
                          >
                            {met ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
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
                <Label htmlFor="confirmPassword" className="text-white/80 text-sm font-medium">Подтвердите пароль *</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-12 pr-12 h-14 bg-white/[0.02] border-white/10 text-white placeholder:text-white/40 focus:border-white/30"
                    style={{
                      WebkitTextFillColor: 'white',
                      WebkitBoxShadow: '0 0 0px 1000px rgba(255, 255, 255, 0.02) inset'
                    }}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-white/5 text-white/60 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {formData.confirmPassword && (
                  <div className={`flex items-center gap-2 text-sm mt-2 ${
                    passwordsMatch ? 'text-white' : 'text-white/60'
                  }`}>
                    {passwordsMatch ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span className="font-medium">Пароли совпадают</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4" />
                        <span className="font-medium">Пароли не совпадают</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {!referralCode && (
                <div className="space-y-2">
                  <Label htmlFor="referralCodeInput" className="text-white/80 text-sm font-medium flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Реферальный код (опционально)
                  </Label>
                  <Input
                    id="referralCodeInput"
                    name="referralCodeInput"
                    type="text"
                    placeholder="Введите код, если есть"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="h-14 bg-black border-white/10 text-white placeholder:text-white/40 focus:border-white/30 uppercase"
                    disabled={loading}
                  />
                  {referralCode && (
                    <p className="text-xs text-white flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Вы получите скидку при использовании этого кода!
                    </p>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 bg-white text-black hover:bg-white/90 transition-colors text-base font-medium" 
                disabled={loading || !allRequirementsMet || !passwordsMatch}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Регистрация...
                  </>
                ) : (
                  'Зарегистрироваться'
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-white/60">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="text-white hover:text-white/80 transition-colors font-medium">
                  Войти
                </Link>
              </p>
            </div>
          </div>
        </div>
        </div>

          {/* Right: User Card */}
          <div className="hidden lg:block">
            <div className="glass-effect glass-hover rounded-xl border border-white/10 bg-white/[0.02] p-8 max-w-md mx-auto backdrop-blur-sm">
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-emerald-300/20 bg-emerald-300/5 flex flex-col items-center justify-center mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/10 to-transparent"></div>
                    <User className="h-8 w-8 text-emerald-300/70 mb-1 relative z-10" />
                    <span className="text-xs text-emerald-300/60 relative z-10">Avatar</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1">New User</h3>
                  <p className="text-white/60 text-sm font-mono">{formData.email || 'your@email.com'}</p>
                </div>
                
                <div className="h-1 bg-gradient-to-r from-emerald-400/50 via-emerald-400 to-emerald-600/50 rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
                </div>
                
                <div className="font-mono text-xs text-white/60 break-all text-center p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-emerald-300/70 mb-1 text-[10px] uppercase tracking-wider">User ID</div>
                  {formData.email ? 
                    Array.from(formData.email).reduce((acc, char) => acc + char.charCodeAt(0).toString(16), '').substring(0, 36).match(/.{1,8}/g)?.join('-') || '00000000-0000-0000-0000-000000000000' :
                    '00000000-0000-0000-0000-000000000000'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
