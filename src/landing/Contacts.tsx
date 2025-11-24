import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { SEO } from '@/components/SEO';
import { 
  Mail, 
  MessageCircle, 
  Send,
  Headphones,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ContactMethod {
  icon: string;
  title: string;
  description: string;
  contact: string;
  responseTime: string;
}

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

  const contactMethods = t('contacts.contactMethods') as ContactMethod[];

  const faqItems = t('contacts.faq.items');

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      <SEO
        title="Контакты EBUSTER"
        description="Свяжитесь с командой EBUSTER: email поддержка, Discord сообщество и система тикетов."
        url="https://ebuster.ru/contacts"
      />
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#1a1a1a] border border-[#2d2d2d] mb-8">
            <Headphones className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-semibold text-[#808080]">{t('contacts.hero.badge')}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            {t('contacts.hero.title')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('contacts.hero.subtitle')}</span>
          </h1>
          
          <p className="text-xl text-[#808080] max-w-3xl mx-auto mb-8 leading-relaxed">
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
              <div key={index} className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 group">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/10 mb-4 group-hover:scale-110 transition-transform duration-200">
                    <IconComponent className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{method.title}</h3>
                  <p className="text-sm text-[#808080] mb-4">
                    {method.description}
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="font-mono text-sm bg-[#111111] border border-[#2d2d2d] px-3 py-2 rounded-lg text-white">
                    {method.contact}
                  </div>
                  <div className="text-xs text-[#808080]">
                    {method.responseTime}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contacts;
