import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { RecentUsers } from '@/components/RecentUsers';

// Генерация authorization code для OAuth
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
        // Сохраняем email для будущих входов
        if (rememberMe) {
          localStorage.setItem('lastEmail', formData.email);
        } else {
          localStorage.removeItem('lastEmail');
        }
        
        // Добавляем в список недавних пользователей
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
        
        toast({
          title: "Успешно!",
          description: "Добро пожаловать!",
          variant: "success"
        });
        
        // Перенаправление в личный кабинет
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          На главную
        </Button>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Вход в систему
            </CardTitle>
            <CardDescription className="text-center">
              Введите свои данные для входа
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Recent Users */}
              <RecentUsers onUserSelect={handleUserSelect} />
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Пароль</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Забыли пароль?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                  Запомнить меня
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Вход...
                  </>
                ) : (
                  'Войти'
                )}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Зарегистрироваться
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
