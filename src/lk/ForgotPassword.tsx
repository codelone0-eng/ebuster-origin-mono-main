import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/contexts/CustomAuthContext';
import { Toaster } from '@/components/ui/toaster';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (!error) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <div className="relative z-content">
        <Header />
        
        <div className="container mx-auto max-w-md px-4 py-16">
          <div className="mb-8">
            <Button variant="outline" size="sm" asChild className="mb-6">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('header.forgotPassword.backToDashboard')}
              </Link>
            </Button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('header.forgotPassword.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('header.forgotPassword.description')}
              </p>
            </div>
          </div>

          {!isSubmitted ? (
            <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
              <CardHeader>
                <CardTitle className="text-center">{t('header.forgotPassword.enterEmail')}</CardTitle>
                <CardDescription className="text-center">
                  {t('header.forgotPassword.enterEmailDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('header.forgotPassword.emailLabel')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('header.forgotPassword.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-card border border-border focus:border-primary/50 focus:ring-0 focus:outline-none transition-all duration-200"
                      autoComplete="off"
                      required
                    />
                  </div>
                  
                  <GradientButton 
                    type="submit" 
                    variant="default"
                    className="w-full"
                    disabled={isLoading || !email.trim()}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        {t('header.forgotPassword.sending')}
                      </>
                    ) : (
                      t('header.forgotPassword.sendResetLink')
                    )}
                  </GradientButton>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      {t('header.forgotPassword.emailSent')}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Мы отправили ссылку для восстановления пароля на {email}
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">
                          {t('header.forgotPassword.checkSpam')}
                        </p>
                        <p>{t('header.forgotPassword.checkSpamDescription')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to="/dashboard">
                        {t('header.forgotPassword.backToDashboard')}
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setIsSubmitted(false);
                        setEmail('');
                      }}
                    >
                      {t('header.forgotPassword.sendAnother')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Footer />
      </div>
      
      {/* Toaster для уведомлений */}
      <Toaster />
    </div>
  );
};

export default ForgotPassword;
