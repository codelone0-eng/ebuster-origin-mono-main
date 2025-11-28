import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Loader2, Check, X, Hash, Type, CaseSensitive, Shield, RefreshCw, Eye, EyeOff, Gift, Plus } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { SilkBackground } from '@/components/SilkBackground';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const isRu = language === 'ru';
  const translate = (ruText: string, enText: string) => (isRu ? ruText : enText);
  
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
    if (savedRefCode && !referralCode) {
      setReferralCode(savedRefCode);
    }
  }, []);

  const passwordRequirements = [
    { 
      label: t('header.modals.register.passwordRequirements.minLength'), 
      test: (pwd: string) => pwd.length >= 8,
      icon: Hash
    },
    { 
      label: t('header.modals.register.passwordRequirements.uppercase'), 
      test: (pwd: string) => /[A-Z]/.test(pwd),
      icon: Type
    },
    { 
      label: t('header.modals.register.passwordRequirements.lowercase'), 
      test: (pwd: string) => /[a-z]/.test(pwd),
      icon: CaseSensitive
    },
    { 
      label: t('header.modals.register.passwordRequirements.number'), 
      test: (pwd: string) => /\d/.test(pwd),
      icon: Shield
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
      title: translate("Пароль сгенерирован!", "Password generated!"),
      description: translate("Пароль скопирован в буфер обмена", "The password has been copied to the clipboard"),
    });
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
        title: translate("Ошибка", "Error"),
        description: translate("Заполните все обязательные поля", "Please fill in all required fields"),
        variant: "destructive"
      });
      return;
    }

    if (!allRequirementsMet) {
      toast({
        title: translate("Ошибка", "Error"),
        description: translate("Пароль не соответствует требованиям", "Password does not meet the requirements"),
        variant: "destructive"
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: translate("Ошибка", "Error"),
        description: translate("Пароли не совпадают", "Passwords do not match"),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(formData.email, formData.password, formData.fullName);
      
      if (result.error) {
        toast({
          title: translate("Ошибка регистрации", "Registration error"),
          description: result.error?.message || translate("Не удалось зарегистрироваться", "Failed to register"),
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
        title: translate("Ошибка", "Error"),
        description: translate("Не удалось зарегистрироваться. Попробуйте позже.", "Registration failed. Please try again later."),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateUserId = () => {
    if (!formData.email) return '00000000-0000-0000-0000-000000000000';
    const hash = Array.from(formData.email)
      .reduce((acc, char) => acc + char.charCodeAt(0).toString(16), '')
      .substring(0, 36);
    return hash.match(/.{1,8}/g)?.join('-') || '00000000-0000-0000-0000-000000000000';
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <SilkBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top navigation */}
        <header className="px-6 lg:px-10 py-6 flex items-center justify-between border-b border-white/5">
          <Link to="/" className="inline-flex items-center text-white font-semibold tracking-[0.3em] text-xs uppercase">
            EBUSTER
          </Link>
          <Link
            to="/"
            className="text-sm text-white/70 hover:text-white inline-flex items-center gap-2 transition-colors"
          >
            {translate("Вернуться на лендинг", "Back to landing")}
          </Link>
        </header>

        <main className="flex-1 px-4 lg:px-10 py-12">
          <div className="w-full max-w-[1920px] mx-auto grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: Form */}
          <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-flex px-4 py-1 text-xs uppercase tracking-[0.4em] text-emerald-300/70 border border-emerald-300/30 rounded-full bg-emerald-300/10">
                  {translate("Регистрация", "Registration")}
                </span>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold leading-tight">{t('header.modals.register.title')}</h1>
                  <p className="text-white/70 mt-3">
                    {t('header.modals.register.haveAccount')}{' '}
                    <Link to="/login" className="text-white hover:text-white/80 transition-colors font-medium">
                      {t('header.modals.register.signIn')}
                    </Link>
              </p>
                </div>
            </div>
            
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {referralCode && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-sm font-medium text-white flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    {translate("Реферальный код", "Referral code")}: {referralCode}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white text-sm font-medium">
                        {t('header.modals.register.fullName')}
                      </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                        placeholder={t('header.modals.register.namePlaceholder')}
                    value={formData.fullName}
                    onChange={handleInputChange}
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-0 rounded-xl"
                    required
                    disabled={loading}
                  />
              </div>

                    <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                        <Label htmlFor="email" className="text-white text-sm font-medium">
                          {t('header.modals.register.email')}
                        </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                          placeholder={t('header.modals.register.emailPlaceholder')}
                    value={formData.email}
                    onChange={handleInputChange}
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-0 rounded-xl"
                    required
                    disabled={loading}
                  />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-white text-sm font-medium">
                            {t('header.modals.register.password')}
                          </Label>
                  <Button
                    type="button"
                            variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      generatePassword();
                    }}
                            className="h-7 px-3 text-[11px] bg-transparent border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                    disabled={loading}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                            {t('header.modals.register.generate')}
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                            placeholder={t('header.modals.register.passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleInputChange}
                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-0 rounded-xl pr-12"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-9 w-9 p-0 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
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
                      </div>
                </div>

                {formData.password && (
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                        <p className="text-xs font-semibold text-white uppercase tracking-[0.2em]">
                          {translate("Требования к паролю", "Password requirements")}
                        </p>
                        <div className="space-y-1.5">
                      {passwordRequirements.map((req, index) => {
                        const Icon = req.icon;
                        const met = req.test(formData.password);
                        return (
                          <div 
                            key={index}
                                className={`flex items-center gap-2 text-xs ${
                              met ? 'text-white' : 'text-white/40'
                            }`}
                          >
                            {met ? (
                                  <Check className="h-3 w-3" />
                            ) : (
                                  <X className="h-3 w-3" />
                            )}
                            <Icon className="h-3 w-3" />
                                <span>{req.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">
                        {t('header.modals.register.confirmPassword')}
                      </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                          placeholder={t('header.modals.register.confirmPasswordPlaceholder')}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-0 rounded-xl pr-12"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-9 w-9 p-0 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
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

                {formData.confirmPassword && (
                        <div className={`flex items-center gap-2 text-xs mt-2 ${
                    passwordsMatch ? 'text-white' : 'text-white/60'
                  }`}>
                    {passwordsMatch ? (
                      <>
                              <Check className="h-3 w-3" />
                              <span className="font-medium">{t('header.modals.register.passwordMatch.success')}</span>
                      </>
                    ) : (
                      <>
                              <X className="h-3 w-3" />
                              <span>{t('header.modals.register.passwordMatch.error')}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                      className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium rounded-xl transition-colors" 
                disabled={loading || !allRequirementsMet || !passwordsMatch}
              >
                {loading ? (
                  <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('header.modals.register.creating')}
                  </>
                ) : (
                        t('header.modals.register.createAccount')
                )}
              </Button>
            </form>

                  <p className="text-xs text-white/60">
                    {translate("Регистрируясь, вы соглашаетесь с нашими", "By signing up, you agree to our")}{' '}
                    <Link to="/terms" className="text-white/80 hover:text-white transition-colors">
                      {translate("Условиями обслуживания", "Terms of Service")}
                </Link>
              </p>

                  <div className="flex flex-col gap-4 text-xs text-white/60 pt-4 border-t border-white/10">
                    <p>{isRu ? "© 2025 EBUSTER. Все права защищены." : "© 2025 EBUSTER. All rights reserved."}</p>
                    <div className="flex items-center gap-6">
                      <Link to="/docs" className="hover:text-white transition-colors">
                        {isRu ? "Документация" : "Docs"}
                      </Link>
                      <Link to="/legal" className="hover:text-white transition-colors">
                        {isRu ? "Правовая информация" : "Legal"}
                      </Link>
                      <Link to="/support" className="hover:text-white transition-colors">
                        {isRu ? "Поддержка" : "Support"}
                      </Link>
                    </div>
                  </div>
        </div>

        {/* Right: User Card */}
            <div className="hidden lg:flex items-center justify-center px-8 py-16">
              <div className="w-full max-w-[460px]">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
              <div className="flex flex-col items-center">
                      <div className="w-24 h-28 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center">
                        <Plus className="h-6 w-6 text-white/60 mb-1" />
                        <span className="text-[11px] text-white/60 font-medium uppercase tracking-wide">
                          {translate("Аватар", "Avatar")}
                        </span>
                        <span className="text-[10px] text-white/40">
                          {translate("Макс 2 МБ", "Max 2MB")}
                        </span>
                      </div>
                </div>

                    <div className="text-center space-y-2">
                      <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                        {translate("Новый пользователь", "New User")}
                      </p>
                      <p className="text-xl text-white font-mono tracking-[0.8em]">•••••</p>
              </div>
              
                    <div className="h-3 bg-white/10 rounded-full relative overflow-hidden">
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                        style={{ animation: 'shimmer 2s linear infinite' }}
                      />
                    </div>

                    <div className="font-mono text-xs text-white/60 text-center tracking-widest">
                      {generateUserId()}
                    </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
