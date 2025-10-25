import { User, ArrowUpRight, Star, ChevronDown, LogIn, Shield, LogOut } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

import { ThemeToggle } from "./ThemeToggle"
import { CursorSelector } from "./CursorSelector"
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
    <header className="relative z-header bg-gradient-to-r from-card/90 via-card/80 to-card/90 backdrop-blur-xl border-b border-border/30 px-6 py-4 rounded-t-3xl overflow-hidden group">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto flex h-16 items-center justify-between gap-20">

        {/* Left - Navigation Menu */}
        <div className="flex items-center gap-6">
          <nav className="max-md:hidden flex items-center gap-16">
            {navigationLinks.map((link, index) => (
              <div key={index}>
                {link.submenu?.items ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground bg-transparent px-0 py-0 font-medium text-sm hover:scale-105 transition-transform duration-200 h-auto"
                      >
                        {link.label}
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      align="start" 
                      className="z-dropdown w-72 p-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl"
                    >
                      <div className="space-y-1">
                        {link.submenu.items.map((item, itemIndex) => (
                          <a 
                            key={itemIndex}
                            href={item.href}
                            className="block p-3 rounded-xl hover:bg-accent/20 transition-colors duration-200 group"
                          >
                            <div className="space-y-1">
                              <div className="font-medium group-hover:text-primary transition-colors">
                                {item.label}
                              </div>
                              <p className="text-muted-foreground line-clamp-2 text-xs">
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
                    className="text-muted-foreground hover:text-foreground px-0 py-0 font-medium text-sm hover:scale-105 transition-all duration-200 relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                  </a>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right - Action Buttons */}
        <div className="flex items-center gap-8">
          {/* Premium Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 text-primary hover:from-primary/20 hover:to-accent/20 hover:border-primary/50 rounded-xl px-4 py-2 h-auto group"
            onClick={() => window.location.href = 'https://ebuster.ru/price'}
          >
            <Star className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-sm font-semibold">{t('header.buttons.premium')}</span>
            <ArrowUpRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </Button>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <CursorSelector 
              currentCursor={cursorType}
              onCursorChange={setCursorType}
            />
            
            {/* Language Toggle */}
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground px-3 py-2 h-auto rounded-xl hover:bg-accent/20 transition-all duration-200"
              onClick={toggleLanguage}
            >
              <span className="text-sm font-medium">{t('header.buttons.language')}</span>
            </Button>

            {/* Auth Buttons - Show different content based on auth state */}
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* User Profile Button */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-foreground px-4 py-2 h-auto rounded-xl hover:bg-accent/20 transition-all duration-200 group"
                    >
                      <User className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-sm font-medium">
                        {user?.full_name || user?.email?.split('@')[0] || 'Пользователь'}
                      </span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="z-dropdown w-64 p-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl">
                    <div className="space-y-2">
                      <div className="px-3 py-2 text-sm font-medium text-foreground border-b border-border/30">
                        {user?.full_name || user?.email}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
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
                          className="w-full justify-start text-muted-foreground hover:text-foreground"
                          onClick={() => window.location.href = 'https://admin.ebuster.ru'}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          {t('header.buttons.adminPanel')}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-destructive hover:text-destructive"
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
                {/* Create Account Button */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground px-4 py-2 h-auto rounded-xl hover:bg-accent/20 transition-all duration-200 group"
                  onClick={handleOpenRegister}
                >
                  <User className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-medium">{t('header.buttons.createAccount')}</span>
                </Button>

                {/* Login Button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 text-primary hover:from-primary/20 hover:to-accent/20 hover:border-primary/50 rounded-xl px-4 py-2 h-auto group"
                  onClick={handleOpenLogin}
                >
                  <LogIn className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-semibold">{t('header.buttons.signIn')}</span>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="group size-10 rounded-xl hover:bg-accent/20 transition-all duration-200"
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
                <PopoverContent align="end" className="z-dropdown w-72 p-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl">
                  <div className="space-y-1">
                    {navigationLinks.map((link, index) => (
                      <div key={index}>
                        {link.submenu?.items ? (
                          <>
                            <div className="text-muted-foreground px-3 py-2 text-xs font-medium">
                              {link.label}
                            </div>
                            <div className="space-y-1">
                              {link.submenu.items.map((item, itemIndex) => (
                                <Link 
                                  key={itemIndex}
                                  to={item.href} 
                                  className="block py-2 px-3 rounded-xl hover:bg-accent/20 transition-colors duration-200"
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          </>
                        ) : (
                          <Link 
                            to={link.href} 
                            className="block py-2 px-3 rounded-xl hover:bg-accent/20 transition-colors duration-200"
                          >
                            {link.label}
                          </Link>
                        )}
                        {index < navigationLinks.length - 1 && (
                          <div
                            role="separator"
                            aria-orientation="horizontal"
                            className="bg-border/50 -mx-1 my-1 h-px w-full"
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
      </div>
    </header>
  )
}