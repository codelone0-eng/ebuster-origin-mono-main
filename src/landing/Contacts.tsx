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
        <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Hero Section */}
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Headphones className="h-5 w-5 text-neutral-500" />
            <h1 className="text-lg font-semibold text-white" style={{ fontSize: '18px', fontWeight: 600 }}>
              {t('contacts.hero.title')}
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mb-4" style={{ fontSize: '12px', lineHeight: '1.5' }}>
            {t('contacts.hero.description')}
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-4">
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
              <div key={index} className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <IconComponent className="h-5 w-5 text-blue-500" />
                  <h3 className="text-sm font-semibold text-white">{method.title}</h3>
                </div>
                <p className="text-xs text-neutral-500 mb-4">
                  {method.description}
                </p>
                <div className="space-y-2">
                  <div className="font-mono text-xs bg-[#111111] border border-[#2d2d2d] px-3 py-2 rounded text-white">
                    {method.contact}
                  </div>
                  <div className="text-xs text-neutral-500">
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
