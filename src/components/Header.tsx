import { User, ChevronDown, LogIn, Shield, LogOut, Search } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

import { ThemeToggle } from "./ThemeToggle"
import { CursorSelector } from "./CursorSelector"
import { GlobalSearch } from "./GlobalSearch"
import { useCursor } from "@/contexts/CursorContext"
import { useLanguage } from "@/hooks/useLanguage"
import { useAuth } from "@/contexts/CustomAuthContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { API_CONFIG } from "@/config/api"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Генерация authorization code для OAuth
const generateAuthCode = () => {
  return 'auth_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const { cursorType, setCursorType } = useCursor();
  const { user, signOut, loading } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Get navigation links from translations
  const navigationLinks = t('header.navigation') as unknown as any[];

  const handleOpenLogin = () => {
    navigate('/login');
  };

  const handleOpenRegister = () => {
    navigate('/register');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleLanguage = () => {
    changeLanguage(language === 'ru' ? 'eng' : 'ru');
  };

  // Горячая клавиша Ctrl+K для поиска
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Авто-открытие модалки входа по URL: /signin или ?open=login
  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const openParam = search.get('open');
    const clientId = search.get('client_id');
    const responseType = search.get('response_type');
    const redirectUri = search.get('redirect_uri');

    // OAuth flow для расширения Chrome
    if (clientId && responseType === 'code' && redirectUri) {
      console.log('🔐 OAuth flow detected:', { clientId, responseType, redirectUri });
      
      // Проверяем, авторизован ли пользователь
      const checkAuthAndRedirect = async () => {
        try {
          const token = localStorage.getItem('jwt_token');
          if (token) {
            // Проверяем валидность токена
            const response = await fetch(`${API_CONFIG.AUTH_URL}/verify`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              console.log('🔐 User is already authenticated, generating auth code');
              // Пользователь авторизован, генерируем authorization code
              const authCode = generateAuthCode();
              const redirectUrl = `${redirectUri}?code=${authCode}&state=success`;
              console.log('🔐 Redirecting to:', redirectUrl);
              
              // Сохраняем код для обмена на токен
              sessionStorage.setItem('auth_code', authCode);
              sessionStorage.setItem('oauth_client_id', clientId);
              
              window.location.href = redirectUrl;
              return;
            }
          }
          
          // Пользователь не авторизован, перенаправляем на страницу логина
          console.log('🔐 User not authenticated, redirecting to login');
          sessionStorage.setItem('oauth_params', JSON.stringify({
            client_id: clientId,
            response_type: responseType,
            redirect_uri: redirectUri,
            scope: search.get('scope')
          }));
          navigate('/login');
          
        } catch (error) {
          console.error('🔐 Auth check error:', error);
          // В случае ошибки перенаправляем на страницу логина
          sessionStorage.setItem('oauth_params', JSON.stringify({
            client_id: clientId,
            response_type: responseType,
            redirect_uri: redirectUri,
            scope: search.get('scope')
          }));
          navigate('/login');
        }
      };
      
      checkAuthAndRedirect();
      return;
    }

    if (location.pathname === '/signin' || openParam === 'login') {
      navigate('/login');
      return;
    }

    // Перенаправляем на страницу регистрации при параметре ?register=true или ?ref=CODE
    const refParam = search.get('ref');
    if (search.get('register') === 'true' || refParam) {
      // Перенаправляем на регистрацию с реферальным кодом
      if (refParam) {
        navigate(`/register?ref=${refParam}`);
      } else {
        navigate('/register');
      }
      return;
    }
    
  }, [location, navigate]);

  return (
    <header className="relative z-50 bg-[#0a0a0a] backdrop-blur-xl border-b border-white/10">
      {/* Noise effect */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      
      <div className="relative max-w-7xl mx-auto flex h-16 items-center justify-between gap-12 px-6">

        {/* Left - Navigation Menu */}
        <div className="flex flex-1 items-center gap-6">
          <nav className="hidden md:flex items-center gap-16">
            {navigationLinks.map((link, index) => (
              <div key={index}>
                {link.submenu?.items ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-white/70 hover:text-white bg-transparent px-0 py-0 font-normal text-sm transition-colors duration-200 h-auto"
                      >
                        {link.label}
                        <ChevronDown className="ml-1 h-3 w-3 text-white/50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      align="start" 
                      className="z-dropdown w-72 p-2 bg-black backdrop-blur-xl border border-white/10 rounded-lg"
                    >
                      <div className="space-y-1">
                        {link.submenu.items.map((item, itemIndex) => (
                          <a 
                            key={itemIndex}
                            href={item.href}
                            className="block p-3 rounded-lg hover:bg-white/5 transition-colors duration-200 group"
                          >
                            <div className="space-y-1">
                              <div className="font-medium text-white transition-colors">
                                {item.label}
                              </div>
                              <p className="text-white/40 line-clamp-2 text-xs">
                                {item.description}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <a
                    href={link.href.startsWith('/') ? `https://ebuster.ru${link.href}` : link.href}
                    className="text-white/70 hover:text-white px-0 py-0 font-normal text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Middle - Controls */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white px-3 py-2 h-auto rounded-lg hover:bg-white/5 transition-colors duration-200"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-4 w-4 mr-2 text-white/60" />
            <span className="text-sm font-normal">Поиск</span>
            <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-white/5 border border-white/10 rounded text-white/50">⌘K</kbd>
          </Button>
          <ThemeToggle />
          <CursorSelector 
            currentCursor={cursorType}
            onCursorChange={setCursorType}
          />
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white/70 hover:text-white px-3 py-2 h-auto rounded-lg hover:bg-white/5 transition-colors duration-200"
            onClick={toggleLanguage}
          >
            <span className="text-sm font-normal">{t('header.buttons.language')}</span>
          </Button>
        </div>

        {/* Right - Authentication */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white/70 hover:text-white px-4 py-2 h-auto rounded-lg hover:bg-white/5 transition-colors duration-200"
              >
                <User className="h-4 w-4 mr-2 text-white/60" />
                <span className="text-sm font-normal">
                  {user?.full_name || user?.email?.split('@')[0] || 'Пользователь'}
                </span>
                <ChevronDown className="h-3 w-3 ml-1 text-white/50" />
              </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="z-dropdown w-64 p-2 bg-black backdrop-blur-xl border border-white/10 rounded-lg">
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm font-medium text-white border-b border-white/10">
                      {user?.full_name || user?.email}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-white/60 hover:text-white"
                      onClick={() => {
                        const isProduction = window.location.hostname !== 'localhost';
                        if (isProduction) {
                          window.location.href = 'https://lk.ebuster.ru/dashboard';
                        } else {
                          window.location.href = '/dashboard';
                        }
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {t('header.buttons.dashboard')}
                    </Button>
                    {user?.role === 'admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-white/60 hover:text-white"
                        onClick={() => window.location.href = 'https://admin.ebuster.ru'}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {t('header.buttons.adminPanel')}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-400 hover:text-red-300"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('header.buttons.logout')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white/70 hover:text-white px-4 py-2 h-auto rounded-lg hover:bg-white/5 transition-colors duration-200"
                onClick={handleOpenRegister}
              >
                <User className="h-4 w-4 mr-2 text-white/60" />
                <span className="text-sm font-normal">{t('header.buttons.createAccount')}</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                className="bg-white text-black hover:bg-white/90 border-white rounded-lg px-4 py-2 h-auto font-normal"
                onClick={handleOpenLogin}
              >
                <LogIn className="h-4 w-4 mr-2" />
                <span className="text-sm">{t('header.buttons.signIn')}</span>
              </Button>
            </div>
          )}

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <CursorSelector 
              currentCursor={cursorType}
              onCursorChange={setCursorType}
            />
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white/70 hover:text-white px-3 py-2 h-auto rounded-lg hover:bg-white/5 transition-colors duration-200"
              onClick={toggleLanguage}
            >
              <span className="text-sm font-normal">{t('header.buttons.language')}</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="group size-10 rounded-lg hover:bg-white/5 transition-colors duration-200 text-white"
                  variant="ghost"
                  size="icon"
                >
                  <svg
                    className="pointer-events-none"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 12L20 12"
                      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="z-dropdown w-72 p-2 bg-black backdrop-blur-xl border border-white/10 rounded-lg">
                <div className="space-y-1">
                  {navigationLinks.map((link, index) => (
                    <div key={index}>
                      {link.submenu?.items ? (
                        <>
                          <div className="text-white/40 px-3 py-2 text-xs font-medium">
                            {link.label}
                          </div>
                          <div className="space-y-1">
                            {link.submenu.items.map((item, itemIndex) => (
                              <Link 
                                key={itemIndex}
                                to={item.href} 
                                className="block py-2 px-3 rounded-lg hover:bg-white/5 transition-colors duration-200 text-white"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </>
                      ) : (
                        <Link 
                          to={link.href} 
                          className="block py-2 px-3 rounded-lg hover:bg-white/5 transition-colors duration-200 text-white"
                        >
                          {link.label}
                        </Link>
                      )}
                      {index < navigationLinks.length - 1 && (
                        <div
                          role="separator"
                          aria-orientation="horizontal"
                          className="bg-white/10 -mx-1 my-1 h-px w-full"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Глобальный поиск */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}