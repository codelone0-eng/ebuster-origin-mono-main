import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Loader2, Eye, EyeOff, Plus } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { RecentUsers } from '@/components/RecentUsers';
import { SilkBackground } from '@/components/SilkBackground';

const generateAuthCode = () => {
  return 'auth_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const { t, language } = useLanguage();
  const isRu = language === 'ru';
  const translate = (ruText: string, enText: string) => (isRu ? ruText : enText);
  
  const [formData, setFormData] = useState({
    email: localStorage.getItem('lastEmail') || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleUserSelect = (email: string) => {
    setFormData(prev => ({
      ...prev,
      email
    }));
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
    
    if (!formData.email || !formData.password) {
      toast({
        title: translate("Ошибка", "Error"),
        description: translate("Заполните все поля", "Please fill in all fields"),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.error) {
        toast({
          title: translate("Ошибка входа", "Login error"),
          description: result.error.message || translate("Неверный email или пароль", "Incorrect email or password"),
          variant: "destructive"
        });
      } else {
        if (rememberMe) {
          localStorage.setItem('lastEmail', formData.email);
        } else {
          localStorage.removeItem('lastEmail');
        }
        
        const recentUsers = JSON.parse(localStorage.getItem('recentUsers') || '[]');
        const userExists = recentUsers.find((u: any) => u.email === formData.email);
        if (!userExists) {
          recentUsers.unshift({
            email: formData.email,
            lastLogin: new Date().toISOString()
          });
          localStorage.setItem('recentUsers', JSON.stringify(recentUsers.slice(0, 3)));
        }
        
        const oauthParams = sessionStorage.getItem('oauth_params');
        if (oauthParams) {
          try {
            const params = JSON.parse(oauthParams);
            const authCode = generateAuthCode();
            const redirectUrl = `${params.redirect_uri}?code=${authCode}&state=success`;
            sessionStorage.setItem('auth_code', authCode);
            sessionStorage.setItem('oauth_client_id', params.client_id);
            window.location.href = redirectUrl;
            return;
          } catch (error) {
            console.error('🔐 OAuth flow error:', error);
          }
        }
        
        toast({
          title: translate("Успешно!", "Success!"),
          description: translate("Добро пожаловать!", "Welcome back!"),
          variant: "success"
        });
        
        setTimeout(() => {
          window.location.href = 'https://lk.ebuster.ru/dashboard';
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: translate("Ошибка", "Error"),
        description: translate("Не удалось войти. Попробуйте позже.", "Unable to sign in. Please try again later."),
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
          <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-flex px-4 py-1 text-xs uppercase tracking-[0.4em] text-emerald-300/70 border border-emerald-300/30 rounded-full bg-emerald-300/10">
                  {translate("Авторизация", "Authorization")}
                </span>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold leading-tight">{t('header.modals.login.title')}</h1>
                  <p className="text-white/70 mt-3">
                    {t('header.modals.login.noAccount')}{' '}
                    <Link to="/register" className="text-white hover:text-white/80 transition-colors font-medium">
                      {t('header.modals.login.createOne')}
                    </Link>
              </p>
                </div>
            </div>
            
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <RecentUsers onUserSelect={handleUserSelect} />
              
              <div className="space-y-2">
                      <Label htmlFor="email" className="text-white text-sm font-medium">
                        {t('header.modals.login.email')}
                      </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                        placeholder={t('header.modals.login.emailPlaceholder')}
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
                          {t('header.modals.login.password')}
                        </Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                          {t('header.modals.login.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                          placeholder={t('header.modals.login.passwordPlaceholder')}
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

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-white/30 bg-white/5 text-white focus:ring-white/20 focus:ring-2"
                />
                <Label htmlFor="rememberMe" className="text-sm text-white/60 cursor-pointer">
                        {t('header.modals.login.rememberMe')}
                </Label>
              </div>

              <Button 
                type="submit" 
                      className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium rounded-xl transition-colors" 
                disabled={loading}
              >
                {loading ? (
                  <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('header.modals.login.signingIn')}
                  </>
                ) : (
                        t('header.modals.login.signIn')
                )}
              </Button>
            </form>

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
          </div>
        </main>
      </div>
    </div>
  );
}
