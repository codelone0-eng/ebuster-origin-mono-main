import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';
import { SEO } from '@/components/SEO';
import { 
  Mail, 
  MessageCircle, 
  Send,
  Headphones,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;

    const elements = heroRef.current.querySelectorAll('.hero-element');
    gsap.from(elements, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
    });

    return () => {
      gsap.killTweensOf(elements);
    };
  }, []);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll('.contact-card');
    cards.forEach((card) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none",
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
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

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail': return Mail;
      case 'MessageCircle': return MessageCircle;
      case 'FileText': return FileText;
      default: return Mail;
    }
  };

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
          <div ref={heroRef} className="text-center mb-16">
            <div className="hero-element inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2d2d2d] mb-8">
              <Headphones className="h-4 w-4 text-[#d9d9d9]" />
              <span className="text-xs text-[#808080] uppercase tracking-wider" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
                {t('contacts.hero.badge')}
              </span>
            </div>
            
            <h1 className="hero-element text-4xl md:text-6xl font-bold mb-6 text-white" style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              lineHeight: '1.1'
            }}>
              {t('contacts.hero.title')}
            </h1>
            
            <p className="hero-element text-lg text-[#808080] max-w-3xl mx-auto mb-8 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              {t('contacts.hero.description')}
            </p>
          </div>

          {/* Contact Methods */}
          <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 mb-16">
            {contactMethods.map((method, index) => {
              const IconComponent = getIcon(method.icon);
              
              return (
                <Card 
                  key={index} 
                  className="contact-card bg-[#1a1a1a] border-[#2d2d2d] p-6 transition-colors duration-200"
                >
                  <CardContent className="p-0 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#2d2d2d] mb-4">
                      <IconComponent className="h-6 w-6 text-[#d9d9d9]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{method.title}</h3>
                    <p className="text-sm text-[#808080] mb-4" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      {method.description}
                    </p>
                    <div className="space-y-3">
                      <div className="font-mono text-sm bg-[#111111] border border-[#2d2d2d] px-3 py-2 rounded-lg text-white">
                        {method.contact}
                      </div>
                      <div className="text-xs text-[#808080]">
                        {method.responseTime}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8">
              <CardContent className="p-0">
                <h2 className="text-2xl font-bold mb-6 text-white">Отправить сообщение</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Имя</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="bg-[#111111] border-[#2d2d2d] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="bg-[#111111] border-[#2d2d2d] text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white">Тема</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="bg-[#111111] border-[#2d2d2d] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white">Сообщение</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="bg-[#111111] border-[#2d2d2d] text-white"
                    />
                  </div>
                  {submitStatus === 'success' && (
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Сообщение отправлено успешно!
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Ошибка при отправке сообщения
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#404040] text-white hover:bg-[#4d4d4d] transition-colors"
                  >
                    {isSubmitting ? (
                      <>Отправка...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Отправить
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contacts;
