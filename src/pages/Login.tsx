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
                Вход в систему
              </h1>
              <p className="text-white/60 text-lg">
                Введите свои данные для входа
              </p>
            </div>
            
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
                    className="pl-12 h-14 bg-white/[0.02] border-white/10 text-white placeholder:text-white/40 focus:border-white/30 autofill:bg-white/[0.02] autofill:text-white"
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
                    className="pl-12 pr-12 h-14 bg-white/[0.02] border-white/10 text-white placeholder:text-white/40 focus:border-white/30 autofill:bg-white/[0.02] autofill:text-white"
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
                className="w-full h-14 bg-white text-black hover:bg-white/90 transition-colors text-base font-medium" 
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

            <div className="text-center">
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
                  <h3 className="text-xl font-semibold text-white mb-1">Sign In</h3>
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
      </div>
    </div>
  );
}
