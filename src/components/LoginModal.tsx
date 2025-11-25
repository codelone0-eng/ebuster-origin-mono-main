import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/CustomAuthContext";
import { RecentUsers } from "@/components/RecentUsers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Генерация authorization code для OAuth
const generateAuthCode = () => {
  return 'auth_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const LoginModal = ({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) => {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: localStorage.getItem('lastEmail') || "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (!error) {
        // Save email to localStorage for future logins
        if (rememberMe) {
          localStorage.setItem('lastEmail', formData.email);
        } else {
          localStorage.removeItem('lastEmail');
        }
        
        // Add to recent users
        const recentUsers = JSON.parse(localStorage.getItem('recentUsers') || '[]');
        const userExists = recentUsers.find((u: any) => u.email === formData.email);
        if (!userExists) {
          recentUsers.unshift({
            email: formData.email,
            lastLogin: new Date().toISOString()
          });
          localStorage.setItem('recentUsers', JSON.stringify(recentUsers.slice(0, 3)));
        }
        
        // Проверяем, есть ли OAuth параметры для расширения
        const oauthParams = sessionStorage.getItem('oauth_params');
        if (oauthParams) {
          try {
            const params = JSON.parse(oauthParams);
            console.log('🔐 OAuth flow after login:', params);
            
            // Генерируем authorization code
            const authCode = generateAuthCode();
            
            // Перенаправляем обратно в расширение с кодом
            const redirectUrl = `${params.redirect_uri}?code=${authCode}&state=success`;
            console.log('🔐 Redirecting to:', redirectUrl);
            
            // Сохраняем код для обмена на токен
            sessionStorage.setItem('auth_code', authCode);
            sessionStorage.setItem('oauth_client_id', params.client_id);
            
            window.location.href = redirectUrl;
            return;
          } catch (error) {
            console.error('🔐 OAuth flow error:', error);
          }
        }
        
        // Редирект на личный кабинет
        const isProduction = window.location.hostname !== 'localhost';
        if (isProduction) {
          window.location.href = 'https://lk.ebuster.ru/dashboard';
        } else {
          onClose();
          // Reset form
          setFormData({ email: "", password: "" });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
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

  const handleUserSelect = (email: string) => {
    setFormData(prev => ({
      ...prev,
      email
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-[#2d2d2d]">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              {t('login.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-[#808080]">
            {t('login.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Recent Users */}
          <RecentUsers onUserSelect={handleUserSelect} />
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-white">
              {t('login.fields.email')}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#808080]" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('login.fields.emailPlaceholder')}
                value={formData.email}
                onChange={handleInputChange}
                required
                className="pl-10 h-12 bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#808080] focus:border-[#404040]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-white">
              {t('login.fields.password')}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#808080]" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('login.fields.passwordPlaceholder')}
                value={formData.password}
                onChange={handleInputChange}
                required
                className="pl-10 pr-12 h-12 bg-[#111111] border-[#2d2d2d] text-white placeholder:text-[#808080] focus:border-[#404040]"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent text-[#808080] hover:text-[#d9d9d9] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    id="remember"
                    type="checkbox"
                    className="sr-only"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <div 
                    className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center cursor-pointer ${
                      rememberMe ? 'border-[#404040] bg-[#404040]' : 'border-[#2d2d2d] bg-[#111111]'
                    }`}
                    onClick={() => setRememberMe(!rememberMe)}
                  >
                    <svg
                      className={`w-3 h-3 text-white transition-opacity duration-200 ${
                        rememberMe ? 'opacity-100' : 'opacity-0'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <Label htmlFor="remember" className="text-sm text-[#808080] cursor-pointer">
                  {t('login.rememberMe')}
                </Label>
              </div>
            <Button
              variant="link"
              className="p-0 h-auto text-[#808080] hover:text-[#d9d9d9] text-sm transition-colors"
              asChild
            >
              <Link to="/forgot-password">
                {t('login.forgotPassword')}
              </Link>
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#404040] text-white hover:bg-[#4d4d4d] transition-colors font-semibold"
            disabled={isLoading}
          >
            {isLoading ? t('header.modals.login.signingIn') : t('header.modals.login.signIn')}
          </Button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-[#808080]">
            {t('login.buttons.dontHaveAccount')}{" "}
            <Button
              variant="link"
              onClick={onSwitchToRegister}
              className="p-0 h-auto text-[#d9d9d9] hover:text-white font-medium transition-colors"
            >
              {t('login.buttons.createAccount')}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
