import { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, Check, X as XIcon, Hash, Type, CaseSensitive, Shield, RefreshCw, Copy, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/CustomAuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Проверяем реферальный код из localStorage или URL
  useEffect(() => {
    const savedRefCode = localStorage.getItem('referral_code');
    const urlParams = new URLSearchParams(window.location.search);
    const urlRefCode = urlParams.get('ref');
    
    if (urlRefCode) {
      setReferralCode(urlRefCode);
      localStorage.setItem('referral_code', urlRefCode);
    } else if (savedRefCode) {
      setReferralCode(savedRefCode);
    }
  }, [isOpen]);

  // Password validation with professional icons
  const passwordRequirements = [
    { 
      text: t('register.passwordRequirements.requirements.0'), 
      icon: Hash,
      test: (pwd: string) => pwd.length >= 8 
    },
    { 
      text: t('register.passwordRequirements.requirements.1'), 
      icon: Type,
      test: (pwd: string) => /[A-Z]/.test(pwd) 
    },
    { 
      text: t('register.passwordRequirements.requirements.2'), 
      icon: CaseSensitive,
      test: (pwd: string) => /[a-z]/.test(pwd) 
    },
    { 
      text: t('register.passwordRequirements.requirements.3'), 
      icon: Hash,
      test: (pwd: string) => /\d/.test(pwd) 
    },
    { 
      text: t('register.passwordRequirements.requirements.4'), 
      icon: Shield,
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) 
    },
  ];

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Гарантируем наличие хотя бы одного символа каждого типа
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // строчная буква
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // заглавная буква
    password += "0123456789"[Math.floor(Math.random() * 10)]; // цифра
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // специальный символ
    
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
    // Сохраняем в буфер обмена
    try {
      navigator.clipboard?.writeText(password).catch(() => {});
    } catch {}
    // Тригерим подсказку менеджера паролей через скрытую форму для браузера
    try {
      const form = document.createElement('form');
      form.style.position = 'fixed';
      form.style.opacity = '0';
      form.style.pointerEvents = 'none';
      const u = document.createElement('input');
      u.type = 'text';
      u.name = 'username';
      u.autocomplete = 'username';
      u.value = formData.email || '';
      const p = document.createElement('input');
      p.type = 'password';
      p.name = 'new-password';
      p.autocomplete = 'new-password';
      p.value = password;
      form.appendChild(u);
      form.appendChild(p);
      document.body.appendChild(form);
      // Фокус + blur, чтобы браузер предложил сохранить
      p.focus();
      p.blur();
      setTimeout(() => document.body.removeChild(form), 0);
    } catch {}
    toast({
      title: t('notifications.admin.passwordGenerated.title'),
      description: `${t('notifications.admin.passwordGenerated.description')} — ${t('notifications.admin.passwordCopied.description')}`,
      variant: "success"
    });
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signUp(formData.email, formData.password, formData.name);
      
      if (!error) {
        // Save email to localStorage for future logins
        localStorage.setItem('lastEmail', formData.email);
        
        // Сохраняем реферальный код для применения после подтверждения email
        if (referralCode && referralCode.length > 0) {
          localStorage.setItem('pending_referral_code', referralCode);
        }
        
        // Очищаем временный код
        localStorage.removeItem('referral_code');
        
        onClose();
        // Reset form
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
        setReferralCode('');
        setGeneratedPassword('');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-card backdrop-blur-xl border border-gray-200 dark:border-border rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {t('register.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {t('register.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              {t('register.fields.fullName')}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder={t('register.fields.fullNamePlaceholder')}
                value={formData.name}
                onChange={handleInputChange}
                required
                className="pl-10 rounded-xl h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              {t('register.fields.email')}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('register.fields.emailPlaceholder')}
                value={formData.email}
                onChange={handleInputChange}
                required
                className="pl-10 rounded-xl h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                {t('register.fields.password')}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  generatePassword();
                }}
                className="h-8 px-3 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {t('header.modals.register.generate')}
              </Button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('register.fields.passwordPlaceholder')}
                value={formData.password}
                onChange={handleInputChange}
                required
                className="pl-10 pr-12 rounded-xl h-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            
            {/* Password Requirements */}
            {formData.password && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-muted border border-gray-200 dark:border-border rounded-xl">
                <p className="text-sm font-semibold text-gray-700 dark:text-foreground mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {t('register.passwordRequirements.title')}
                </p>
                <div className="space-y-2">
                  {passwordRequirements.map((req, index) => {
                    const isValid = req.test(formData.password);
                    const IconComponent = req.icon;
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                          isValid 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-gray-500 dark:text-muted-foreground"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isValid 
                            ? "bg-green-100 dark:bg-green-900/30" 
                            : "bg-gray-100 dark:bg-muted"
                        }`}>
                          {isValid ? (
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                          ) : (
                            <IconComponent className="h-3 w-3" />
                          )}
                        </div>
                        <span className={isValid ? "font-medium" : ""}>
                          {req.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Password Strength Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-muted-foreground">Strength</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-foreground">
                      {passwordRequirements.filter(req => req.test(formData.password)).length}/5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        passwordRequirements.filter(req => req.test(formData.password)).length === 5
                          ? "bg-green-500"
                          : passwordRequirements.filter(req => req.test(formData.password)).length >= 3
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${(passwordRequirements.filter(req => req.test(formData.password)).length / 5) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              {t('register.fields.confirmPassword')}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t('register.fields.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="pl-10 pr-12 rounded-xl h-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            
            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className={`flex items-center gap-2 text-sm p-2 rounded-lg transition-all duration-300 ${
                passwordsMatch 
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" 
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
              }`}>
                {passwordsMatch ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="font-medium">{t('header.modals.register.passwordMatch.success')}</span>
                  </>
                ) : (
                  <>
                    <XIcon className="h-4 w-4" />
                    <span className="font-medium">{t('header.modals.register.passwordMatch.error')}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Реферальный код */}
          <div className="space-y-2">
            <Label htmlFor="referralCode" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Реферальный код (опционально)
            </Label>
            <div className="relative">
              <Input
                id="referralCode"
                name="referralCode"
                type="text"
                placeholder="Введите код, если есть"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="pl-4 rounded-xl h-12 uppercase"
              />
            </div>
            {referralCode && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Вы получите скидку при использовании этого кода!
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold"
            disabled={isLoading}
          >
            {isLoading ? t('header.modals.register.creating') : t('header.modals.register.createAccount')}
          </Button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            {t('register.buttons.alreadyHaveAccount')}{" "}
            <Button
              variant="link"
              onClick={onSwitchToLogin}
              className="p-0 h-auto text-primary hover:text-primary/80 font-medium"
            >
              {t('register.buttons.signIn')}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
