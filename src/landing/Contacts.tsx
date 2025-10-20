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
                <Button variant="outline" size="sm" className="w-full">
                  {t('contacts.contactMethods.0.buttonText')}
                </Button>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
            {t('contacts.form.title')}
          </h2>
          
          <Card className="bg-card/30 backdrop-blur-sm border content-border-30">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                      {t('contacts.form.fields.name')} *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('contacts.form.fields.name')}
                      required
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                      {t('contacts.form.fields.email')} *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                      className="rounded-xl h-12"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
                    {t('contacts.form.fields.subject')} *
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder={t('contacts.form.fields.subjectPlaceholder')}
                    required
                    className="bg-gray-50 dark:bg-input border-gray-200 dark:border-border focus:border-primary focus:ring-primary/20 rounded-xl h-12 text-gray-900 dark:text-foreground placeholder:text-gray-500 dark:placeholder:text-muted-foreground"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                    {t('contacts.form.fields.message')} *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={t('contacts.form.fields.messagePlaceholder')}
                    rows={6}
                    required
                    className="rounded-xl resize-none"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('contacts.form.submitting')}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t('contacts.form.fields.submit')}
                    </>
                  )}
                </Button>
                
                {submitStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">{t('contacts.form.success')}</span>
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{t('contacts.form.error')}</span>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            {t('contacts.faq.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {faqItems.map((item, index) => (
              <Card key={index} className="bg-card/30 backdrop-blur-sm border content-border-30">
                <CardHeader>
                  <CardTitle className="text-lg">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {item.answer}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/5 via-transparent to-accent/5 border content-border-30 p-12">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">{t('contacts.cta.title')}</CardTitle>
              <CardDescription className="text-lg">
                {t('contacts.cta.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Mail className="h-4 w-4 mr-2" />
                  techsupport@ebuster.ru
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('contacts.cta.discord')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contacts;
