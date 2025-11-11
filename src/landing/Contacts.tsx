import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  Mail, 
  MessageCircle, 
  Send,
  Headphones,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Contacts = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactMethods = t('contacts.contactMethods');

  const faqItems = t('contacts.faq.items');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 backdrop-blur-sm border content-border-50 mb-8">
            <Headphones className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground">{t('contacts.hero.badge')}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            {t('contacts.hero.title')} <span className="gradient-text">{t('contacts.hero.subtitle')}</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            {t('contacts.hero.description')}
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => {
            const getIcon = (iconName: string) => {
              switch (iconName) {
                case 'Mail': return Mail;
                case 'MessageCircle': return MessageCircle;
                case 'FileText': return FileText;
                default: return Mail;
              }
            };
            const IconComponent = getIcon(method.icon);
            
            return (
              <Card key={index} className="bg-card/30 backdrop-blur-sm border content-border-30 hover:bg-card/50 transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4 group-hover:scale-110 transition-transform duration-200">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {method.description}
                  </CardDescription>
                </CardHeader>
              <CardContent className="text-center space-y-3">
                <div className="font-mono text-sm bg-muted/50 px-3 py-2 rounded-lg">
                  {method.contact}
                </div>
                <div className="text-xs text-muted-foreground">
                  {method.responseTime}
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contacts;
