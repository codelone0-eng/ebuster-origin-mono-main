import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Loader2, Mail, Lock, User, Check, X, Hash, Type, CaseSensitive, Shield, RefreshCw, Eye, EyeOff, Gift, Plus } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  
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
      label: 'At least 8 characters', 
      test: (pwd: string) => pwd.length >= 8,
      icon: Hash
    },
    { 
      label: 'One uppercase letter', 
      test: (pwd: string) => /[A-Z]/.test(pwd),
      icon: Type
    },
    { 
      label: 'One lowercase letter', 
      test: (pwd: string) => /[a-z]/.test(pwd),
      icon: CaseSensitive
    },
    { 
      label: 'One number', 
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
      title: "Пароль сгенерирован!",
      description: "Пароль скопирован в буфер обмена",
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
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    if (!allRequirementsMet) {
      toast({
        title: "Ошибка",
        description: "Пароль не соответствует требованиям",
        variant: "destructive"
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(formData.email, formData.password, formData.fullName);
      
      if (result.error) {
        toast({
          title: "Ошибка регистрации",
          description: result.error.message || "Не удалось зарегистрироваться",
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
        title: "Ошибка",
        description: "Не удалось зарегистрироваться. Попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateUserId = () => {
    if (!formData.email) return '00000000-0000-0000-0000-000000000000';
    return Array.from(formData.email)
      .reduce((acc, char) => acc + char.charCodeAt(0).toString(16), '')
      .substring(0, 36)
      .match(/.{1,8}/g)
      ?.join('-') || '00000000-0000-0000-0000-000000000000';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundSize: '60px 60px'
    }}>
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Form */}
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-2">Create an account</h2>
          <p className="text-sm text-white/60 mb-6">
            Already have an account?{' '}
            <Link to="/login" className="text-white/80 hover:text-white transition-colors">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {referralCode && (
              <div className="bg-white/5 border border-white/10 rounded p-3">
                <p className="text-sm font-medium text-white flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Реферальный код: {referralCode}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white text-sm font-medium">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="h-11 bg-[#0a0a0a] border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-0 rounded"
                style={{
                  WebkitTextFillColor: 'white',
                  WebkitBoxShadow: '0 0 0px 1000px #0a0a0a inset'
                }}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleInputChange}
                className="h-11 bg-[#0a0a0a] border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-0 rounded"
                style={{
                  WebkitTextFillColor: 'white',
                  WebkitBoxShadow: '0 0 0px 1000px #0a0a0a inset'
                }}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white text-sm font-medium">Password</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    generatePassword();
                  }}
                  className="h-7 px-2 text-xs bg-transparent border-0 text-white/60 hover:text-white hover:bg-white/5"
                  disabled={loading}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Generate
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-11 bg-[#0a0a0a] border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-0 rounded pr-10"
                  style={{
                    WebkitTextFillColor: 'white',
                    WebkitBoxShadow: '0 0 0px 1000px #0a0a0a inset'
                  }}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/5 text-white/60 hover:text-white"
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

              {formData.password && (
                <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded space-y-2">
                  <p className="text-xs font-semibold text-white">Password requirements:</p>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Enter password again"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="h-11 bg-[#0a0a0a] border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-0 rounded pr-10"
                  style={{
                    WebkitTextFillColor: 'white',
                    WebkitBoxShadow: '0 0 0px 1000px #0a0a0a inset'
                  }}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/5 text-white/60 hover:text-white"
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
                      <span className="font-medium">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3" />
                      <span>Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium rounded transition-colors" 
              disabled={loading || !allRequirementsMet || !passwordsMatch}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <p className="mt-4 text-xs text-white/60">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-white/80 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </p>
        </div>

        {/* Right: User Card */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 relative" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}>
              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-white/30 bg-white/[0.08] flex flex-col items-center justify-center mb-3 relative">
                    <Plus className="h-6 w-6 text-white/50 mb-1" />
                    <span className="text-[10px] text-white/50 font-medium">Avatar</span>
                    <span className="text-[10px] text-white/40">Max 2MB</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">New User</h3>
                  <p className="text-white/60 text-sm font-mono">{formData.email || 'your@email.com'}</p>
                </div>
                
                {/* Password dots */}
                <div className="text-center">
                  <div className="text-white/70 text-sm font-mono tracking-widest">*****</div>
                </div>
                
                {/* Barcode */}
                <div className="h-2.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 rounded-sm relative overflow-hidden">
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
                <div className="font-mono text-xs text-white/70 break-all text-center leading-relaxed tracking-tight">
                  {generateUserId()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-white/60">© 2025. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/docs" className="text-white/80 hover:text-white transition-colors">Docs</Link>
            <Link to="/legal" className="text-white/80 hover:text-white transition-colors">Legal</Link>
            <Link to="/support" className="text-white/80 hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
