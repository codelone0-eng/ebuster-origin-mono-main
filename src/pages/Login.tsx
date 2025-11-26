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

  const generateUserId = () => {
    if (!formData.email) return '00000000-0000-0000-0000-000000000000';
    const hash = Array.from(formData.email)
      .reduce((acc, char) => acc + char.charCodeAt(0).toString(16), '')
      .substring(0, 36);
    return hash.match(/.{1,8}/g)?.join('-') || '00000000-0000-0000-0000-000000000000';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundSize: '60px 60px'
    }}>
      <div className="w-full max-w-[1920px] grid lg:grid-cols-2 gap-0 items-center min-h-screen">
        {/* Left: Form */}
        <div className="w-full flex items-center justify-center px-8 py-16">
          <div className="w-full max-w-[512px]">
            {/* Header */}
            <div className="mb-16">
              <h1 className="text-3xl font-semibold text-white mb-2">Sign in</h1>
              <p className="text-white/60 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-white hover:text-white/80 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <RecentUsers onUserSelect={handleUserSelect} />
              
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:ring-0 rounded"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white text-sm font-medium">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:ring-0 rounded pr-10"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
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

              {/* Remember Me */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 bg-white text-[#3b82f6] focus:ring-[#3b82f6] focus:ring-2"
                />
                <Label htmlFor="rememberMe" className="text-sm text-white/60 cursor-pointer">
                  Remember me
                </Label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium rounded transition-colors" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-16 flex items-center justify-between text-xs text-white/60">
              <p>© 2025. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link to="/docs" className="text-white/80 hover:text-white transition-colors">Docs</Link>
                <Link to="/legal" className="text-white/80 hover:text-white transition-colors">Legal</Link>
                <Link to="/support" className="text-white/80 hover:text-white transition-colors">Support</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right: User Card */}
        <div className="hidden lg:flex items-center justify-center px-8 py-16 bg-gradient-to-b from-transparent via-white/5 to-transparent">
          <div className="w-full max-w-[448px]">
            <div className="bg-white rounded-lg border border-gray-200 shadow-xl p-8 relative">
              {/* Top accent tab */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-gray-300 rounded-full"></div>
              
              <div className="space-y-8">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/50 flex flex-col items-center justify-center relative">
                    <Plus className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-[10px] text-gray-500 font-medium">Avatar</span>
                    <span className="text-[10px] text-gray-400">Max 2MB</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold text-gray-900">New User</h3>
                  <p className="text-lg text-gray-600 font-mono tracking-widest">•••••</p>
                </div>
                
                {/* Barcode */}
                <div className="h-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 rounded-full relative overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    style={{
                      width: '100%',
                      height: '100%',
                      animation: 'shimmer 2s linear infinite'
                    }}
                  ></div>
                </div>
                
                {/* User ID */}
                <div className="font-mono text-xs text-gray-600 break-all text-center leading-relaxed">
                  {generateUserId()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
