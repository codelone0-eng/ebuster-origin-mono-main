import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Loader2, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { RecentUsers } from '@/components/RecentUsers';
import Silk from '@/components/Silk';
import { BeamsUpstream } from '@/components/ui/beams-upstream';

const generateAuthCode = () => {
  return 'auth_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const { t } = useLanguage();
  
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
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.error) {
        toast({
          title: "Ошибка входа",
          description: result.error.message || "Неверный email или пароль",
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
          title: "Успешно!",
          description: "Добро пожаловать!",
          variant: "success"
        });
        
        setTimeout(() => {
          window.location.href = 'https://lk.ebuster.ru/dashboard';
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось войти. Попробуйте позже.",
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
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-32">
        <div className="container mx-auto max-w-[1440px]">
          <div className="max-w-[1312px] mx-auto">
            <div className="grid lg:grid-cols-[1fr,1fr] gap-16 items-start">
              {/* Left: Form */}
              <div className="space-y-6">
                <span className="inline-flex px-3 py-1.5 text-xs uppercase tracking-[0.4em] text-emerald-300/70 font-medium border border-emerald-300/20 rounded bg-emerald-300/5">
                  Авторизация
                </span>
                <h1 className="text-4xl md:text-6xl font-semibold leading-tight text-white" style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                  fontWeight: 600
                }}>
                  Вход в систему
                </h1>
                <p className="text-white/60 text-lg max-w-xl leading-relaxed">
                  Введите свои данные для входа в аккаунт EBUSTER
                </p>
              </div>

              {/* Right: Form Card */}
              <div className="space-y-6">
                <div className="rounded-[32px] border border-white/10 bg-black/30 backdrop-blur-xl p-8">
                  <div className="rounded-2xl border border-white/10 bg-[#05090f] p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <RecentUsers onUserSelect={handleUserSelect} />
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/80 text-sm font-medium">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="pl-12 h-14 bg-white/[0.02] border-white/10 text-white placeholder:text-white/40 focus:border-white/30 rounded-lg"
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
                          <Label htmlFor="password" className="text-white/80 text-sm font-medium">Пароль</Label>
                          <Link 
                            to="/forgot-password" 
                            className="text-sm text-white/60 hover:text-white transition-colors"
                          >
                            Забыли пароль?
                          </Link>
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
                            className="pl-12 pr-12 h-14 bg-white/[0.02] border-white/10 text-white placeholder:text-white/40 focus:border-white/30 rounded-lg"
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
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="rememberMe"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded border-white/20 bg-black text-white focus:ring-white/20 focus:ring-2"
                        />
                        <Label htmlFor="rememberMe" className="text-sm text-white/60 cursor-pointer">
                          Запомнить меня
                        </Label>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-14 bg-white text-black hover:bg-white/90 transition-colors text-base font-medium rounded-lg" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Вход...
                          </>
                        ) : (
                          'Войти'
                        )}
                      </Button>
                    </form>

                    <div className="text-center pt-6 mt-6 border-t border-white/10">
                      <p className="text-sm text-white/60">
                        Нет аккаунта?{' '}
                        <Link to="/register" className="text-white hover:text-white/80 transition-colors font-medium">
                          Зарегистрироваться
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
