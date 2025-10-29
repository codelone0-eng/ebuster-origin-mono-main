import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Paperclip,
  MessageSquare,
  Send,
  Upload,
  Download,
  Tag,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const statusConfig = {
  new: { label: 'Новый', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
  open: { label: 'Открыт', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
  pending_customer: { label: 'Ожидание клиента', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50' },
  pending_internal: { label: 'Ожидание внутреннее', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50' },
  resolved: { label: 'Решен', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
  closed: { label: 'Закрыт', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' },
  cancelled: { label: 'Отменен', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' }
};

const priorityConfig = {
  low: { label: 'Низкий', color: 'bg-gray-500' },
  medium: { label: 'Средний', color: 'bg-blue-500' },
  high: { label: 'Высокий', color: 'bg-orange-500' },
  critical: { label: 'Критический', color: 'bg-red-500' }
};

// Mock данные для тикета
const mockTicket = {
  id: 1,
  subject: "Проблема с установкой скрипта",
  description: "Не могу установить скрипт Auto Form Filler, выдает ошибку при загрузке",
  status: "open",
  priority: "high",
  category: "technical",
  createdAt: "2024-01-20T09:15:00Z",
  updatedAt: "2024-01-20T14:30:00Z",
  attachments: [
    { name: "error_log.txt", size: "2.3 KB", url: "#" },
    { name: "screenshot.png", size: "1.2 MB", url: "#" }
  ],
  messages: [
    {
      id: 1,
      author: "Александр Петров",
      authorAvatar: "/api/placeholder/32/32",
      message: "Не могу установить скрипт Auto Form Filler, выдает ошибку при загрузке. Прикрепляю логи и скриншот ошибки.",
      timestamp: "2024-01-20T09:15:00Z",
      isUser: true,
      attachments: [
        { name: "error_log.txt", size: "2.3 KB", url: "#" },
        { name: "screenshot.png", size: "1.2 MB", url: "#" }
      ]
    },
    {
      id: 2,
      author: "Support Team",
      authorAvatar: "/api/placeholder/32/32",
      message: "Здравствуйте! Мы получили ваш запрос. Пожалуйста, приложите скриншот ошибки и логи для более детального анализа. Также попробуйте перезапустить браузер и повторить установку.",
      timestamp: "2024-01-20T10:30:00Z",
      isUser: false,
      attachments: []
    },
    {
      id: 3,
      author: "Александр Петров",
      authorAvatar: "/api/placeholder/32/32",
      message: "Перезапустил браузер, проблема остается. Ошибка появляется на этапе загрузки скрипта. В логах видно, что не хватает прав доступа к файловой системе.",
      timestamp: "2024-01-20T11:45:00Z",
      isUser: true,
      attachments: []
    },
    {
      id: 4,
      author: "Support Team",
      authorAvatar: "/api/placeholder/32/32",
      message: "Понял проблему. Это связано с настройками безопасности браузера. Попробуйте:\n\n1. Отключить блокировщик рекламы на время установки\n2. Проверить настройки расширений в браузере\n3. Убедиться, что у EBUSTER есть необходимые разрешения\n\nЕсли проблема сохранится, мы передадим запрос в техническую команду.",
      timestamp: "2024-01-20T14:30:00Z",
      isUser: false,
      attachments: []
    }
  ]
};

const TicketPage = () => {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const [ticket] = useState(mockTicket);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Функция для правильного склонения слова "вложение"
  const getAttachmentText = (count: number) => {
    if (count === 1) {
      return t('header.dashboard.tickets.attachment');
    } else if (count >= 2 && count <= 4) {
      return t('header.dashboard.tickets.attachments2');
    } else {
      return t('header.dashboard.tickets.attachments');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-600 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Loader className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <div className="relative z-content">
        <Header />
        
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard?tab=support">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('header.dashboard.tickets.backToSupport')}
                </Link>
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-6">
              {ticket.subject}
            </h1>
          </div>

          {/* Main Content with Sticky Sidebar */}
          <div className="flex gap-8">
            {/* Messages and Reply Form */}
            <div className="flex-1 min-w-0">

          {/* Messages */}
          <div className="space-y-6 mb-8">
            {ticket.messages.map((message) => (
              <Card key={message.id} className={`${message.isUser ? 'ml-8' : 'mr-8'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={message.authorAvatar} />
                      <AvatarFallback>
                        {message.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{message.author}</h4>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(message.timestamp)}
                        </span>
                        {message.isUser && (
                          <Badge variant="outline" className="text-xs">
                            Вы
                          </Badge>
                        )}
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-foreground whitespace-pre-wrap mb-4">
                          {message.message}
                        </p>
                      </div>
                      {message.attachments.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-primary" />
                            {t('header.dashboard.tickets.attachments')}
                          </h5>
                          <div className="grid gap-2">
                            {message.attachments.map((attachment, index) => {
                              const isImage = attachment.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
                              const isDocument = attachment.name.toLowerCase().match(/\.(pdf|doc|docx|txt)$/);
                              const isArchive = attachment.name.toLowerCase().match(/\.(zip|rar|7z)$/);
                              
                              return (
                                <div 
                                  key={index}
                                  className="group p-3 bg-card/30 border border-border/20 rounded-lg hover:bg-card/50 hover:border-border/40 transition-all duration-200 cursor-pointer"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                      {isImage ? (
                                        <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      ) : isDocument ? (
                                        <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      ) : isArchive ? (
                                        <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                      ) : (
                                        <Paperclip className="h-4 w-4 text-primary" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                                        {attachment.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {attachment.size}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        asChild
                                      >
                                        <a href={attachment.url} download>
                                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                        </a>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reply Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('header.dashboard.tickets.replyToTicket')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={t('header.dashboard.tickets.enterYourReply')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    {t('header.dashboard.tickets.attachFile')}
                  </Button>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSubmitting}
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t('header.dashboard.tickets.send')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
            </div>

            {/* Sticky Ticket Info Sidebar */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-24">
                <Card className="bg-card/50 backdrop-blur-sm border border-border/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Информация о тикете</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Status */}
                    <div className="flex items-center gap-3 text-sm">
                      <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">{t('header.dashboard.tickets.status')}</div>
                        <div className="text-muted-foreground">
                          {(statusConfig[ticket.status as keyof typeof statusConfig] || { label: ticket.status }).label}
                        </div>
                      </div>
                    </div>
                    
                    {/* Priority */}
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">{t('header.dashboard.tickets.priority')}</div>
                        <div className="text-muted-foreground">
                          {(priorityConfig[ticket.priority as keyof typeof priorityConfig] || { label: ticket.priority }).label}
                        </div>
                      </div>
                    </div>
                    
                    {/* Category */}
                    <div className="flex items-center gap-3 text-sm">
                      <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">{t('header.dashboard.tickets.category')}</div>
                        <div className="text-muted-foreground">
                          {ticket.category === 'technical' ? t('header.dashboard.tickets.technicalIssue') :
                           ticket.category === 'feature_request' ? t('header.dashboard.tickets.featureRequest') :
                           ticket.category === 'bug_report' ? t('header.dashboard.tickets.bugReport') : t('header.dashboard.tickets.other')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Dates */}
                    <div className="space-y-4 pt-4 border-t border-border/20">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">{t('header.dashboard.tickets.created')}</div>
                          <div className="text-muted-foreground">{formatDate(ticket.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">{t('header.dashboard.tickets.updated')}</div>
                          <div className="text-muted-foreground">{formatDate(ticket.updatedAt)}</div>
                        </div>
                      </div>
                      {ticket.attachments.length > 0 && (
                        <div className="flex items-center gap-3 text-sm">
                          <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <div className="font-medium text-foreground">{t('header.dashboard.tickets.attachedFiles')}</div>
                            <div className="text-muted-foreground">{ticket.attachments.length} {getAttachmentText(ticket.attachments.length)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default TicketPage;
